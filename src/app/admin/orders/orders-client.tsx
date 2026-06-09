"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus, deleteOrder } from "@/actions/order-actions";
import { getModerators } from "@/actions/moderator-actions";
import { useToast } from "@/components/ui/Toast";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  FileText,
  Trash2,
  Check,
  Calendar,
  Phone,
  MapPin,
  TrendingUp,
  Download,
  Share2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function AdminOrdersClient() {
  const { toast, confirm } = useToast();
  
  // States
  const [orders, setOrders] = useState<any[]>([]);
  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedModerator, setSelectedModerator] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Dialog State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadFilterData = async () => {
    try {
      const res = await getModerators();
      if (res.success && res.moderators) {
        setModerators(res.moderators);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await getOrders({
        status,
        moderatorId: selectedModerator,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 10,
      });

      if (res.success && res.orders) {
        setOrders(res.orders);
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setPage(res.pagination.page);
          setTotalOrders(res.pagination.total);
        }
      } else {
        toast(res.error || "Failed to load orders.", "error");
      }
    } catch (err) {
      toast("Error fetching orders.", "error");
    } finally {
      setLoading(false);
    }
  }, [status, selectedModerator, search, startDate, endDate, page, toast]);

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: "Pending" | "Confirmed" | "Delivered" | "Cancelled") => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast(`Order status changed to ${newStatus}.`, "success", "Order Updated");
        await loadOrders(true);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
      } else {
        toast(res.error || "Failed to update order status.", "error");
      }
    } catch (err) {
      toast("Error updating order.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const isConfirmed = await confirm({
      title: "Delete Order?",
      text: "Are you sure you want to permanently delete this order? Moderator point balances will be recalculated.",
      icon: "warning",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (!isConfirmed) {
      return;
    }

    setUpdatingId(orderId);
    try {
      const res = await deleteOrder(orderId);
      if (res.success) {
        toast("Order deleted successfully.", "success");
        setSelectedOrder(null);
        await loadOrders(true);
      } else {
        toast(res.error || "Failed to delete order.", "error");
      }
    } catch (err) {
      toast("Error deleting order.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast("No orders to export.", "warning");
      return;
    }

    const headers = [
      "Order ID",
      "Moderator Name",
      "Customer Name",
      "Customer Phone",
      "Alternative Phone",
      "Address",
      "Product Name",
      "Category",
      "Quantity",
      "Unit Price",
      "Delivery Charge",
      "Total Amount",
      "Status",
      "Notes",
      "Date",
    ];

    const rows = orders.map((o) => [
      o.id,
      o.moderatorId?.name || "Deleted Moderator",
      o.customerName,
      o.customerPhone,
      o.alternativePhone || "",
      `"${o.address.replace(/"/g, '""')}"`,
      o.productName,
      o.category,
      o.quantity,
      o.unitPrice,
      o.deliveryCharge,
      o.totalAmount,
      o.status,
      `"${(o.notes || "").replace(/"/g, '""')}"`,
      o.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Orders exported to CSV successfully!", "success");
  };

  // Excel (HTML-table representation) Export Utility
  const handleExportExcel = () => {
    if (orders.length === 0) {
      toast("No orders to export.", "warning");
      return;
    }

    let xml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Orders</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
      <table border="1">
        <tr style="background-color:#4F46E5;color:white;font-weight:bold;">
          <th>Order ID</th><th>Moderator</th><th>Customer</th><th>Phone</th><th>Address</th><th>Product</th><th>Qty</th><th>Price</th><th>Delivery</th><th>Total</th><th>Status</th><th>Date</th>
        </tr>
    `;

    orders.forEach((o) => {
      xml += `
        <tr>
          <td>${o.id}</td>
          <td>${o.moderatorId?.name || "Deleted"}</td>
          <td>${o.customerName}</td>
          <td>${o.customerPhone}</td>
          <td>${o.address}</td>
          <td>${o.productName}</td>
          <td>${o.quantity}</td>
          <td>${o.unitPrice}</td>
          <td>${o.deliveryCharge}</td>
          <td>${o.totalAmount}</td>
          <td>${o.status}</td>
          <td>${formatDate(o.createdAt).split(",")[0]}</td>
        </tr>
      `;
    });

    xml += `</table></body></html>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Orders exported to Excel successfully!", "success");
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setSelectedModerator("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Client Sales Orders</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Review submissions from moderators, update fulfillment status, generate invoices, or download sheets.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all duration-200"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search customer/product */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Customer name, Phone, or Product..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary"
            />
          </div>

          {/* Moderator filter */}
          <div>
            <select
              value={selectedModerator}
              onChange={(e) => {
                setSelectedModerator(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45"
            >
              <option value="ALL">All Moderators</option>
              {moderators.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (@{m.username})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Filter Range & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold focus:outline-none text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground font-semibold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold focus:outline-none text-muted-foreground"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline self-end sm:self-auto"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden animate-slide-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground">Loading orders database...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-xs font-bold text-muted-foreground">
                    No orders matching selected filters found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderShortId = order.id.substring(18);
                  return (
                    <tr key={order.id} className="text-xs font-semibold hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">#{orderShortId}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.moderatorId?.name || "Purged Mod"}</p>
                        <p className="text-[10px] text-muted-foreground">@{order.moderatorId?.username || "deleted"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.productName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.category} (x{order.quantity})
                        </p>
                      </td>
                      <td className="px-6 py-4 font-black text-foreground">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {updatingId === order.id ? (
                          <div className="flex items-center justify-center gap-1.5 text-primary text-[10px] font-bold py-1 px-2.5 bg-primary/5 rounded-lg border border-primary/10">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e: any) => handleStatusChange(order.id, e.target.value)}
                            className={cn(
                              "px-2 py-1 bg-secondary border border-border rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-primary",
                              order.status === "Pending" && "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/15",
                              order.status === "Confirmed" && "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/15",
                              order.status === "Delivered" && "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/15",
                              order.status === "Cancelled" && "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/15"
                            )}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(order.createdAt).split(",")[0]}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 min-h-[30px]">
                          {updatingId === order.id ? (
                            <div className="flex items-center text-primary text-xs font-semibold px-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 text-foreground transition-all duration-200"
                                title="View Order Details"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              
                              {(order.status === "Confirmed" || order.status === "Delivered") && (
                                <Link
                                  href={`/api/invoice/${order.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200"
                                  title="Print Invoice"
                                >
                                  <TrendingUp className="w-3.5 h-3.5 rotate-45" />
                                </Link>
                              )}

                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-200"
                                title="Delete Order Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Showing page {page} of {totalPages} ({totalOrders} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal dialog for ORDER DETAILS & status settings */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl animate-slide-in relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-secondary/80 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-black text-foreground mb-6 flex items-center gap-1.5">
              <span>Order Details</span>
              <span className="font-mono font-bold text-primary">#{selectedOrder.id.substring(18)}</span>
            </h2>

            <div className="space-y-6">
              {/* Submitted By */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Submitted By Moderator
                </h4>
                <div className="bg-secondary/20 p-3.5 border border-border/40 rounded-xl flex items-center justify-between text-xs font-semibold text-foreground">
                  <div>
                    <p className="font-bold">{selectedOrder.moderatorId?.name || "Deleted"}</p>
                    <p className="text-[10px] text-muted-foreground">@{selectedOrder.moderatorId?.username || "deleted"}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-[10px]">
                    Points: {selectedOrder.moderatorId?.points || 0} pts
                  </span>
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Customer Information
                </h4>
                <div className="bg-secondary/20 p-3.5 border border-border/40 rounded-xl space-y-1 text-xs font-semibold text-foreground">
                  <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedOrder.customerPhone} {selectedOrder.alternativePhone && `(Alt: ${selectedOrder.alternativePhone})`}
                  </p>
                  <p className="text-muted-foreground">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Product details */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Product Summary
                </h4>
                <div className="bg-secondary/20 p-3.5 border border-border/40 rounded-xl space-y-2.5 font-semibold text-xs text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-bold text-right">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{selectedOrder.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pricing</span>
                    <span>{formatPrice(selectedOrder.unitPrice)} × {selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2.5">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-primary pt-1.5">
                    <span>Grand Total</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Options */}
              <div className="flex justify-between items-center text-xs font-semibold pt-1">
                <div className="flex gap-2">
                  {(selectedOrder.status === "Confirmed" || selectedOrder.status === "Delivered") && (
                    <Link
                      href={`/api/invoice/${selectedOrder.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice PDF
                    </Link>
                  )}
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs font-bold"
                  >
                    Delete Record
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Set Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e: any) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className={cn(
                      "px-2.5 py-1 bg-secondary border border-border rounded-lg text-xs font-bold",
                      selectedOrder.status === "Pending" && "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/15",
                      selectedOrder.status === "Confirmed" && "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/15",
                      selectedOrder.status === "Delivered" && "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/15",
                      selectedOrder.status === "Cancelled" && "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/15"
                    )}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

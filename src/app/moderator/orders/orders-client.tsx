"use client";

import { useEffect, useState, useCallback } from "react";
import OrderForm from "@/components/OrderForm";
import { getOrders } from "@/actions/order-actions";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  FileText,
  Calendar,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface OrdersClientProps {
  userId: string;
}

export default function OrdersClient({ userId }: OrdersClientProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await getOrders({
        moderatorId: userId,
        search,
        status,
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
  }, [userId, search, status, page, toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Debounced search logic could go here, for simplicity we search on value change or can add a search button
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleStatusFilter = (val: string) => {
    setStatus(val);
    setPage(1); // Reset to first page
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Order Submissions</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Submit new client sales and review your order fulfillment history.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Order</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by customer name, phone, or product..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/35 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 bg-secondary/35 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-muted-foreground">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderShortId = order.id.substring(18);
                  return (
                    <tr key={order.id} className="text-xs font-semibold hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">#{orderShortId}</td>
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
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg border font-bold text-[9px]",
                            order.status === "Pending" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                            order.status === "Confirmed" && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                            order.status === "Delivered" && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                            order.status === "Cancelled" && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 text-foreground transition-all duration-200"
                            title="View Details"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {(order.status === "Confirmed" || order.status === "Delivered") && (
                            <Link
                              href={`/api/invoice/${order.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200"
                              title="Invoice PDF"
                            >
                              <TrendingUp className="w-3.5 h-3.5 rotate-45" />
                            </Link>
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

      {/* 1. Modal dialog for ORDER FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl animate-slide-in relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-secondary/80 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Submit Customer Order
            </h2>
            <OrderForm
              onSuccess={() => {
                setIsFormOpen(false);
                loadOrders(true);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Modal dialog for ORDER DETAILS */}
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
              {/* Customer summary */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Customer Information
                </h4>
                <div className="bg-secondary/20 p-3.5 border border-border/40 rounded-xl space-y-1.5 font-semibold text-xs text-foreground">
                  <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedOrder.customerPhone} {selectedOrder.alternativePhone && `(Alt: ${selectedOrder.alternativePhone})`}
                  </p>
                  <p className="text-muted-foreground">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Product details */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Product Information
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

              {/* Order Status & Date */}
              <div className="flex justify-between items-center text-xs font-semibold p-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted: {formatDate(selectedOrder.createdAt)}</span>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg border font-bold text-[10px]",
                    selectedOrder.status === "Pending" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                    selectedOrder.status === "Confirmed" && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                    selectedOrder.status === "Delivered" && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                    selectedOrder.status === "Cancelled" && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  )}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

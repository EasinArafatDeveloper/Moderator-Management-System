"use server";

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Invoice from "@/models/Invoice";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to recalculate points for a moderator
export async function recalculateModeratorPoints(moderatorId: string) {
  const orders = await Order.find({ moderatorId });
  let totalPoints = 0;
  for (const order of orders) {
    if (order.status === "Pending") totalPoints += 1;
    else if (order.status === "Confirmed") totalPoints += 6; // +1 for submit + 5 for confirm
    else if (order.status === "Delivered") totalPoints += 16; // +1 submit + 5 confirm + 10 deliver
    else if (order.status === "Cancelled") totalPoints += 0;
  }
  await User.findByIdAndUpdate(moderatorId, { points: totalPoints });
  return totalPoints;
}

// Helper to convert Mongoose documents to plain objects
function serializeDoc(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert _id to string
  if (obj._id) obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  
  // Convert dates to string ISO
  if (obj.createdAt && typeof obj.createdAt.toISOString === "function") {
    obj.createdAt = obj.createdAt.toISOString();
  }
  if (obj.updatedAt && typeof obj.updatedAt.toISOString === "function") {
    obj.updatedAt = obj.updatedAt.toISOString();
  }
  if (obj.date && typeof obj.date.toISOString === "function") {
    obj.date = obj.date.toISOString();
  }
  
  // Handle nested moderatorId ref
  if (obj.moderatorId) {
    if (typeof obj.moderatorId === "object" && obj.moderatorId.username) {
      const mod = obj.moderatorId.toObject ? obj.moderatorId.toObject() : obj.moderatorId;
      if (mod._id) mod.id = mod._id.toString();
      delete mod._id;
      delete mod.password; // Do not leak hash
      if (mod.createdAt && typeof mod.createdAt.toISOString === "function") {
        mod.createdAt = mod.createdAt.toISOString();
      }
      if (mod.updatedAt && typeof mod.updatedAt.toISOString === "function") {
        mod.updatedAt = mod.updatedAt.toISOString();
      }
      obj.moderatorId = mod;
    } else {
      obj.moderatorId = obj.moderatorId.toString();
    }
  }
  
  // Handle nested orderId ref
  if (obj.orderId) {
    if (typeof obj.orderId === "object" && obj.orderId.customerName) {
      const ord = obj.orderId.toObject ? obj.orderId.toObject() : obj.orderId;
      if (ord._id) ord.id = ord._id.toString();
      delete ord._id;
      if (ord.createdAt && typeof ord.createdAt.toISOString === "function") {
        ord.createdAt = ord.createdAt.toISOString();
      }
      if (ord.updatedAt && typeof ord.updatedAt.toISOString === "function") {
        ord.updatedAt = ord.updatedAt.toISOString();
      }
      obj.orderId = ord;
    } else {
      obj.orderId = obj.orderId.toString();
    }
  }
  
  return obj;
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  alternativePhone?: string;
  address: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  deliveryCharge: number;
  notes?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Moderator") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const totalAmount = data.quantity * data.unitPrice + data.deliveryCharge;

    const newOrder = await Order.create({
      moderatorId: new mongoose.Types.ObjectId(session.user.id),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      alternativePhone: data.alternativePhone || "",
      address: data.address,
      productName: data.productName,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      deliveryCharge: data.deliveryCharge,
      totalAmount,
      status: "Pending",
      notes: data.notes || "",
    });

    // Update moderator's points
    await recalculateModeratorPoints(session.user.id);

    // Create system notification
    await Notification.create({
      userId: undefined, // Broadcast to admins
      type: "NEW_ORDER",
      message: `New Order #${newOrder._id.toString().substring(18)} submitted by Moderator ${session.user.name} for ${data.customerName}.`,
    });

    // Log activity
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "CREATE_ORDER",
      details: `Created order for ${data.customerName} (Total: ${totalAmount} BDT). Order ID: ${newOrder._id}`,
    });

    return { success: true, order: serializeDoc(newOrder) };
  } catch (error: any) {
    console.error("Create order error:", error);
    return { success: false, error: error.message || "Failed to create order." };
  }
}

export async function getOrders(filters: {
  status?: string;
  moderatorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    await connectToDatabase();

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.status && filters.status !== "ALL") {
      query.status = filters.status;
    }

    if (filters.moderatorId && filters.moderatorId !== "ALL") {
      query.moderatorId = new mongoose.Types.ObjectId(filters.moderatorId);
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { productName: searchRegex },
        { category: searchRegex },
      ];
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("moderatorId", "name username email phone points profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      success: true,
      orders: orders.map(serializeDoc),
      pagination: {
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
        page,
        limit,
      },
    };
  } catch (error: any) {
    console.error("Get orders error:", error);
    return { success: false, error: error.message || "Failed to fetch orders." };
  }
}

export async function updateOrderStatus(orderId: string, status: "Pending" | "Confirmed" | "Delivered" | "Cancelled") {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized. Admin role required." };
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Recalculate moderator points
    await recalculateModeratorPoints(order.moderatorId.toString());

    // Create system notification for the moderator
    await Notification.create({
      userId: order.moderatorId,
      type: "STATUS_UPDATE",
      message: `Your Order for ${order.customerName} has been updated to ${status}.`,
    });

    // Create notification for all admins
    await Notification.create({
      userId: undefined,
      type: "STATUS_UPDATE",
      message: `Order #${orderId.substring(18)} status updated from ${oldStatus} to ${status} by Admin ${session.user.name}.`,
    });

    // Log activity
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "UPDATE_ORDER_STATUS",
      details: `Updated Order ID ${orderId} status from ${oldStatus} to ${status}`,
    });

    return { success: true, order: serializeDoc(order) };
  } catch (error: any) {
    console.error("Update order status error:", error);
    return { success: false, error: error.message || "Failed to update order status." };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const moderatorId = order.moderatorId.toString();

    await Order.findByIdAndDelete(orderId);
    
    // Delete any associated invoices
    await Invoice.deleteMany({ orderId: new mongoose.Types.ObjectId(orderId) });

    // Recalculate points since the order was deleted
    await recalculateModeratorPoints(moderatorId);

    // Log activity
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "DELETE_ORDER",
      details: `Deleted Order ID ${orderId} for customer ${order.customerName}`,
    });

    return { success: true, message: "Order deleted successfully." };
  } catch (error: any) {
    console.error("Delete order error:", error);
    return { success: false, error: error.message || "Failed to delete order." };
  }
}

export async function getOrCreateInvoice(orderId: string) {
  try {
    await connectToDatabase();

    // Try finding existing invoice
    let invoice = await Invoice.findOne({ orderId: new mongoose.Types.ObjectId(orderId) }).populate({
      path: "orderId",
      populate: { path: "moderatorId", select: "name username email phone" },
    });

    if (invoice) {
      return { success: true, invoice: serializeDoc(invoice) };
    }

    // Generate new invoice
    const order = await Order.findById(orderId).populate("moderatorId", "name username email phone");
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Generate invoice number: INV-YYYY-XXXXXX
    const currentYear = new Date().getFullYear();
    const invoiceCount = await Invoice.countDocuments({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
      },
    });

    const sequentialNumber = String(invoiceCount + 1).padStart(6, "0");
    const invoiceNumber = `INV-${currentYear}-${sequentialNumber}`;

    invoice = await Invoice.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      invoiceNumber,
      pdfUrl: "", // Can be filled if uploaded to S3, otherwise generated client-side
    });

    // Populate order details for return
    const populatedInvoice = await Invoice.findById(invoice._id).populate({
      path: "orderId",
      populate: { path: "moderatorId", select: "name username email phone" },
    });

    return { success: true, invoice: serializeDoc(populatedInvoice) };
  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return { success: false, error: error.message || "Failed to generate invoice." };
  }
}

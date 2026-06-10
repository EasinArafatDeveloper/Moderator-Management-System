"use server";

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helpers
function serializeDoc(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  if (obj.createdAt) obj.createdAt = obj.createdAt.toISOString();
  if (obj.userId && obj.userId.toString) obj.userId = obj.userId.toString();
  if (obj.orderId && obj.orderId.toString) obj.orderId = obj.orderId.toString();
  return obj;
}

export async function getAdminDashboardStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const [
      totalModerators,
      activeModerators,
      pendingModerators,
      totalOrders,
      confirmedOrders,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
    ] = await Promise.all([
      User.countDocuments({ role: "Moderator" }),
      User.countDocuments({ role: "Moderator", status: "Approved" }),
      User.countDocuments({ role: "Moderator", status: "Pending" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "Confirmed" }),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Cancelled" }),
      Order.countDocuments({ status: "Delivered" }),
    ]);

    // Total Revenue is sum of Confirmed and Delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["Confirmed", "Delivered"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total Profit is sum of profit field for all orders
    const profitResult = await Order.aggregate([
      { $group: { _id: null, totalProfit: { $sum: "$profit" } } },
    ]);
    const totalProfit = profitResult[0]?.totalProfit || 0;

    return {
      success: true,
      stats: {
        totalModerators,
        activeModerators,
        pendingModerators,
        totalOrders,
        confirmedOrders: confirmedOrders + deliveredOrders, // Confirmed & Delivered count as confirmed/completed orders in card
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        totalProfit,
      },
    };
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return { success: false, error: error.message || "Failed to load statistics." };
  }
}

export async function getAnalyticsData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    // 1. Orders and Revenue Per Month (Last 6 Months)
    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthName = d.toLocaleString("default", { month: "short" });

      const ordersCount = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const revenueResult = await Order.aggregate([
        {
          $match: {
            status: { $in: ["Confirmed", "Delivered"] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      const revenue = revenueResult[0]?.total || 0;

      monthlyStats.push({
        month: `${monthName} ${year}`,
        orders: ordersCount,
        revenue,
      });
    }

    // 2. Top Moderators (Sorted by points)
    const topModsRaw = await User.find({ role: "Moderator", status: "Approved" })
      .sort({ points: -1 })
      .limit(5);
    const topModerators = topModsRaw.map((mod) => ({
      name: mod.name,
      points: mod.points,
    }));

    // 3. Order Status Distribution
    const statusDistribution = [
      { name: "Pending", value: await Order.countDocuments({ status: "Pending" }) },
      { name: "Confirmed", value: await Order.countDocuments({ status: "Confirmed" }) },
      { name: "Delivered", value: await Order.countDocuments({ status: "Delivered" }) },
      { name: "Cancelled", value: await Order.countDocuments({ status: "Cancelled" }) },
    ];

    return {
      success: true,
      analytics: {
        monthlyStats,
        topModerators,
        statusDistribution,
      },
    };
  } catch (error: any) {
    console.error("Analytics error:", error);
    return { success: false, error: error.message || "Failed to load analytics." };
  }
}

export async function getActivityLogs(limit = 15) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const logs = await ActivityLog.find()
      .populate("userId", "name username email role")
      .sort({ createdAt: -1 })
      .limit(limit);

    const serializedLogs = logs.map((log) => {
      const obj = log.toObject();
      const userObj = obj.userId as any;
      return {
        id: obj._id.toString(),
        action: obj.action,
        details: obj.details,
        ipAddress: obj.ipAddress || "N/A",
        createdAt: obj.createdAt.toISOString(),
        user: userObj
          ? {
              id: userObj._id.toString(),
              name: userObj.name,
              username: userObj.username,
              email: userObj.email,
              role: userObj.role,
            }
          : { name: "System/Deleted" },
      };
    });

    return { success: true, logs: serializedLogs };
  } catch (error: any) {
    console.error("Activity logs error:", error);
    return { success: false, error: error.message || "Failed to fetch logs." };
  }
}

export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    let query: any = {};
    if (session.user.role === "Admin") {
      // Admins view broadcasts (userId == null)
      query.userId = null;
    } else {
      // Moderators view their own notifications
      query.userId = new mongoose.Types.ObjectId(session.user.id);
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return { success: true, notifications: notifications.map(serializeDoc) };
  } catch (error: any) {
    console.error("Notifications error:", error);
    return { success: false, error: error.message || "Failed to fetch notifications." };
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    let query: any = {};
    if (session.user.role === "Admin") {
      query.userId = null;
    } else {
      query.userId = new mongoose.Types.ObjectId(session.user.id);
    }

    await Notification.updateMany(query, { isRead: true });

    return { success: true, message: "Notifications marked as read." };
  } catch (error: any) {
    console.error("Mark notifications error:", error);
    return { success: false, error: error.message || "Failed to update notifications." };
  }
}

export async function updateUserProfile(data: {
  name: string;
  phone: string;
  profilePicture?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    user.name = data.name;
    user.phone = data.phone;
    if (data.profilePicture !== undefined) {
      user.profilePicture = data.profilePicture;
    }

    await user.save();

    // Log action
    await ActivityLog.create({
      userId: user._id,
      action: "UPDATE_PROFILE",
      details: `Updated personal profile details`,
    });

    return {
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
    };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

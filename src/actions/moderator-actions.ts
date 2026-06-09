"use server";

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function serializeUser(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  if (obj._id) obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.password; // Securely delete password hash

  if (obj.createdAt) obj.createdAt = obj.createdAt.toISOString();
  if (obj.updatedAt) obj.updatedAt = obj.updatedAt.toISOString();

  return obj;
}

export async function getModerators(filters: {
  status?: string;
  search?: string;
  minPoints?: number;
  maxPoints?: number;
} = {}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const query: any = { role: "Moderator" };

    if (filters.status && filters.status !== "ALL") {
      query.status = filters.status;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (filters.minPoints !== undefined || filters.maxPoints !== undefined) {
      query.points = {};
      if (filters.minPoints !== undefined) query.points.$gte = filters.minPoints;
      if (filters.maxPoints !== undefined) query.points.$lte = filters.maxPoints;
    }

    const moderators = await User.find(query).sort({ createdAt: -1 });

    // For each moderator, we want to fetch order statistics (total orders and confirmed orders count)
    const moderatorsWithStats = [];
    for (const mod of moderators) {
      const totalOrders = await Order.countDocuments({ moderatorId: mod._id });
      const confirmedOrders = await Order.countDocuments({
        moderatorId: mod._id,
        status: { $in: ["Confirmed", "Delivered"] },
      });
      
      const modObj = serializeUser(mod);
      moderatorsWithStats.push({
        ...modObj,
        totalOrders,
        confirmedOrders,
      });
    }

    return { success: true, moderators: moderatorsWithStats };
  } catch (error: any) {
    console.error("Get moderators error:", error);
    return { success: false, error: error.message || "Failed to fetch moderators." };
  }
}

export async function getLeaderboard() {
  try {
    await connectToDatabase();
    
    // Get top 10 moderators by points
    const moderators = await User.find({ role: "Moderator", status: "Approved" })
      .sort({ points: -1 })
      .limit(10);
      
    return { success: true, leaderboard: moderators.map(serializeUser) };
  } catch (error: any) {
    console.error("Get leaderboard error:", error);
    return { success: false, error: error.message || "Failed to fetch leaderboard." };
  }
}

export async function updateModeratorStatus(moderatorId: string, status: "Approved" | "Suspended" | "Pending") {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const user = await User.findById(moderatorId);
    if (!user) {
      return { success: false, error: "Moderator not found." };
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Notify the moderator of status change
    await Notification.create({
      userId: user._id,
      type: "STATUS_UPDATE",
      message: `Your account status has been changed to ${status} by the administrator.`,
    });

    // Log action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "UPDATE_MODERATOR_STATUS",
      details: `Changed moderator ${user.name} (@${user.username}) status from ${oldStatus} to ${status}`,
    });

    return { success: true, moderator: serializeUser(user) };
  } catch (error: any) {
    console.error("Update moderator status error:", error);
    return { success: false, error: error.message || "Failed to update moderator status." };
  }
}

export async function updateModeratorProfile(moderatorId: string, data: {
  name: string;
  email: string;
  phone: string;
  status: "Approved" | "Suspended" | "Pending";
  points?: number;
  adminNotes?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const user = await User.findById(moderatorId);
    if (!user) {
      return { success: false, error: "Moderator not found." };
    }

    // Check if email is already taken by someone else
    const emailLower = data.email.toLowerCase().trim();
    if (emailLower !== user.email) {
      const emailExists = await User.findOne({ email: emailLower, _id: { $ne: moderatorId } });
      if (emailExists) {
        return { success: false, error: "Email is already taken." };
      }
    }

    user.name = data.name;
    user.email = emailLower;
    user.phone = data.phone;
    user.status = data.status;
    if (data.points !== undefined) {
      user.points = data.points;
    }
    if (data.adminNotes !== undefined) {
      user.adminNotes = data.adminNotes;
    }

    await user.save();

    // Log action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "EDIT_MODERATOR_PROFILE",
      details: `Edited profile details for moderator ${user.name} (@${user.username})`,
    });

    return { success: true, moderator: serializeUser(user) };
  } catch (error: any) {
    console.error("Update moderator profile error:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

export async function deleteModerator(moderatorId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();

    const user = await User.findById(moderatorId);
    if (!user) {
      return { success: false, error: "Moderator not found." };
    }

    await User.findByIdAndDelete(moderatorId);

    // Delete all orders associated with this moderator
    await Order.deleteMany({ moderatorId: new mongoose.Types.ObjectId(moderatorId) });

    // Log action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "DELETE_MODERATOR",
      details: `Deleted moderator ${user.name} (@${user.username}) and purged their order history.`,
    });

    return { success: true, message: "Moderator deleted successfully." };
  } catch (error: any) {
    console.error("Delete moderator error:", error);
    return { success: false, error: error.message || "Failed to delete moderator." };
  }
}

import bcrypt from "bcryptjs";
import User from "../models/User";
import Order from "../models/Order";
import Notification from "../models/Notification";

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Already seeded
    }

    console.log("Seeding database with default accounts...");

    const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
    const hashedPasswordMod = await bcrypt.hash("password123", 10);

    // Create Admin
    const admin = await User.create({
      name: "System Administrator",
      username: "admin",
      email: "admin@system.com",
      phone: "+8801700000000",
      password: hashedPasswordAdmin,
      role: "Admin",
      status: "Approved",
      points: 0,
    });

    // Create Moderators
    const sakib = await User.create({
      name: "Sakib Al Hasan",
      username: "sakib",
      email: "sakib@moderator.com",
      phone: "+8801700000001",
      password: hashedPasswordMod,
      role: "Moderator",
      status: "Approved",
      points: 25,
    });

    const tamim = await User.create({
      name: "Tamim Iqbal",
      username: "tamim",
      email: "tamim@moderator.com",
      phone: "+8801700000002",
      password: hashedPasswordMod,
      role: "Moderator",
      status: "Pending",
      points: 0,
    });

    const mushfiq = await User.create({
      name: "Mushfiqur Rahim",
      username: "mushfiq",
      email: "mushfiq@moderator.com",
      phone: "+8801700000003",
      password: hashedPasswordMod,
      role: "Moderator",
      status: "Suspended",
      points: 12,
    });

    // Create a few mock orders for Sakib to give them data
    const orders = [
      {
        moderatorId: sakib._id,
        customerName: "John Doe",
        customerPhone: "+8801811111111",
        address: "123 Green Road, Dhaka",
        productName: "iPhone 15 Pro",
        category: "Mobile Phones",
        quantity: 1,
        unitPrice: 120000,
        deliveryCharge: 100,
        totalAmount: 120100,
        status: "Delivered",
        notes: "Deliver in afternoon",
      },
      {
        moderatorId: sakib._id,
        customerName: "Jane Smith",
        customerPhone: "+8801822222222",
        address: "456 Blue Avenue, Chittagong",
        productName: "Samsung S24 Ultra",
        category: "Mobile Phones",
        quantity: 1,
        unitPrice: 135000,
        deliveryCharge: 120,
        totalAmount: 135120,
        status: "Confirmed",
        notes: "Gift wrap it",
      },
      {
        moderatorId: sakib._id,
        customerName: "Alice Cooper",
        customerPhone: "+8801833333333",
        address: "789 Red Street, Sylhet",
        productName: "MacBook Air M3",
        category: "Laptops",
        quantity: 1,
        unitPrice: 115000,
        deliveryCharge: 150,
        totalAmount: 115150,
        status: "Pending",
        notes: "Call before delivery",
      },
    ];

    await Order.create(orders as any);

    // Create notifications
    await Notification.create([
      {
        userId: undefined,
        type: "NEW_MODERATOR",
        message: "New Moderator Registration: Tamim Iqbal is awaiting approval.",
      },
      {
        userId: undefined,
        type: "NEW_ORDER",
        message: "New Order Submitted by Sakib Al Hasan for iPhone 15 Pro.",
      },
    ] as any);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendRegistrationEmail, sendPasswordResetEmail } from "@/lib/email";

export async function registerModerator(formData: any) {
  try {
    await connectToDatabase();

    const { name, username, email, phone, password } = formData;

    if (!name || !username || !email || !phone || !password) {
      return { success: false, error: "All fields are required." };
    }

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await User.findOne({ email: emailLower });
    if (existingEmail) {
      return { success: false, error: "Email is already registered." };
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: usernameLower });
    if (existingUsername) {
      return { success: false, error: "Username is already taken." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username: usernameLower,
      email: emailLower,
      phone,
      password: hashedPassword,
      role: "Moderator",
      status: "Pending", // Admin approval required
      points: 0,
    });

    // Create system notification for admins
    await Notification.create({
      userId: undefined, // Broadcast/Admins
      type: "NEW_MODERATOR",
      message: `New Moderator Registration: ${name} (@${usernameLower}) has registered and is pending approval.`,
    });

    // Send confirmation email
    try {
      await sendRegistrationEmail(emailLower, name, usernameLower, password);
    } catch (emailErr) {
      console.error("Failed to send registration email:", emailErr);
    }

    return {
      success: true,
      message: "Registration successful! Your credentials have been emailed, and your account is pending admin approval.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Failed to register." };
  }
}

// Temporary in-memory reset token storage (in a production app, save to User model or a Token collection)
// Since we want production-ready with MongoDB, let's extend User model dynamically or store in Mongoose.
// Let's do a simulation of forgot password: find user, generate token, return mock link, let user navigate to /reset-password?token=XYZ.
export async function forgotPassword(email: string) {
  try {
    await connectToDatabase();
    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return { success: false, error: "No account found with this email." };
    }

    const mockToken = Buffer.from(emailLower + "||" + Date.now()).toString("base64");
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(mockToken)}`;

    try {
      await sendPasswordResetEmail(emailLower, user.name, resetLink);
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      return { success: false, error: "Failed to send reset email. SMTP configuration error." };
    }
    
    return {
      success: true,
      message: "Password reset link has been dispatched to your email address.",
      resetLink: `/reset-password?token=${encodeURIComponent(mockToken)}`,
    };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}

export async function resetPassword(token: string, passwordNew: string) {
  try {
    await connectToDatabase();

    if (!token || !passwordNew) {
      return { success: false, error: "Invalid request data." };
    }

    // Decode token: base64 email||timestamp
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email, timestampStr] = decoded.split("||");
    const timestamp = parseInt(timestampStr, 10);

    if (!email || isNaN(timestamp)) {
      return { success: false, error: "Invalid or corrupted reset token." };
    }

    // Check token expiration (e.g., 1 hour)
    if (Date.now() - timestamp > 60 * 60 * 1000) {
      return { success: false, error: "Reset link has expired." };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}

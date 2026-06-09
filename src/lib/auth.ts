import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import User from "../models/User";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter your username/email and password.");
        }

        await connectToDatabase();

        // Find user by email or username (case-insensitive)
        const user = await User.findOne({
          $or: [
            { email: credentials.username.toLowerCase() },
            { username: credentials.username.toLowerCase() },
          ],
        });

        if (!user) {
          throw new Error("No user found with those credentials.");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password || "");
        if (!isPasswordMatch) {
          throw new Error("Incorrect password.");
        }

        // Check account status
        if (user.status === "Pending") {
          throw new Error("Your registration is pending admin approval.");
        }

        if (user.status === "Suspended") {
          throw new Error("Your account has been suspended by the administrator.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          points: user.points,
          profilePicture: user.profilePicture || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.status = user.status;
        token.points = user.points;
        token.profilePicture = user.profilePicture;
      }
      
      // Allow dynamic updates to token via session triggers (e.g. updating profile pic or points)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as "Admin" | "Moderator";
        session.user.status = token.status as "Pending" | "Approved" | "Suspended";
        session.user.points = token.points as number;
        session.user.profilePicture = token.profilePicture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "moderator-management-system-super-secret-key-2026",
};

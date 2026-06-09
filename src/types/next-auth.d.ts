import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "Admin" | "Moderator";
      status: "Pending" | "Approved" | "Suspended";
      points: number;
      profilePicture: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    role: "Admin" | "Moderator";
    status: "Pending" | "Approved" | "Suspended";
    points: number;
    profilePicture: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "Admin" | "Moderator";
    status: "Pending" | "Approved" | "Suspended";
    points: number;
    profilePicture: string;
  }
}

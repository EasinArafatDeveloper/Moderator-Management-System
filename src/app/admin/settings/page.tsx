import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import SettingsClient from "./settings-client";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findById(session.user.id);
  if (!dbUser) return null;

  const serializedUser = {
    name: dbUser.name,
    username: dbUser.username,
    email: dbUser.email,
    phone: dbUser.phone,
    role: dbUser.role,
    profilePicture: dbUser.profilePicture || "",
    createdAt: dbUser.createdAt.toISOString(),
  };

  return <SettingsClient dbUser={serializedUser} />;
}

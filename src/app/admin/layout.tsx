import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "Admin") {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findById(session.user.id);

  const user = {
    name: dbUser?.name || session.user.name || "",
    email: dbUser?.email || session.user.email || "",
    role: "Admin" as const,
    profilePicture: dbUser?.profilePicture || session.user.profilePicture || "",
  };

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}

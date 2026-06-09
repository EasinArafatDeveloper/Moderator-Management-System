import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminOrdersClient from "./orders-client";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    redirect("/login");
  }

  return <AdminOrdersClient />;
}

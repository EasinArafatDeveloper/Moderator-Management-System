import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersClient from "./orders-client";

export default async function ModeratorOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return <OrdersClient userId={session.user.id} />;
}

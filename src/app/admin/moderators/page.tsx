import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModeratorsClient from "./moderators-client";

export default async function AdminModeratorsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    redirect("/login");
  }

  return <ModeratorsClient />;
}

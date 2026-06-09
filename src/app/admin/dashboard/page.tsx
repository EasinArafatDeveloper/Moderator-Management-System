import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminDashboardStats, getActivityLogs, getNotifications } from "@/actions/admin-actions";
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  ShieldCheck,
  TrendingUp,
  Bell,
  History,
  FileText,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const [statsRes, logsRes, notifRes] = await Promise.all([
    getAdminDashboardStats(),
    getActivityLogs(8), // Limit to 8 items for dashboard view
    getNotifications(),
  ]);

  const stats = statsRes.success && statsRes.stats ? statsRes.stats : {
    totalModerators: 0,
    activeModerators: 0,
    pendingModerators: 0,
    totalOrders: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  };

  const logs = logsRes.success && logsRes.logs ? logsRes.logs : [];
  const notifications = notifRes.success && notifRes.notifications ? notifRes.notifications : [];

  const statCards = [
    {
      name: "Total Moderators",
      value: stats.totalModerators,
      subtext: `${stats.activeModerators} active / ${stats.pendingModerators} pending`,
      icon: Users,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      name: "Total Sales Orders",
      value: stats.totalOrders,
      subtext: `${stats.confirmedOrders} confirmed / ${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
    {
      name: "Total System Revenue",
      value: formatPrice(stats.totalRevenue),
      subtext: "From confirmed & delivered orders",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      name: "Pending Orders",
      value: stats.pendingOrders,
      subtext: "Require status confirmation",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      name: "Cancelled Orders",
      value: stats.cancelledOrders,
      subtext: "Non-credited orders",
      icon: XCircle,
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-black text-foreground">Management Console Overview</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Review real-time stats, moderator requests, order processing, and system audit logs.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="flex flex-col bg-card border border-border/80 rounded-2xl p-5 shadow-sm"
          >
            <div className={`p-2 rounded-xl border w-fit ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-4">
              {card.name}
            </p>
            <p className="text-xl font-black text-foreground mt-1.5 leading-none">
              {card.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-2.5">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Main split grid: Activity Log vs System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Activity Logs (Admin Audit Trail) */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Recent Activity Logs
          </h3>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Action Description</th>
                  <th className="pb-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground font-semibold">
                      No system activity logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="text-xs font-semibold hover:bg-secondary/5 transition-colors">
                      <td className="py-3.5">
                        <p className="font-bold text-foreground">{log.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{log.user?.role}</p>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-[9px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                        {log.details}
                      </td>
                      <td className="py-3.5 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Notifications / System Broadcasts */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            System Broadcasts
          </h3>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">All clear</p>
                <p className="text-[10px] text-muted-foreground/60">No pending alerts received.</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`p-3.5 border rounded-xl flex flex-col gap-1 transition-all ${
                    !n.isRead ? "bg-primary/5 border-primary/20" : "bg-secondary/10 border-border/50"
                  }`}
                >
                  <p className={`text-xs text-foreground leading-normal ${!n.isRead ? "font-bold" : "font-semibold"}`}>
                    {n.message}
                  </p>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase mt-1">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

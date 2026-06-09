import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { getLeaderboard } from "@/actions/moderator-actions";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ModeratorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await connectToDatabase();

  const [dbUser, totalOrders, confirmedCount, deliveredCount, pendingCount, cancelledCount] =
    await Promise.all([
      User.findById(session.user.id),
      Order.countDocuments({ moderatorId: session.user.id }),
      Order.countDocuments({ moderatorId: session.user.id, status: "Confirmed" }),
      Order.countDocuments({ moderatorId: session.user.id, status: "Delivered" }),
      Order.countDocuments({ moderatorId: session.user.id, status: "Pending" }),
      Order.countDocuments({ moderatorId: session.user.id, status: "Cancelled" }),
    ]);

  const leaderboardRes = await getLeaderboard();
  const leaderboard = leaderboardRes.success && leaderboardRes.leaderboard ? leaderboardRes.leaderboard : [];

  const stats = [
    {
      name: "Total Orders Submitted",
      value: totalOrders,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/15",
    },
    {
      name: "Orders Confirmed/Delivered",
      value: confirmedCount + deliveredCount,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-500 border-green-500/15",
    },
    {
      name: "Orders Pending Verification",
      value: pendingCount,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/15",
    },
    {
      name: "Orders Cancelled",
      value: cancelledCount,
      icon: XCircle,
      color: "bg-red-500/10 text-red-500 border-red-500/15",
    },
    {
      name: "Total Earned Points",
      value: dbUser?.points || 0,
      icon: Coins,
      color: "bg-violet-500/10 text-violet-500 border-violet-500/15",
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Hero header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-black text-foreground">Welcome back, {dbUser?.name}!</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Track your client submissions, performance targets, and points totals.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-bold text-sm rounded-xl self-start md:self-auto">
          <Coins className="w-4 h-4" />
          <span>My Score: {dbUser?.points || 0} Points</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="flex flex-col bg-card border border-border/80 rounded-2xl p-4 shadow-sm"
          >
            <div className={`p-2 rounded-xl border w-fit ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-4">
              {item.name}
            </p>
            <p className="text-2xl font-black text-foreground mt-1.5 leading-none">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Leaderboard and Profile Column split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            My Profile Card
          </h3>
          <div className="flex flex-col items-center text-center pb-6 border-b border-border/40">
            {dbUser?.profilePicture ? (
              <img
                src={dbUser.profilePicture}
                alt={dbUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md mb-4"
              />
            ) : (
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
            <h4 className="font-black text-base text-foreground">{dbUser?.name}</h4>
            <p className="text-[11px] text-muted-foreground font-semibold">@{dbUser?.username}</p>
          </div>

          <div className="flex-1 py-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Registered Email</span>
              <span className="text-foreground truncate max-w-[160px]">{dbUser?.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="text-foreground">{dbUser?.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Joined Date</span>
              <span className="text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dbUser ? formatDate(dbUser.createdAt) : ""}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Verification status</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 font-bold text-[10px]">
                {dbUser?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table (Top 10 Approved moderators by points) */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top 10 Leaderboard
          </h3>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 text-center w-12">Rank</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground font-semibold">
                      No leaderboard data available.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item: any, index: number) => {
                    const isCurrentUser = item.id === session.user.id;
                    const rank = index + 1;
                    return (
                      <tr
                        key={item.id}
                        className={`text-xs font-semibold ${
                          isCurrentUser ? "bg-primary/5 text-primary" : "text-foreground/90"
                        }`}
                      >
                        <td className="py-3 text-center font-bold">
                          {rank === 1 && "🥇"}
                          {rank === 2 && "🥈"}
                          {rank === 3 && "🥉"}
                          {rank > 3 && rank}
                        </td>
                        <td className="py-3 flex items-center gap-2">
                          {item.profilePicture ? (
                            <img
                              src={item.profilePicture}
                              alt={item.name}
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[10px]">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold truncate max-w-[140px] md:max-w-[200px]">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">@{item.username}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 font-bold text-[9px]">
                            Approved
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-sm text-primary">
                          {item.points}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "Admin" | "Moderator";
  userName: string;
  userPoints?: number;
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ role, userName, userPoints, className, onClose }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Moderators", href: "/admin/moderators", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const moderatorLinks = [
    { name: "Dashboard", href: "/moderator/dashboard", icon: LayoutDashboard },
    { name: "Orders & Forms", href: "/moderator/orders", icon: ShoppingBag },
    { name: "My Profile", href: "/moderator/profile", icon: User },
  ];

  const links = role === "Admin" ? adminLinks : moderatorLinks;

  return (
    <aside
      className={cn(
        "flex flex-col w-64 h-screen bg-background border-r border-border/80 transition-all duration-300",
        className
      )}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight tracking-wide text-foreground">
            ModManager
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {role} Portal
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <link.icon className={cn("w-4 h-4 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{link.name}</span>
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info panel at bottom */}
      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between gap-3 mb-4 p-2 bg-background/50 border border-border/40 rounded-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground font-medium truncate">
              {role === "Admin" ? "System Administrator" : "Moderator"}
            </p>
          </div>
          {role === "Moderator" && userPoints !== undefined && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs">
              <TrendingUp className="w-3. h-3" />
              <span>{userPoints} pts</span>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border hover:bg-destructive/5 hover:border-destructive/20 text-muted-foreground hover:text-destructive text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

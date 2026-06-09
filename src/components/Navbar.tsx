"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, User, Check, Clock } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getNotifications, markAllNotificationsRead } from "@/actions/admin-actions";
import { useToast } from "./ui/Toast";
import { formatDate } from "@/lib/utils";

interface NavbarProps {
  userName: string;
  userEmail: string;
  profilePicture?: string;
  role: "Admin" | "Moderator";
  onMenuToggle: () => void;
}

export default function Navbar({ userName, userEmail, profilePicture, role, onMenuToggle }: NavbarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res.success) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast("All notifications marked as read.", "success");
      }
    } catch (err) {
      toast("Failed to update notifications.", "error");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border/80">
      {/* Mobile Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl lg:hidden text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-foreground capitalize">
            {role === "Admin" ? "Admin Console" : "Moderator Workspace"}
          </h2>
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-secondary/30 hover:bg-secondary/80 border border-border text-foreground/80 hover:text-foreground transition-all duration-200 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            )}
          </button>

          {/* Floating Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-semibold text-muted-foreground">All caught up!</p>
                    <p className="text-[10px] text-muted-foreground/60">No new alerts to show.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 flex gap-3 transition-colors ${
                        !n.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/15"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs text-foreground leading-normal ${!n.isRead ? "font-semibold" : "font-normal"}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 self-center" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <ThemeToggle />

        <div className="w-px h-5 bg-border/80 mx-1 hidden sm:block" />

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-1.5">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={userName}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary/10"
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
            <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: "Admin" | "Moderator";
    points?: number;
    profilePicture?: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <Sidebar
        role={user.role}
        userName={user.name}
        userPoints={user.points}
        className="hidden lg:flex flex-shrink-0"
      />

      {/* Mobile Sidebar overlay drawer (visible on small screens) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative animate-slide-in">
            {/* Close button inside drawer */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-secondary/80 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-50"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar
              role={user.role}
              userName={user.name}
              userPoints={user.points}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main workspace container */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Navbar
          userName={user.name}
          userEmail={user.email}
          profilePicture={user.profilePicture}
          role={user.role}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8 bg-secondary/10 dark:bg-secondary/5 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

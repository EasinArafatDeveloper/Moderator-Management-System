"use client";

import React, { createContext, useContext, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  confirm: (options: {
    title: string;
    text: string;
    icon?: "warning" | "error" | "success" | "info" | "question";
    confirmButtonText?: string;
    cancelButtonText?: string;
  }) => Promise<boolean>;
  alert: (options: {
    title: string;
    text: string;
    icon?: "warning" | "error" | "success" | "info";
  }) => Promise<void>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  
  const showToast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const formattedMessage = title ? `${title}: ${message}` : message;
    
    // Customize toast style based on theme (dark mode compatibility)
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    
    const toastStyle = {
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#f8fafc" : "#0f172a",
      borderRadius: "12px",
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "12px 16px",
    };

    switch (type) {
      case "success":
        toast.success(formattedMessage, { style: toastStyle });
        break;
      case "error":
        toast.error(formattedMessage, { style: toastStyle, duration: 5000 });
        break;
      case "warning":
        toast(formattedMessage, {
          icon: "⚠️",
          style: toastStyle,
        });
        break;
      case "info":
      default:
        toast(formattedMessage, {
          icon: "ℹ️",
          style: toastStyle,
        });
        break;
    }
  }, []);

  const confirm = useCallback(async (options: {
    title: string;
    text: string;
    icon?: "warning" | "error" | "success" | "info" | "question";
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<boolean> => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6", // Primary blue (tailwind blue-500)
      cancelButtonColor: "#ef4444", // Red (tailwind red-500)
      confirmButtonText: options.confirmButtonText || "Yes, proceed",
      cancelButtonText: options.cancelButtonText || "Cancel",
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#f8fafc" : "#0f172a",
      customClass: {
        popup: "rounded-3xl border border-border shadow-2xl p-6",
        title: "text-lg font-black mt-2",
        htmlContainer: "text-xs font-semibold text-muted-foreground mt-1",
        confirmButton: "px-5 py-2.5 rounded-xl text-xs font-bold mr-2 text-white bg-blue-500 hover:bg-blue-600 transition-colors",
        cancelButton: "px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors",
      },
      buttonsStyling: false, // Disables SweetAlert2 default button styling to apply our custom Tailwind classes
    });
    return result.isConfirmed;
  }, []);

  const alert = useCallback(async (options: {
    title: string;
    text: string;
    icon?: "warning" | "error" | "success" | "info";
  }): Promise<void> => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || "info",
      confirmButtonColor: "#3b82f6",
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#f8fafc" : "#0f172a",
      customClass: {
        popup: "rounded-3xl border border-border shadow-2xl p-6",
        title: "text-lg font-black mt-2",
        htmlContainer: "text-xs font-semibold text-muted-foreground mt-1",
        confirmButton: "px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors",
      },
      buttonsStyling: false,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast, confirm, alert }}>
      {children}
      <Toaster position="bottom-right" reverseOrder={false} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

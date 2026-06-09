"use client";

import { useEffect, useState, useCallback } from "react";
import { getModerators, updateModeratorStatus, updateModeratorProfile, deleteModerator } from "@/actions/moderator-actions";
import { useToast } from "@/components/ui/Toast";
import { cn, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Loader2,
  X,
  Save,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function ModeratorsClient() {
  const { toast } = useToast();
  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Editing dialog state
  const [editingMod, setEditingMod] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"Approved" | "Suspended" | "Pending">("Pending");
  const [editPoints, setEditPoints] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  const loadModerators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getModerators({
        search,
        status: statusFilter,
      });

      if (res.success && res.moderators) {
        setModerators(res.moderators);
      } else {
        toast(res.error || "Failed to load moderators.", "error");
      }
    } catch (err) {
      toast("Error fetching moderators.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    loadModerators();
  }, [loadModerators]);

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Suspended" | "Pending") => {
    try {
      const res = await updateModeratorStatus(id, newStatus);
      if (res.success) {
        toast(`Moderator status updated to ${newStatus}.`, "success");
        loadModerators();
      } else {
        toast(res.error || "Failed to update status.", "error");
      }
    } catch (err) {
      toast("Error changing status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this moderator? This will purge all their order history!")) {
      return;
    }

    try {
      const res = await deleteModerator(id);
      if (res.success) {
        toast("Moderator deleted successfully.", "success");
        loadModerators();
      } else {
        toast(res.error || "Failed to delete moderator.", "error");
      }
    } catch (err) {
      toast("Error deleting user.", "error");
    }
  };

  const openEditModal = (mod: any) => {
    setEditingMod(mod);
    setEditName(mod.name);
    setEditEmail(mod.email);
    setEditPhone(mod.phone);
    setEditStatus(mod.status);
    setEditPoints(mod.points);
    setEditNotes(mod.adminNotes || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMod) return;

    try {
      const res = await updateModeratorProfile(editingMod.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        points: Number(editPoints),
        adminNotes: editNotes,
      });

      if (res.success) {
        toast("Moderator profile updated successfully!", "success");
        setEditingMod(null);
        loadModerators();
      } else {
        toast(res.error || "Failed to save changes.", "error");
      }
    } catch (err) {
      toast("Error updating profile.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground">Moderator Accounts</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Approve pending registrations, suspend active profiles, adjust point scores, or review moderator logs.
        </p>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border/80 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/35 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            className="px-3 py-2 bg-secondary/35 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200"
          >
            <option value="ALL">All Accounts</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Accounts List Grid/Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                <th className="px-6 py-4">Moderator Details</th>
                <th className="px-6 py-4 text-center">Score Points</th>
                <th className="px-6 py-4 text-center">Orders Submitted</th>
                <th className="px-6 py-4 text-center">Account Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground">Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : moderators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-muted-foreground">
                    No moderators matching current criteria found.
                  </td>
                </tr>
              ) : (
                moderators.map((mod) => (
                  <tr key={mod.id} className="text-xs font-semibold hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {mod.profilePicture ? (
                          <img
                            src={mod.profilePicture}
                            alt={mod.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                            {mod.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{mod.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            @{mod.username} • {mod.email} • {mod.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-sm text-primary">
                      {mod.points} pts
                    </td>
                    <td className="px-6 py-4 text-center text-foreground font-bold">
                      {mod.totalOrders} <span className="text-[10px] text-muted-foreground font-normal">({mod.confirmedOrders} confirmed)</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-lg border font-bold text-[9px]",
                          mod.status === "Approved" && "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                          mod.status === "Pending" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                          mod.status === "Suspended" && "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                        )}
                      >
                        {mod.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(mod.createdAt).split(",")[0]}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {mod.status === "Pending" && (
                          <button
                            onClick={() => handleStatusChange(mod.id, "Approved")}
                            className="p-1.5 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-all duration-200"
                            title="Approve User"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {mod.status === "Approved" && (
                          <button
                            onClick={() => handleStatusChange(mod.id, "Suspended")}
                            className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-all duration-200"
                            title="Suspend User"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {mod.status === "Suspended" && (
                          <button
                            onClick={() => handleStatusChange(mod.id, "Approved")}
                            className="p-1.5 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-all duration-200"
                            title="Re-activate User"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(mod)}
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 text-foreground transition-all duration-200"
                          title="Edit Profile Settings"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mod.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-200"
                          title="Delete Moderator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editing Dialog Modal */}
      {editingMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl animate-slide-in relative">
            <button
              onClick={() => setEditingMod(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-secondary/80 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-black text-foreground mb-6 flex items-center gap-1.5">
              <span>Edit Account:</span>
              <span className="font-bold text-primary">@{editingMod.username}</span>
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Email & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Points Adjustment */}
              <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <label className="block text-xs font-bold text-foreground">Score Points Adjuster</label>
                    <p className="text-[10px] text-muted-foreground font-semibold">Change moderator score manually</p>
                  </div>
                </div>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(Number(e.target.value))}
                  className="w-20 px-3 py-1 bg-background border border-border rounded-xl text-xs font-black text-center focus:outline-none"
                  min="0"
                />
              </div>

              {/* Administrative Notes */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Administrative Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-xl text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Needs verification for phone number..."
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Moderator Details</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

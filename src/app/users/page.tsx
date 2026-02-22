"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Shield, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MaxisUser {
  uid: string;
  gid: string;
  username: string;
  balance: string;
  mt_quota: string;
}

export default function UsersGroupsPage() {
  const [users, setUsers] = useState<MaxisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<MaxisUser | null>(null);
  const [form, setForm] = useState({
    uid: "",
    gid: "maxis_group",
    username: "",
    password: ""
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setForm({ uid: "", gid: "maxis_group", username: "", password: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: MaxisUser) => {
    setEditingUser(user);
    setForm({ 
      uid: user.uid, 
      gid: user.gid, 
      username: user.username, 
      password: "" // Don't pre-fill password for security/API limitations
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const response = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm(`Are you sure you want to delete user ${uid}?`)) return;
    try {
      const response = await fetch(`/api/users?uid=${uid}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }
      fetchUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Users & Groups</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Manage Maxis users, authentication, and credit balances.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-surface border border-maxis-border text-white hover:bg-maxis-surface-hover transition-colors text-sm font-medium">
            <Shield className="h-4 w-4 text-maxis-muted" />
            Manage Groups
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden">
        <div className="p-4 border-b border-maxis-border flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maxis-muted" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white placeholder:text-maxis-muted focus:outline-none focus:border-maxis-green/50 focus:ring-1 focus:ring-maxis-green/50 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[200px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-maxis-green animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-12 text-red-400 text-sm">
              Error loading users: {error}
            </div>
          ) : users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-maxis-muted">
              <Shield className="h-12 w-12 opacity-20 mb-4" />
              <p>No users found in Maxis Gateway</p>
              <button 
                onClick={handleOpenAddModal}
                className="mt-4 text-maxis-green text-sm hover:underline"
              >
                Create first user
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-maxis-muted uppercase bg-maxis-darker/50 border-b border-maxis-border">
                <tr>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Group</th>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Balance</th>
                  <th className="px-6 py-4 font-medium">Quota</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maxis-border">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-maxis-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{user.uid}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-maxis-darker border border-maxis-border text-maxis-text">
                        {user.gid}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-maxis-muted">{user.username}</td>
                    <td className="px-6 py-4 font-mono text-maxis-green">
                      {user.balance === "ND" ? "Unlimited" : user.balance}
                    </td>
                    <td className="px-6 py-4 text-maxis-muted">{user.mt_quota}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 text-maxis-muted hover:text-white rounded-md hover:bg-maxis-darker transition-colors"
                          title="Edit User"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.uid)}
                          className="p-1.5 text-maxis-muted hover:text-red-400 rounded-md hover:bg-maxis-darker transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-maxis-border flex items-center justify-between text-sm text-maxis-muted bg-maxis-darker/30">
          <span>{users.length} users configured</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-maxis-border hover:bg-maxis-surface-hover disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-maxis-border hover:bg-maxis-surface-hover disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit Maxis User" : "Add New Maxis User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">User ID</label>
            <input 
              required
              disabled={!!editingUser}
              value={form.uid}
              onChange={e => setForm({...form, uid: e.target.value})}
              placeholder="e.g. user_01"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Group ID</label>
            <input 
              required
              value={form.gid}
              onChange={e => setForm({...form, gid: e.target.value})}
              placeholder="e.g. maxis_group"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Username</label>
            <input 
              required
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              placeholder="Authentication username"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Password {editingUser && "(Leave blank to keep current)"}</label>
            <input 
              required={!editingUser}
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder={editingUser ? "New password" : "Authentication password"}
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-maxis-border text-white hover:bg-maxis-darker transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

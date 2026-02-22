"use client";

import { useEffect, useState } from "react";
import { Server, Activity, Users, ShieldAlert, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Stats {
  connected_count?: string;
  submit_sm_count?: string;
  deliver_sm_count?: string;
  bind_rx_count?: string;
  bind_tx_count?: string;
  bind_trx_count?: string;
  [key: string]: string | undefined;
}

interface SmppUser {
  uid: string;
  gid: string;
  balance: string;
  mt: string;
  throughput: string;
  bound_connections?: string;
}

export default function SmppServerPage() {
  const [stats, setStats] = useState<Stats>({});
  const [users, setUsers] = useState<SmppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<SmppUser | null>(null);
  const [form, setForm] = useState({
    uid: "",
    gid: "demo_group",
    username: "",
    password: ""
  });

  const fetchServerData = async () => {
    try {
      const response = await fetch("/api/smpp-server");
      if (!response.ok) throw new Error("Failed to fetch SMPP Server data");
      const data = await response.json();
      setStats(data.stats || {});
      setUsers(data.users || []);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerData();
    const interval = setInterval(fetchServerData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setForm({ uid: "", gid: "demo_group", username: "", password: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: SmppUser) => {
    setEditingUser(user);
    setForm({ 
      uid: user.uid, 
      gid: user.gid || "demo_group",
      username: "",
      password: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const response = await fetch("/api/smpp-server", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update user');
        }
      } else {
        const response = await fetch("/api/smpp-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, action: 'create' })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create user');
        }
      }
      setIsModalOpen(false);
      fetchServerData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserAction = async (uid: string, action: 'unbind' | 'ban') => {
    if (!confirm(`Are you sure you want to ${action} user ${uid} from the SMPP server?`)) return;
    try {
      const response = await fetch("/api/smpp-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} user`);
      }
      fetchServerData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Server className="h-6 w-6 text-indigo-400" />
              SMPP Server API
            </h2>
            <p className="text-sm text-maxis-muted mt-1">
              Real-time monitoring of Jasmin&apos;s internal SMPP server and client sessions.
            </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
        >
          <Users className="h-4 w-4" />
          New SMPP Client
        </button>
      </div>

      {loading && !Object.keys(stats).length ? (
        <div className="flex items-center gap-3 p-4 bg-maxis-surface rounded-lg border border-maxis-border">
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          <span className="text-sm text-maxis-muted">Connecting to SMPP Server...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-maxis-surface p-5 rounded-xl border border-maxis-border">
              <div className="flex items-center gap-2 text-maxis-muted mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Active Submits</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.submit_sm_count || '0'}</p>
              <p className="text-xs text-maxis-muted">Total SMPP MT messages</p>
            </div>
            
            <div className="bg-maxis-surface p-5 rounded-xl border border-maxis-border">
              <div className="flex items-center gap-2 text-maxis-muted mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Deliver SM</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.deliver_sm_count || '0'}</p>
              <p className="text-xs text-maxis-muted">Total Delivers / DLRs</p>
            </div>

            <div className="bg-maxis-surface p-5 rounded-xl border border-maxis-border">
              <div className="flex flex-col gap-1">
                 <div className="flex justify-between text-sm">
                   <span className="text-maxis-muted">RX Binds</span>
                   <span className="text-indigo-400 font-medium">{stats.bind_rx_count || '0'}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-maxis-muted">TX Binds</span>
                   <span className="text-indigo-400 font-medium">{stats.bind_tx_count || '0'}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-maxis-muted">TRX Binds</span>
                   <span className="text-indigo-400 font-medium">{stats.bind_trx_count || '0'}</span>
                 </div>
              </div>
            </div>

            <div className="bg-maxis-surface p-5 rounded-xl border border-maxis-border flex flex-col justify-center">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-maxis-muted flex items-center gap-2">
                    <div className="w-2 h-2 bg-maxis-green rounded-full shadow-[0_0_8px_rgba(57,255,20,0.6)] animate-pulse" />
                    Server Status
                 </span>
                 <span className="text-sm font-medium text-maxis-green">Listening :2775</span>
               </div>
            </div>
          </div>

          <div className="mt-8">
             <h3 className="text-lg font-semibold text-white mb-4">Active Client Sessions</h3>
             <div className="bg-maxis-surface border border-maxis-border rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-maxis-border/50">
                  <thead className="bg-maxis-darker">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">UID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">Group</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">MT Msgs</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">Throughput</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-maxis-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-maxis-border/50">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-maxis-muted">
                          No active clients bound to the SMPP Server.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.uid} className="hover:bg-maxis-darker/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.uid}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-maxis-muted">{user.gid}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {parseInt(user.bound_connections || '0') > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-maxis-green/10 text-maxis-green text-xs font-medium border border-maxis-green/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-maxis-green animate-pulse" />
                                Online ({user.bound_connections})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-maxis-muted/10 text-maxis-muted text-xs font-medium border border-maxis-border">
                                <span className="w-1.5 h-1.5 rounded-full bg-maxis-muted" />
                                Offline
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-400">{user.mt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-maxis-muted">{user.throughput}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleOpenEditModal(user)}
                              className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors"
                              title="Edit User Config"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.uid, 'unbind')}
                              disabled={parseInt(user.bound_connections || '0') === 0}
                              className={`mr-4 transition-colors ${parseInt(user.bound_connections || '0') === 0 ? 'text-maxis-muted cursor-not-allowed' : 'text-amber-500 hover:text-amber-400'}`}
                              title={parseInt(user.bound_connections || '0') === 0 ? "User is already offline" : "Force Unbind TCP Session"}
                            >
                              Unbind
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.uid, 'ban')}
                              disabled={parseInt(user.bound_connections || '0') === 0}
                              className={`flex items-center gap-1 ml-auto transition-colors ${parseInt(user.bound_connections || '0') === 0 ? 'text-maxis-muted cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
                              title={parseInt(user.bound_connections || '0') === 0 ? "User is already offline" : "Unbind and Ban"}
                            >
                              <ShieldAlert className="h-3 w-3" /> Ban
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit SMPP Client" : "Add SMPP Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">User ID (UID)</label>
            <input 
              required
              disabled={!!editingUser}
              value={form.uid}
              onChange={e => setForm({...form, uid: e.target.value})}
              placeholder="e.g. client_123"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Group (GID)</label>
            <input 
              required
              value={form.gid}
              onChange={e => setForm({...form, gid: e.target.value})}
              placeholder="e.g. demo_group"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Auth Username</label>
            <input 
              required={!editingUser}
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              placeholder={editingUser ? "Leave blank to keep current" : "API Username"}
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Auth Password</label>
            <input 
              type="password"
              required={!editingUser}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder={editingUser ? "Leave blank to keep current" : "API Password"}
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-maxis-border rounded-lg text-sm text-white hover:bg-maxis-darker">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-600 transition-colors">
               {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
               {editingUser ? "Save Changes" : "Create Client"}
             </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

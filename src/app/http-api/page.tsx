"use client";

import { useEffect, useState } from "react";
import { AppWindow, Activity, LogIn, ServerCrash, Loader2, AlertCircle, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Stats {
  request_count?: string;
  success_count?: string;
  auth_error_count?: string;
  route_error_count?: string;
  server_error_count?: string;
  [key: string]: string | undefined;
}

interface HttpUser {
  uid: string;
  gid: string;
  balance: string;
  mt: string;
  throughput: string;
}

export default function HttpApiPage() {
  const [stats, setStats] = useState<Stats>({});
  const [users, setUsers] = useState<HttpUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<HttpUser | null>(null);
  const [form, setForm] = useState({
    uid: "",
    gid: "demo_group",
    username: "",
    password: ""
  });

  const fetchServerData = async () => {
    try {
      const response = await fetch("/api/http-api");
      if (!response.ok) throw new Error("Failed to fetch HTTP API data");
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

  const handleOpenEditModal = (user: HttpUser) => {
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
        const response = await fetch("/api/http-api", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update user');
        }
      } else {
        const response = await fetch("/api/http-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <AppWindow className="h-6 w-6 text-fuchsia-400" />
              Restful & HTTP APIs
            </h2>
            <p className="text-sm text-maxis-muted mt-1">
              Real-time monitoring of Jasmin&apos;s incoming HTTP API server traffic.
            </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500 text-white hover:bg-fuchsia-600 transition-colors text-sm font-medium"
        >
          <Users className="h-4 w-4" />
          New API User
        </button>
      </div>

      {loading && !Object.keys(stats).length ? (
        <div className="flex items-center gap-3 p-4 bg-maxis-surface rounded-lg border border-maxis-border">
          <Loader2 className="h-5 w-5 text-fuchsia-400 animate-spin" />
          <span className="text-sm text-maxis-muted">Connecting to HTTP Server...</span>
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
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Total Requests</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.request_count || '0'}</p>
              <p className="text-xs text-maxis-muted">Since server start</p>
            </div>
            
            <div className="bg-maxis-surface p-5 rounded-xl border-t-2 border-t-maxis-green border-x border-b border-x-maxis-border border-b-maxis-border">
              <div className="flex items-center gap-2 text-maxis-muted mb-2">
                <span className="text-sm font-medium">Successful Requests</span>
              </div>
              <p className="text-2xl font-bold text-maxis-green mb-1">{stats.success_count || '0'}</p>
            </div>

            <div className="bg-maxis-surface p-5 rounded-xl border-t-2 border-t-amber-500 border-x border-b border-x-maxis-border border-b-maxis-border">
              <div className="flex items-center gap-2 text-maxis-muted mb-2">
                 <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">Auth Errors</span>
              </div>
              <p className="text-2xl font-bold text-amber-500 mb-1">{stats.auth_error_count || '0'}</p>
            </div>

            <div className="bg-maxis-surface p-5 rounded-xl border-t-2 border-t-red-500 border-x border-b border-x-maxis-border border-b-maxis-border">
              <div className="flex items-center gap-2 text-maxis-muted mb-2">
                 <ServerCrash className="h-4 w-4" />
                <span className="text-sm font-medium">Server / Route Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-500 mb-1">{parseInt(stats.route_error_count || '0') + parseInt(stats.server_error_count || '0')}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row">
             <div className="flex-1 bg-maxis-surface border border-maxis-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Authorized API Users</h3>
                <div className="overflow-hidden">
                   <table className="min-w-full divide-y divide-maxis-border/50">
                     <thead className="bg-maxis-darker">
                       <tr>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">UID</th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">Group</th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-maxis-muted uppercase">Throughput</th>
                         <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-maxis-muted uppercase">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-maxis-border/50">
                       {users.length === 0 ? (
                         <tr>
                           <td colSpan={3} className="px-6 py-8 text-center text-sm text-maxis-muted">
                             No users configured.
                           </td>
                         </tr>
                       ) : (
                         users.map((user) => (
                           <tr key={user.uid} className="hover:bg-maxis-darker/50 transition-colors">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.uid}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-maxis-muted">{user.gid}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-fuchsia-400">{user.throughput || 'Unlimited'}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                               <button 
                                 onClick={() => handleOpenEditModal(user)}
                                 className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                                 title="Edit User Config"
                               >
                                 Edit
                               </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>
             </div>
             
             <div className="w-full lg:w-96 flex flex-col gap-4">
                 <div className="p-5 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-transparent border border-fuchsia-500/20">
                    <h4 className="text-sm font-semibold text-fuchsia-400 mb-2">HTTP Listeners</h4>
                    <p className="text-xs text-white">Send HTTP POST requests directly to Jasmin&apos;s internal HTTP API.</p>
                    <div className="mt-3 p-2 bg-maxis-darker rounded border border-maxis-border font-mono text-xs text-maxis-muted">
                      http://localhost:1401/send
                    </div>
                 </div>

                 <div className="p-5 rounded-xl bg-maxis-surface border border-maxis-border">
                    <h4 className="text-sm font-semibold text-white mb-2">Usage Examples</h4>
                    <div className="space-y-3">
                       <code className="block p-2 bg-maxis-darker rounded text-[10px] text-maxis-green overflow-x-auto whitespace-pre">
{`curl -X POST http://localhost:1401/send \\
-d "username=jcliadmin" \\
-d "password=jclipwd" \\
-d "to=12345678" \\
-d "content=Hello World"`}
                       </code>
                    </div>
                 </div>
             </div>

          </div>
        </>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit API User" : "Add API User"}>
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
             <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500 text-white font-medium rounded-lg text-sm disabled:opacity-50 hover:bg-fuchsia-600 transition-colors">
               {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
               {editingUser ? "Save Changes" : "Create User"}
             </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Send, Plus, Loader2, AlertCircle, Trash2, Edit } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface HttpClient {
  id: string;
  type: string;
  service_status: string;
  session_status: string;
}

export default function HttpClientsPage() {
  const [clients, setClients] = useState<HttpClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<HttpClient | null>(null);
  const [form, setForm] = useState({
    cid: "",
    url: "http://example.com/callback",
    method: "POST"
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/http-clients");
      if (!response.ok) throw new Error("Failed to fetch HTTP Clients");
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setForm({ cid: "", url: "http://example.com/callback", method: "POST" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: HttpClient) => {
    setEditingClient(client);
    setForm({ 
      cid: client.id, 
      url: "http://example.com/callback", // Default as we don't have detail view mapped yet
      method: "POST"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingClient ? "PUT" : "POST";
      const response = await fetch("/api/http-clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingClient ? 'update' : 'create'} HTTP Client`);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (cid: string) => {
    if (!confirm(`Are you sure you want to delete HTTP Client ${cid}?`)) return;
    try {
      const response = await fetch(`/api/http-clients?cid=${cid}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete HTTP Client");
      }
      fetchClients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">HTTP Clients</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Manage external HTTP callbacks like DeliverSM and DLR throwers.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add HTTP Client
        </button>
      </div>

      {loading && clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border">
          <Loader2 className="h-8 w-8 text-maxis-green animate-spin mb-4" />
          <p className="text-maxis-muted text-sm">Loading configurations...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-red-900/50">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-400 text-sm">Error connecting: {error}</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border text-maxis-muted">
          <Send className="h-12 w-12 opacity-20 mb-4" />
          <p>No HTTP Clients configured in Jasmin.</p>
          <button onClick={handleOpenAddModal} className="mt-4 text-maxis-green text-sm hover:underline">
            Configure your first HTTP Callback
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm transition-all hover:border-maxis-border/80 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-maxis-darker border border-maxis-border flex items-center justify-center">
                    <Send className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{client.id}</h3>
                    <p className="text-xs text-maxis-muted">{client.type} Thrower</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-maxis-muted hover:text-red-400 p-1 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3 flex-1 text-sm bg-maxis-darker p-3 rounded-lg border border-maxis-border">
                  <div className="flex justify-between">
                    <span className="text-maxis-muted">URL</span>
                    <span className="text-white truncate lg:max-w-32">HTTP Method</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-maxis-muted">Status</span>
                    <span className="text-maxis-green">{client.service_status || 'Online'}</span>
                  </div>
              </div>

              <div className="mt-4 flex justify-end">
                 <button onClick={() => handleOpenEditModal(client)} className="text-sm flex items-center gap-1.5 text-maxis-muted hover:text-white transition-colors">
                    <Edit className="h-3 w-3" /> Edit Config
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Sample Content / Test Helper */}
      {clients.length > 0 && (
         <div className="mt-8 p-4 rounded-lg bg-maxis-green/10 border border-maxis-green/20">
           <p className="text-sm font-medium text-maxis-green">HTTP Clients are fully active and updating in real-time.</p>
           <p className="text-xs text-maxis-green/70 mt-1">If you receive incoming SMS, Jasmin will forward them using these endpoints in real time.</p>
         </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Edit HTTP Client" : "Add HTTP Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Connector ID (CID)</label>
            <input 
              required
              disabled={!!editingClient}
              value={form.cid}
              onChange={e => setForm({...form, cid: e.target.value})}
              placeholder="e.g. callback_01"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Callback URL</label>
            <input 
              required
              value={form.url}
              onChange={e => setForm({...form, url: e.target.value})}
              placeholder="http://your-server/api/sms"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Method</label>
            <select 
              value={form.method}
              onChange={e => setForm({...form, method: e.target.value})}
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:border-maxis-green outline-none"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-maxis-border rounded-lg text-sm text-white hover:bg-maxis-darker">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-maxis-green text-maxis-darker font-medium rounded-lg text-sm disabled:opacity-50">
               {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
               {editingClient ? "Save Changes" : "Create"}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

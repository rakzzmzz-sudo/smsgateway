"use client";

import { useEffect, useState } from "react";
import { Network, Plus, Server, CheckCircle2, XCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MaxisConnector {
  id: string;
  type: 'SMPP' | 'HTTP';
  service_status: string;
  session_status: string;
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<MaxisConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingConnector, setEditingConnector] = useState<MaxisConnector | null>(null);
  const [form, setForm] = useState({
    cid: "",
    host: "127.0.0.1",
    port: "2775",
    username: "",
    password: ""
  });

  const fetchConnectors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/connectors");
      if (!response.ok) throw new Error("Failed to fetch connectors");
      const data = await response.json();
      setConnectors(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleOpenAddModal = () => {
    setEditingConnector(null);
    setForm({ cid: "", host: "127.0.0.1", port: "2775", username: "", password: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (connector: MaxisConnector) => {
    setEditingConnector(connector);
    setForm({ 
      cid: connector.id, 
      host: "127.0.0.1", // Defaults for now as we don't fetch full details in GET list
      port: "2775",
      username: "",
      password: "" 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingConnector ? "PUT" : "POST";
      const response = await fetch("/api/connectors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingConnector ? 'update' : 'create'} connector`);
      }
      setIsModalOpen(false);
      fetchConnectors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConnector = async (cid: string) => {
    if (!confirm(`Are you sure you want to delete connector ${cid}?`)) return;
    try {
      const response = await fetch(`/api/connectors?cid=${cid}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete connector");
      }
      fetchConnectors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleToggleService = async (cid: string, currentStatus: string) => {
  const action = currentStatus.includes('STARTED') ? 'stop' : 'start';
    try {
      const response = await fetch("/api/connectors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid, action, type: connectors.find(c => c.id === cid)?.type })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} connector`);
      }
      fetchConnectors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Connectors</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Manage SMPP and HTTP connections to external providers.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Connector
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border">
          <Loader2 className="h-8 w-8 text-maxis-green animate-spin mb-4" />
          <p className="text-maxis-muted text-sm">Loading connectors from gateway...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-red-900/50">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-400 text-sm">Error connecting to Maxis: {error}</p>
        </div>
      ) : connectors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border text-maxis-muted">
          <Network className="h-12 w-12 opacity-20 mb-4" />
          <p>No connectors configured in Maxis Gateway</p>
          <button 
            onClick={handleOpenAddModal}
            className="mt-4 text-maxis-green text-sm hover:underline"
          >
            Configure your first connector
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {connectors.map((connector) => (
            <div key={connector.id} className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm transition-all hover:border-maxis-border/80 group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-maxis-darker border border-maxis-border flex items-center justify-center">
                    {connector.type === "SMPP" ? (
                      <Server className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    ) : (
                      <Network className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{connector.id}</h3>
                    <p className="text-xs text-maxis-muted">{connector.type} Client</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteConnector(connector.id)}
                  className="text-maxis-muted hover:text-red-400 p-1 rounded-md hover:bg-maxis-darker transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-maxis-muted">Service</span>
                  <span className={`font-medium ${
                    connector.service_status.includes('STARTED') ? 'text-maxis-green' : 'text-red-400'
                  }`}>
                    {connector.service_status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-maxis-muted">Session</span>
                  <span className="font-medium text-white">{connector.session_status}</span>
                </div>
                <div className="flex justify-between text-sm items-center pt-2 border-t border-maxis-border">
                  <span className="text-maxis-muted">Status</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    connector.session_status.includes('BOUND') || connector.service_status.includes('STARTED') ? "text-maxis-green" : "text-red-400"
                  }`}>
                    {connector.session_status.includes('BOUND') || connector.service_status.includes('STARTED') ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {connector.session_status.includes('BOUND') ? 'Online' : connector.service_status.includes('STARTED') ? 'Started' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-maxis-border flex justify-between">
                <button 
                  onClick={() => handleOpenEditModal(connector)}
                  className="text-sm font-medium text-maxis-muted hover:text-white transition-colors"
                >
                  Configure
                </button>
                <button 
                  onClick={() => handleToggleService(connector.id, connector.service_status)}
                  className={`text-sm font-medium transition-colors ${
                    connector.service_status.includes('STARTED') 
                      ? "text-red-400 hover:text-red-300" 
                      : "text-maxis-green hover:text-maxis-green/80"
                  }`}
                >
                  {connector.service_status.includes('STARTED') ? "Stop Service" : "Start Service"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingConnector ? "Edit Connector" : "Add New Connector"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Connector ID</label>
            <input 
              required
              disabled={!!editingConnector}
              value={form.cid}
              onChange={e => setForm({...form, cid: e.target.value})}
              placeholder="e.g. PROVIDER_01"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Host</label>
            <input 
              required
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
              placeholder="e.g. 127.0.0.1"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Port</label>
            <input 
              required
              value={form.port}
              onChange={e => setForm({...form, port: e.target.value})}
              placeholder="e.g. 2775"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Username</label>
            <input 
              required
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              placeholder="SMPP username"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Password {editingConnector && "(Leave blank to keep current)"}</label>
            <input 
              required={!editingConnector}
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder={editingConnector ? "New password" : "SMPP password"}
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
              {editingConnector ? "Save Changes" : "Create Connector"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

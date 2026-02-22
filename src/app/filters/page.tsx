"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Plus, ShieldCheck, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MaxisFilter {
  fid: string;
  type: string;
  parameters: string;
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<MaxisFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFilter, setEditingFilter] = useState<MaxisFilter | null>(null);
  const [form, setForm] = useState({
    fid: "",
    type: "UserFilter",
    uid: ""
  });

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/filters");
      if (!response.ok) throw new Error("Failed to fetch filters");
      const data = await response.json();
      setFilters(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFilter(null);
    setForm({ fid: "", type: "UserFilter", uid: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (filter: MaxisFilter) => {
    setEditingFilter(filter);
    
    // Extract uid from parameters (e.g. "uid=myuser")
    const uidMatch = filter.parameters.match(/uid=([^, ]+)/);
    const uid = uidMatch ? uidMatch[1] : "";
    
    setForm({ 
      fid: filter.fid, 
      type: filter.type, 
      uid: uid
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingFilter ? "PUT" : "POST";
      const response = await fetch("/api/filters", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingFilter ? 'update' : 'create'} filter`);
      }
      setIsModalOpen(false);
      fetchFilters();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFilter = async (fid: string) => {
    if (!confirm(`Are you sure you want to delete filter ${fid}?`)) return;
    try {
      const response = await fetch(`/api/filters?fid=${fid}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete filter");
      }
      fetchFilters();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Filters & Interceptors</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Define message filtering rules and actions.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border">
          <Loader2 className="h-8 w-8 text-maxis-green animate-spin mb-4" />
          <p className="text-maxis-muted text-sm">Loading filters from gateway...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-red-900/50">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-400 text-sm">Error connecting to Maxis: {error}</p>
        </div>
      ) : filters.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 bg-maxis-surface rounded-xl border border-maxis-border text-maxis-muted">
          <ShieldAlert className="h-12 w-12 opacity-20 mb-4" />
          <p>No filters defined in Maxis Gateway</p>
          <button 
            onClick={handleOpenAddModal}
            className="mt-4 text-maxis-green text-sm hover:underline"
          >
            Create your first filter
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filters.map((filter) => (
            <div key={filter.fid} className="rounded-xl border border-maxis-border bg-maxis-surface overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-maxis-green/20 bg-maxis-green/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-maxis-green" />
                  <h3 className="font-semibold text-white">{filter.fid}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-maxis-green/20 text-maxis-green">
                  ACTIVE
                </span>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <p className="text-xs text-maxis-muted uppercase tracking-wider mb-1">Filter Type</p>
                  <p className="text-sm text-white font-medium">{filter.type}</p>
                </div>
                <div>
                  <p className="text-xs text-maxis-muted uppercase tracking-wider mb-1">Parameters</p>
                  <code className="text-sm px-2 py-1 rounded bg-maxis-darker text-maxis-green font-mono border border-maxis-border block break-all">
                    {filter.parameters}
                  </code>
                </div>
              </div>
              
              <div className="p-4 bg-maxis-darker/50 border-t border-maxis-border flex justify-end gap-3">
                <button 
                  onClick={() => handleOpenEditModal(filter)}
                  className="text-sm font-medium text-maxis-muted hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteFilter(filter.fid)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  title="Delete Filter"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingFilter ? "Edit Filter" : "Create New Filter"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Filter ID (Fid)</label>
            <input 
              required
              disabled={!!editingFilter}
              value={form.fid}
              onChange={e => setForm({...form, fid: e.target.value})}
              placeholder="e.g. filter_01"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Type</label>
            <select 
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            >
              <option value="UserFilter">User Filter</option>
              <option value="ConnectorFilter">Connector Filter</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Target User/Connector ID</label>
            <input 
              required
              value={form.uid}
              onChange={e => setForm({...form, uid: e.target.value})}
              placeholder="e.g. user_01"
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
              {editingFilter ? "Save Changes" : "Create Filter"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

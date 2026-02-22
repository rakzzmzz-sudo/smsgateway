"use client";

import { useEffect, useState } from "react";
import { Route as RouteIcon, Plus, Search, Filter as FilterIcon, Loader2, AlertCircle, Trash2, MoreVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MaxisRoute {
  order: string;
  type: 'MO' | 'MT';
  route_type: string;
  rate: string;
  connectors: string;
  filters: string;
}

export default function RoutingPage() {
  const [routes, setRoutes] = useState<MaxisRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoute, setEditingRoute] = useState<MaxisRoute | null>(null);
  const [form, setForm] = useState({
    type: "MT" as "MT" | "MO",
    route_type: "DefaultRoute",
    order: "0",
    connector: "",
    filters: ""
  });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/routing");
      if (!response.ok) throw new Error("Failed to fetch routes");
      const data = await response.json();
      setRoutes(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoute(null);
    setForm({ type: "MT", route_type: "DefaultRoute", order: "0", connector: "", filters: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (route: MaxisRoute) => {
    setEditingRoute(route);
    setForm({ 
      type: route.type, 
      route_type: route.route_type, 
      order: route.order, 
      connector: route.connectors, 
      filters: route.filters === "None" ? "" : route.filters 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingRoute ? "PUT" : "POST";
      const response = await fetch("/api/routing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingRoute ? 'update' : 'create'} route`);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async (type: string, order: string) => {
    if (!confirm(`Are you sure you want to delete ${type} route with order ${order}?`)) return;
    try {
      const response = await fetch(`/api/routing?type=${type}&order=${order}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete route");
      }
      fetchRoutes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Routing Management</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Configure MO and MT message routing rules and priorities.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Route
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden">
        <div className="p-4 border-b border-maxis-border flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full max-md:max-w-none max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maxis-muted" />
            <input 
              type="text" 
              placeholder="Search routes..." 
              className="w-full pl-10 pr-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white placeholder:text-maxis-muted focus:outline-none focus:border-maxis-green/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-maxis-muted flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Filter by:
            </span>
            <select className="bg-maxis-darker border border-maxis-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-maxis-green/50">
              <option>All Types</option>
              <option>MO Routes</option>
              <option>MT Routes</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-maxis-green animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-12 text-red-400 text-sm">
              <AlertCircle className="h-6 w-6 mr-2" />
              Error loading routes: {error}
            </div>
          ) : routes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-maxis-muted">
              <RouteIcon className="h-12 w-12 opacity-20 mb-4" />
              <p>No routing rules defined in Maxis</p>
              <button 
                onClick={handleOpenAddModal}
                className="mt-4 text-maxis-green text-sm hover:underline"
              >
                Create DefaultRoute
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-maxis-muted uppercase bg-maxis-darker/50 border-b border-maxis-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Route Type</th>
                  <th className="px-6 py-4 font-medium">Connector(s)</th>
                  <th className="px-6 py-4 font-medium">Filter(s)</th>
                  <th className="px-6 py-4 font-medium">Rate</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maxis-border">
                {routes.map((route, idx) => (
                  <tr key={`${route.type}-${route.order}-${idx}`} className="hover:bg-maxis-surface-hover/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-maxis-darker border border-maxis-border text-maxis-muted font-mono text-xs group-hover:text-maxis-green transition-colors">
                        {route.order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                        route.type === 'MO' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {route.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                       <RouteIcon className="h-4 w-4 text-maxis-muted" />
                      {route.route_type}
                    </td>
                    <td className="px-6 py-4 font-mono text-maxis-muted">{route.connectors}</td>
                    <td className="px-6 py-4 text-maxis-muted text-xs max-w-[200px] truncate" title={route.filters}>
                      {route.filters === "None" ? "-" : route.filters}
                    </td>
                    <td className="px-6 py-4 font-mono text-maxis-green">{route.rate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(route)}
                          className="text-maxis-muted hover:text-white p-1 rounded-md hover:bg-maxis-darker transition-colors"
                          title="Edit Route"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoute(route.type, route.order)}
                          className="text-maxis-muted hover:text-red-400 p-1 rounded-md hover:bg-maxis-darker transition-colors"
                          title="Delete Route"
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
          <span>{routes.length} routing rules active</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-maxis-border hover:bg-maxis-surface-hover disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-maxis-border hover:bg-maxis-surface-hover disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRoute ? "Edit Routing Rule" : "Add New Routing Rule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Direction</label>
              <select 
                disabled={!!editingRoute}
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as "MT" | "MO"})}
                className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all disabled:opacity-50"
              >
                <option value="MT">MT (Mobile Terminated)</option>
                <option value="MO">MO (Mobile Originated)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Route Type</label>
              <select 
                value={form.route_type}
                onChange={e => setForm({...form, route_type: e.target.value})}
                className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
              >
                <option value="DefaultRoute">Default Route</option>
                <option value="StaticMTRoute">Static MT Route</option>
                <option value="RandomRoundrobinMTRoute">Random Roundrobin MT</option>
              </select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Execution Order (Priority)</label>
            <input 
              required
              disabled={!!editingRoute}
              type="number"
              value={form.order}
              onChange={e => setForm({...form, order: e.target.value})}
              placeholder="e.g. 0"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all disabled:opacity-50"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Target Connector(s)</label>
            <input 
              required
              value={form.connector}
              onChange={e => setForm({...form, connector: e.target.value})}
              placeholder="e.g. smppc_01"
              className="px-3 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green transition-all"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">Filter(s) (Optional)</label>
            <input 
              value={form.filters}
              onChange={e => setForm({...form, filters: e.target.value})}
              placeholder="e.g. filter_01, filter_02"
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
              {editingRoute ? "Save Changes" : "Create Route"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

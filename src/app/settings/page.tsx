"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { 
  Settings, 
  AlertCircle, 
  Terminal, 
  Activity, 
  Database,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Cpu,
  Users as UsersIcon,
  Shield,
  Blocks,
  Plus,
  Search,
  MoreVertical,
  ActivitySquare
} from "lucide-react";

interface SystemStats {
  http: Record<string, string>;
  smpp: Record<string, string>;
  timestamp: string;
}

export default function SettingsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [persisting, setPersisting] = useState(false);
  const [lastPersist, setLastPersist] = useState<string | null>(null);
  
  // Console state
  const [command, setCommand] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<{cmd: string, res: string}[]>([]);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Tab State
  type TabType = 'system' | 'users' | 'audit' | 'integrations';
  const [activeTab, setActiveTab] = useState<TabType>('system');

  // MOCK DATA STATE for interactions
  const [mockUsers, setMockUsers] = useState([
    { name: 'Admin User', email: 'admin@maxis.com.my', role: 'Super Admin', status: 'Active', login: '2 mins ago' },
    { name: 'NOC Operator', email: 'noc1@maxis.com.my', role: 'Viewer', status: 'Active', login: '1 hour ago' },
    { name: 'DevOps Lead', email: 'devops@maxis.com.my', role: 'Admin', status: 'Active', login: 'Yesterday' },
    { name: 'Old Accounts', email: 'billing@maxis.com.my', role: 'Editor', status: 'Suspended', login: '2 months ago' }
  ]);

  // Modals state
  interface Integration { name: string; desc: string; status: boolean; }
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Viewer');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMockUsers([{ name: newUserName, email: newUserEmail, role: newUserRole, status: 'Active', login: 'Just now' }, ...mockUsers]);
    setIsUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/system");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      console.error("Failed to fetch system stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  const handlePersist = async () => {
    setPersisting(true);
    try {
      const response = await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "persist" })
      });
      if (response.ok) {
        setLastPersist(new Date().toLocaleTimeString());
      }
    } catch {
      alert("Failed to persist configurations");
    } finally {
      setPersisting(false);
    }
  };

  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsExecutingCmd(true);
    try {
      const response = await fetch("/api/system/jcli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });
      const data = await response.json();
      setConsoleOutput(prev => [...prev, { cmd: command, res: data.result || data.error }]);
      setCommand("");
    } catch {
      setConsoleOutput(prev => [...prev, { cmd: command, res: "Error executing command" }]);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Configure global Jasmin SMS Gateway parameters and advanced system controls.
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'system' && (
            <button 
              onClick={handlePersist}
              disabled={persisting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {persisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Persist All Config
            </button>
          )}
          {activeTab === 'users' && (
            <button 
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker hover:bg-maxis-green/90 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Add Admin
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-maxis-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'system', name: 'System', icon: Cpu },
            { id: 'users', name: 'User Management', icon: UsersIcon },
            { id: 'audit', name: 'Audit Trails', icon: Shield },
            { id: 'integrations', name: 'Integrations', icon: Blocks },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'border-maxis-green text-maxis-green' 
                  : 'border-transparent text-maxis-muted hover:border-maxis-border hover:text-white'}
              `}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-maxis-green' : 'text-maxis-muted group-hover:text-white'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden">
            <div className="p-6 border-b border-maxis-border">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-maxis-green" />
                API Connection
              </h3>
              <p className="text-sm text-maxis-muted mt-1">
                Details for connecting to the Jasmin HTTP API Server.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">API Host</label>
                  <input 
                    type="text" 
                    defaultValue="localhost"
                    className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">API Port</label>
                  <input 
                    type="number" 
                    defaultValue={1401}
                    className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Authentication Token</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="password" 
                    defaultValue="************************"
                    readOnly
                    className="w-full px-4 py-2 bg-maxis-darker/50 border border-maxis-border rounded-lg text-sm text-maxis-muted cursor-not-allowed"
                  />
                  <button className="px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm font-medium text-white hover:bg-maxis-surface-hover transition-colors whitespace-nowrap">
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-maxis-muted flex items-center gap-1 mt-2">
                  <AlertCircle className="h-3 w-3" />
                  This token is used by the Web UI to securely communicate with the Jasmin interceptor.
                </p>
              </div>
            </div>
          </div>

          {/* JCLI Console */}
          <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-maxis-border flex items-center justify-between bg-maxis-darker/30">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-maxis-green" />
                Interactive JCLI Console
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-maxis-green animate-pulse"></span>
                <span className="text-[10px] text-maxis-muted uppercase font-bold tracking-wider">Connected</span>
              </div>
            </div>
            <div className="flex-1 bg-black/50 p-4 font-mono text-xs overflow-y-auto space-y-2 custom-scrollbar">
              <div className="text-maxis-muted whitespace-pre-wrap">Jasmin SMS Gateway Console - Type &apos;help&apos; for available commands.</div>
              {consoleOutput.map((out, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-maxis-green flex gap-2">
                    <span className="opacity-50">jcli :</span>
                    <span>{out.cmd}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap pl-4 border-l border-white/5 pb-2">{out.res}</div>
                </div>
              ))}
              {isExecutingCmd && (
                <div className="flex items-center gap-2 text-maxis-muted italic">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Executing...
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
            <form onSubmit={handleExecuteCommand} className="p-2 bg-maxis-darker border-t border-maxis-border">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maxis-green text-xs font-bold">jcli :</span>
                <input 
                  type="text"
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  placeholder="Enter JCLI command..."
                  disabled={isExecutingCmd}
                  className="w-full pl-14 pr-4 py-2 bg-black/40 border border-maxis-border/50 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-maxis-green/50 transition-all placeholder:text-white/20"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Column: Stats & Maintenance */}
        <div className="space-y-6">
          <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-maxis-green" />
              Advanced Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-maxis-darker rounded-lg border border-maxis-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-maxis-muted flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    HTTP API Status
                  </span>
                  <span className="text-[10px] bg-maxis-green/20 text-maxis-green px-1.5 py-0.5 rounded font-bold uppercase">Online</span>
                </div>
                {loading ? (
                  <div className="h-10 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-maxis-muted" /></div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-maxis-muted">Messages Sent: <span className="text-white font-mono">{stats?.http?.messages_sent || "0"}</span></div>
                    <div className="text-maxis-muted">Error Count: <span className="text-red-400 font-mono">{stats?.http?.error_count || "0"}</span></div>
                    <div className="text-maxis-muted">Active Conns: <span className="text-white font-mono">{stats?.http?.active_connections || "0"}</span></div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-maxis-darker rounded-lg border border-maxis-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-maxis-muted flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    SMPP Server Status
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
                </div>
                {loading ? (
                  <div className="h-10 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-maxis-muted" /></div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-maxis-muted">Sessions: <span className="text-white font-mono">{stats?.smpp?.bound_sessions || "0"}</span></div>
                    <div className="text-maxis-muted">Throughput: <span className="text-maxis-green font-mono">{stats?.smpp?.mt_throughput || "0.0"}</span></div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-maxis-muted mt-4 text-center italic">Auto-refreshing every 5 seconds</p>
          </div>

          <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Cpu className="h-4 w-4 text-maxis-green" />
              Maintenance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs p-3 bg-maxis-darker rounded-lg border border-maxis-border">
                <span className="text-maxis-muted">Last Persist</span>
                <span className="text-white font-mono">{lastPersist || "N/A"}</span>
              </div>
              <button 
                onClick={handlePersist}
                disabled={persisting}
                className="w-full py-2 bg-maxis-surface border border-maxis-border rounded-lg text-xs font-medium text-white hover:bg-maxis-surface-hover transition-colors flex items-center justify-center gap-2"
              >
                {persisting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
                Force Snapshot
              </button>
              <div className="flex items-start gap-2 text-[10px] text-maxis-muted">
                <CheckCircle2 className="h-3 w-3 text-maxis-green flex-shrink-0" />
                Global configuration is verified and consistent across all services.
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-maxis-border flex justify-between items-center bg-maxis-darker/30">
              <div>
                <h3 className="text-lg font-semibold text-white">Administrator Access</h3>
                <p className="text-sm text-maxis-muted mt-1">Manage users who have access to this Web UI dashboard.</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maxis-muted" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-maxis-border rounded-lg text-sm text-white placeholder:text-maxis-muted focus:outline-none focus:border-maxis-green/50"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-maxis-muted uppercase bg-maxis-darker/50 border-b border-maxis-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Last Login</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-maxis-border">
                  {mockUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-maxis-surface-hover/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-maxis-darker border border-maxis-border flex items-center justify-center text-xs font-medium text-white">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-xs text-maxis-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-maxis-darker text-xs font-medium border border-maxis-border text-white">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          user.status === 'Active' 
                            ? 'bg-maxis-green/10 text-maxis-green border-maxis-green/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-maxis-green' : 'bg-red-400'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-maxis-muted">{user.login}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-maxis-muted hover:text-white p-1 rounded hover:bg-maxis-darker transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- AUDIT TAB --- */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm">
                <h4 className="text-sm font-medium text-maxis-muted mb-2">Total Events (24h)</h4>
                <div className="text-3xl font-bold text-white">1,248</div>
              </div>
              <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm">
                <h4 className="text-sm font-medium text-maxis-muted mb-2">Config Changes</h4>
                <div className="text-3xl font-bold text-amber-400">12</div>
              </div>
              <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm">
                <h4 className="text-sm font-medium text-maxis-muted mb-2">Failed Logins</h4>
                <div className="text-3xl font-bold text-red-400">3</div>
              </div>
            </div>

            <div className="rounded-xl border border-maxis-border bg-maxis-surface shadow-sm overflow-hidden">
              <div className="p-4 border-b border-maxis-border flex justify-between items-center bg-maxis-darker/30">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ActivitySquare className="h-4 w-4 text-maxis-green" />
                  Recent Activity Log
                </h3>
                <button className="text-xs text-maxis-green hover:underline">Export CSV</button>
              </div>
              <div className="divide-y divide-maxis-border">
                {[
                  { action: 'Persisted global configurations', user: 'Admin User', time: '10 mins ago', type: 'system' },
                  { action: 'Added new MT Route (DefaultRoute)', user: 'DevOps Lead', time: '1 hour ago', type: 'config' },
                  { action: 'Created HTTP Client Connector dlr_webhook', user: 'Admin User', time: '2 hours ago', type: 'config' },
                  { action: 'Failed login attempt via UI', user: 'Unknown IP (10.0.1.55)', time: '5 hours ago', type: 'security' },
                  { action: 'Unbound SMPP Client client_test_1', user: 'NOC Operator', time: 'Yesterday', type: 'action' }
                ].map((log, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 hover:bg-maxis-surface-hover/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-maxis-darker border border-maxis-border flex items-center justify-center shrink-0">
                      {log.type === 'system' && <Database className="h-4 w-4 text-blue-400" />}
                      {log.type === 'config' && <Settings className="h-4 w-4 text-amber-400" />}
                      {log.type === 'security' && <Shield className="h-4 w-4 text-red-400" />}
                      {log.type === 'action' && <ActivitySquare className="h-4 w-4 text-maxis-green" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{log.action}</p>
                      <p className="text-xs text-maxis-muted truncate mt-0.5">by {log.user}</p>
                    </div>
                    <div className="text-xs text-maxis-muted whitespace-nowrap">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- INTEGRATIONS TAB --- */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {[
              { name: 'Slack Notifications', desc: 'Receive gateway alerts directly in Slack channels.', status: true },
              { name: 'Datadog Metrics', desc: 'Export JCLI stats to Datadog for unified monitoring.', status: false },
              { name: 'PagerDuty', desc: 'Trigger incidents on critical gateway failovers.', status: false },
              { name: 'Active Directory / SAML', desc: 'SSO integration for the Web UI dashboard.', status: true },
              { name: 'Custom Webhooks', desc: 'Fire HTTP webhooks on specific internal events.', status: false }
            ].map((integ, idx) => (
              <div key={idx} className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm hover:border-maxis-green/50 transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-maxis-darker flex items-center justify-center border border-maxis-border group-hover:bg-maxis-green/10 group-hover:border-maxis-green/30 transition-colors">
                    <Blocks className={`h-5 w-5 ${integ.status ? 'text-maxis-green' : 'text-maxis-muted group-hover:text-maxis-green'}`} />
                  </div>
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maxis-green focus:ring-offset-2 focus:ring-offset-maxis-bg ${integ.status ? 'bg-maxis-green' : 'bg-maxis-border'}`}>
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${integ.status ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{integ.name}</h3>
                <p className="text-sm text-maxis-muted flex-grow">{integ.desc}</p>
                <div className="pt-4 mt-4 border-t border-maxis-border/50">
                  <button 
                    onClick={() => { setSelectedIntegration(integ); setIsIntegrationModalOpen(true); }}
                    className="text-xs font-medium text-maxis-green hover:underline"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODALS */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Invite Administrator">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Full Name</label>
            <input 
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green/50" 
              placeholder="e.g. John Doe" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email Address</label>
            <input 
              required
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green/50" 
              placeholder="e.g. john@maxis.com.my" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Role</label>
            <select 
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-white focus:outline-none focus:border-maxis-green/50 appearance-none"
            >
              <option value="Viewer">Viewer (Read-only)</option>
              <option value="Editor">Editor (Can change configs)</option>
              <option value="Admin">Admin (Can manage users)</option>
              <option value="Super Admin">Super Admin (Full access)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-maxis-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker text-sm font-medium hover:bg-maxis-green/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Switch / Invite
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIntegrationModalOpen} onClose={() => setIsIntegrationModalOpen(false)} title={`Configure ${selectedIntegration?.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-maxis-muted">Setup the connection details for {selectedIntegration?.name}. This interface represents a mock-up of what would connect to external services.</p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">API Key / Endpoint URL</label>
            <input 
              defaultValue="https://example.com/api/webhook"
              className="w-full px-4 py-2 bg-maxis-darker border border-maxis-border rounded-lg text-sm text-maxis-muted focus:outline-none focus:border-maxis-green/50 font-mono" 
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsIntegrationModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-maxis-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsIntegrationModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-maxis-green text-maxis-darker text-sm font-medium hover:bg-maxis-green/90 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

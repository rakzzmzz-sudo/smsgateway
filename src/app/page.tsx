"use client";

import { useEffect, useState } from "react";
import { 
  StatCard, 
  TrafficChart, 
  SystemStatus 
} from "@/components/dashboard/DashboardOverview";

interface Stats {
  users: number;
  connectors: number;
  routes: number;
  status: string;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    connectors: 0,
    routes: 0,
    status: 'Loading...'
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Overview</h2>
          <p className="text-sm text-maxis-muted mt-1">
            Real-time insights and metrics for the Maxis SMS Gateway.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-maxis-green/10 border border-maxis-green/20">
          <span className="h-2 w-2 rounded-full bg-maxis-green animate-pulse"></span>
          <span className="text-xs font-medium text-maxis-green uppercase tracking-wider">System {stats.status}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.users.toString()}
          trend="neutral"
          trendValue="Active"
          iconName="Shield"
        />
        <StatCard
          title="Delivery Rate"
          value="98.2%"
          trend="up"
          trendValue="+0.4%"
          iconName="Activity"
        />
        <StatCard
          title="Connectors"
          value={stats.connectors.toString()}
          trend="neutral"
          trendValue="Operational"
          iconName="Server"
        />
        <StatCard
          title="Routing Rules"
          value={stats.routes.toString()}
          trend="neutral"
          trendValue="Configured"
          iconName="Route"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrafficChart />
        </div>
        <div className="lg:col-span-1">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}

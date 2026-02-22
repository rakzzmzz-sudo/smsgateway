"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MessageSquare,
  Activity,
  Server, 
  Zap,
  Shield,
  Route
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import clsx from "clsx";

const data = [
  { time: "00:00", sms: 400 },
  { time: "04:00", sms: 300 },
  { time: "08:00", sms: 550 },
  { time: "12:00", sms: 700 },
  { time: "16:00", sms: 900 },
  { time: "20:00", sms: 1200 },
  { time: "24:00", sms: 800 },
];

const IconMap = {
  MessageSquare,
  Activity,
  Server,
  Zap,
  Shield,
  Route
};

export function StatCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  iconName 
}: { 
  title: string; 
  value: string; 
  trend: "up" | "down" | "neutral"; 
  trendValue: string; 
  iconName: keyof typeof IconMap; 
}) {
  const Icon = IconMap[iconName];

  return (
    <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 shadow-sm transition-all hover:border-maxis-green/30 hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-maxis-muted">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-maxis-darker border border-maxis-border">
          <Icon className="h-5 w-5 text-maxis-green" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-4">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <p className={clsx(
          "flex items-center text-sm font-medium",
          trend === "up" ? "text-maxis-green" : trend === "down" ? "text-red-400" : "text-maxis-muted"
        )}>
          {trend === "up" && <ArrowUpRight className="mr-1 h-4 w-4" />}
          {trend === "down" && <ArrowDownRight className="mr-1 h-4 w-4" />}
          {trendValue}
        </p>
      </div>
    </div>
  );
}

export function TrafficChart() {
  return (
    <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 mt-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">SMS Traffic Overview</h3>
          <p className="text-sm text-maxis-muted">Messages processed over the last 24 hours</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-medium rounded-md bg-maxis-darker border border-maxis-border text-maxis-muted hover:text-white">Day</button>
          <button className="px-3 py-1 text-xs font-medium rounded-md bg-maxis-green/20 border border-maxis-green/50 text-maxis-green">Week</button>
          <button className="px-3 py-1 text-xs font-medium rounded-md bg-maxis-darker border border-maxis-border text-maxis-muted hover:text-white">Month</button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e3340" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1d24', 
                border: '1px solid #2e3340',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#39FF14' }}
            />
            <Area 
              type="monotone" 
              dataKey="sms" 
              stroke="#39FF14" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSms)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SystemStatus() {
  const services = [
    { name: "SMPP Server", status: "Operational", port: 2775, type: "primary" },
    { name: "HTTP API", status: "Operational", port: 1401, type: "primary" },
    { name: "CLI Console", status: "Operational", port: 8990, type: "secondary" },
    { name: "Redis Cache", status: "Operational", port: 6379, type: "infrastructure" },
    { name: "RabbitMQ Broker", status: "Operational", port: 5672, type: "infrastructure" },
  ];

  return (
    <div className="rounded-xl border border-maxis-border bg-maxis-surface p-6 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">System Service Status</h3>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-maxis-darker border border-maxis-border transition-colors hover:border-maxis-border/80">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-maxis-green shadow-[0_0_8px_rgba(57,255,20,0.6)]"></div>
              <div>
                <p className="text-sm font-medium text-white">{service.name}</p>
                <p className="text-xs text-maxis-muted">Port {service.port}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-maxis-green/10 text-maxis-green border border-maxis-green/20">
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

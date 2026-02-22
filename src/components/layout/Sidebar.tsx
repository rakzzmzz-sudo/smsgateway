"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Route,
  Settings,
  ShieldAlert,
  Menu,
  LogOut,
  AppWindow,
  Server,
  Send,
  Terminal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Restful & HTTP APIs", href: "/http-api", icon: AppWindow },
  { name: "SMPP Server API", href: "/smpp-server", icon: Server },
  { name: "HTTP Clients", href: "/http-clients", icon: Send },
  { name: "Router", href: "/routing", icon: Route },
  { name: "SMPP Client Manager", href: "/connectors", icon: Network },
  { name: "jCli Console", href: "/users", icon: Terminal },
  { name: "Filters & Interceptors", href: "/filters", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
      router.push("/login");
    } catch {
      alert("Failed to logout");
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 transform bg-maxis-darker border-r border-maxis-border transition-all duration-300 ease-in-out flex flex-col lg:static lg:translate-x-0 overflow-hidden",
          isOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full lg:translate-x-0",
        )}
      >
        <div className={clsx("flex h-16 items-center flex-shrink-0 px-4 bg-maxis-darker border-b border-maxis-border", isOpen ? "justify-between" : "justify-center")}>
          {isOpen && (
            <Link href="/" className="flex items-center overflow-hidden">
              <div className="flex items-center justify-center p-1 rounded-lg bg-white/5 relative h-10 w-10 shrink-0">
                <Image src="/logo.png" alt="SMS Gateway Logo" width={32} height={32} className="object-contain" priority />
              </div>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="text-maxis-muted hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!isOpen ? item.name : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                  isOpen ? "px-3" : "justify-center px-0",
                  isActive
                    ? "bg-maxis-green/10 text-maxis-green"
                    : "text-maxis-muted hover:bg-maxis-surface hover:text-white",
                )}
              >
                <item.icon
                  className={clsx(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-maxis-green"
                      : "text-maxis-muted group-hover:text-maxis-green/70",
                  )}
                />
                {isOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-maxis-border bg-maxis-darker">
          <div className={clsx("flex items-center", isOpen ? "gap-3 px-3 py-2" : "flex-col gap-3 p-0 justify-center")}>
            <div className="h-8 w-8 rounded-full bg-maxis-surface flex items-center justify-center border border-maxis-border flex-shrink-0">
              <span className="text-xs font-medium text-white">A</span>
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-white text-left group-hover:text-maxis-green transition-colors truncate">Admin User</span>
                <span className="text-xs text-maxis-muted truncate">
                  admin@maxis.com.my
                </span>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className={clsx(
                "rounded-lg text-maxis-muted hover:text-white hover:bg-white/5 transition-all text-center",
                isOpen ? "ml-auto p-1.5" : "p-2"
              )}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

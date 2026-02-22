"use client";

import { Menu, Bell } from "lucide-react";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-maxis-border bg-maxis-darker px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-maxis-muted lg:hidden hover:text-white transition-colors"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-maxis-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-white/90 hidden sm:block">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-maxis-muted hover:text-maxis-green transition-colors relative"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-maxis-green ring-2 ring-maxis-darker"></span>
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-maxis-border"
            aria-hidden="true"
          />

          {/* Server Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-maxis-surface border border-maxis-border">
            <div className="h-2 w-2 rounded-full bg-maxis-green shadow-[0_0_8px_rgba(57,255,20,0.6)] animate-pulse"></div>
            <span className="text-xs font-medium text-maxis-green">Connected to Maxis</span>
          </div>
        </div>
      </div>
    </header>
  );
}

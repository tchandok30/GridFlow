
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const pageInfo = {
  "/": {
    title: "Overview",
    subtitle: "Your logistics operations at a glance.",
  },
  "/vehicles": {
    title: "Fleet vehicles",
    subtitle: "Manage your fleet, availability and vehicle capacity.",
  },
  "/orders": {
    title: "Delivery orders",
    subtitle: "Manage, assign and track delivery orders.",
  },
  "/plans": {
    title: "Route planning",
    subtitle: "Generate optimized delivery assignments and routes.",
  },
  "/plans/history": {
    title: "Plan history",
    subtitle: "Review previously generated delivery plans.",
  },
};

export default function AppLayout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const page = pageInfo[location.pathname] || pageInfo["/"];

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("gridflow_user") || "{}");
  } catch {
    user = {};
  }

  const displayName = user.name || user.full_name || user.email || "GridFlow User";
  const role = user.role || "Operations";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <Sidebar />

      <div className="min-h-screen lg:ml-[252px]">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden text-gray-400 sm:inline">Workspace</span>
            <ChevronRight size={14} className="hidden text-gray-300 sm:block" />
            <span className="truncate font-semibold text-[#26332d]">
              {page.title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {searchOpen && (
              <input
                id="page-search"
                autoFocus
                placeholder="Search this page..."
                className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-lime-500 sm:w-48"
              />
            )}

            <button
              type="button"
              aria-label="Toggle search"
              onClick={() => setSearchOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c8f169]" />
            </button>

            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c8f169] text-sm font-extrabold text-[#17211f]">
                {initials}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-36 truncate text-[11px] font-bold text-gray-800">
                  {displayName}
                </p>
                <p className="mt-0.5 text-[10px] capitalize text-gray-500">
                  {role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-7">
            <p className="mb-2 text-[9px] font-bold tracking-[1.7px] text-gray-400">
              GRIDFLOW / OPERATIONS
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17211f] sm:text-[29px]">
              {page.title}
            </h1>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {page.subtitle}
            </p>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

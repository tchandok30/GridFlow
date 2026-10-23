
import { NavLink, useNavigate } from "react-router-dom";
import {
  Zap,
  LayoutDashboard,
  Truck,
  Package,
  MapPinned,
  History,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    heading: "WORKSPACE",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/vehicles", label: "Fleet vehicles", icon: Truck },
      { to: "/orders", label: "Delivery orders", icon: Package },
    ],
  },
  {
    heading: "OPTIMIZATION",
    items: [
      { to: "/plans", label: "Route planning", icon: MapPinned, badge: "AI" },
      { to: "/plans/history", label: "Plan history", icon: History },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const { default: api } = await import("../services/api");
      await api.post("/auth/logout");
    } catch {
      // Always clear the local session, even if the server is unreachable.
    } finally {
      localStorage.removeItem("gridflow_token");
      localStorage.removeItem("gridflow_user");
      navigate("/login", { replace: true });
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col bg-[#111c1b] px-4 py-6 text-gray-300">
      <NavLink to="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8f169] text-[#111c1b]">
          <Zap size={22} fill="currentColor" />
        </div>
        <div>
          <div className="text-[23px] font-extrabold tracking-tight text-white">
            gridflow<span className="text-[#c8f169]">.</span>
          </div>
          <div className="mt-0.5 text-[8px] font-bold tracking-[1.4px] text-gray-500">
            LOGISTICS INTELLIGENCE
          </div>
        </div>
      </NavLink>

      {navigation.map((group) => (
        <div key={group.heading} className="mb-7">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-gray-500">
            {group.heading}
          </p>

          <nav className="space-y-1">
            {group.items.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex min-h-11 items-center gap-3 rounded-xl border px-3 transition ${
                    isActive
                      ? "border-white/10 bg-[#26352f] text-white"
                      : "border-transparent text-[#aab6b0] hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={isActive ? "text-[#c8f169]" : ""}
                    />
                    <span className="flex-1 text-[12px] font-medium">
                      {label}
                    </span>
                    {badge && (
                      <span className="rounded-md bg-[#35422d] px-1.5 py-1 text-[9px] font-bold text-[#c8f169]">
                        {badge}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className={`transition ${
                        isActive
                          ? "opacity-60"
                          : "opacity-0 group-hover:opacity-50"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="mt-auto">
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d39980]" />
          <div>
            <p className="text-[11px] font-semibold text-gray-200">
              API connection
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              Session authenticated
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs text-gray-400 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut size={17} />
          Sign out
        </button>

        <div className="mt-4 border-t border-white/10 px-2 pt-4 text-[8px] tracking-[1.2px] text-gray-600">
          GRIDFLOW · OPERATIONS PLATFORM
        </div>
      </div>
    </aside>
  );
}

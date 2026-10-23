
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock3,
  MapPinned,
  Package,
  RefreshCw,
  Truck,
  Zap,
} from "lucide-react";
import api from "../services/api";

function extractRows(response) {
  const body = response.data;
  const payload = body?.data ?? body;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.vehicles)) return payload.vehicles;
  if (Array.isArray(payload?.orders)) return payload.orders;

  return [];
}

function MetricCard({ title, value, subtitle, icon: Icon, tone, loading }) {
  const tones = {
    green: "bg-lime-100 text-lime-800",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    dark: "bg-[#172522] text-lime-300",
  };

  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#17211f]">
            {loading ? (
              <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-gray-100" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">{subtitle}</p>
    </article>
  );
}

function statusStyle(status) {
  const value = String(status || "").toLowerCase();

  if (["delivered", "available", "completed"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "maintenance", "failed"].includes(value)) {
    return "bg-red-50 text-red-700";
  }
  if (["in_transit", "assigned", "in_use"].includes(value)) {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-amber-50 text-amber-700";
}

function prettyStatus(status) {
  return String(status || "pending").replaceAll("_", " ");
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/vehicles"),
        api.get("/orders"),
      ]);

      const vehicleResult = results[0];
      const orderResult = results[1];

      if (vehicleResult.status === "fulfilled") {
        setVehicles(extractRows(vehicleResult.value));
      } else {
        setVehicles([]);
      }

      if (orderResult.status === "fulfilled") {
        setOrders(extractRows(orderResult.value));
      } else {
        setOrders([]);
      }

      if (
        vehicleResult.status === "rejected" &&
        orderResult.status === "rejected"
      ) {
        throw new Error("Unable to load dashboard data. Check your API connection.");
      }

      if (
        vehicleResult.status === "rejected" ||
        orderResult.status === "rejected"
      ) {
        setError("Some dashboard data could not be loaded. Try refreshing.");
      }
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const availableVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "available"
    ).length;

    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    const activeDeliveries = orders.filter((order) =>
      ["assigned", "in_transit"].includes(order.status)
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return {
      availableVehicles,
      pendingOrders,
      activeDeliveries,
      deliveredOrders,
    };
  }, [vehicles, orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const user = JSON.parse(localStorage.getItem("gridflow_user") || "{}");

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-[#14221f] p-6 text-white sm:p-8">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-300">
              <span className="h-2 w-2 rounded-full bg-[#c8f169]" />
              Operations overview
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}
              {user.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400">
              Here’s your logistics overview. Monitor fleet availability,
              track deliveries and generate optimized route plans.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 rounded-lg bg-[#c8f169] px-4 py-3 text-xs font-bold text-[#17211f] transition hover:bg-lime-300"
              >
                <Zap size={16} />
                Open route planning
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                View orders
              </Link>
            </div>
          </div>

          <div className="hidden min-w-40 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 md:flex">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c8f169]/10 text-[#c8f169]">
              <Truck size={29} />
            </div>
            <p className="mt-4 text-3xl font-bold">
              {loading ? "—" : vehicles.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">Vehicles in fleet</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-amber-800">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-amber-900 hover:underline"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#17211f]">
              Operations at a glance
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Based on the data currently available in your system
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total vehicles"
            value={vehicles.length}
            subtitle="Registered fleet vehicles"
            icon={Truck}
            tone="dark"
            loading={loading}
          />
          <MetricCard
            title="Available vehicles"
            value={stats.availableVehicles}
            subtitle="Ready for assignment"
            icon={CheckCircle2}
            tone="green"
            loading={loading}
          />
          <MetricCard
            title="Pending orders"
            value={stats.pendingOrders}
            subtitle="Awaiting vehicle assignment"
            icon={Clock3}
            tone="amber"
            loading={loading}
          />
          <MetricCard
            title="Active deliveries"
            value={stats.activeDeliveries}
            subtitle="Assigned or in transit"
            icon={Boxes}
            tone="blue"
            loading={loading}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-[#17211f]">
                Recent delivery orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest orders recorded in GridFlow
              </p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#566f2c] hover:text-black"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-500">
                <Package size={23} />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-700">
                No delivery orders yet
              </p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
                Once orders are created, the latest deliveries will appear here.
              </p>
              <Link
                to="/orders"
                className="mt-4 text-xs font-bold text-[#566f2c] hover:underline"
              >
                Go to orders →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80">
                  <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Weight</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.id ?? order.order_number ?? index}
                      className="border-t border-gray-100 transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-gray-800">
                          {order.order_number || `Order #${order.id}`}
                        </p>
                        <p className="mt-1 max-w-52 truncate text-[11px] text-gray-500">
                          {order.delivery_address || "Address not provided"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">
                        {order.package_weight_kg != null
                          ? `${order.package_weight_kg} kg`
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(order.status)}`}
                        >
                          {prettyStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3.5 text-[11px] text-gray-500 sm:px-6">
            <ArrowDownRight size={14} />
            Delivered orders:{" "}
            <strong className="text-gray-700">
              {loading ? "—" : stats.deliveredOrders}
            </strong>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-[#17211f]">
            Quick actions
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Jump straight into your daily operations
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/vehicles"
              className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-lime-200 hover:bg-lime-50/50"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-lime-100">
                <Truck size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  Manage fleet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  View vehicle status and capacity
                </p>
              </div>
              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>

            <Link
              to="/orders"
              className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-lime-200 hover:bg-lime-50/50"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-lime-100">
                <Package size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  Manage orders
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Track pending and active deliveries
                </p>
              </div>
              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>

            <Link
              to="/plans"
              className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-lime-200 hover:bg-lime-50/50"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-lime-100">
                <MapPinned size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  Optimize routes
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Generate vehicle assignments and plans
                </p>
              </div>
              <ArrowUpRight size={17} className="text-gray-400" />
            </Link>
          </div>

          <div className="mt-5 rounded-xl bg-[#f5f8ef] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#364b24]">
              <Zap size={16} />
              GridFlow optimization
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-600">
              Route plans use your existing backend's assignment and
              distance-optimization logic.
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-2 border-t border-gray-200 pt-5 text-[10px] text-gray-400 sm:flex-row sm:items-center">
        <span>GRIDFLOW · URBAN LOGISTICS OPTIMIZATION ENGINE</span>
        <span>Operations dashboard</span>
      </footer>
    </div>
  );
}

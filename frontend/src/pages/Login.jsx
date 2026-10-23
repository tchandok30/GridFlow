
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Zap, Truck } from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("gridflow_token")) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const result = response.data;
      const payload = result.data ?? result;
      const token =
        payload.token ??
        payload.accessToken ??
        payload.access_token ??
        result.token;

      const user = payload.user ?? result.user;

      if (!token) {
        throw new Error(
          result.message ||
            "Login succeeded, but no token was returned. Check the backend response."
        );
      }

      localStorage.setItem("gridflow_token", token);

      if (user) {
        localStorage.setItem("gridflow_user", JSON.stringify(user));
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sign in. Check your credentials and backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f2] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="relative hidden min-h-[610px] flex-col justify-between overflow-hidden bg-[#111c1b] p-10 text-white lg:flex">
          <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#c8f169] text-[#111c1b]">
              <Zap size={23} fill="currentColor" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              gridflow<span className="text-[#c8f169]">.</span>
            </span>
          </div>

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full bg-[#c8f169]" />
              LOGISTICS INTELLIGENCE PLATFORM
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
              Move smarter.
              <br />
              Deliver better.
              <br />
              <span className="text-[#c8f169]">Every single day.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              One workspace to coordinate your fleet, manage deliveries and
              create optimized route plans.
            </p>

            <div className="mt-9 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#c8f169]/10 text-[#c8f169]">
                <Truck size={23} />
              </div>
              <div>
                <p className="text-sm font-semibold">Your operations, connected</p>
                <p className="mt-1 text-xs text-gray-400">
                  Fleet · Orders · Route optimization
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-[10px] tracking-[2px] text-gray-500">
            GRIDFLOW · BUILT FOR BETTER LOGISTICS
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8f169] text-[#111c1b]">
                <Zap size={22} fill="currentColor" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                gridflow<span className="text-lime-600">.</span>
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[2px] text-lime-700">
              Operations workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17211f]">
              Welcome back.
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Sign in to access your logistics dashboard.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8f169] px-4 py-3.5 text-sm font-bold text-[#17211f] transition hover:bg-[#b9e55b] disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to GridFlow"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-5 text-center text-xs leading-5 text-gray-400">
              Secure access to your logistics workspace.
              <br />
              GridFlow Operations Platform
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

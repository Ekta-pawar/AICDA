import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/auth-api";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate({ to: "/admin" });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold text-primary">AICDA Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access the Family Member Management dashboard.</p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address <span className="text-primary">*</span></label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-slate-700">Password <span className="text-primary">*</span></label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>

            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-deep focus:outline-none focus:ring-3 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

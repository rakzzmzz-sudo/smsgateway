"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-maxis-dark relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maxis-green/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-maxis-green/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-maxis-darker border border-maxis-border mb-6">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-maxis-green fill-current">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Maxis Gateway</h1>
          <p className="text-maxis-muted mt-2 text-sm">Secure Administration Console</p>
        </div>

        <div className="bg-maxis-surface/40 backdrop-blur-xl border border-maxis-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-maxis-muted uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maxis-muted group-focus-within:text-maxis-green transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-11 pr-4 py-3 bg-maxis-darker border border-maxis-border rounded-xl text-sm text-white focus:outline-none focus:border-maxis-green/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-maxis-muted uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maxis-muted group-focus-within:text-maxis-green transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-maxis-darker border border-maxis-border rounded-xl text-sm text-white focus:outline-none focus:border-maxis-green/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-in shake-in duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-maxis-green text-maxis-darker font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:bg-maxis-green/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-maxis-border/50 text-center">
            <p className="text-[10px] text-maxis-muted">
              Access restricted to authorized personnel. All unauthorized attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

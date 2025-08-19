"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/ui/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  if (!auth) return <div>Loading...</div>;
  const { login, forgotPassword, authError, setAuthError } = auth;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const ok = login(email, password, "admin");
      if (ok) {
        router.push("/admin/dashboard");
      }
    }, 1000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setAuthError("New password must be at least 6 characters.");
      return;
    }
    const ok = forgotPassword(email, password);
    if (ok) {
      setResetSuccess("Password reset! You can now log in.");
      setForgotMode(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Admin Login</h2>
        {!forgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setAuthError(""); }}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setAuthError(""); }}
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {authError && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</div>}
            <button
              type="submit"
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Admin Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setAuthError(""); }}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError(""); }}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="new-password"
              />
            </div>
            {authError && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</div>}
            {resetSuccess && <div className="text-green-600 dark:text-green-400 text-sm font-medium">{resetSuccess}</div>}
            <button
              type="submit"
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {!forgotMode && (
            <button className="text-blue-600 hover:underline mr-2" type="button" onClick={() => { setForgotMode(true); setAuthError(""); setResetSuccess(""); }}>
              Forgot password?
            </button>
          )}
          {forgotMode && (
            <button className="text-blue-600 hover:underline" type="button" onClick={() => { setForgotMode(false); setAuthError(""); setResetSuccess(""); }}>
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
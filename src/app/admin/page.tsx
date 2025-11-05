"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { login, forgotPassword, authError, setAuthError } = auth || {};

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setAuthError) setAuthError("");
    setLoading(true);
    
    try {
      if (login) {
        const ok = await login(email, password);
        if (ok) {
          router.push("/admin/dashboard");
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setAuthError) setAuthError("");
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      if (setAuthError) setAuthError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      if (setAuthError) setAuthError("New password must be at least 6 characters.");
      return;
    }
    if (forgotPassword) {
      const ok = await forgotPassword(email);
      if (ok) {
        setResetSuccess("Password reset! You can now log in.");
        setForgotMode(false);
        setEmail("");
        setPassword("");
      } else {
        if (setAuthError) setAuthError("You cannot perform this Task right Now");
      }
    }
  };

  // Return minimal HTML until hydration is complete
  if (!mounted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-0" />
        <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-2xl backdrop-blur-md">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-0" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Admin Login</h2>
        {!forgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (setAuthError) setAuthError(""); }}
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
                  onChange={e => { setPassword(e.target.value); if (setAuthError) setAuthError(""); }}
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
                onChange={e => { setEmail(e.target.value); if (setAuthError) setAuthError(""); }}
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
                onChange={e => { setPassword(e.target.value); if (setAuthError) setAuthError(""); }}
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
            <button className="text-blue-600 hover:underline mr-2" type="button" onClick={() => { setForgotMode(true); if (setAuthError) setAuthError(""); setResetSuccess(""); }}>
              Forgot password?
            </button>
          )}
          {forgotMode && (
            <button className="text-blue-600 hover:underline" type="button" onClick={() => { setForgotMode(false); if (setAuthError) setAuthError(""); setResetSuccess(""); }}>
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
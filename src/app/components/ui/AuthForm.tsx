"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>("login");
  const [form, setForm] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const router = useRouter();
  const auth = useAuth();
  if (!auth) return <div>Loading...</div>;
  const { login, forgotPassword, authError, setAuthError } = auth;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
    setAuthError("");
  };

  

  const validate = () => {
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAuthError("");
    if (!validate()) return;
    setLoading(true);
    
    try {
      if (mode === "login") {
        const ok = await login(form.email, form.password, "user");
        if (ok) {
          setSuccess("Logged in!");
          router.push("/profile");
        } else {
          setError(authError || "Login failed.");
        }
      } else {
        // Handle registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.email.split('@')[0] // Use email prefix as default name
          }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.message || 'Registration failed');
        } else {
          setSuccess("Account created successfully! Please log in.");
          setMode("login");
          setForm(initialState);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    const ok = forgotPassword(form.email, form.password);
    if (ok) {
      setResetSuccess("Password reset! You can now log in.");
      setForgotMode(false);
      setForm(initialState);
    } else {
      setError(authError || "Reset failed.");
    }
  };

  return (
    <div>
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${mode === "login" && !forgotMode ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
          onClick={() => { setMode("login"); setForm(initialState); setError(""); setSuccess(""); setForgotMode(false); }}
          type="button"
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${mode === "signup" && !forgotMode ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
          onClick={() => { setMode("signup"); setForm(initialState); setError(""); setSuccess(""); setForgotMode(false); }}
          type="button"
        >
          Sign Up
        </button>
      </div>
      {!forgotMode ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {mode === "signup" && (
            <div>
              <label className="block mb-1 font-medium">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="new-password"
              />
            </div>
          )}
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
          {authError && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</div>}
          {success && <div className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="new-password"
            />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
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
        {!forgotMode && mode === "login" && (
          <button className="text-blue-600 hover:underline mr-2" type="button" onClick={() => { setForgotMode(true); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); }}>
            Forgot password?
          </button>
        )}
        {!forgotMode && (mode === "login" ? (
          <>
            Don&apos;t have an account?{' '}
            <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode('signup'); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); }}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode('login'); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); }}>
              Login
            </button>
          </>
        ))}
        {forgotMode && (
          <button className="text-blue-600 hover:underline" type="button" onClick={() => { setForgotMode(false); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); setResetSuccess(""); }}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
} 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function EditorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  
  if (!auth) return <div>Loading...</div>;
  const { login, authError, setAuthError } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push("/Editor/dashboard");
      }
    } catch (error) {
      console.error('Editor login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-1 font-medium text-gray-900 dark:text-white">
          Editor Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setAuthError(""); }}
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <label className="block mb-1 font-medium text-gray-900 dark:text-white">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          required
          autoComplete="current-password"
        />
      </div>
      
      {authError && (
        <div className="text-red-600 dark:text-red-400 text-sm font-medium">
          {authError}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Editor Login"}
      </button>
    </form>
  );
}
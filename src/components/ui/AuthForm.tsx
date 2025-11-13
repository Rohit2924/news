// src/components/ui/AuthForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const initialState = {
  name: "",
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
  const pathname = usePathname();
  const { login, register, forgotPassword, user, isLoading, isAuthenticated, authError, setAuthError } = useAuth();

  

  // Detect if this is admin login page
  const isAdminLogin = pathname === '/login' || pathname.startsWith('/login/');
  const isEditorLogin = pathname === '/editor' || pathname.startsWith('/editor/login');
  
  // Determine the role context
  const getRoleContext = () => {
    if (isAdminLogin) return 'ADMIN';
    if (isEditorLogin) return 'EDITOR';
    return 'USER';
  };

  const roleContext = getRoleContext();
  

  // Handle redirection after login
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const currentPath = pathname;
    console.log(currentPath);
    if(user.role === 'ADMIN'){
      redirect('/admin/dashboard');
    }else if(user.role === 'EDITOR'){
      redirect('/editor/dashboard');
    }else{
      redirect('/profile');
    }
    
 
  }, [isAuthenticated, user, pathname, router]);

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
    if (!validate()) return;  
    setLoading(true);
    setError("");
    setAuthError("");

   try {
      let ok = false;
      if (mode === "login") {
        ok = await login(form.email, form.password);
      } else if (mode === "signup") {
        ok = await register(form.email, form.password, form.name);

        console.log("email:" + form.email, "passwod" + form.password);
        
        
        if (ok) {
          setSuccess("Account created successfully! Please login to continue.");
          setTimeout(() => {
            setMode("login");
            setForm({ ...initialState, email: form.email }); // Keep the email filled
            setSuccess("");
          }, 2000);
          return;
        }
      }

      if (ok && mode === "login") {
        setSuccess("Logged in successfully!");
      } else if (!ok) {
        setError(authError || `${mode === "login" ? "Login" : "Sign up"} failed.`);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const ok = await forgotPassword(form.email);
    if (ok) {
      setResetSuccess("Password reset instructions have been sent to your email.");
    } else {
      setError(authError || "Password reset failed");
    }
    setLoading(false);
  };

  // Get styles based on role context
  const getStyles = () => {
    switch (roleContext) {
      case 'ADMIN':
        return {
          bglinear: "from-red-600 to-indigo-800",
          buttonColor: "bg-red-600 hover:bg-red-700",
          headerText: "Admin Portal",
          subText: "Sign in with your admin credentials",
          placeholder: "admin@newsportal.com"
        };
      case 'EDITOR':
        return {
          bglinear: "from-green-600 via-blue-600 to-teal-800",
          buttonColor: "bg-green-600 hover:bg-green-700",
          headerText: "Editor Portal",
          subText: "Sign in with your editor credentials",
          placeholder: "editor@newsportal.com"
        };
      default:
        return {
          bglinear: "from-blue-500 via-purple-500 to-pink-500",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
          headerText: "Welcome Back",
          subText: "Sign in to your account",
          placeholder: "your@email.com"
        };
    }
  };

  const styles = getStyles();

  return (
    <div>
      {/* Header Section with Role-based Styling */}
      {(isAdminLogin || isEditorLogin) && (
        <div className="text-center mb-8">
          <div className={`mx-auto h-12 w-12 bg-linear-to-r ${styles.bglinear.split(' ')[0]} ${styles.bglinear.split(' ')[1]} rounded-full flex items-center justify-center mb-4`}>
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{styles.headerText}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{styles.subText}</p>
        </div>
      )}

      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${mode === "login" && !forgotMode ? `${styles.buttonColor} text-white` : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
          onClick={() => { setMode("login"); setForm(initialState); setError(""); setSuccess(""); setForgotMode(false); }}
          type="button"
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${mode === "signup" && !forgotMode ? `${styles.buttonColor} text-white` : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
          onClick={() => { setMode("signup"); setForm(initialState); setError(""); setSuccess(""); setForgotMode(false); }}
          type="button"
        >
          Sign Up
        </button>
      </div>

      {!forgotMode ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              {roleContext === 'ADMIN' ? 'Admin Email' : roleContext === 'EDITOR' ? 'Editor Email' : 'Email'}
            </label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
              autoComplete="email" 
              placeholder={styles.placeholder}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required autoComplete={mode === "login" ? "current-password" : "new-password"} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          {mode === "signup" && (<div><label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Confirm Password</label><input type={showPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required autoComplete="new-password" /></div>)}
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
          {authError && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</div>}
          {success && <div className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</div>}
          <button type="submit" disabled={loading} className={`w-full py-2 px-4 ${styles.buttonColor} text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}>
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required autoComplete="email" />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
          {authError && <div className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</div>}
          {resetSuccess && <div className="text-green-600 dark:text-green-400 text-sm font-medium">{resetSuccess}</div>}
          <button type="submit" className={`w-full py-2 rounded ${styles.buttonColor} text-white font-semibold transition-colors duration-200 disabled:opacity-60`} disabled={loading}>
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
          <>Don&apos;t have an account? <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode('signup'); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); }}>Sign Up</button></>
        ) : (
          <>Already have an account? <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode('login'); setForm(initialState); setError(""); setSuccess(""); setAuthError(""); }}>Login</button></>
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
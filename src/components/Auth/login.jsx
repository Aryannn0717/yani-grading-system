// login.jsx
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient";

export default function LoginForm({ onSwitchToRegister, initialEmail = "" }) {
  const [loginData, setLoginData] = useState({ email: initialEmail, password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) throw authError;

      // Get the full user data to check role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User data not available");
      }

      // Redirect based on role
      const role = user.user_metadata?.role || "teacher";
      window.location.href =
        role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    } catch (err) {
      setError(err.message || "Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-100 max-w-md w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access your account
        </p>
      </div>

      {error && (
        <div className="flex items-start p-4 space-x-2 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-100">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <a href="#" className="text-xs text-green-600 hover:text-green-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          className="font-medium text-green-600 hover:text-green-500 hover:underline"
          onClick={onSwitchToRegister}
        >
          Create one
        </button>
      </div>
    </form>
  );
}
// Login.jsx
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Login({ setActiveTab }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User data not available");
      }

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
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="flex items-start p-4 space-x-2 text-sm text-red-600 bg-red-50 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <div>{error}</div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={loginData.email}
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          className="font-medium text-red-600 hover:text-red-500"
          onClick={() => setActiveTab("register")}
        >
          Register as Teacher
        </button>
      </div>
    </form>
  );
}
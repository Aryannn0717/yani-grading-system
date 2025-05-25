// register.jsx
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient";

export default function RegisterForm({ onSwitchToLogin }) {
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "teacher",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            role: registerData.role,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        await supabase.auth.signInWithPassword({
          email: registerData.email,
          password: registerData.password,
        });
      }

      onSwitchToLogin(registerData.email);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-100 max-w-md w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Register for a new account
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
            htmlFor="reg-email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email: e.target.value,
              })
            }
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reg-password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use at least 8 characters with a mix of letters and numbers
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reg-confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="reg-confirm-password"
            type="password"
            required
            minLength={8}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
            placeholder="••••••••"
          />
        </div>
      </div>

      <input
        type="hidden"
        name="role"
        value="teacher"
      />

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
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-green-600 hover:text-green-500 hover:underline"
          onClick={() => onSwitchToLogin("")}
        >
          Sign in here
        </button>
      </div>
    </form>
  );
}
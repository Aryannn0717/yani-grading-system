// Register.jsx
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Register({ setActiveTab }) {
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
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            role: registerData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.auth.signInWithPassword({
          email: registerData.email,
          password: registerData.password,
        });
      }

      setError("Registration successful! You can now login.");
      setActiveTab("login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Registration</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create a new teacher account
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
          htmlFor="reg-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              email: e.target.value,
            })
          }
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reg-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={registerData.password}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              password: e.target.value,
            })
          }
          placeholder="Create a password"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reg-confirm-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={registerData.confirmPassword}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              confirmPassword: e.target.value,
            })
          }
          placeholder="Confirm your password"
        />
      </div>

      <input
        type="hidden"
        value="teacher"
        onChange={(e) =>
          setRegisterData({ ...registerData, role: e.target.value })
        }
      />

      <div className="text-xs text-gray-500 mt-4">
        <p>
          Note: Student registration is only available through the
          teacher portal after login.
        </p>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        disabled={isLoading}
      >
        {isLoading ? "Registering..." : "Register Teacher Account"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-red-600 hover:text-red-500"
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
      </div>
    </form>
  );
}
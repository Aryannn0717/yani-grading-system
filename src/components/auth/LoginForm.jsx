// LoginForm.jsx
import React, { useState } from "react";
import Login from "../auth/Login";
import Register from "../auth/Register";

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-red-100">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "login"
                  ? "border-red-600 text-red-700"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "register"
                  ? "border-red-600 text-red-700"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Register (Teachers Only)
            </button>
          </div>

          <div className="p-8">
            {activeTab === "login" ? (
              <Login setActiveTab={setActiveTab} />
            ) : (
              <Register setActiveTab={setActiveTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
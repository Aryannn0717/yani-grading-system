// auth-container.jsx
import React, { useState } from "react";
import LoginForm from "./login";
import RegisterForm from "./register";

export default function AuthContainer() {
  const [showRegister, setShowRegister] = useState(false);
  const [initialEmail, setInitialEmail] = useState("");

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = (email = "") => {
    setShowRegister(false);
    if (email && typeof email === 'string') {
      setInitialEmail(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {showRegister ? (
            <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
          ) : (
            <LoginForm 
              onSwitchToRegister={handleSwitchToRegister} 
              initialEmail={initialEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
}
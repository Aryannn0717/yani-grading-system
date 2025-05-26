"use client"

import { useState } from "react"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

export default function AuthContainer() {
  const [showRegister, setShowRegister] = useState(false)
  const [initialEmail, setInitialEmail] = useState("")

  const handleSwitchToRegister = () => {
    setShowRegister(true)
  }

  const handleSwitchToLogin = (email = "") => {
    setShowRegister(false)
    if (email && typeof email === "string") {
      setInitialEmail(email)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#ede8f5" }}
    >
      <div
        className="w-full max-w-4xl flex bg-white rounded-lg shadow-md overflow-hidden border"
        style={{ borderColor: "#adbbda" }}
      >
        {/* Left Panel - Login */}
        <div
          className={`flex-1 transition-all duration-500 ease-in-out ${
            showRegister ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <LoginForm onSwitchToRegister={handleSwitchToRegister} initialEmail={initialEmail} />
        </div>

        {/* Right Panel - Register */}
        <div
          className={`flex-1 transition-all duration-500 ease-in-out ${
            showRegister ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
        </div>
      </div>
    </div>
  )
}

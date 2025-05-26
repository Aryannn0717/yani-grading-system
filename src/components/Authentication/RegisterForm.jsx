"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { supabase } from "../Supabase/supabaseClient"

export default function RegisterForm({ onSwitchToLogin }) {
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "teacher",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
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
      })

      console.log("Qee", data)

      if (authError) throw authError

      if (data.user) {
        await supabase.auth.signInWithPassword({
          email: registerData.email,
          password: registerData.password,
        })
      }

      onSwitchToLogin(registerData.email)
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
      console.error("Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6 p-8 h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold" style={{ color: "#3d52a0" }}>
          Register as a Teacher
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#8697c4" }}>
          Register for a new account
        </p>
      </div>

      {error && (
        <div
          className="flex items-start p-4 space-x-2 text-sm rounded-md border"
          style={{
            color: "#3d52a0",
            backgroundColor: "#ede8f5",
            borderColor: "#adbbda",
          }}
        >
          <AlertCircle className="h-5 w-5" style={{ color: "#7091e6" }} />
          <div>{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="reg-email" className="block text-sm font-medium" style={{ color: "#3d52a0" }}>
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            required
            className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors"
            style={{
              borderColor: "#adbbda",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#7091e6"
              e.target.style.boxShadow = `0 0 0 2px rgba(112, 145, 230, 0.2)`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#adbbda"
              e.target.style.boxShadow = "none"
            }}
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
          <label htmlFor="reg-password" className="block text-sm font-medium" style={{ color: "#3d52a0" }}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors"
            style={{
              borderColor: "#adbbda",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#7091e6"
              e.target.style.boxShadow = `0 0 0 2px rgba(112, 145, 230, 0.2)`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#adbbda"
              e.target.style.boxShadow = "none"
            }}
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
            placeholder="••••••••"
          />
          <p className="text-xs mt-1" style={{ color: "#8697c4" }}>
            Use at least 8 characters with a mix of letters and numbers
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="reg-confirm-password" className="block text-sm font-medium" style={{ color: "#3d52a0" }}>
            Confirm Password
          </label>
          <input
            id="reg-confirm-password"
            type="password"
            required
            minLength={8}
            className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors"
            style={{
              borderColor: "#adbbda",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#7091e6"
              e.target.style.boxShadow = `0 0 0 2px rgba(112, 145, 230, 0.2)`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#adbbda"
              e.target.style.boxShadow = "none"
            }}
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

      <input type="hidden" name="role" value="teacher" />

      <button
        type="submit"
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: "#3d52a0",
          focusRingColor: "#7091e6",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#7091e6")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#3d52a0")}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-center text-sm" style={{ color: "#8697c4" }}>
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium hover:underline transition-colors"
          style={{ color: "#7091e6" }}
          onMouseEnter={(e) => (e.target.style.color = "#8697c4")}
          onMouseLeave={(e) => (e.target.style.color = "#7091e6")}
          onClick={() => onSwitchToLogin("")}
        >
          Sign in
        </button>
      </div>
    </form>
  )
}

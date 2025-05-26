"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Home, Calendar, Award, User, LogOut, Menu, X, GraduationCap } from "lucide-react"
import { supabase } from "../Supabase/supabaseClient"

export default function StudentLayout({ children, title }) {
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error || !session) {
          navigate("/")
          return
        }

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          navigate("/")
          return
        }

        let userRole = authUser.user_metadata?.role

        if (!userRole) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", authUser.id)
            .single()

          if (!userError && userData) {
            userRole = userData.role
          }
        }

        if (userRole !== "student") {
          navigate("/")
          return
        }

        const { data: studentData } = await supabase.from("students").select("*").eq("user_id", authUser.id).single()

        setUser({
          ...authUser,
          ...studentData,
          username: studentData?.student_id || authUser.email,
        })
      } catch (err) {
        console.error("Error fetching user:", err)
        navigate("/")
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
    setShowLogoutConfirm(false)
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navigationItems = [
    { href: "/student/dashboard", icon: Home, label: "Dashboard" },
    { href: "/student/attendance", icon: Calendar, label: "Attendance" },
    { href: "/student/grades", icon: Award, label: "Grades" },
    { href: "/student/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#ede8f5" }}>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Are you sure you want to logout?</h3>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                style={{ backgroundColor: "#3d52a0" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#2d3f7f")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#3d52a0")}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
        style={{ backgroundColor: "#3d52a0" }}
      >
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <GraduationCap className="h-8 w-8 text-white mr-3" />
            <h1 className="text-xl font-bold text-white">Student Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5] text-white"
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[#7091e6]">
            <div className="text-sm mb-3 px-2 py-2 rounded-lg bg-[#4a63b5] shadow-md border border-[#5a74c5]">
              Hello! Student <span className="font-semibold">{user?.username || "Student"}</span>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5] text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full" style={{ backgroundColor: "#3d52a0" }}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={toggleMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <GraduationCap className="h-8 w-8 text-white mr-3" />
                <h1 className="text-xl font-bold text-white">Student Portal</h1>
              </div>
              <nav className="mt-5 px-2 space-y-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5] text-white"
                      onClick={toggleMobileMenu}
                    >
                      <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-[#7091e6]">
              <div className="text-sm mb-3 px-2 py-2 rounded-lg bg-[#4a63b5] shadow-md border border-[#5a74c5]">
                Hello! Student <span className="font-semibold">{user?.username || "Student"}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-base bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5] text-white"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "#3d52a0" }}>
            <button onClick={toggleMobileMenu} className="text-white hover:text-gray-200 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">Student Portal</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page header */}
        <header className="bg-white shadow-sm border-b" style={{ borderColor: "#adbbda" }}>
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-2xl font-bold" style={{ color: "#3d52a0" }}>
              {title}
            </h2>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

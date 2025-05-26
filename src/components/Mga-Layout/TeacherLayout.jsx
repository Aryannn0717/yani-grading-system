"use client"

import { useState, useEffect } from "react"
import { FiHome, FiBook, FiUsers, FiCalendar, FiAward, FiFileText, FiMenu, FiX } from "react-icons/fi"
import { RiDashboardHorizontalFill } from "react-icons/ri"
import { IoMdLogOut } from "react-icons/io"
import { supabase } from "../Supabase/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function TeacherLayout({ children, title }) {
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        navigate("/")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        navigate("/")
        return
      }

      if (user.user_metadata?.role !== "teacher") {
        navigate("/")
        return
      }

      setUser({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        username: user.user_metadata?.username || user.email.split("@")[0],
      })
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/")
      } else if (session?.user) {
        if (session.user.user_metadata?.role === "teacher") {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role,
            username: session.user.user_metadata?.username || session.user.email.split("@")[0],
          })
        }
      }
    })

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe()
      }
    }
  }, [navigate])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut()
    navigate("/")
    setShowLogoutConfirm(false)
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-[#ede8f5] md:flex-row">
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#3d52a0] rounded-md hover:bg-[#2d3f7f] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#3d52a0] text-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b border-[#7091e6]">
          <h1 className="text-xl font-bold ">Teacher Portal</h1>
        </div>

        {/* Menu items as separate boxes */}
        <div className="flex-1 px-4 py-4 space-y-3">
          <a
            href="/teacher/dashboard"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiHome className="text-xl mr-3" />
            Dashboard
          </a>
          <a
            href="/teacher/subjects"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiBook className="text-xl mr-3" />
            Subjects
          </a>
          <a
            href="/teacher/students"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiUsers className="text-xl mr-3" />
            Students
          </a>
          <a
            href="/teacher/attendance"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiCalendar className="text-xl mr-3" />
            Attendance
          </a>
          <a
            href="/teacher/grades"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiAward className="text-xl mr-3" />
            Grades
          </a>
          <a
            href="/teacher/reports"
            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <FiFileText className="text-xl mr-3" />
            Reports
          </a>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-[#7091e6]">
          <div className="text-sm mb-3 px-2 py-2 rounded-lg bg-[#4a63b5] shadow-md border border-[#5a74c5]">
            Hello! Teacher <span className="font-semibold">{user.username}</span>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
          >
            <IoMdLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
          <div className="relative flex flex-col w-64 h-full bg-[#3d52a0] text-white shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#7091e6]">
              <h1 className="text-xl font-bold">Menu</h1>
              <button onClick={toggleMobileMenu} className="text-white hover:text-[#adbbda]">
                <FiX size={24} />
              </button>
            </div>

            {/* Menu items as separate boxes */}
            <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
              <a
                href="/teacher/dashboard"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <RiDashboardHorizontalFill className="text-xl mr-3" />
                Dashboard
              </a>
              <a
                href="/teacher/subjects"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <FiBook className="text-xl mr-3" />
                Subjects
              </a>
              <a
                href="/teacher/students"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <FiUsers className="text-xl mr-3" />
                Students
              </a>
              <a
                href="/teacher/attendance"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <FiCalendar className="text-xl mr-3" />
                Attendance
              </a>
              <a
                href="/teacher/grades"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <FiAward className="text-xl mr-3" />
                Grades
              </a>
              <a
                href="/teacher/reports"
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <FiFileText className="text-xl mr-3" />
                Reports
              </a>
            </div>

            <div className="p-4 border-t border-[#7091e6]">
              <div className="text-sm mb-3 px-2 py-2 rounded-lg bg-[#4a63b5] shadow-md border border-[#5a74c5]">
                Hello!, Teacher <span className="font-semibold">{user.username}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-base bg-[#4a63b5] hover:bg-[#7091e6] shadow-md border border-[#5a74c5]"
              >
                <IoMdLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#3d52a0] text-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="text-white hover:text-[#adbbda] focus:outline-none mr-4 md:hidden"
                >
                  <FiMenu size={24} />
                </button>
                <h1 className="text-xl font-bold">{}</h1>
              </div>

              <div className="md:hidden flex items-center space-x-4">
                <div className="text-sm">Hello!, Teacher {user.username}</div>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center px-3 py-1 rounded-lg text-sm bg-[#4a63b5] hover:bg-[#7091e6] transition-colors shadow-md border border-[#5a74c5]"
                >
                  <IoMdLogOut className="mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 container mx-auto">
          <h2 className="text-2xl font-bold text-[#3d52a0] mb-6">{title}</h2>
          {children}
        </main>
      </div>
    </div>
  )
}

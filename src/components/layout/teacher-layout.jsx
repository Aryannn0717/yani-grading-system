import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiCalendar,
  FiAward,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TeacherLayout({ children, title }) {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/");
        return;
      }

      // Force refresh the session if needed
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      if (user.user_metadata?.role !== "teacher") {
        navigate("/");
        return;
      }

      setUser({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        username: user.user_metadata?.username || user.email.split("@")[0],
      });
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/");
      } else if (session?.user) {
        if (session.user.user_metadata?.role === "teacher") {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role,
            username: session.user.user_metadata?.username || session.user.email.split("@")[0],
          });
        } else {
          navigate("/");
        }
      }
    });

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return null; // or a loading spinner
  }

  // Helper function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F4F3]">
      {/* Header */}
      <header className="bg-white h-16 flex items-center justify-between px-4 shadow-sm border-b border-[#E0D5D3]">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 text-[#743A36]"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#743A36] hidden md:block">
            Welcome, {user?.username || "Teacher"}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 border border-[#743A36] text-[#743A36] rounded-md hover:bg-[#F0E5E3] transition-colors flex items-center"
          >
            <FiLogOut className="mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-sm">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => handleNavigation("/teacher/dashboard")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiHome className="mr-3 text-[#743A36]" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleNavigation("/teacher/subjects")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiBook className="mr-3 text-[#743A36]" />
              <span>Subjects</span>
            </button>
            <button
              onClick={() => handleNavigation("/teacher/students")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiUsers className="mr-3 text-[#743A36]" />
              <span>Students</span>
            </button>
            <button
              onClick={() => handleNavigation("/teacher/attendance")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiCalendar className="mr-3 text-[#743A36]" />
              <span>Attendance</span>
            </button>
            <button
              onClick={() => handleNavigation("/teacher/grades")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiAward className="mr-3 text-[#743A36]" />
              <span>Grades</span>
            </button>
            <button
              onClick={() => handleNavigation("/teacher/reports")}
              className="w-full flex items-center p-2 rounded-lg hover:bg-[#F0E5E3] transition-colors text-left"
            >
              <FiFileText className="mr-3 text-[#743A36]" />
              <span>Reports</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 bg-[#F8F4F3]">{children}</main>

      {/* Bottom navigation for desktop */}
      <nav className="hidden md:flex bg-[#743A36] text-white h-16 items-center justify-around px-4 shadow-lg">
        <button
          onClick={() => handleNavigation("/teacher/dashboard")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Dashboard"
        >
          <FiHome className="text-xl" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button
          onClick={() => handleNavigation("/teacher/subjects")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Subjects"
        >
          <FiBook className="text-xl" />
          <span className="text-xs mt-1">Subjects</span>
        </button>
        <button
          onClick={() => handleNavigation("/teacher/students")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Students"
        >
          <FiUsers className="text-xl" />
          <span className="text-xs mt-1">Students</span>
        </button>
        <button
          onClick={() => handleNavigation("/teacher/attendance")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Attendance"
        >
          <FiCalendar className="text-xl" />
          <span className="text-xs mt-1">Attendance</span>
        </button>
        <button
          onClick={() => handleNavigation("/teacher/grades")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Grades"
        >
          <FiAward className="text-xl" />
          <span className="text-xs mt-1">Grades</span>
        </button>
        <button
          onClick={() => handleNavigation("/teacher/reports")}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-[#5D2E2B] transition-colors"
          title="Reports"
        >
          <FiFileText className="text-xl" />
          <span className="text-xs mt-1">Reports</span>
        </button>
      </nav>
    </div>
  );
}
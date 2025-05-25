import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiCalendar,
  FiAward,
  FiFileText,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { IoMdLogOut } from "react-icons/io";
import { supabase } from "../../Supabase/supabaseClient";
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
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar with User Info */}
      <header className="bg-[#d4af37] text-black shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Teacher Portal</h1>
            </div>
            
            {/* User info for desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm">Welcome, {user.username}</div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1 rounded-md text-sm bg-[#b89930] hover:bg-[#a28728] transition-colors"
              >
                <IoMdLogOut className="mr-1" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-black hover:text-gray-200 focus:outline-none"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#b89930]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/teacher/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiHome className="inline mr-2" />
                Dashboard
              </a>
              <a href="/teacher/subjects" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiBook className="inline mr-2" />
                Subjects
              </a>
              <a href="/teacher/students" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiUsers className="inline mr-2" />
                Students
              </a>
              <a href="/teacher/attendance" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiCalendar className="inline mr-2" />
                Attendance
              </a>
              <a href="/teacher/grades" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiAward className="inline mr-2" />
                Grades
              </a>
              <a href="/teacher/reports" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728]">
                <FiFileText className="inline mr-2" />
                Reports
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-[#a28728] transition-colors"
              >
                <IoMdLogOut className="inline mr-2 text-lg" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 container mx-auto">
        <h2 className="text-2xl font-bold text-[#d4af37] mb-6">{title}</h2>
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="bg-[#d4af37] text-black shadow-md">
        <div className="container mx-auto px-4">
          <nav className="hidden md:flex items-center justify-around">
            <a href="/teacher/dashboard" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiHome className="text-lg mb-1" />
              Dashboard
            </a>
            <a href="/teacher/subjects" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiBook className="text-lg mb-1" />
              Subjects
            </a>
            <a href="/teacher/students" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiUsers className="text-lg mb-1" />
              Students
            </a>
            <a href="/teacher/attendance" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiCalendar className="text-lg mb-1" />
              Attendance
            </a>
            <a href="/teacher/grades" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiAward className="text-lg mb-1" />
              Grades
            </a>
            <a href="/teacher/reports" className="px-3 py-4 flex flex-col items-center text-xs font-medium hover:bg-[#b89930] transition-colors">
              <FiFileText className="text-lg mb-1" />
              Reports
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
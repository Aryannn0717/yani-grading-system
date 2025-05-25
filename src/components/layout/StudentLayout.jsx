import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiCalendar, 
  FiAward, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX 
} from "react-icons/fi";
import { supabase } from "../../Supabase/supabaseClient";

export default function StudentLayout({ children, title }) {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate("/");
          return;
        }

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          navigate("/");
          return;
        }

        let userRole = authUser.user_metadata?.role;
        
        if (!userRole) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();

          if (!userError && userData) {
            userRole = userData.role;
          }
        }

        if (userRole !== "student") {
          navigate("/");
          return;
        }

        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        setUser({
          ...authUser,
          ...studentData,
          username: studentData?.student_id || authUser.email
        });

      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      {/* Top Navigation Bar */}
      <header className="bg-green-800 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Student Portal</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <a href="/student/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <FiHome className="inline mr-2" />
                Dashboard
              </a>
              <a href="/student/attendance" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <FiCalendar className="inline mr-2" />
                Attendance
              </a>
              <a href="/student/grades" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <FiAward className="inline mr-2" />
                Grades
              </a>
              <a href="/student/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <FiUser className="inline mr-2" />
                Profile
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-green-200 focus:outline-none"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-green-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/student/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">
                <FiHome className="inline mr-2" />
                Dashboard
              </a>
              <a href="/student/attendance" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">
                <FiCalendar className="inline mr-2" />
                Attendance
              </a>
              <a href="/student/grades" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">
                <FiAward className="inline mr-2" />
                Grades
              </a>
              <a href="/student/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">
                <FiUser className="inline mr-2" />
                Profile
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
              >
                <FiLogOut className="inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* User info and logout for desktop */}
      <div className="hidden md:flex justify-end items-center bg-green-700 text-white px-4 py-2">
        <button
          onClick={handleLogout}
          className="flex items-center text-sm hover:text-green-200"
        >
          <FiLogOut className="mr-1" />
          Logout
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 container mx-auto">
        <h2 className="text-2xl font-bold text-green-800 mb-6">{title}</h2>
        {children}
      </main>
    </div>
  );
}
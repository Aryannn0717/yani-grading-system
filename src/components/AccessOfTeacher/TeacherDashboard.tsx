import React, { useEffect, useState } from "react";
import TeacherLayout from "../Mga-Layout/TeacherLayout";
import { BookText, Users, CalendarCheck, NotebookPen } from "lucide-react";
import { supabase } from "../Supabase/supabaseClient";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    subjects: 0,
    students: 0,
    attendanceRecords: 0,
    gradeRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true });

      const { count: gradesCount } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true });

      setStats({
        subjects: subjectsCount || 0,
        students: studentsCount || 0,
        attendanceRecords: attendanceCount || 0,
        gradeRecords: gradesCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <TeacherLayout title="Dashboard">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Subjects Card */}
        <div className="relative bg-white p-8 rounded-xl shadow-md border border-[#adbbda] hover:border-[#7091e6] transition-all duration-300 group overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8f5] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#8697c4]">Subjects</h3>
              <div className="p-3 rounded-lg bg-[#ede8f5] group-hover:bg-[#adbbda] transition-colors duration-300">
                <BookText className="h-6 w-6 text-[#3d52a0]" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-4 ${loading ? "animate-pulse bg-[#adbbda] rounded h-10 w-20" : "text-[#3d52a0]"}`}>
              {loading ? "" : stats.subjects}
            </div>
            <div className="mt-auto text-sm text-[#8697c4]">
              Courses you're currently teaching this semester. Manage subjects and curriculum.
            </div>
            <div className="mt-2 text-xs text-[#adbbda]">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Students Card */}
        <div className="relative bg-white p-8 rounded-xl shadow-md border border-[#adbbda] hover:border-[#7091e6] transition-all duration-300 group overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8f5] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#8697c4]">Students</h3>
              <div className="p-3 rounded-lg bg-[#ede8f5] group-hover:bg-[#adbbda] transition-colors duration-300">
                <Users className="h-6 w-6 text-[#3d52a0]" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-4 ${loading ? "animate-pulse bg-[#adbbda] rounded h-10 w-20" : "text-[#3d52a0]"}`}>
              {loading ? "" : stats.students}
            </div>
            <div className="mt-auto text-sm text-[#8697c4]">
              Total students enrolled in your classes. View and manage student profiles.
            </div>
            <div className="mt-2 text-xs text-[#adbbda]">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="relative bg-white p-8 rounded-xl shadow-md border border-[#adbbda] hover:border-[#7091e6] transition-all duration-300 group overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8f5] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#8697c4]">Attendance</h3>
              <div className="p-3 rounded-lg bg-[#ede8f5] group-hover:bg-[#adbbda] transition-colors duration-300">
                <CalendarCheck className="h-6 w-6 text-[#3d52a0]" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-4 ${loading ? "animate-pulse bg-[#adbbda] rounded h-10 w-20" : "text-[#3d52a0]"}`}>
              {loading ? "" : stats.attendanceRecords}
            </div>
            <div className="mt-auto text-sm text-[#8697c4]">
              Attendance records tracked. Monitor student participation and class sessions.
            </div>
            <div className="mt-2 text-xs text-[#adbbda]">
              Current academic year
            </div>
          </div>
        </div>

        {/* Grades Card */}
        <div className="relative bg-white p-8 rounded-xl shadow-md border border-[#adbbda] hover:border-[#7091e6] transition-all duration-300 group overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ede8f5] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#8697c4]">Grades</h3>
              <div className="p-3 rounded-lg bg-[#ede8f5] group-hover:bg-[#adbbda] transition-colors duration-300">
                <NotebookPen className="h-6 w-6 text-[#3d52a0]" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-4 ${loading ? "animate-pulse bg-[#adbbda] rounded h-10 w-20" : "text-[#3d52a0]"}`}>
              {loading ? "" : stats.gradeRecords}
            </div>
            <div className="mt-auto text-sm text-[#8697c4]">
              Grades recorded across all subjects. Input and manage student performance.
            </div>
            <div className="mt-2 text-xs text-[#adbbda]">
              Includes all grading periods
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
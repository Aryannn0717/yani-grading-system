import React, { useEffect, useState } from "react";
import StudentLayout from "../Mga-Layout/StudentLayout";
import { BookOpen, ClipboardCheck, GraduationCap, AlertCircle, TrendingUp, Check, X, Clock } from 'lucide-react';
import { supabase } from "../Supabase/supabaseClient";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    subjects: 0,
    attendanceRecords: 0,
    attendancePercentage: 0,
    recentAttendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get session and user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          window.location.href = "/";
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          window.location.href = "/";
          return;
        }

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, subjects")
          .eq("email", user.email)
          .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error("Student record not found");

        // Count enrolled subjects
        let enrolledSubjects = 0;
        let subjectIds = [];
        if (studentData?.subjects) {
          if (typeof studentData.subjects === "string") {
            try {
              subjectIds = JSON.parse(studentData.subjects);
              enrolledSubjects = subjectIds.length;
            } catch {
              enrolledSubjects = 1;
            }
          } else if (Array.isArray(studentData.subjects)) {
            subjectIds = studentData.subjects;
            enrolledSubjects = subjectIds.length;
          } else {
            enrolledSubjects = 1;
          }
        }

        // Get attendance records
        const { data: attendanceData, count: attendanceCount, error: attendanceError } = await supabase
          .from("attendance")
          .select("status, date, subject_id", { count: "exact" })
          .eq("student_id", studentData.id)
          .order("date", { ascending: false })
          .limit(5);

        if (attendanceError) throw attendanceError;

        // Calculate attendance percentage
        const presentCount = attendanceData?.filter(a => a.status === "present").length || 0;
        const attendancePercentage = attendanceCount ? Math.round((presentCount / attendanceCount) * 100) : 0;

        // Get subject names for recent attendance
        let recentAttendance = [];
        if (attendanceData?.length > 0) {
          const { data: subjectsData } = await supabase
            .from("subjects")
            .select("id, code, name")
            .in("id", subjectIds);

          recentAttendance = attendanceData.map(record => {
            const subject = subjectsData?.find(s => s.id === record.subject_id);
            return {
              ...record,
              subjectCode: subject?.code || "N/A",
              subjectName: subject?.name || "Unknown Course"
            };
          });
        }

        setStats({
          subjects: enrolledSubjects,
          attendanceRecords: attendanceCount || 0,
          attendancePercentage,
          recentAttendance
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#7091e6' }}></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm" style={{ borderColor: '#adbbda', border: '1px solid' }}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: '#ede8f5' }}>
              <AlertCircle className="h-6 w-6" style={{ color: '#3d52a0' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#3d52a0' }}>Error loading dashboard</h3>
            <p className="text-sm mb-4" style={{ color: '#8697c4' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#7091e6' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3d52a0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#7091e6'}
            >
              Try Again
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Academic Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, #ede8f5 0%, #adbbda 100%)', border: '1px solid #adbbda' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d52a0' }}>Welcome Back!</h1>
          <p style={{ color: '#8697c4' }}>Here's your academic overview</p>
        </div>

        {/* Stats Grid - Centered and Wider */}
        <div className="flex justify-center">
          <div className="grid gap-5 md:grid-cols-2 w-full max-w-6xl">
            {/* Enrolled Courses Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full min-h-[220px]" style={{ border: '1px solid #adbbda' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium" style={{ color: '#8697c4' }}>Enrolled Courses</h3>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#ede8f5' }}>
                  <BookOpen className="h-6 w-6" style={{ color: '#7091e6' }} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold" style={{ color: '#3d52a0' }}>{stats.subjects}</p>
                  <p className="text-md mt-2" style={{ color: '#8697c4' }}>Active courses</p>
                </div>
                <div className="flex items-center" style={{ color: '#7091e6' }}>
                  <TrendingUp className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">+2 this term</span>
                </div>
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full min-h-[220px]" style={{ border: '1px solid #adbbda' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium" style={{ color: '#8697c4' }}>Class Attendance</h3>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#ede8f5' }}>
                  <ClipboardCheck className="h-6 w-6" style={{ color: '#7091e6' }} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold" style={{ color: '#3d52a0' }}>{stats.attendanceRecords}</p>
                  <p className="text-md mt-2" style={{ color: '#8697c4' }}>Sessions attended</p>
                </div>
                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#adbbda"
                        strokeWidth="2"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#7091e6"
                        strokeWidth="2"
                        strokeDasharray={`${stats.attendancePercentage} 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: '#3d52a0' }}>
                        {stats.attendancePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

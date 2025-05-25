import React, { useEffect, useState } from "react";
import StudentLayout from "../layout/StudentLayout";
import { BookOpen, ClipboardCheck, GraduationCap, AlertCircle, TrendingUp, Check, X, Clock } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient";

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md p-6 bg-white rounded-xl border border-red-100 shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
          <p className="text-gray-600">Here's your academic overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Enrolled Courses Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Enrolled Courses</h3>
              <div className="p-2 rounded-lg bg-green-50">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.subjects}</p>
                <p className="text-sm text-gray-500 mt-1">Active courses</p>
              </div>
              <div className="text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">+2 this term</span>
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Class Attendance</h3>
              <div className="p-2 rounded-lg bg-blue-50">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.attendanceRecords}</p>
                <p className="text-sm text-gray-500 mt-1">Sessions attended</p>
              </div>
              <div className="flex items-center">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={`${stats.attendancePercentage} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">
                      {stats.attendancePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
              <div className="p-2 rounded-lg bg-purple-50">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-4">
              {stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((record, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      record.status === "present" ? "bg-green-50 text-green-600" :
                      record.status === "absent" ? "bg-red-50 text-red-600" :
                      record.status === "late" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {record.status === "present" ? <Check className="h-4 w-4" /> :
                       record.status === "absent" ? <X className="h-4 w-4" /> :
                       record.status === "late" ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{record.subjectCode}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      record.status === "present" ? "bg-green-100 text-green-800" :
                      record.status === "absent" ? "bg-red-100 text-red-800" :
                      record.status === "late" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent attendance records</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <div className="mx-auto mb-2 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Attendance</span>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
              <div className="mx-auto mb-2 flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Grades</span>
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
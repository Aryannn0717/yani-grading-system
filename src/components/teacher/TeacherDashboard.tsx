// pages/teacher/dashboard.jsx
import React, { useEffect, useState } from "react"
import TeacherLayout from "../layout/TeacherLayout"
import { BookText, Users, CalendarCheck, NotebookPen } from "lucide-react"
import { supabase } from "../../Supabase/supabaseClient"

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    subjects: 0,
    students: 0,
    attendanceRecords: 0,
    gradeRecords: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })

      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })

      const { count: gradesCount } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })

      setStats({
        subjects: subjectsCount || 0,
        students: studentsCount || 0,
        attendanceRecords: attendanceCount || 0,
        gradeRecords: gradesCount || 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <TeacherLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Subjects Card */}
        <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-red-200 transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Subjects</h3>
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-300">
                <BookText className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className={`mt-4 text-2xl font-semibold ${loading ? "animate-pulse bg-gray-200 rounded h-8 w-16" : "text-gray-900"}`}>
              {loading ? "" : stats.subjects}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {loading ? "" : "Teaching this semester"}
            </div>
          </div>
        </div>

        {/* Students Card */}
        <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className={`mt-4 text-2xl font-semibold ${loading ? "animate-pulse bg-gray-200 rounded h-8 w-16" : "text-gray-900"}`}>
              {loading ? "" : stats.students}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {loading ? "" : "In your classes"}
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-green-200 transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Attendance Records</h3>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                <CalendarCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className={`mt-4 text-2xl font-semibold ${loading ? "animate-pulse bg-gray-200 rounded h-8 w-16" : "text-gray-900"}`}>
              {loading ? "" : stats.attendanceRecords}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {loading ? "" : "This academic year"}
            </div>
          </div>
        </div>

        {/* Grades Card */}
        <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-purple-200 transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Grade Records</h3>
              <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                <NotebookPen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className={`mt-4 text-2xl font-semibold ${loading ? "animate-pulse bg-gray-200 rounded h-8 w-16" : "text-gray-900"}`}>
              {loading ? "" : stats.gradeRecords}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {loading ? "" : "Submitted grades"}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
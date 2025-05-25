import React, { useState, useEffect } from "react";
import StudentLayout from "../layout/StudentLayout";
import { Check, X, Clock, AlertCircle, ChevronDown, Filter } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient";

export default function StudentAttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0
  });

  const statusConfig = {
    present: {
      icon: <Check className="h-4 w-4 text-green-500" />,
      color: "bg-green-100 text-green-800",
      label: "Present"
    },
    absent: {
      icon: <X className="h-4 w-4 text-red-500" />,
      color: "bg-red-100 text-red-800",
      label: "Absent"
    },
    late: {
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: "bg-amber-100 text-amber-800",
      label: "Late"
    },
    excused: {
      icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-100 text-blue-800",
      label: "Excused"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("email", user.email)
          .single();

        if (studentError) throw studentError;
        if (!studentData) {
          console.error("No student data found");
          return;
        }

        setCurrentUser(studentData);

        let enrolledSubjectIds = [];
        if (studentData?.subjects) {
          try {
            enrolledSubjectIds = Array.isArray(studentData.subjects) 
              ? studentData.subjects 
              : JSON.parse(studentData.subjects);
          } catch (error) {
            console.error("Error parsing subjects:", error);
            enrolledSubjectIds = [];
          }
        }

        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("*")
          .in("id", enrolledSubjectIds);

        setSubjects(subjectsData || []);
        setEnrolledSubjects(subjectsData || []);

        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", studentData.id)
          .in("subject_id", enrolledSubjectIds);

        setAttendanceRecords(attendanceData || []);

        // Calculate statistics
        if (attendanceData) {
          const stats = {
            present: attendanceData.filter(r => r.status === 'present').length,
            absent: attendanceData.filter(r => r.status === 'absent').length,
            late: attendanceData.filter(r => r.status === 'late').length,
            excused: attendanceData.filter(r => r.status === 'excused').length
          };
          setStats(stats);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser && selectedSubject) {
      const filtered = attendanceRecords.filter(
        (record) => record.subject_id === selectedSubject
      );
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setFilteredAttendance(filtered);
    } else if (currentUser) {
      setFilteredAttendance(attendanceRecords);
    }
  }, [currentUser, selectedSubject, attendanceRecords]);

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.absent;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  const calculateAttendancePercentage = (status) => {
    const total = filteredAttendance.length || 1;
    return Math.round((stats[status] / total) * 100);
  };

  if (loading) {
    return (
      <StudentLayout title="Class Attendance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Class Attendance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
            <p className="text-gray-500 mt-1">View your class attendance history</p>
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Subjects</option>
              {enrolledSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{config.label}</p>
                  <p className="text-2xl font-semibold mt-1 text-gray-900">
                    {stats[status] || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">sessions</span>
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${config.color}`}>
                  {React.cloneElement(config.icon, { className: "h-6 w-6" })}
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      status === 'present' ? 'bg-green-500' : 
                      status === 'absent' ? 'bg-red-500' : 
                      status === 'late' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${calculateAttendancePercentage(status)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {calculateAttendancePercentage(status)}% of total
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Recent Attendance</h3>
          </div>
          {filteredAttendance.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">No attendance records found</div>
              <p className="text-sm text-gray-500">Your attendance will appear here once recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.map((record) => {
                    const subject = subjects.find((s) => s.id === record.subject_id);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subject ? subject.code : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subject ? subject.name : "Course not found"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
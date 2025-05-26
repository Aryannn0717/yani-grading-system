import React, { useState, useEffect } from "react";
import StudentLayout from "../Mga-Layout/StudentLayout";
import { Check, X, Clock, AlertCircle, ChevronDown, Filter } from 'lucide-react';
import { supabase } from "../Supabase/supabaseClient";

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
      icon: <Check className="h-4 w-4" style={{ color: '#7091e6' }} />,
      color: { backgroundColor: '#ede8f5', color: '#3d52a0' },
      label: "Present"
    },
    absent: {
      icon: <X className="h-4 w-4" style={{ color: '#3d52a0' }} />,
      color: { backgroundColor: '#adbbda', color: '#3d52a0' },
      label: "Absent"
    },
    late: {
      icon: <Clock className="h-4 w-4" style={{ color: '#8697c4' }} />,
      color: { backgroundColor: '#8697c4', color: 'white' },
      label: "Late"
    },
    excused: {
      icon: <AlertCircle className="h-4 w-4" style={{ color: '#7091e6' }} />,
      color: { backgroundColor: '#7091e6', color: 'white' },
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
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={config.color}>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#7091e6' }}></div>
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
            <h1 className="text-2xl font-bold" style={{ color: '#3d52a0' }}>Attendance Records</h1>
            <p className="mt-1" style={{ color: '#8697c4' }}>View your class attendance history</p>
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4" style={{ color: '#8697c4' }} />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-white focus:ring-2 focus:border-transparent"
              style={{ 
                border: '1px solid #adbbda',
                color: '#3d52a0'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7091e6';
                e.target.style.boxShadow = '0 0 0 2px rgba(112, 145, 230, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#adbbda';
                e.target.style.boxShadow = 'none';
              }}
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
            <div key={status} className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid #adbbda' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#8697c4' }}>{config.label}</p>
                  <p className="text-2xl font-semibold mt-1" style={{ color: '#3d52a0' }}>
                    {stats[status] || 0}
                    <span className="text-sm font-normal ml-1" style={{ color: '#8697c4' }}>sessions</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={config.color}>
                  {React.cloneElement(config.icon, { className: "h-6 w-6" })}
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#ede8f5' }}>
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: status === 'present' ? '#7091e6' : 
                                     status === 'absent' ? '#3d52a0' : 
                                     status === 'late' ? '#8697c4' : '#7091e6',
                      width: `${calculateAttendancePercentage(status)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: '#8697c4' }}>
                  {calculateAttendancePercentage(status)}% of total
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #adbbda' }}>
          <div className="p-4" style={{ borderBottom: '1px solid #adbbda' }}>
            <h3 className="font-medium" style={{ color: '#3d52a0' }}>Recent Attendance</h3>
          </div>
          {filteredAttendance.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-2" style={{ color: '#8697c4' }}>No attendance records found</div>
              <p className="text-sm" style={{ color: '#8697c4' }}>Your attendance will appear here once recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: '#ede8f5' }}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8697c4' }}>
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8697c4' }}>
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8697c4' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white" style={{ borderTop: '1px solid #adbbda' }}>
                  {filteredAttendance.map((record, index) => {
                    const subject = subjects.find((s) => s.id === record.subject_id);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50" style={{ 
                        borderBottom: index < filteredAttendance.length - 1 ? '1px solid #ede8f5' : 'none'
                      }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: '#3d52a0' }}>
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs" style={{ color: '#8697c4' }}>
                            {new Date(record.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: '#3d52a0' }}>
                            {subject ? subject.code : "N/A"}
                          </div>
                          <div className="text-xs" style={{ color: '#8697c4' }}>
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

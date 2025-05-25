import { useState, useEffect } from "react"
import TeacherLayout from "../layout/TeacherLayout"
import { CalendarIcon, Save, Check, X, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "../../Supabase/supabaseClient"

export default function AttendanceTracker() {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [currentAttendance, setCurrentAttendance] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const statusConfig = {
    present: {
      icon: <Check className="h-4 w-4" />,
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      border: "border-l-4 border-l-emerald-500",
      label: "Present"
    },
    absent: {
      icon: <X className="h-4 w-4" />,
      color: "bg-rose-50 border-rose-200 text-rose-700",
      border: "border-l-4 border-l-rose-500",
      label: "Absent"
    },
    late: {
      icon: <Clock className="h-4 w-4" />,
      color: "bg-amber-50 border-amber-200 text-amber-700",
      border: "border-l-4 border-l-amber-500",
      label: "Late"
    },
    excused: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
      border: "border-l-4 border-l-indigo-500",
      label: "Excused"
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: subjectsData } = await supabase.from('subjects').select('*')
      const { data: studentsData } = await supabase.from('students').select('*')
      const { data: attendanceData } = await supabase.from('attendance').select('*')

      if (subjectsData) setSubjects(subjectsData)
      if (studentsData) setStudents(studentsData)
      if (attendanceData) setAttendanceRecords(attendanceData)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSubject && selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      
      const fetchAttendance = async () => {
        const { data } = await supabase
          .from('attendance')
          .select('*')
          .eq('subject_id', selectedSubject)
          .eq('date', dateString)

        const existingRecords = data || []

        const studentsInSubject = students.filter(student => 
          student.subjects?.includes(selectedSubject))

        const attendanceMap = {}
        existingRecords.forEach((record) => {
          attendanceMap[record.student_id] = record.status
        })

        studentsInSubject.forEach(student => {
          if (attendanceMap[student.id] === undefined) {
            attendanceMap[student.id] = "absent"
          }
        })

        setCurrentAttendance(attendanceMap)
      }

      fetchAttendance()
    }
  }, [selectedSubject, selectedDate, attendanceRecords, students])

  const handleAttendanceChange = (studentId, status) => {
    setCurrentAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedDate) return

    setIsSaving(true)
    const dateString = format(selectedDate, "yyyy-MM-dd")

    const recordsToUpsert = Object.entries(currentAttendance).map(([studentId, status]) => ({
      date: dateString,
      subject_id: selectedSubject,
      student_id: studentId,
      status: status
    }))

    const { error } = await supabase
      .from('attendance')
      .upsert(recordsToUpsert, { onConflict: ['date', 'subject_id', 'student_id'] })

    if (!error) {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('subject_id', selectedSubject)
        .eq('date', dateString)

      setAttendanceRecords(data || [])
    }

    setIsSaving(false)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const studentsInSubject = students.filter(student => 
    selectedSubject ? student.subjects?.includes(selectedSubject) : false)

  return (
    <TeacherLayout title="Class Attendance">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                <div className="relative">
                  <select
                    className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Choose a Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code}: {subject.name}
                      </option>
                    ))}
                  </select>
                  <div className="">
                    
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Date</label>
                <div className="relative">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 text-left border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-3 h-5 w-5 text-emerald-600" />
                      <span>{format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isCalendarOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = new Date()
                          day.setDate(i + 1)
                          return (
                            <button
                              key={i}
                              className={`p-2 text-center rounded-md hover:bg-emerald-50 ${
                                selectedDate && day.getDate() === selectedDate.getDate() 
                                  ? "bg-emerald-100 text-emerald-800 font-medium" 
                                  : "text-gray-700"
                              }`}
                              onClick={() => handleDateSelect(day)}
                            >
                              {day.getDate()}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedSubject && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Attendance Records</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {subjects.find(s => s.id === selectedSubject)?.name} • {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                </div>
                <span className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  {studentsInSubject.length} {studentsInSubject.length === 1 ? 'student' : 'students'}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading attendance data...</p>
                </div>
              ) : studentsInSubject.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No students enrolled in this course.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mark
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentsInSubject.map((student) => {
                        const status = currentAttendance[student.id] || "absent"
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                                  {student.photo ? (
                                    <img
                                      src={student.photo}
                                      alt={student.full_name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-emerald-600 font-medium">
                                      {student.full_name?.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.student_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                                value={status}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                              >
                                {Object.entries(statusConfig).map(([key, { label }]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`flex items-center px-3 py-2 rounded ${statusConfig[status].color} ${statusConfig[status].border}`}>
                                {statusConfig[status].icon}
                                <span className="ml-2 text-sm font-medium">{statusConfig[status].label}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {studentsInSubject.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  onClick={saveAttendance}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
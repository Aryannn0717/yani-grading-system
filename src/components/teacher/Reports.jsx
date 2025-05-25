// pages/teacher/reports.jsx
"use client"

import { useState, useEffect } from "react"
import TeacherLayout from "../layout/TeacherLayout"
import { FileDown, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle, BarChart2, TrendingUp, TrendingDown } from "lucide-react"
import { supabase } from "../../Supabase/supabaseClient"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Add this CSS to your global styles or in a style tag
const responsiveStyles = `
  @media (max-width: 768px) {
    .grade-details-table {
      display: block;
      width: 100%;
      overflow-x: auto;
    }
    
    .grade-details-table thead {
      display: none;
    }
    
    .grade-details-table tbody {
      display: block;
      width: 100%;
    }
    
    .grade-details-table tr {
      display: block;
      margin-bottom: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    .grade-details-table td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      text-align: right;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .grade-details-table td:before {
      content: attr(data-label);
      float: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .grade-details-table td:last-child {
      border-bottom: 0;
    }
    
    .grade-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .grade-item {
      flex: 1 1 calc(50% - 0.5rem);
      min-width: calc(50% - 0.5rem);
    }
  }
`;

// Gradebook PDF Component
const GradebookPDF = ({ students, subject, calculateAcademicPerformance }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica'
    },
    header: {
      marginBottom: 20,
      textAlign: 'center'
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 10
    },
    table: {
      display: "table",
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0
    },
    tableRow: {
      margin: "auto",
      flexDirection: "row"
    },
    tableColHeader: {
      width: "20%",
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      backgroundColor: '#f3f4f6'
    },
    tableCol: {
      width: "20%",
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0
    },
    tableCellHeader: {
      margin: 5,
      fontSize: 10,
      fontWeight: 'bold'
    },
    tableCell: {
      margin: 5,
      fontSize: 10
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      color: 'gray'
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{subject?.name} Gradebook</Text>
          <Text style={styles.subtitle}>{subject?.code} - {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Student</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Raw Grades</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Cumulative</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Trend</Text>
            </View>
          </View>

          {/* Table Rows */}
          {students.map((student) => {
            const performance = calculateAcademicPerformance(student.id);
            if (performance.cumulative.final === 0) return null;

            return (
              <View key={student.id} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{student.full_name}</Text>
                  <Text style={[styles.tableCell, { fontSize: 8 }]}>{student.student_id}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    Prelim: {performance.raw.prelim > 0 ? performance.raw.prelim.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Midterm: {performance.raw.midterm > 0 ? performance.raw.midterm.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Semi: {performance.raw.semifinal > 0 ? performance.raw.semifinal.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Final: {performance.raw.final > 0 ? performance.raw.final.toFixed(1) : '-'}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    Prelim: {performance.cumulative.prelim > 0 ? performance.cumulative.prelim.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Midterm: {performance.cumulative.midterm > 0 ? performance.cumulative.midterm.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Semi: {performance.cumulative.semifinal > 0 ? performance.cumulative.semifinal.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    Final: {performance.cumulative.final > 0 ? performance.cumulative.final.toFixed(1) : '-'}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[
                    styles.tableCell,
                    performance.passed ? { color: 'green' } : { color: 'red' }
                  ]}>
                    {performance.passed ? 'Passing' : 'Failing'}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[
                    styles.tableCell,
                    performance.trend === 'improving' ? { color: 'green' } : 
                    performance.trend === 'declining' ? { color: 'red' } : { color: 'gray' }
                  ]}>
                    {performance.trend === 'improving' ? 'Improving' : 
                     performance.trend === 'declining' ? 'Declining' : 'Stable'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Attendance PDF Component
const AttendancePDF = ({ students, subject, attendanceRecords }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica'
    },
    header: {
      marginBottom: 20,
      textAlign: 'center'
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 10
    },
    table: {
      display: "table",
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0
    },
    tableRow: {
      margin: "auto",
      flexDirection: "row"
    },
    tableColHeader: {
      width: "15%",
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      backgroundColor: '#f3f4f6'
    },
    tableCol: {
      width: "15%",
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0
    },
    tableCellHeader: {
      margin: 5,
      fontSize: 8,
      fontWeight: 'bold'
    },
    tableCell: {
      margin: 5,
      fontSize: 8
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      color: 'gray'
    }
  });

  // Process attendance data
  const classAttendance = attendanceRecords.filter((record) => record.subject_id === subject.id);
  const attendanceBySession = classAttendance.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = {};
    }
    acc[record.date][record.student_id] = record.status;
    return acc;
  }, {});

  const sessionDates = Object.keys(attendanceBySession).sort();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{subject?.name} Attendance</Text>
          <Text style={styles.subtitle}>{subject?.code} - {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Student</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>ID</Text>
            </View>
            {sessionDates.map((date) => (
              <View key={date} style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>{new Date(date).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {students.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>{student.full_name}</Text>
              </View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>{student.student_id}</Text>
              </View>
              {sessionDates.map((date) => (
                <View key={date} style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {attendanceBySession[date][student.id] || "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function ReportsPage() {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [gradeRecords, setGradeRecords] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [activeTab, setActiveTab] = useState("attendance")
  const [isLoading, setIsLoading] = useState(false)
  const [classStats, setClassStats] = useState(null)

  useEffect(() => {
    const fetchAcademicData = async () => {
      setIsLoading(true)
      try {
        const { data: subjectsData } = await supabase.from('subjects').select('*')
        const { data: studentsData } = await supabase.from('students').select('*')
        const { data: attendanceData } = await supabase.from('attendance').select('*')
        const { data: gradesData } = await supabase.from('grades').select('*')

        if (subjectsData) setSubjects(subjectsData)
        if (studentsData) setStudents(studentsData)
        if (attendanceData) setAttendanceRecords(attendanceData)
        if (gradesData) setGradeRecords(gradesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAcademicData()
  }, [])

  useEffect(() => {
    if (selectedSubject && students.length > 0 && gradeRecords.length > 0) {
      calculateClassStatistics()
    }
  }, [selectedSubject, students, gradeRecords])

  const calculateClassStatistics = () => {
    const subjectGrades = gradeRecords.filter(record => record.subject_id === selectedSubject)
    
    if (subjectGrades.length === 0) {
      setClassStats(null)
      return
    }

    const stats = {
      prelim: calculateTermStats('prelim'),
      midterm: calculateTermStats('midterm'),
      semifinal: calculateTermStats('semifinal'),
      final: calculateTermStats('final'),
      passRate: calculatePassRate()
    }

    setClassStats(stats)
  }

  const calculateTermStats = (term) => {
    const termGrades = students.map(student => {
      const perf = calculateAcademicPerformance(student.id)
      return perf.cumulative[term]
    }).filter(grade => grade > 0)

    if (termGrades.length === 0) return null

    const average = termGrades.reduce((sum, grade) => sum + grade, 0) / termGrades.length
    const highest = Math.max(...termGrades)
    const lowest = Math.min(...termGrades)

    return {
      average: parseFloat(average.toFixed(2)),
      highest: parseFloat(highest.toFixed(2)),
      lowest: parseFloat(lowest.toFixed(2))
    }
  }

  const calculatePassRate = () => {
    const passedCount = students.filter(student => {
      const perf = calculateAcademicPerformance(student.id)
      return perf.passed
    }).length

    return (passedCount / students.length) * 100
  }

  const calculateAcademicPerformance = (studentId) => {
    const studentGrades = gradeRecords
      .filter((record) => record.subject_id === selectedSubject && record.student_id === studentId)
      .reduce(
        (acc, record) => {
          acc[record.term] = record.grade
          return acc
        },
        { prelim: 0, midterm: 0, semifinal: 0, final: 0 },
      )

    const prelimGrade = studentGrades.prelim
    const midtermGrade = (prelimGrade + studentGrades.midterm) / 2
    const semifinalGrade = (midtermGrade + studentGrades.semifinal) / 2
    const finalGrade = (semifinalGrade + studentGrades.final) / 2

    return {
      raw: studentGrades,
      cumulative: {
        prelim: prelimGrade,
        midterm: midtermGrade,
        semifinal: semifinalGrade,
        final: finalGrade,
      },
      passed: finalGrade <= 3.0 && finalGrade > 0,
      trend: calculateTrend(prelimGrade, midtermGrade, semifinalGrade, finalGrade)
    }
  }

  const calculateTrend = (prelim, midterm, semifinal, final) => {
    if (prelim === 0 || final === 0) return 'stable'
    const diff = final - prelim
    if (diff < -0.5) return 'improving'
    if (diff > 0.5) return 'declining'
    return 'stable'
  }

  const generateAttendanceSpreadsheet = () => {
    if (!selectedSubject) return

    const subject = subjects.find((s) => s.id === selectedSubject)
    if (!subject) return

    const classAttendance = attendanceRecords.filter((record) => record.subject_id === selectedSubject)
    const attendanceBySession = classAttendance.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = {}
      }
      acc[record.date][record.student_id] = record.status
      return acc
    }, {})

    let csvContent = "Student ID,Student Name"
    const sessionDates = Object.keys(attendanceBySession).sort()
    sessionDates.forEach((date) => {
      csvContent += `,${date}`
    })
    csvContent += "\n"

    students.forEach((student) => {
      csvContent += `${student.student_id},"${student.full_name}"`
      sessionDates.forEach((date) => {
        const status = attendanceBySession[date][student.id] || "N/A"
        csvContent += `,${status}`
      })
      csvContent += "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${subject.code}_class_attendance.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateGradebookSpreadsheet = () => {
    if (!selectedSubject) return

    const subject = subjects.find((s) => s.id === selectedSubject)
    if (!subject) return

    let csvData = "Student ID,Student Name,Prelim Raw,Midterm Raw,Semi-Final Raw,Final Raw,Prelim Cumulative,Midterm Cumulative,Semi-Final Cumulative,Final Cumulative,Status\n"

    students.forEach((student) => {
      const performance = calculateAcademicPerformance(student.id)
      const finalResult = performance.cumulative.final
      const standing = finalResult <= 3.0 ? "Passed" : "Failed"

      csvData += `${student.student_id},"${student.full_name}",`
      csvData += `${performance.raw.prelim},${performance.raw.midterm},${performance.raw.semifinal},${performance.raw.final},`
      csvData += `${performance.cumulative.prelim.toFixed(2)},${performance.cumulative.midterm.toFixed(2)},${performance.cumulative.semifinal.toFixed(2)},${performance.cumulative.final.toFixed(2)},`
      csvData += `${standing}\n`
    })

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${subject.code}_gradebook.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const createAttendanceDocument = () => {
    if (!selectedSubject) return null;
    
    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return null;

    return (
      <PDFDownloadLink
        document={
          <AttendancePDF 
            students={students} 
            subject={subject} 
            attendanceRecords={attendanceRecords} 
          />
        }
        fileName={`${subject.code}_attendance.pdf`}
      >
        {({ loading }) => (
          <button
            className="flex items-center gap-2 border border-green-200 px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
            disabled={loading}
          >
            <FileDown className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>
        )}
      </PDFDownloadLink>
    );
  };

  const createGradebookDocument = () => {
    if (!selectedSubject) return null;
    
    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return null;

    return (
      <PDFDownloadLink
        document={
          <GradebookPDF 
            students={students} 
            subject={subject} 
            calculateAcademicPerformance={calculateAcademicPerformance} 
          />
        }
        fileName={`${subject.code}_gradebook.pdf`}
      >
        {({ loading }) => (
          <button
            className="flex items-center gap-2 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm"
            disabled={loading}
          >
            <FileDown className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>
        )}
      </PDFDownloadLink>
    );
  };

  return (
    <TeacherLayout title="Academic Reports">
      <style>{responsiveStyles}</style>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Academic Report Generator</h2>
        <div className="bg-white rounded-lg border border-green-100 shadow-md">
          <div className="p-5 border-b border-green-100 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-700">Course Selection</h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-600">
                Select Course
              </label>
              <select
                id="subject"
                className="w-full px-4 py-2.5 border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-300"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Choose a course</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {!isLoading && selectedSubject && (
        <div className="space-y-6">
          <div className="mb-5">
            <div className="flex border-b border-green-100">
              <button
                className={`py-3 px-5 text-sm font-medium ${
                  activeTab === "attendance" 
                    ? "border-b-2 border-green-600 text-green-700" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance Records
              </button>
              <button
                className={`py-3 px-5 text-sm font-medium ${
                  activeTab === "grades" 
                    ? "border-b-2 border-green-600 text-green-700" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("grades")}
              >
                Gradebook Records
              </button>
            </div>
          </div>

          {activeTab === "attendance" && (
            <div className="bg-white rounded-lg border border-green-100 shadow-md">
              <div className="p-5 border-b border-green-100 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-700">Attendance Reporting</h3>
              </div>
              <div className="p-5">
                <p className="mb-5 text-gray-600">
                  Generate detailed attendance reports showing student participation for each class session.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={generateAttendanceSpreadsheet}
                  >
                    <FileDown className="h-4 w-4" />
                    Download CSV
                  </button>
                  {createAttendanceDocument()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "grades" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-green-100 shadow-md">
                <div className="p-5 border-b border-green-100 bg-green-50">
                  <h3 className="text-lg font-semibold text-gray-700">Class Performance Overview</h3>
                </div>
                <div className="p-5">
                  {classStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-2">
                          <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                          <h4 className="text-sm font-medium text-blue-800">Prelim Stats</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">Avg: <span className="font-bold text-blue-600">{classStats.prelim?.average || 'N/A'}</span></p>
                          <p className="text-sm">High: <span className="font-bold text-green-600">{classStats.prelim?.highest || 'N/A'}</span></p>
                          <p className="text-sm">Low: <span className="font-bold text-red-600">{classStats.prelim?.lowest || 'N/A'}</span></p>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center mb-2">
                          <BarChart2 className="h-5 w-5 text-purple-500 mr-2" />
                          <h4 className="text-sm font-medium text-purple-800">Midterm Stats</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">Avg: <span className="font-bold text-purple-600">{classStats.midterm?.average || 'N/A'}</span></p>
                          <p className="text-sm">High: <span className="font-bold text-green-600">{classStats.midterm?.highest || 'N/A'}</span></p>
                          <p className="text-sm">Low: <span className="font-bold text-red-600">{classStats.midterm?.lowest || 'N/A'}</span></p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center mb-2">
                          <BarChart2 className="h-5 w-5 text-amber-500 mr-2" />
                          <h4 className="text-sm font-medium text-amber-800">Final Stats</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">Avg: <span className="font-bold text-amber-600">{classStats.final?.average || 'N/A'}</span></p>
                          <p className="text-sm">High: <span className="font-bold text-green-600">{classStats.final?.highest || 'N/A'}</span></p>
                          <p className="text-sm">Low: <span className="font-bold text-red-600">{classStats.final?.lowest || 'N/A'}</span></p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                          <h4 className="text-sm font-medium text-green-800">Class Standing</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">Pass Rate: <span className="font-bold text-green-600">{classStats.passRate.toFixed(1)}%</span></p>
                          <p className="text-sm">Total Students: <span className="font-bold text-gray-600">{students.length}</span></p>
                          <p className="text-sm">Passing: <span className="font-bold text-green-600">{Math.round(students.length * classStats.passRate / 100)}</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No grade data available for this course
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-green-100 shadow-md overflow-hidden">
                <div className="p-5 border-b border-green-100 bg-green-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Student Grade Details</h3>
                    <div className="text-sm text-gray-500">
                      {students.length} students
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 grade-details-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Grades</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => {
                        const performance = calculateAcademicPerformance(student.id)
                        
                        if (performance.cumulative.final === 0) return null

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4" data-label="Student">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  {student.full_name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                  <div className="text-sm text-gray-500">{student.student_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4" data-label="Raw Grades">
                              <div className="grid grid-cols-4 gap-1 grade-grid">
                                {['prelim', 'midterm', 'semifinal', 'final'].map((term) => (
                                  <div key={term} className="text-center grade-item">
                                    <span className="text-xs text-gray-500 capitalize">{term.split('-').join(' ')}</span>
                                    <div className={`text-sm font-medium ${
                                      performance.raw[term] <= 3.0 && performance.raw[term] > 0 ? 
                                        'text-green-600' : 
                                        performance.raw[term] > 0 ? 'text-red-600' : 'text-gray-400'
                                    }`}>
                                      {performance.raw[term] > 0 ? performance.raw[term].toFixed(1) : '-'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4" data-label="Cumulative">
                              <div className="grid grid-cols-4 gap-1 grade-grid">
                                {['prelim', 'midterm', 'semifinal', 'final'].map((term) => (
                                  <div key={term} className="text-center grade-item">
                                    <span className="text-xs text-gray-500 capitalize">{term.split('-').join(' ')}</span>
                                    <div className={`text-sm font-medium ${
                                      performance.cumulative[term] <= 3.0 && performance.cumulative[term] > 0 ? 
                                        'text-green-600' : 
                                        performance.cumulative[term] > 0 ? 'text-red-600' : 'text-gray-400'
                                    }`}>
                                      {performance.cumulative[term] > 0 ? performance.cumulative[term].toFixed(1) : '-'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" data-label="Status">
                              <div className="flex items-center">
                                {performance.passed ? (
                                  <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="ml-2 text-sm text-green-600">Passing</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="ml-2 text-sm text-red-600">Failing</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" data-label="Trend">
                              <div className="flex items-center">
                                {performance.trend === 'improving' ? (
                                  <>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="ml-2 text-sm text-green-600">Improving</span>
                                  </>
                                ) : performance.trend === 'declining' ? (
                                  <>
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                    <span className="ml-2 text-sm text-red-600">Declining</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="h-5 w-5 text-gray-400">—</span>
                                    <span className="ml-2 text-sm text-gray-500">Stable</span>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Showing {students.filter(s => calculateAcademicPerformance(s.id).cumulative.final > 0).length} of {students.length} students with grades
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        onClick={generateGradebookSpreadsheet}
                      >
                        <FileDown className="h-4 w-4" />
                        Export CSV
                      </button>
                      {createGradebookDocument()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </TeacherLayout>
  )
}
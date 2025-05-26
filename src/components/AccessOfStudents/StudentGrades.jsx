"use client"

import { useState, useEffect } from "react"
import StudentLayout from "../Mga-Layout/StudentLayout"
import { supabase } from "../Supabase/supabaseClient"

export default function StudentGradesPage() {
  const [subjects, setSubjects] = useState([])
  const [grades, setGrades] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [activeTab, setActiveTab] = useState("raw")
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Get authenticated user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError || !session) {
          window.location.href = "/"
          return
        }

        // 2. Get user details
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          window.location.href = "/"
          return
        }

        // 3. Get student record using email
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, subjects")
          .eq("email", user.email)
          .single()

        if (studentError) throw studentError
        if (!studentData) {
          throw new Error("Student record not found")
        }

        // 4. Get enrolled subjects
        let enrolledSubjectIds = []
        if (studentData.subjects) {
          try {
            enrolledSubjectIds = Array.isArray(studentData.subjects)
              ? studentData.subjects
              : JSON.parse(studentData.subjects)
          } catch (e) {
            console.error("Error parsing subjects:", e)
            throw new Error("Failed to parse enrolled subjects")
          }
        }

        // 5. Get subjects data
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("*")
          .in("id", enrolledSubjectIds)

        if (subjectsError) throw subjectsError
        setSubjects(subjectsData || [])

        // 6. Get grades
        const { data: gradesData, error: gradesError } = await supabase
          .from("grades")
          .select("*")
          .eq("student_id", studentData.id)
          .in("subject_id", enrolledSubjectIds)

        if (gradesError) throw gradesError
        setGrades(gradesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message || "Failed to load grade data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getGradesBySubject = () => {
    if (!grades.length) return {}

    const filteredGrades = selectedSubject ? grades.filter((grade) => grade.subject_id === selectedSubject) : grades

    const groupedGrades = {}

    filteredGrades.forEach((grade) => {
      if (!groupedGrades[grade.subject_id]) {
        groupedGrades[grade.subject_id] = {
          prelim: 0,
          midterm: 0,
          semifinal: 0,
          final: 0,
        }
      }
      groupedGrades[grade.subject_id][grade.term] = grade.grade
    })

    return groupedGrades
  }

  const calculateCumulativeGrades = (rawGrades) => {
    const prelimGrade = rawGrades.prelim || 0
    const midtermGrade = (prelimGrade + (rawGrades.midterm || 0)) / 2
    const semifinalGrade = (midtermGrade + (rawGrades.semifinal || 0)) / 2
    const finalGrade = (semifinalGrade + (rawGrades.final || 0)) / 2

    return {
      prelim: prelimGrade,
      midterm: midtermGrade,
      semifinal: semifinalGrade,
      final: finalGrade,
    }
  }

  const isPassingGrade = (grade) => grade > 0 && grade <= 3.0

  const toggleCourseDetails = (subjectId) => {
    setExpandedCourse(expandedCourse === subjectId ? null : subjectId)
  }

  const getGradeColor = (grade) => {
    if (grade === 0) return "#8697c4"
    if (grade <= 1.5) return "#3d52a0"
    if (grade <= 3.0) return "#7091e6"
    return "#dc2626" // Red color for failing grades (3.1 and above)
  }

  const getGradeProgress = (grade) => {
    if (grade === 0) return 0
    if (grade > 5.0) return 100
    return 100 - (grade / 5.0) * 100
  }

  const gradesBySubject = getGradesBySubject()
  const enrolledSubjects = subjects

  if (loading) {
    return (
      <StudentLayout title="Academic Transcript">
        <div className="flex items-center justify-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: "#7091e6" }}
          ></div>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout title="Academic Transcript">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mb-4" style={{ color: "#7091e6" }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-white rounded-md transition-colors"
              style={{ backgroundColor: "#7091e6" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#3d52a0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#7091e6")}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title="Academic Transcript">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: "1px solid #adbbda" }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#3d52a0" }}>
            Academic Performance
          </h1>
          <p style={{ color: "#8697c4" }}>View your grades and academic progress for each course</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1" style={{ color: "#8697c4" }}>
                Filter by Course
              </label>
              <select
                id="subject"
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                style={{
                  border: "1px solid #adbbda",
                  color: "#3d52a0",
                }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7091e6"
                  e.target.style.boxShadow = "0 0 0 2px rgba(112, 145, 230, 0.2)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#adbbda"
                  e.target.style.boxShadow = "none"
                }}
              >
                <option value="">All enrolled courses</option>
                {enrolledSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex space-x-1 p-1 rounded-lg w-full" style={{ backgroundColor: "#ede8f5" }}>
                <button
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "raw" ? "bg-white shadow-sm" : "hover:bg-gray-50"
                  }`}
                  style={{
                    color: activeTab === "raw" ? "#3d52a0" : "#8697c4",
                  }}
                  onClick={() => setActiveTab("raw")}
                >
                  Term Grades
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "cumulative" ? "bg-white shadow-sm" : "hover:bg-gray-50"
                  }`}
                  style={{
                    color: activeTab === "cumulative" ? "#3d52a0" : "#8697c4",
                  }}
                  onClick={() => setActiveTab("cumulative")}
                >
                  Cumulative
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Display Section */}
        {activeTab === "raw" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid #adbbda" }}>
            <div className="p-6" style={{ borderBottom: "1px solid #adbbda" }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: "#3d52a0" }}>
                  Term Grades
                </h2>
                <span className="text-sm" style={{ color: "#8697c4" }}>
                  {Object.keys(gradesBySubject).length} courses
                </span>
              </div>
            </div>

            {Object.keys(gradesBySubject).length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ color: "#8697c4" }}>No academic records available</p>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid #ede8f5" }}>
                {Object.entries(gradesBySubject).map(([subjectId, terms], index) => {
                  const subject = subjects.find((s) => s.id === subjectId)
                  const isExpanded = expandedCourse === subjectId

                  return (
                    <div
                      key={subjectId}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        borderBottom: index < Object.entries(gradesBySubject).length - 1 ? "1px solid #ede8f5" : "none",
                      }}
                    >
                      <div className="p-4 cursor-pointer" onClick={() => toggleCourseDetails(subjectId)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium" style={{ color: "#3d52a0" }}>
                              {subject ? subject.code : "UNK"} - {subject ? subject.name : "Unknown Course"}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: "#8697c4" }}></p>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <span className="text-sm font-medium" style={{ color: getGradeColor(terms.final) }}>
                                {terms.final > 0 ? terms.final.toFixed(1) : "-"}
                              </span>
                              <div className="text-xs" style={{ color: "#8697c4" }}>
                                Final
                              </div>
                            </div>
                            <svg
                              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              style={{ color: "#8697c4" }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t" style={{ backgroundColor: "#ede8f5", borderColor: "#adbbda" }}>
                          <h4 className="font-medium mb-3" style={{ color: "#3d52a0" }}>
                            Term Breakdown
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {["prelim", "midterm", "semifinal", "final"].map((term) => (
                              <div
                                key={term}
                                className="bg-white p-3 rounded-lg shadow-xs"
                                style={{ border: "1px solid #adbbda" }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-sm font-medium capitalize" style={{ color: "#8697c4" }}>
                                      {term}
                                    </h5>
                                    <p
                                      className="text-2xl font-medium mt-1"
                                      style={{ color: getGradeColor(terms[term]) }}
                                    >
                                      {terms[term] > 0 ? terms[term].toFixed(1) : "-"}
                                    </p>
                                  </div>
                                  {terms[term] > 0 && (
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        isPassingGrade(terms[term]) ? "text-white" : "text-white"
                                      }`}
                                      style={{
                                        backgroundColor: isPassingGrade(terms[term]) ? "#7091e6" : "#3d52a0",
                                      }}
                                    >
                                      {isPassingGrade(terms[term]) ? "Pass" : "Fail"}
                                    </span>
                                  )}
                                </div>
                                {terms[term] > 0 && (
                                  <div className="mt-3">
                                    <div className="w-full rounded-full h-2" style={{ backgroundColor: "#ede8f5" }}>
                                      <div
                                        className="h-2 rounded-full"
                                        style={{
                                          backgroundColor: terms[term] > 3.0 ? "#dc2626" : "#7091e6",
                                          width: `${getGradeProgress(terms[term])}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1" style={{ color: "#8697c4" }}>
                                      <span>1.0</span>
                                      <span>3.0</span>
                                      <span>5.0</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "cumulative" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid #adbbda" }}>
            <div className="p-6" style={{ borderBottom: "1px solid #adbbda" }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: "#3d52a0" }}>
                  Cumulative Assessment
                </h2>
                <span className="text-sm" style={{ color: "#8697c4" }}>
                  {Object.keys(gradesBySubject).length} courses
                </span>
              </div>
            </div>

            {Object.keys(gradesBySubject).length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ color: "#8697c4" }}>No academic records available</p>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid #ede8f5" }}>
                {Object.entries(gradesBySubject).map(([subjectId, rawGrades], index) => {
                  const subject = subjects.find((s) => s.id === subjectId)
                  const cumulativeGrades = calculateCumulativeGrades(rawGrades)
                  const finalGrade = cumulativeGrades.final
                  const isPassing = isPassingGrade(finalGrade)
                  const isExpanded = expandedCourse === subjectId

                  return (
                    <div
                      key={subjectId}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        borderBottom: index < Object.entries(gradesBySubject).length - 1 ? "1px solid #ede8f5" : "none",
                      }}
                    >
                      <div className="p-4 cursor-pointer" onClick={() => toggleCourseDetails(subjectId)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium" style={{ color: "#3d52a0" }}>
                              {subject ? subject.code : "UNK"} - {subject ? subject.name : "Unknown Course"}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: "#8697c4" }}>
                              {subject ? subject.credits || 3 : 3} credits •{" "}
                              {subject ? subject.professor || "Professor not assigned" : ""}
                            </p>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <span className="text-sm font-medium" style={{ color: getGradeColor(finalGrade) }}>
                                {finalGrade > 0 ? finalGrade.toFixed(1) : "-"}
                              </span>
                              <div className="text-xs" style={{ color: "#8697c4" }}>
                                Final
                              </div>
                            </div>
                            <div>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  finalGrade > 0 ? "text-white" : "text-white"
                                }`}
                                style={{
                                  backgroundColor: finalGrade > 0 ? (isPassing ? "#7091e6" : "#3d52a0") : "#8697c4",
                                }}
                              >
                                {finalGrade > 0 ? (isPassing ? "Passed" : "Failed") : "In Progress"}
                              </span>
                            </div>
                            <svg
                              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              style={{ color: "#8697c4" }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t" style={{ backgroundColor: "#ede8f5", borderColor: "#adbbda" }}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-xs" style={{ border: "1px solid #adbbda" }}>
                              <h4 className="font-medium mb-3" style={{ color: "#3d52a0" }}>
                                Grade Progression
                              </h4>
                              <div className="space-y-4">
                                {["prelim", "midterm", "semifinal", "final"].map((term) => (
                                  <div key={term}>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="capitalize font-medium" style={{ color: "#8697c4" }}>
                                        {term}
                                      </span>
                                      <span
                                        className="font-medium"
                                        style={{ color: getGradeColor(cumulativeGrades[term]) }}
                                      >
                                        {cumulativeGrades[term] > 0 ? cumulativeGrades[term].toFixed(2) : "-"}
                                      </span>
                                    </div>
                                    <div className="w-full rounded-full h-2" style={{ backgroundColor: "#ede8f5" }}>
                                      <div
                                        className="h-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            cumulativeGrades[term] > 0
                                              ? cumulativeGrades[term] > 3.0
                                                ? "#dc2626"
                                                : "#7091e6"
                                              : "#8697c4",
                                          width: `${getGradeProgress(cumulativeGrades[term])}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-xs" style={{ border: "1px solid #adbbda" }}>
                              <h4 className="font-medium mb-3" style={{ color: "#3d52a0" }}>
                                Grade Calculation
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: "#8697c4" }}>Prelim Grade:</span>
                                  <span className="font-medium" style={{ color: "#3d52a0" }}>
                                    {rawGrades.prelim > 0 ? rawGrades.prelim.toFixed(1) : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: "#8697c4" }}>Midterm Grade:</span>
                                  <span className="font-medium" style={{ color: "#3d52a0" }}>
                                    {rawGrades.midterm > 0 ? rawGrades.midterm.toFixed(1) : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: "#8697c4" }}>Semi-Final Grade:</span>
                                  <span className="font-medium" style={{ color: "#3d52a0" }}>
                                    {rawGrades.semifinal > 0 ? rawGrades.semifinal.toFixed(1) : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: "#8697c4" }}>Final Grade:</span>
                                  <span className="font-medium" style={{ color: "#3d52a0" }}>
                                    {rawGrades.final > 0 ? rawGrades.final.toFixed(1) : "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-xs" style={{ border: "1px solid #adbbda" }}>
                              <h4 className="font-medium mb-3" style={{ color: "#3d52a0" }}>
                                Final Assessment
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#8697c4" }}>
                                    Status:
                                  </span>
                                  <span
                                    className={`text-sm font-medium ${
                                      finalGrade > 0 ? (isPassing ? "text-blue-600" : "text-red-600") : "text-blue-600"
                                    }`}
                                    style={{
                                      color: finalGrade > 0 ? (isPassing ? "#7091e6" : "#3d52a0") : "#8697c4",
                                    }}
                                  >
                                    {finalGrade > 0 ? (isPassing ? "Passed" : "Failed") : "In Progress"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#8697c4" }}>
                                    Passing Grade:
                                  </span>
                                  <span className="text-sm font-medium" style={{ color: "#3d52a0" }}>
                                    ≤ 3.0
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#8697c4" }}>
                                    Your Grade:
                                  </span>
                                  <span className="text-sm font-medium" style={{ color: getGradeColor(finalGrade) }}>
                                    {finalGrade > 0 ? finalGrade.toFixed(2) : "-"}
                                  </span>
                                </div>
                                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #adbbda" }}>
                                  <div className="text-sm mb-2" style={{ color: "#8697c4" }}>
                                    Performance:
                                  </div>
                                  <div className="w-full rounded-full h-2.5" style={{ backgroundColor: "#ede8f5" }}>
                                    <div
                                      className="h-2.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          finalGrade > 0 ? (finalGrade > 3.0 ? "#dc2626" : "#7091e6") : "#8697c4",
                                        width: `${getGradeProgress(finalGrade)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

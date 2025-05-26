"use client"

import { useState, useEffect } from "react"
import TeacherLayout from "../Mga-Layout/TeacherLayout"
import { Save, BookOpen, GraduationCap, ChevronDown } from "lucide-react"
import { supabase } from "../Supabase/supabaseClient"

export default function GradesPage() {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [gradeRecords, setGradeRecords] = useState([])
  const [currentGrades, setCurrentGrades] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("raw")
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchAcademicData = async () => {
      setLoading(true)
      try {
        const [{ data: subjectsData }, { data: studentsData }, { data: gradesData }] = await Promise.all([
          supabase.from("subjects").select("*"),
          supabase.from("students").select("*"),
          supabase.from("grades").select("*"),
        ])

        setSubjects(subjectsData || [])
        setStudents(studentsData || [])
        setGradeRecords(gradesData || [])
      } catch (error) {
        console.error("Error fetching academic data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAcademicData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      const loadSubjectGrades = async () => {
        const { data } = await supabase.from("grades").select("*").eq("subject_id", selectedSubject)

        const existingRecords = data || []
        const gradesMap = {}

        const enrolledStudents = students.filter((student) => student.subjects?.includes(selectedSubject))

        enrolledStudents.forEach((student) => {
          gradesMap[student.id] = {
            prelim: 0,
            midterm: 0,
            semifinal: 0,
            final: 0,
          }
        })

        existingRecords.forEach((record) => {
          if (!gradesMap[record.student_id]) {
            gradesMap[record.student_id] = {
              prelim: 0,
              midterm: 0,
              semifinal: 0,
              final: 0,
            }
          }
          gradesMap[record.student_id][record.term] = record.grade
        })

        setCurrentGrades(gradesMap)
      }

      loadSubjectGrades()
    }
  }, [selectedSubject, gradeRecords, students])

  const handleGradeInput = (studentId, term, value) => {
    const numericValue = Math.min(5, Math.max(1, Number.parseFloat(value) || 0))
    setCurrentGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [term]: numericValue,
      },
    }))
  }

  const submitGrades = async () => {
    if (!selectedSubject) return

    setIsSaving(true)

    const gradeUpdates = Object.entries(currentGrades).flatMap(([studentId, terms]) => {
      return Object.entries(terms).map(([term, grade]) => ({
        subject_id: selectedSubject,
        student_id: studentId,
        term,
        grade,
      }))
    })

    const { error } = await supabase
      .from("grades")
      .upsert(gradeUpdates, { onConflict: ["subject_id", "student_id", "term"] })

    if (!error) {
      const { data } = await supabase.from("grades").select("*").eq("subject_id", selectedSubject)

      setGradeRecords(data || [])
    }

    setIsSaving(false)
  }

  const computeCumulativeGrades = () => {
    const computedGrades = {}

    const enrolledStudents = students.filter((student) =>
      selectedSubject ? student.subjects?.includes(selectedSubject) : false,
    )

    enrolledStudents.forEach((student) => {
      const grades = currentGrades[student.id] || {
        prelim: 0,
        midterm: 0,
        semifinal: 0,
        final: 0,
      }

      const prelim = grades.prelim
      const midterm = (prelim + grades.midterm) / 2
      const semifinal = (midterm + grades.semifinal) / 2
      const final = (semifinal + grades.final) / 2

      computedGrades[student.id] = {
        prelim,
        midterm,
        semifinal,
        final,
      }
    })

    return computedGrades
  }

  const cumulativeGrades = computeCumulativeGrades()
  const isPassing = (grade) => grade <= 3.0 && grade >= 1.0
  const getGradeColor = (grade) => {
    if (grade === 0) return "#8697c4"
    if (grade <= 3.0) return "#3d52a0"
    return "#dc2626" // Red for failing grades
  }

  const enrolledStudents = students.filter((student) =>
    selectedSubject ? student.subjects?.includes(selectedSubject) : false,
  )

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject)

  return (
    <TeacherLayout title="Grade Management">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="h-8 w-8" style={{ color: "#3d52a0" }} />
          <h2 className="text-2xl font-bold" style={{ color: "#3d52a0" }}>
            Grade Management
          </h2>
        </div>

        {/* Enhanced Course Selection */}
        <div className="bg-white rounded-lg shadow-sm mb-8" style={{ border: "1px solid #adbbda" }}>
          <div className="p-4 border-b" style={{ borderColor: "#adbbda", backgroundColor: "#ede8f5" }}>
            <h3 className="text-lg font-semibold" style={{ color: "#3d52a0" }}>
              Select Course
            </h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2"
                style={{
                  border: "1px solid #8697c4",
                  color: "#3d52a0",
                }}
                onMouseEnter={(e) => (e.target.style.borderColor = "#7091e6")}
                onMouseLeave={(e) => (e.target.style.borderColor = "#8697c4")}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7091e6"
                  e.target.style.boxShadow = "0 0 0 2px rgba(173, 187, 218, 0.5)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#8697c4"
                  e.target.style.boxShadow = "none"
                }}
              >
                <span className="truncate">
                  {selectedSubjectData
                    ? `${selectedSubjectData.code} - ${selectedSubjectData.name}`
                    : "Select a course"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
                  style={{ color: "#8697c4" }}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto"
                  style={{ border: "1px solid #adbbda" }}
                >
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`px-4 py-3 cursor-pointer ${selectedSubject === subject.id ? "" : ""}`}
                      style={{
                        backgroundColor: selectedSubject === subject.id ? "#adbbda" : "transparent",
                      }}
                      onClick={() => {
                        setSelectedSubject(subject.id)
                        setIsDropdownOpen(false)
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSubject !== subject.id) {
                          e.target.style.backgroundColor = "#ede8f5"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSubject !== subject.id) {
                          e.target.style.backgroundColor = "transparent"
                        }
                      }}
                    >
                      <div className="font-medium" style={{ color: "#3d52a0" }}>
                        {subject.code}
                      </div>
                      <div className="text-sm" style={{ color: "#8697c4" }}>
                        {subject.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSubject && (
          <div>
            <div className="mb-6">
              <div className="flex" style={{ borderBottom: "1px solid #adbbda" }}>
                <button
                  className={`py-3 px-6 flex items-center gap-2 ${
                    activeTab === "raw" ? "border-b-2 font-medium" : "hover:bg-gray-50"
                  }`}
                  style={{
                    borderColor: activeTab === "raw" ? "#3d52a0" : "transparent",
                    color: activeTab === "raw" ? "#3d52a0" : "#8697c4",
                    backgroundColor: activeTab === "raw" ? "rgba(237, 232, 245, 0.5)" : "transparent",
                  }}
                  onClick={() => setActiveTab("raw")}
                >
                  <BookOpen className="h-4 w-4" />
                  Raw Grades
                </button>
                <button
                  className={`py-3 px-6 flex items-center gap-2 ${
                    activeTab === "cumulative" ? "border-b-2 font-medium" : "hover:bg-gray-50"
                  }`}
                  style={{
                    borderColor: activeTab === "cumulative" ? "#3d52a0" : "transparent",
                    color: activeTab === "cumulative" ? "#3d52a0" : "#8697c4",
                    backgroundColor: activeTab === "cumulative" ? "rgba(237, 232, 245, 0.5)" : "transparent",
                  }}
                  onClick={() => setActiveTab("cumulative")}
                >
                  <GraduationCap className="h-4 w-4" />
                  Cumulative Grades
                </button>
              </div>
            </div>

            {activeTab === "raw" && (
              <div className="bg-white rounded-lg shadow-sm" style={{ border: "1px solid #adbbda" }}>
                <div className="p-4 border-b" style={{ borderColor: "#adbbda", backgroundColor: "#ede8f5" }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: "#3d52a0" }}>
                        Grade Input
                      </h3>
                      <p className="text-sm mt-1" style={{ color: "#8697c4" }}>
                        {selectedSubjectData?.name} • {enrolledStudents.length} students
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors focus:ring-2 focus:outline-none disabled:opacity-70"
                      style={{
                        backgroundColor: isSaving ? "#8697c4" : "#3d52a0",
                      }}
                      onClick={submitGrades}
                      disabled={isSaving}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.target.style.backgroundColor = "#7091e6"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.target.style.backgroundColor = "#3d52a0"
                        }
                      }}
                      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px rgba(173, 187, 218, 0.5)")}
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    >
                      {isSaving ? "Saving..." : "Save Grades"}
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div
                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                        style={{ borderColor: "#3d52a0" }}
                      ></div>
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <div
                        className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: "#ede8f5" }}
                      >
                        <GraduationCap className="h-8 w-8" style={{ color: "#8697c4" }} />
                      </div>
                      <p className="font-medium" style={{ color: "#8697c4" }}>
                        No students enrolled in this course
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr
                            className="border-b text-sm"
                            style={{ borderColor: "#adbbda", backgroundColor: "#ede8f5", color: "#8697c4" }}
                          >
                            <th className="text-left p-3 font-medium">Student</th>
                            <th className="text-left p-3 font-medium">Prelim</th>
                            <th className="text-left p-3 font-medium">Midterm</th>
                            <th className="text-left p-3 font-medium">Semi-Final</th>
                            <th className="text-left p-3 font-medium">Final</th>
                          </tr>
                        </thead>
                        <tbody style={{ borderTop: "1px solid #adbbda" }}>
                          {enrolledStudents.map((student, index) => (
                            <tr
                              key={student.id}
                              className="hover:bg-gray-50"
                              style={{
                                borderBottom: index < enrolledStudents.length - 1 ? "1px solid #adbbda" : "none",
                              }}
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center"
                                    style={{ backgroundColor: "#adbbda", border: "1px solid #8697c4" }}
                                  >
                                    {student.photo ? (
                                      <img
                                        src={student.photo || "/placeholder.svg"}
                                        alt={student.full_name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="font-medium" style={{ color: "#3d52a0" }}>
                                        {student.full_name
                                          ?.split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-medium" style={{ color: "#3d52a0" }}>
                                    {student.full_name}
                                  </div>
                                </div>
                              </td>
                              {["prelim", "midterm", "semifinal", "final"].map((term) => (
                                <td key={term} className="p-3">
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={currentGrades[student.id]?.[term] || ""}
                                    onChange={(e) => handleGradeInput(student.id, term, e.target.value)}
                                    className="w-20 px-3 py-2 rounded-md focus:ring-2 focus:border-transparent text-center"
                                    style={{
                                      border: "1px solid #8697c4",
                                      color: "#3d52a0",
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = "#7091e6"
                                      e.target.style.boxShadow = "0 0 0 2px rgba(173, 187, 218, 0.5)"
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = "#8697c4"
                                      e.target.style.boxShadow = "none"
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "cumulative" && (
              <div className="bg-white rounded-lg shadow-sm" style={{ border: "1px solid #adbbda" }}>
                <div className="p-4 border-b" style={{ borderColor: "#adbbda", backgroundColor: "#ede8f5" }}>
                  <h3 className="text-lg font-semibold" style={{ color: "#3d52a0" }}>
                    Cumulative Grades
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "#8697c4" }}>
                    {selectedSubjectData?.name} • {enrolledStudents.length} students
                  </p>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div
                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                        style={{ borderColor: "#3d52a0" }}
                      ></div>
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <div
                        className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: "#ede8f5" }}
                      >
                        <GraduationCap className="h-8 w-8" style={{ color: "#8697c4" }} />
                      </div>
                      <p className="font-medium" style={{ color: "#8697c4" }}>
                        No students enrolled in this course
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr
                            className="border-b text-sm"
                            style={{ borderColor: "#adbbda", backgroundColor: "#ede8f5", color: "#8697c4" }}
                          >
                            <th className="text-left p-3 font-medium">Student</th>
                            <th className="text-left p-3 font-medium">Prelim</th>
                            <th className="text-left p-3 font-medium">Midterm</th>
                            <th className="text-left p-3 font-medium">Semi-Final</th>
                            <th className="text-left p-3 font-medium">Final</th>
                            <th className="text-left p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody style={{ borderTop: "1px solid #adbbda" }}>
                          {enrolledStudents.map((student, index) => {
                            const grades = cumulativeGrades[student.id] || {
                              prelim: 0,
                              midterm: 0,
                              semifinal: 0,
                              final: 0,
                            }
                            const finalGrade = grades.final
                            const passed = isPassing(finalGrade)

                            return (
                              <tr
                                key={student.id}
                                className="hover:bg-gray-50"
                                style={{
                                  borderBottom: index < enrolledStudents.length - 1 ? "1px solid #adbbda" : "none",
                                }}
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center"
                                      style={{ backgroundColor: "#adbbda", border: "1px solid #8697c4" }}
                                    >
                                      {student.photo ? (
                                        <img
                                          src={student.photo || "/placeholder.svg"}
                                          alt={student.full_name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="font-medium" style={{ color: "#3d52a0" }}>
                                          {student.full_name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-medium" style={{ color: "#3d52a0" }}>
                                      {student.full_name}
                                    </div>
                                  </div>
                                </td>
                                {["prelim", "midterm", "semifinal", "final"].map((term) => (
                                  <td
                                    key={term}
                                    className="p-3 font-medium"
                                    style={{ color: getGradeColor(grades[term]) }}
                                  >
                                    {grades[term] > 0 ? grades[term].toFixed(1) : "0.0"}
                                  </td>
                                ))}
                                <td className="p-3">
                                  <span
                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: passed ? "#ede8f5" : "#fee2e2",
                                      color: passed ? "#3d52a0" : "#dc2626",
                                    }}
                                  >
                                    {passed ? "Passed" : "Failed"}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}

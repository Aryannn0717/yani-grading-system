// pages/teacher/grades.jsx
"use client"

import { useState, useEffect } from "react"
import TeacherLayout from "../layout/TeacherLayout"
import { Save, BookOpen, GraduationCap, ChevronDown } from "lucide-react"
import { supabase } from "../../Supabase/supabaseClient"

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
        const [
          { data: subjectsData },
          { data: studentsData },
          { data: gradesData }
        ] = await Promise.all([
          supabase.from('subjects').select('*'),
          supabase.from('students').select('*'),
          supabase.from('grades').select('*')
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
        const { data } = await supabase
          .from('grades')
          .select('*')
          .eq('subject_id', selectedSubject)

        const existingRecords = data || []
        const gradesMap = {}

        const enrolledStudents = students.filter(student => 
          student.subjects?.includes(selectedSubject))

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
    setCurrentGrades(prev => ({
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
      .from('grades')
      .upsert(gradeUpdates, { onConflict: ['subject_id', 'student_id', 'term'] })

    if (!error) {
      const { data } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', selectedSubject)

      setGradeRecords(data || [])
    }

    setIsSaving(false)
  }

  const computeCumulativeGrades = () => {
    const computedGrades = {}

    const enrolledStudents = students.filter(student => 
      selectedSubject ? student.subjects?.includes(selectedSubject) : false)

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

  const enrolledStudents = students.filter(student => 
    selectedSubject ? student.subjects?.includes(selectedSubject) : false)

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  return (
    <TeacherLayout title="Grade Management">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Grade Management</h2>
        </div>
        
        {/* Enhanced Course Selection */}
        <div className="bg-white rounded-lg border border-green-100 shadow-sm mb-8">
          <div className="p-4 border-b border-green-100 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-800">Select Course</h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-3 text-left bg-white border border-green-300 rounded-lg shadow-sm hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <span className="truncate">
                  {selectedSubjectData 
                    ? `${selectedSubjectData.code} - ${selectedSubjectData.name}`
                    : "Select a course"}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`px-4 py-3 hover:bg-green-50 cursor-pointer ${selectedSubject === subject.id ? 'bg-green-100' : ''}`}
                      onClick={() => {
                        setSelectedSubject(subject.id)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <div className="font-medium text-gray-900">{subject.code}</div>
                      <div className="text-sm text-gray-500">{subject.name}</div>
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
              <div className="flex border-b border-green-100">
                <button
                  className={`py-3 px-6 flex items-center gap-2 ${
                    activeTab === "raw" 
                      ? "border-b-2 border-green-600 font-medium text-green-700 bg-green-50/50" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("raw")}
                >
                  <BookOpen className="h-4 w-4" />
                  Raw Grades
                </button>
                <button
                  className={`py-3 px-6 flex items-center gap-2 ${
                    activeTab === "cumulative" 
                      ? "border-b-2 border-green-600 font-medium text-green-700 bg-green-50/50" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("cumulative")}
                >
                  <GraduationCap className="h-4 w-4" />
                  Cumulative Grades
                </button>
              </div>
            </div>

            {activeTab === "raw" && (
              <div className="bg-white rounded-lg border border-green-100 shadow-sm">
                <div className="p-4 border-b border-green-100 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Grade Input</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedSubjectData?.name} • {enrolledStudents.length} students
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-200 focus:outline-none disabled:opacity-70"
                      onClick={submitGrades}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Grades"}
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No students enrolled in this course</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-green-100 bg-green-50 text-gray-700 text-sm">
                            <th className="text-left p-3 font-medium">Student</th>
                            <th className="text-left p-3 font-medium">Prelim</th>
                            <th className="text-left p-3 font-medium">Midterm</th>
                            <th className="text-left p-3 font-medium">Semi-Final</th>
                            <th className="text-left p-3 font-medium">Final</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100">
                          {enrolledStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-green-50/50">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-green-100 overflow-hidden flex items-center justify-center border border-green-200">
                                    {student.photo ? (
                                      <img
                                        src={student.photo}
                                        alt={student.full_name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-green-600 font-medium">
                                        {student.full_name?.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-medium text-gray-900">{student.full_name}</div>
                                </div>
                              </td>
                              {['prelim', 'midterm', 'semifinal', 'final'].map((term) => (
                                <td key={term} className="p-3">
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={currentGrades[student.id]?.[term] || ""}
                                    onChange={(e) => handleGradeInput(student.id, term, e.target.value)}
                                    className="w-20 px-3 py-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-100 focus:border-green-500 text-center"
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
              <div className="bg-white rounded-lg border border-green-100 shadow-sm">
                <div className="p-4 border-b border-green-100 bg-green-50">
                  <h3 className="text-lg font-semibold text-gray-800">Cumulative Grades</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSubjectData?.name} • {enrolledStudents.length} students
                  </p>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No students enrolled in this course</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-green-100 bg-green-50 text-gray-700 text-sm">
                            <th className="text-left p-3 font-medium">Student</th>
                            <th className="text-left p-3 font-medium">Prelim</th>
                            <th className="text-left p-3 font-medium">Midterm</th>
                            <th className="text-left p-3 font-medium">Semi-Final</th>
                            <th className="text-left p-3 font-medium">Final</th>
                            <th className="text-left p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100">
                          {enrolledStudents.map((student) => {
                            const grades = cumulativeGrades[student.id] || {
                              prelim: 0,
                              midterm: 0,
                              semifinal: 0,
                              final: 0,
                            }
                            const finalGrade = grades.final
                            const passed = isPassing(finalGrade)

                            return (
                              <tr key={student.id} className="hover:bg-green-50/50">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 overflow-hidden flex items-center justify-center border border-green-200">
                                      {student.photo ? (
                                        <img
                                          src={student.photo}
                                          alt={student.full_name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-green-600 font-medium">
                                          {student.full_name?.split(' ').map(n => n[0]).join('')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-medium text-gray-900">{student.full_name}</div>
                                  </div>
                                </td>
                                {['prelim', 'midterm', 'semifinal', 'final'].map((term) => (
                                  <td key={term} className={`p-3 ${!isPassing(grades[term]) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                    {grades[term].toFixed(1)}
                                  </td>
                                ))}
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                    passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {passed ? 'Passed' : 'Failed'}
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
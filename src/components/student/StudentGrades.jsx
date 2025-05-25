import React, { useState, useEffect } from "react";
import StudentLayout from "../layout/StudentLayout";
import { supabase } from "../../Supabase/supabaseClient";

export default function StudentGradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [activeTab, setActiveTab] = useState("raw");
  const [expandedCourse, setExpandedCourse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get authenticated user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          window.location.href = "/";
          return;
        }

        // 2. Get user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          window.location.href = "/";
          return;
        }

        // 3. Get student record using email (consistent with other pages)
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, subjects')
          .eq('email', user.email)
          .single();

        if (studentError) throw studentError;
        if (!studentData) {
          throw new Error("Student record not found");
        }

        // 4. Get enrolled subjects (with proper error handling)
        let enrolledSubjectIds = [];
        if (studentData.subjects) {
          try {
            enrolledSubjectIds = Array.isArray(studentData.subjects) 
              ? studentData.subjects 
              : JSON.parse(studentData.subjects);
          } catch (e) {
            console.error("Error parsing subjects:", e);
            throw new Error("Failed to parse enrolled subjects");
          }
        }

        // 5. Get subjects data (only enrolled subjects)
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', enrolledSubjectIds);

        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);

        // 6. Get grades (only for this student and enrolled subjects)
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', studentData.id)
          .in('subject_id', enrolledSubjectIds);

        if (gradesError) throw gradesError;
        setGrades(gradesData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load grade data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGradesBySubject = () => {
    if (!grades.length) return {};
    
    const filteredGrades = selectedSubject
      ? grades.filter(grade => grade.subject_id === selectedSubject)
      : grades;

    const groupedGrades = {};
    
    filteredGrades.forEach(grade => {
      if (!groupedGrades[grade.subject_id]) {
        groupedGrades[grade.subject_id] = {
          prelim: 0,
          midterm: 0,
          semifinal: 0,
          final: 0
        };
      }
      groupedGrades[grade.subject_id][grade.term] = grade.grade;
    });

    return groupedGrades;
  };

  const calculateCumulativeGrades = (rawGrades) => {
    const prelimGrade = rawGrades.prelim || 0;
    const midtermGrade = (prelimGrade + (rawGrades.midterm || 0)) / 2;
    const semifinalGrade = (midtermGrade + (rawGrades.semifinal || 0)) / 2;
    const finalGrade = (semifinalGrade + (rawGrades.final || 0)) / 2;

    return {
      prelim: prelimGrade,
      midterm: midtermGrade,
      semifinal: semifinalGrade,
      final: finalGrade,
    };
  };

  const isPassingGrade = (grade) => grade > 0 && grade <= 3.0;

  const toggleCourseDetails = (subjectId) => {
    setExpandedCourse(expandedCourse === subjectId ? null : subjectId);
  };

  const gradesBySubject = getGradesBySubject();
  const enrolledSubjects = subjects;

  if (loading) {
    return (
      <StudentLayout title="Academic Transcript">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Academic Transcript">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-green-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Academic Transcript">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Academic Performance</h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-bold text-gray-800">
              Course Selection
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Filter by Course
              </label>
              <select
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All enrolled courses</option>
                {enrolledSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 ${
              activeTab === "raw"
                ? "border-b-2 border-green-600 font-medium text-green-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("raw")}
          >
            Term Grades
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "cumulative"
                ? "border-b-2 border-green-600 font-medium text-green-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("cumulative")}
          >
            Cumulative Assessment
          </button>
        </div>
      </div>

      {activeTab === "raw" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-bold text-gray-800">Term Grades</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedSubject
                ? subjects.find((s) => s.id === selectedSubject)?.name
                : "All Enrolled Courses"}
              <span className="ml-2 text-green-600">
                ({Object.keys(gradesBySubject).length} courses)
              </span>
            </p>
          </div>
          <div className="p-4">
            {Object.keys(gradesBySubject).length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No academic records available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="text-left p-3">Course</th>
                      <th className="text-left p-3">Prelim</th>
                      <th className="text-left p-3">Midterm</th>
                      <th className="text-left p-3">Semi-Final</th>
                      <th className="text-left p-3">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradesBySubject).map(
                      ([subjectId, terms]) => {
                        const subject = subjects.find(
                          (s) => s.id === subjectId
                        );
                        return (
                          <React.Fragment key={subjectId}>
                            <tr
                              className="border-b border-gray-200 hover:bg-green-50 cursor-pointer"
                              onClick={() => toggleCourseDetails(subjectId)}
                            >
                              <td className="p-3">
                                {subject
                                  ? `${subject.code} - ${subject.name}`
                                  : "Course not found"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(terms.prelim)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {terms.prelim > 0 ? terms.prelim.toFixed(2) : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(terms.midterm)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {terms.midterm > 0
                                  ? terms.midterm.toFixed(2)
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(terms.semifinal)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {terms.semifinal > 0
                                  ? terms.semifinal.toFixed(2)
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(terms.final)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {terms.final > 0 ? terms.final.toFixed(2) : "-"}
                              </td>
                            </tr>
                            {expandedCourse === subjectId && (
                              <tr className="bg-gray-50">
                                <td colSpan="5" className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                      <h4 className="font-medium text-blue-700 mb-2">Prelim Details</h4>
                                      <p className="text-sm text-gray-600">
                                        Raw Grade: {terms.prelim > 0 ? terms.prelim.toFixed(2) : "Not available"}
                                      </p>
                                      <p className={`text-sm ${
                                        isPassingGrade(terms.prelim) ? "text-green-600" : "text-red-600"
                                      }`}>
                                        Status: {isPassingGrade(terms.prelim) ? "Passing" : terms.prelim > 0 ? "Not Passing" : "Not Available"}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded border border-purple-100">
                                      <h4 className="font-medium text-purple-700 mb-2">Midterm Details</h4>
                                      <p className="text-sm text-gray-600">
                                        Raw Grade: {terms.midterm > 0 ? terms.midterm.toFixed(2) : "Not available"}
                                      </p>
                                      <p className={`text-sm ${
                                        isPassingGrade(terms.midterm) ? "text-green-600" : "text-red-600"
                                      }`}>
                                        Status: {isPassingGrade(terms.midterm) ? "Passing" : terms.midterm > 0 ? "Not Passing" : "Not Available"}
                                      </p>
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded border border-amber-100">
                                      <h4 className="font-medium text-amber-700 mb-2">Semi-Final Details</h4>
                                      <p className="text-sm text-gray-600">
                                        Raw Grade: {terms.semifinal > 0 ? terms.semifinal.toFixed(2) : "Not available"}
                                      </p>
                                      <p className={`text-sm ${
                                        isPassingGrade(terms.semifinal) ? "text-green-600" : "text-red-600"
                                      }`}>
                                        Status: {isPassingGrade(terms.semifinal) ? "Passing" : terms.semifinal > 0 ? "Not Passing" : "Not Available"}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                      <h4 className="font-medium text-green-700 mb-2">Final Details</h4>
                                      <p className="text-sm text-gray-600">
                                        Raw Grade: {terms.final > 0 ? terms.final.toFixed(2) : "Not available"}
                                      </p>
                                      <p className={`text-sm ${
                                        isPassingGrade(terms.final) ? "text-green-600" : "text-red-600"
                                      }`}>
                                        Status: {isPassingGrade(terms.final) ? "Passing" : terms.final > 0 ? "Not Passing" : "Not Available"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "cumulative" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-bold text-gray-800">
              Cumulative Assessment
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedSubject
                ? subjects.find((s) => s.id === selectedSubject)?.name
                : "All Enrolled Courses"}
              <span className="ml-2 text-green-600">
                ({Object.keys(gradesBySubject).length} courses)
              </span>
            </p>
          </div>
          <div className="p-4">
            {Object.keys(gradesBySubject).length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No academic records available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="text-left p-3">Course</th>
                      <th className="text-left p-3">Prelim</th>
                      <th className="text-left p-3">Midterm</th>
                      <th className="text-left p-3">Semi-Final</th>
                      <th className="text-left p-3">Final</th>
                      <th className="text-left p-3">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradesBySubject).map(
                      ([subjectId, rawGrades]) => {
                        const subject = subjects.find(
                          (s) => s.id === subjectId
                        );
                        const cumulativeGrades =
                          calculateCumulativeGrades(rawGrades);
                        const finalGrade = cumulativeGrades.final;
                        const isPassing = isPassingGrade(finalGrade);

                        return (
                          <React.Fragment key={subjectId}>
                            <tr
                              className="border-b border-gray-200 hover:bg-green-50 cursor-pointer"
                              onClick={() => toggleCourseDetails(subjectId)}
                            >
                              <td className="p-3">
                                {subject
                                  ? `${subject.code} - ${subject.name}`
                                  : "Course not found"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(cumulativeGrades.prelim)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {cumulativeGrades.prelim > 0
                                  ? cumulativeGrades.prelim.toFixed(2)
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(cumulativeGrades.midterm)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {cumulativeGrades.midterm > 0
                                  ? cumulativeGrades.midterm.toFixed(2)
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassingGrade(cumulativeGrades.semifinal)
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {cumulativeGrades.semifinal > 0
                                  ? cumulativeGrades.semifinal.toFixed(2)
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  !isPassing
                                    ? "text-red-600 font-medium"
                                    : "text-green-600"
                                }`}
                              >
                                {finalGrade > 0 ? finalGrade.toFixed(2) : "-"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`${
                                    isPassing ? "bg-green-500" : "bg-red-500"
                                  } text-white text-xs px-2 py-1 rounded-full`}
                                >
                                  {finalGrade > 0
                                    ? isPassing
                                      ? "Completed"
                                      : "Not Passed"
                                    : "In Progress"}
                                </span>
                              </td>
                            </tr>
                            {expandedCourse === subjectId && (
                              <tr className="bg-gray-50">
                                <td colSpan="6" className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                      <h4 className="font-medium text-blue-700 mb-2">Grade Calculation</h4>
                                      <p className="text-sm text-gray-600">
                                        Prelim: {rawGrades.prelim > 0 ? rawGrades.prelim.toFixed(2) : "Not available"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Midterm: {rawGrades.midterm > 0 ? rawGrades.midterm.toFixed(2) : "Not available"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Semi-Final: {rawGrades.semifinal > 0 ? rawGrades.semifinal.toFixed(2) : "Not available"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Final: {rawGrades.final > 0 ? rawGrades.final.toFixed(2) : "Not available"}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded border border-purple-100">
                                      <h4 className="font-medium text-purple-700 mb-2">Cumulative Grades</h4>
                                      <p className="text-sm text-gray-600">
                                        Prelim: {cumulativeGrades.prelim > 0 ? cumulativeGrades.prelim.toFixed(2) : "-"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Midterm: {cumulativeGrades.midterm > 0 ? cumulativeGrades.midterm.toFixed(2) : "-"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Semi-Final: {cumulativeGrades.semifinal > 0 ? cumulativeGrades.semifinal.toFixed(2) : "-"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Final: {finalGrade > 0 ? finalGrade.toFixed(2) : "-"}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                      <h4 className="font-medium text-green-700 mb-2">Final Assessment</h4>
                                      <p className={`text-sm ${
                                        isPassing ? "text-green-600" : "text-red-600"
                                      }`}>
                                        Status: {finalGrade > 0 ? (isPassing ? "Passing" : "Not Passing") : "In Progress"}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Passing Grade: ≤ 3.0
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Your Final Grade: {finalGrade > 0 ? finalGrade.toFixed(2) : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
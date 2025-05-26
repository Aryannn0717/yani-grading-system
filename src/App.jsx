import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthContainer from "./components/Authentication/Auth-Context";
import StudentAttendance from "./components/AccessOfStudents/StudentAttendance";
import StudentDashboard from "./components/AccessOfStudents/StudentDashboard";
import StudentGrades from "./components/AccessOfStudents/StudentGrades";
import StudentProfile from "./components/AccessOfStudents/StudentProfile";

import AttendanceManage from "./components/AccessOfTeacher/AttendanceTracking";
import GradesManage from "./components/AccessOfTeacher/Grades";
import Report from "./components/AccessOfTeacher/Reports";
import StudentManage from "./components/AccessOfTeacher/StudentsManagement";
import TeacherSubject from "./components/AccessOfTeacher/SubjectsManagement";
import TeacherDashboard from "./components/AccessOfTeacher/TeacherDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthContainer />} />
        <Route path="/login" element={<AuthContainer />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/subjects" element={<TeacherSubject />} />
        <Route path="/teacher/students" element={<StudentManage />} />
        <Route path="/teacher/attendance" element={<AttendanceManage />} />
        <Route path="/teacher/grades" element={<GradesManage />} />
        <Route path="/teacher/reports" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;
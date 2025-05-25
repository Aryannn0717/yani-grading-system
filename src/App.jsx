import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthContainer from "./components/Auth/auth-container";
import StudentAttendance from "./components/student/StudentAttendance";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentGrades from "./components/student/StudentGrades";
import StudentProfile from "./components/student/StudentProfile";

import AttendanceManage from "./components/teacher/AttendanceTracking";
import GradesManage from "./components/teacher/Grades";
import Report from "./components/teacher/Reports";
import StudentManage from "./components/teacher/StudentsManagement";
import TeacherSubject from "./components/teacher/SubjectsManagement";
import TeacherDashboard from "./components/teacher/TeacherDashboard";

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
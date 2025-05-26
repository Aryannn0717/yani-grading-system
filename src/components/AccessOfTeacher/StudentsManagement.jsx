"use client";

import { useState, useEffect } from "react";
import TeacherLayout from "../Mga-Layout/TeacherLayout";
import {
  Plus,
  Pencil,
  Trash,
  Upload,
  User,
  BookOpen,
  Mail,
  Key,
  Hash,
} from "lucide-react";
import { supabase } from "../Supabase/supabaseClient";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    email: "",
    password: "",
    subjects: [],
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*");
      const { data: studentsData } = await supabase
        .from("students")
        .select("*");

      if (subjectsData) setSubjects(subjectsData);
      if (studentsData) setStudents(studentsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const registerStudentAccount = async (studentData) => {
    const { error } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password || "password",
      options: {
        data: {
          role: "student",
          student_id: studentData.student_id,
          full_name: studentData.full_name,
        },
      },
    });

    if (error) return { error: error.message };

    return {
      email: studentData.email,
      password: studentData.password || "password",
    };
  };

  const handleAddStudent = async () => {
    if (!formData.student_id || !formData.full_name || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Register auth account
      const accountResult = await registerStudentAccount(formData);
      if (accountResult.error) {
        throw new Error(accountResult.error);
      }

      // Create student record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert([
          {
            student_id: formData.student_id,
            full_name: formData.full_name,
            email: formData.email,
            subjects: formData.subjects,
            photo: formData.photo,
          },
        ])
        .select();

      if (studentError) {
        // If student record fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(accountResult.user.id);
        throw new Error(
          "Error creating student record: " + studentError.message
        );
      }

      // If everything succeeded
      setStudents([studentData[0], ...students]);
      setCredentials(accountResult);
      setSuccessMessage("Student added successfully!");

      // Reset form but keep the dialog open
      resetForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!currentStudent) return;

    const { error } = await supabase
      .from("students")
      .update({
        full_name: formData.full_name,
        email: formData.email,
        subjects: formData.subjects,
        photo: formData.photo,
      })
      .eq("id", currentStudent.id);

    if (error) {
      alert("Error updating student: " + error.message);
      return;
    }

    // Update auth user if email changed
    if (formData.email !== currentStudent.email) {
      await supabase.auth.admin.updateUserById(currentStudent.id, {
        email: formData.email,
        user_metadata: {
          full_name: formData.full_name,
        },
      });
    }

    const updatedStudents = students.map((student) =>
      student.id === currentStudent.id ? { ...student, ...formData } : student
    );
    setStudents(updatedStudents);
    setIsEditDialogOpen(false);
    resetForm();
    setSuccessMessage("Student updated successfully!");
  };

  const handleDeleteStudent = async () => {
    if (!currentStudent) return;

    // Delete student record
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", currentStudent.id);

    if (error) {
      alert("Error deleting student: " + error.message);
      return;
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(currentStudent.id);

    const updatedStudents = students.filter(
      (student) => student.id !== currentStudent.id
    );
    setStudents(updatedStudents);
    setIsDeleteDialogOpen(false);
    setSuccessMessage("Student deleted successfully!");
  };

  const openEditDialog = (student) => {
    setCurrentStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      subjects: student.subjects || [],
      photo: student.photo,
    });
    setPhotoPreview(student.photo);
    setIsEditDialogOpen(true);
    setSuccessMessage(null);
  };

  const openDeleteDialog = (student) => {
    setCurrentStudent(student);
    setIsDeleteDialogOpen(true);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      full_name: "",
      email: "",
      password: "",
      subjects: [],
      photo: null,
    });
    setPhotoPreview(null);
    setCurrentStudent(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, photo: base64String });
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setFormData((prev) => {
      const newSubjects = prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId];
      return { ...prev, subjects: newSubjects };
    });
  };

  

  return (
    <TeacherLayout title="Students">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[#8697c4] mt-1">
            Manage student profiles and academic records
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-[#3d52a0] to-[#7091e6] hover:from-[#7091e6] hover:to-[#8697c4] text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#adbbda] focus:ring-offset-2"
          onClick={() => {
            setIsAddDialogOpen(true);
            setCredentials(null);
            setSuccessMessage(null);
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Enroll New Student</span>
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-[#ede8f5] border border-[#adbbda] rounded-lg">
          <div className="flex items-center text-[#3d52a0]">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            {successMessage}
          </div>
          {credentials && (
            <div className="mt-3 p-3 bg-[#ede8f5] rounded border border-[#adbbda] text-sm">
              <div className="font-medium text-[#3d52a0] mb-1">
                Student Credentials:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-[#8697c4]">Email:</div>
                <div className="font-mono text-[#7091e6] break-all">
                  {credentials.email}
                </div>
                <div className="text-[#8697c4]">Password:</div>
                <div className="font-mono text-[#7091e6]">
                  {credentials.password}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#adbbda] shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-[#ede8f5] to-[#adbbda] border-b border-[#adbbda]">
          <h3 className="text-lg font-semibold text-[#3d52a0] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-[#7091e6] to-[#3d52a0] rounded-full"></span>
            Student Directory
          </h3>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-500">Loading student data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-1">
                No students enrolled
              </h4>
              <p className="text-gray-500">
                Begin by enrolling your first student
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Profile
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Subjects
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-green-800 font-medium">
                                {student.full_name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {student.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.student_id}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {student.subjects?.length > 0
                            ? student.subjects
                                .map(
                                  (id) =>
                                    subjects.find((s) => s.id === id)?.code
                                )
                                .join(", ")
                            : "Not enrolled"}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-green-600 hover:text-green-800 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                            onClick={() => openEditDialog(student)}
                            title="Edit student"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                            onClick={() => openDeleteDialog(student)}
                            title="Delete student"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal - Updated Layout */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#3d52a0] to-[#7091e6] text-white">
              <h3 className="text-2xl font-bold">Enroll New Student</h3>
              <p className="text-[#adbbda] mt-1">
                Complete the student registration form
              </p>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Student Info */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-green-100 to-teal-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg mb-3">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-green-800 font-medium text-3xl">
                          {formData.full_name
                            ? formData.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "ST"}
                        </span>
                      )}
                    </div>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center cursor-pointer transition text-sm"
                    >
                      <Upload className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Upload Student Photo</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="student_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Student ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="student_id"
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          value={formData.student_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              student_id: e.target.value,
                            })
                          }
                          placeholder="Enter student ID"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="full_name"
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          type="password"
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Leave blank for default"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Subjects */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-green-600" />
                      Enroll in Subjects{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </h4>
                    <div className="space-y-3">
                      {subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={formData.subjects.includes(subject.id)}
                              onChange={() => handleSubjectChange(subject.id)}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">
                              {subject.name}
                            </div>
                            <div className="text-gray-500">{subject.code}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Notes
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-start">
                        <svg
                          className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Fields marked with * are required</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>
                          Default password will be 'password' if left blank
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>
                          Credentials will be shown after successful enrollment
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddStudent}
                disabled={
                  !formData.student_id ||
                  !formData.full_name ||
                  !formData.email ||
                  formData.subjects.length === 0
                }
              >
                Complete Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <h3 className="text-2xl font-bold">Update Student Record</h3>
              <p className="text-green-100 mt-1">Modify student information</p>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="relative">
                  <label
                    htmlFor="edit-student_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-student_id"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      value={formData.student_id}
                      readOnly
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="edit-full_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-full_name"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="edit-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-email"
                      type="email"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="inline mr-1 h-4 w-4 text-gray-500" />
                    Enrolled Subjects
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject.id)}
                          onChange={() => handleSubjectChange(subject.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {subject.name}{" "}
                          <span className="text-gray-500">
                            ({subject.code})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-teal-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-green-800 font-medium text-lg">
                            {formData.full_name
                              ? formData.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "ST"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        id="edit-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="edit-photo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                      >
                        <Upload className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm">Update Photo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Discard Changes
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors"
                onClick={handleEditStudent}
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <h3 className="text-2xl font-bold">Confirm Deletion</h3>
              <p className="text-red-100 mt-1">
                This will permanently remove the student record. This action
                cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors"
                onClick={handleDeleteStudent}
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

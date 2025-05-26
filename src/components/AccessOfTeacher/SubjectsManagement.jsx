import { useState, useEffect } from "react";
import TeacherLayout from "../Mga-Layout/TeacherLayout";
import { Plus, Pencil, Trash } from "lucide-react";
import { supabase } from "../Supabase/supabaseClient";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    semester: "1st",
    school_year: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setSubjects(data);
      }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (!formData.code || !formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert([formData])
      .select();

    if (error) {
      alert("Error adding subject: " + error.message);
      return;
    }

    setSubjects([data[0], ...subjects]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditSubject = async () => {
    if (!currentSubject) return;

    const { error } = await supabase
      .from("subjects")
      .update(formData)
      .eq("id", currentSubject.id);
    if (error) {
      alert("Error updating subject: " + error.message);
      return;
    }

    const updatedSubjects = subjects.map((subject) =>
      subject.id === currentSubject.id ? { ...subject, ...formData } : subject
    );
    setSubjects(updatedSubjects);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteSubject = async () => {
    if (!currentSubject) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", currentSubject.id);

    if (error) {
      alert("Error deleting subject: " + error.message);
      return;
    }

    const updatedSubjects = subjects.filter(
      (subject) => subject.id !== currentSubject.id
    );
    setSubjects(updatedSubjects);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      school_year: subject.school_year,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subject) => {
    setCurrentSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      semester: "1st",
      school_year: "",
    });
    setCurrentSubject(null);
  };

  return (
    <TeacherLayout title="Subjects">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[#8697c4] mt-1">
            Create and manage academic subjects
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-[#3d52a0] to-[#7091e6] text-white px-5 py-3 rounded-lg hover:from-[#7091e6] hover:to-[#8697c4] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#adbbda] shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 border-b border-[#adbbda] bg-gradient-to-r from-[#ede8f5] to-[#adbbda]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#3d52a0]">
                Subject Catalog
              </h3>
              <p className="text-[#8697c4] text-sm mt-1">
                {subjects.length} subjects registered
              </p>
            </div>
            <div className="relative">
              
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-[#8697c4]"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="animate-pulse rounded-full bg-gray-200 h-12 w-12"></div>
              <p className="text-gray-500">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-700">
                No subjects found
              </h4>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                Add your first subject to begin organizing your academic
                curriculum.
              </p>
              <button
                className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Subject
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School Year
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {subjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-emerald-800 font-medium">
                              {subject.code.substring(0, 3)}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {subject.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {subject.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subject.semester === "1st"
                              ? "bg-blue-100 text-blue-800"
                              : subject.semester === "2nd"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {subject.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {subject.school_year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-2 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            onClick={() => openEditDialog(subject)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={() => openDeleteDialog(subject)}
                            title="Delete"
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

      {/* Add Subject Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6 border-b border-[#adbbda] bg-gradient-to-r from-[#ede8f5] to-white">
              <h3 className="text-2xl font-bold text-[#3d52a0]">New Subject</h3>
              <p className="text-sm text-[#8697c4] mt-1">
                Fill in the details to create a new subject
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="code"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., CS101"
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="semester"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Semester
                    </label>
                    <select
                      id="semester"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm bg-white"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="school_year"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      School Year
                    </label>
                    <input
                      id="school_year"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                      value={formData.school_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          school_year: e.target.value,
                        })
                      }
                      placeholder="e.g., 2023-2024"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700 font-medium shadow-sm"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleAddSubject}
                disabled={!formData.code || !formData.name}
              >
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-2xl font-bold text-gray-800">Edit Subject</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update the subject information
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="edit-code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-code"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-semester"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Semester
                    </label>
                    <select
                      id="edit-semester"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm bg-white"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-school_year"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      School Year
                    </label>
                    <input
                      id="edit-school_year"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                      value={formData.school_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          school_year: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700 font-medium shadow-sm"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
                onClick={handleEditSubject}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center">
                Delete Subject?
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-700">
                  {currentSubject?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-center gap-4 bg-gray-50">
              <button
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700 font-medium shadow-sm min-w-[120px]"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md min-w-[120px]"
                onClick={handleDeleteSubject}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

import React, { useState, useEffect } from "react";
import StudentLayout from "../layout/StudentLayout";
import { Upload, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Supabase/supabaseClient";

const STORAGE_BUCKET = "profile";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [student, setStudent] = useState({
    id: '',
    fullName: '',
    email: '',
    photo: null
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate("/");
          return;
        }

        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/");
          return;
        }

        setCurrentUser(user);

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id, full_name, photo')
          .eq('email', user.email)
          .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error("Student record not found");

        setStudent({
          id: studentData.student_id || '',
          fullName: studentData.full_name || '',
          email: user.email || '',
          photo: studentData.photo || null
        });

        if (studentData.photo) {
          setPhotoPreview(studentData.photo);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        showToast(error.message || "Error loading profile data", true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      showToast("Please upload an image file (JPEG, PNG)", true);
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size should be less than 2MB", true);
      return;
    }

    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const saveProfile = async () => {
    if (!currentUser || !student.id) return;
    setIsSaving(true);

    try {
      let photoUrl = student.photo;

      // Upload new photo if selected
      if (photoFile) {
        // Delete old photo if exists
        if (student.photo) {
          const oldFileName = student.photo.split('/').pop();
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([oldFileName])
            .catch(error => console.warn("Error deleting old photo:", error));
        }

        // Upload new photo
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${student.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, photoFile, {
            cacheControl: '3600',
            contentType: photoFile.type
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Update student record (without updated_at column)
      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          photo: photoUrl
        })
        .eq('email', currentUser.email);

      if (updateError) throw updateError;

      // Update local state
      setStudent(prev => ({ ...prev, photo: photoUrl }));
      setPhotoFile(null);
      showToast("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast(error.message || "Failed to save profile", true);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (!currentUser || !student.id) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-green-600 mb-4">Unable to load profile data</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Student Profile">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Academic Profile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Section */}
        <div className="bg-white rounded-xl border border-green-100 shadow-sm">
          <div className="p-5 border-b border-green-100 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-700">Academic Information</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Student ID</label>
              <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                {student.id}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                {student.fullName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Institutional Email</label>
              <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                {student.email}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white rounded-xl border border-green-100 shadow-sm">
          <div className="p-5 border-b border-green-100 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-700">Student Photo</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={() => setPhotoPreview(null)}
                  />
                ) : (
                  <span className="text-gray-500 font-medium text-4xl">
                    {student.fullName?.split(' ').map(n => n[0]).join('') || 'ST'}
                  </span>
                )}
              </div>
              <div className="w-full space-y-2">
                <input 
                  id="photo" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                />
                <label
                  htmlFor="photo"
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </label>
                {photoFile && (
                  <p className="text-xs text-gray-500 text-center">
                    {photoFile.name} ({Math.round(photoFile.size / 1024)}KB)
                  </p>
                )}
              </div>
              <button
                className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                onClick={saveProfile}
                disabled={isSaving || !photoFile}
              >
                {isSaving ? "Saving..." : "Save Profile"}
                <Save className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out
          ${toastMessage.toLowerCase().includes("fail") || toastMessage.toLowerCase().includes("error") ? "bg-red-500" : "bg-green-500"} text-white`}>
          {toastMessage}
        </div>
      )}
    </StudentLayout>
  );
}
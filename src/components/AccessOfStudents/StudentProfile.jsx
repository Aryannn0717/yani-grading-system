"use client"

import { useState, useEffect } from "react"
import StudentLayout from "../Mga-Layout/StudentLayout"
import { Upload, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../Supabase/supabaseClient";

const STORAGE_BUCKET = "profile"

export default function StudentProfilePage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [student, setStudent] = useState({
    id: "",
    fullName: "",
    email: "",
    photo: null,
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError || !session) {
          navigate("/")
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          navigate("/")
          return
        }

        setCurrentUser(user)

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("student_id, full_name, photo")
          .eq("email", user.email)
          .single()

        if (studentError) throw studentError
        if (!studentData) throw new Error("Student record not found")

        setStudent({
          id: studentData.student_id || "",
          fullName: studentData.full_name || "",
          email: user.email || "",
          photo: studentData.photo || null,
        })

        if (studentData.photo) {
          setPhotoPreview(studentData.photo)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        showToast(error.message || "Error loading profile data", true)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match("image.*")) {
      showToast("Please upload an image file (JPEG, PNG)", true)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size should be less than 2MB", true)
      return
    }

    setPhotoFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const showToast = (message, isError = false) => {
    setToastMessage(message)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const saveProfile = async () => {
    if (!currentUser || !student.id) return
    setIsSaving(true)

    try {
      let photoUrl = student.photo

      if (photoFile) {
        if (student.photo) {
          const oldFileName = student.photo.split("/").pop()
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([oldFileName])
            .catch((error) => console.warn("Error deleting old photo:", error))
        }

        const fileExt = photoFile.name.split(".").pop()
        const fileName = `${student.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, photoFile, {
          cacheControl: "3600",
          contentType: photoFile.type,
        })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      const { error: updateError } = await supabase
        .from("students")
        .update({
          photo: photoUrl,
        })
        .eq("email", currentUser.email)

      if (updateError) throw updateError

      setStudent((prev) => ({ ...prev, photo: photoUrl }))
      setPhotoFile(null)
      showToast("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      showToast(error.message || "Failed to save profile", true)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: "#7091e6" }}
          ></div>
        </div>
      </StudentLayout>
    )
  }

  if (!currentUser || !student.id) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mb-4" style={{ color: "#7091e6" }}>
              Unable to load profile data
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: "#7091e6" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#3d52a0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#7091e6")}
            >
              Try Again
            </button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title="Student Profile">
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: "#3d52a0" }}>
          Student Profile
        </h2>
        <p className="mt-2" style={{ color: "#8697c4" }}>
          Manage your academic identity
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Photo Section - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ border: "1px solid #adbbda" }}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #3d52a0 0%, #7091e6 100%)" }}>
              <h3 className="text-lg font-semibold text-white">Profile Identity</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center gap-6">
                <div
                  className="relative h-48 w-48 rounded-xl overflow-hidden flex items-center justify-center border-4 border-white shadow-inner"
                  style={{ backgroundColor: "#ede8f5" }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={() => setPhotoPreview(null)}
                    />
                  ) : (
                    <span className="font-medium text-6xl" style={{ color: "#8697c4" }}>
                      {student.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "ST"}
                    </span>
                  )}
                  {photoFile && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">New Upload</span>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <label
                    htmlFor="photo"
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                    style={{
                      borderColor: "#adbbda",
                      backgroundColor: "#ede8f5",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#adbbda"
                      e.target.style.borderColor = "#7091e6"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ede8f5"
                      e.target.style.borderColor = "#adbbda"
                    }}
                  >
                    <Upload className="mr-2 h-5 w-5" style={{ color: "#7091e6" }} />
                    <span className="font-medium" style={{ color: "#7091e6" }}>
                      {photoFile ? "Change Photo" : "Upload Photo"}
                    </span>
                  </label>
                  {photoFile && (
                    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#ede8f5" }}>
                      <p className="text-sm font-medium truncate" style={{ color: "#3d52a0" }}>
                        {photoFile.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#7091e6" }}>
                        {Math.round(photoFile.size / 1024)}KB • {photoFile.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                  )}

                  <button
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all mt-4 text-white font-medium
                      ${!photoFile ? "opacity-50 cursor-not-allowed" : "shadow-sm hover:shadow-md"}`}
                    style={{
                      backgroundColor: isSaving ? "#8697c4" : "#7091e6",
                    }}
                    onClick={saveProfile}
                    disabled={isSaving || !photoFile}
                    onMouseEnter={(e) => {
                      if (!isSaving && photoFile) {
                        e.target.style.backgroundColor = "#3d52a0"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving && photoFile) {
                        e.target.style.backgroundColor = "#7091e6"
                      }
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        Save Changes
                        <Save className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information - Right Side */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ border: "1px solid #adbbda" }}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #3d52a0 0%, #7091e6 100%)" }}>
              <h3 className="text-lg font-semibold text-white">Academic Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "#8697c4" }}>
                  Student ID
                </label>
                <div
                  className="w-full px-4 py-3 rounded-lg font-medium"
                  style={{
                    border: "1px solid #adbbda",
                    backgroundColor: "#ede8f5",
                    color: "#3d52a0",
                  }}
                >
                  {student.id}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "#8697c4" }}>
                  Full Name
                </label>
                <div
                  className="w-full px-4 py-3 rounded-lg font-medium"
                  style={{
                    border: "1px solid #adbbda",
                    backgroundColor: "#ede8f5",
                    color: "#3d52a0",
                  }}
                >
                  {student.fullName}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium" style={{ color: "#8697c4" }}>
                  Institutional Email
                </label>
                <div
                  className="w-full px-4 py-3 rounded-lg font-medium break-all"
                  style={{
                    border: "1px solid #adbbda",
                    backgroundColor: "#ede8f5",
                    color: "#3d52a0",
                  }}
                >
                  {student.email}
                </div>
              </div>

              <div className="md:col-span-2 pt-6" style={{ borderTop: "1px solid #adbbda" }}>
                <h4 className="text-sm font-medium mb-4" style={{ color: "#8697c4" }}>
                  Account Security
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg animate-fade-in-up text-white font-medium`}
          style={{
            backgroundColor:
              toastMessage.toLowerCase().includes("fail") || toastMessage.toLowerCase().includes("error")
                ? "#3d52a0"
                : "#7091e6",
          }}
        >
          {toastMessage}
        </div>
      )}
    </StudentLayout>
  )
}

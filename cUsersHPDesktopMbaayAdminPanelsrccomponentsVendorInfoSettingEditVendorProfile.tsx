"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Edit2 } from "lucide-react"
import { MdVerified } from "react-icons/md";
import type React from "react" // Import React
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { findOneAdmin, editAdminProfile } from "../../../services/adminApi";
import { RootState } from "@/components/redux/store";
import { toast } from "react-toastify";

interface AdminProfile {
  name: string
  email: string
  role: string
}

export default function EditVendorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const admin = useSelector((state: RootState) => state.admin);
  const queryClient = useQueryClient();

  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: () => findOneAdmin(admin.token),
  });

  console.log("Admin", adminData)

  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    role: "",
  })

  useEffect(() => {
    if (adminData) {
      setProfile({
        name: adminData.name || "",
        email: adminData.email || "",
        role: adminData.role || "",
      });
      setProfileImage(adminData.profileImage || null);
    }
  }, [adminData]);

  const editProfileMutation = useMutation({
    mutationFn: (formData: FormData) => editAdminProfile(formData, admin.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      toast.success("Admin profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = () => {
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);

    // If there's a new image file, append it
    const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('profileImage', fileInput.files[0]);
    }

    editProfileMutation.mutate(formData);
  }

  const handleCancelEdit = () => {
    // Reset to original data
    if (adminData) {
      setProfile({
        name: adminData.name || "",
        email: adminData.email || "",
        role: adminData.role || "",
      });
      setProfileImage(adminData.profileImage || null);
    }
    setIsEditing(false);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="min-h-screen bg-gray-50 p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-2xl mx-auto">
        {isLoading && <div className="text-center py-4">Loading admin profile...</div>}
        {error && <div className="text-center py-4 text-red-500">Error loading admin profile</div>}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Admin Profile</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              {profile.role}
              <MdVerified size={20} className="text-blue-500"/>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-4">Admin Information</h2>
          
          {/* Profile Image */}
          {isEditing && (
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="profile-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full cursor-pointer hover:bg-orange-600"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upload profile image</p>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <motion.input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500 ${
                  !isEditing ? 'bg-gray-100' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email Address</label>
              <motion.input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500 ${
                  !isEditing ? 'bg-gray-100' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Role</label>
              <motion.input
                type="text"
                value={profile.role}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="mt-6 flex gap-4">
              <button 
                onClick={handleSaveChanges}
                disabled={editProfileMutation.isPending}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button 
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

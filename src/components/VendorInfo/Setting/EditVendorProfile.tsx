import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { MdVerified } from "react-icons/md";
import type React from "react"; // Import React
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { findOneAdmin, editAdminProfile } from "../../../services/adminApi";
import { RootState } from "@/components/redux/store";
import { toast } from "react-toastify";

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export default function EditVendorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const admin = useSelector((state: RootState) => state.admin);
  const queryClient = useQueryClient();

  const {
    data: adminData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: () => findOneAdmin(admin.token),
  });

  console.log("Admin", adminData);

  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (adminData) {
      setProfile({
        name: adminData.name || "",
        email: adminData.email || "",
        role: adminData.role || "",
      });
      setProfileImage(adminData.profileImage || null);
      setBannerImage(adminData.bannerImage || null);
    }
  }, [adminData]);

  const editProfileMutation = useMutation({
    mutationFn: (formData: FormData) => editAdminProfile(formData, admin.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      toast.success("Admin profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "banner" | "logo",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (type) {
          case "profile":
            setProfileImage(reader.result as string);
            break;
          case "banner":
            setBannerImage(reader.result as string);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);

    // If there's a new image file, append it
    const fileInput = document.getElementById(
      "profile-upload",
    ) as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append("profileImage", fileInput.files[0]);
    }

    editProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (adminData) {
      setProfile({
        name: adminData.name || "",
        email: adminData.email || "",
        role: adminData.role || "",
      });
      setProfileImage(adminData.profileImage || null);
      setBannerImage(adminData.bannerImage || null);
    }
    setIsEditing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-5xl mx-auto">
        {isLoading && (
          <div className="text-center py-4">Loading admin profile...</div>
        )}
        {error && (
          <div className="text-center py-4 text-red-500">
            Error loading admin profile
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{admin.role} Profile</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              Verified {admin.role}
              <MdVerified size={20} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Banner and Profile Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="relative h-48 bg-gradient-to-r from-orange-500 to-black">
              {bannerImage ? (
                <img
                  src={bannerImage || "/placeholder.svg"}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-orange-500 to-black" />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-end gap-4 -mt-16">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
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
                  <motion.input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="profile-upload"
                    className={`absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full ${
                      isEditing
                        ? "cursor-pointer hover:bg-orange-600"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="font-semibold mb-4">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <motion.input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Email Address
                </label>
                <motion.input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-end gap-4"
          >
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 border-orange-500"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={editProfileMutation.isPending}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
                >
                  {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, ChevronDown, Edit2, Eye, EyeOff, Upload } from "lucide-react"
import { MdVerified } from "react-icons/md";
import type React from "react" // Import React

interface VendorProfile {
  companyName: string
  email: string
  phone: string
  bio: string
  accountName: string
  accountNumber: string
  bankName: string
  returnPolicy: string
}

export default function EditVendorProfile() {
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [logoImage, setLogoImage] = useState<string | null>(null)

  const [profile, setProfile] = useState<VendorProfile>({
    companyName: "PreciousLtd Limited",
    email: "preciousltd@gmail.com",
    phone: "+234 805743214",
    bio: "",
    accountName: "OGHOGHO PRECIOUS IHECHIUWU",
    accountNumber: "2784956623",
    bankName: "Zenith Bank",
    returnPolicy: "",
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner" | "logo") => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        switch (type) {
          case "profile":
            setProfileImage(reader.result as string)
            break
          case "banner":
            setBannerImage(reader.result as string)
            break
          case "logo":
            setLogoImage(reader.result as string)
            break
        }
      }
      reader.readAsDataURL(file)
    }
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Vendor Profile</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              Be Mbaay Verified
              <MdVerified size={20} className="text-blue-500"/>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Banner and Profile Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-orange-500 to-black">
              {bannerImage ? (
                <img src={bannerImage || "/placeholder.svg"} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-orange-500 to-black" />
              )}
              <motion.input
                type="file"
                id="banner-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "banner")}
              />
              <label
                htmlFor="banner-upload"
                className="absolute bottom-4 right-4 bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100"
              >
                <Camera className="w-5 h-5" />
              </label>
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
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full cursor-pointer hover:bg-orange-600"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <div className="font-semibold">12</div>
                    <div className="text-gray-500">Followers</div>
                  </div>
                  <div>
                    <div className="font-semibold">17</div>
                    <div className="text-gray-500">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Type and Rating */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500 mb-2">Account Type</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-500 font-semibold">C</span>
                </div>
                <div className="font-semibold">Counter</div>
              </div>
              <div className="mt-2">
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">Standard Account</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500 mb-2">Business Rating</h3>
              <div className="text-2xl font-bold">3.5</div>
              <button className="text-purple-600 text-sm hover:underline">View Reviews</button>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Company Name</label>
                <motion.input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                <motion.input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <motion.input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    value="••••••••••••"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                </div>
                <button
                    type="button"
                    // className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-700 text-sm"
                    className="mt-3 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    Change password
                  </button>
              </div>
            </div>
          </motion.div>

          {/* Business Category */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">💄</div>
                <span>Beauty and Skin Care</span>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4">Payment Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                <motion.input
                  type="text"
                  value={profile.accountName}
                  onChange={(e) => setProfile({ ...profile, accountName: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Number</label>
                <motion.input
                  type="text"
                  value={profile.accountNumber}
                  onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Bank Name</label>
                <motion.input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-orange-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Return Policy */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4">Return Policy</h2>
            <div className="border rounded-lg">
              <div className="border-b p-2 flex gap-2">
                <motion.button className="p-1.5 hover:bg-orange-100 rounded">
                  <Edit2 className="w-4 h-4" />
                </motion.button>
              </div>
              <textarea
                value={profile.returnPolicy}
                onChange={(e) => setProfile({ ...profile, returnPolicy: e.target.value })}
                className="w-full p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg "
                placeholder="Write your return policy here..."
              />
            </div>
          </motion.div>

          {/* Logo & Branding */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4">Logo & Branding</h2>
            <div className="border-2 border-dashed rounded-lg p-8 text-center border-orange-500">
              {logoImage ? (
                <img src={logoImage || "/placeholder.svg"} alt="Logo" className="max-w-[200px] mx-auto" />
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upload your logo</p>
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logo")}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600"
                    >
                      Upload Now
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex justify-end gap-4">
            <button className="px-6 py-2 border rounded-lg hover:bg-orange-50 border-orange-500">Discard Changes</button>
            <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Save Changes</button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import mbayy from "../../../assets/image/mbbaylogo.png"
import { motion } from "framer-motion"

import { useSelector } from "react-redux"
import { get_vendor_details, validate_reject_vendor } from "../../../services/adminApi"

type StoreType = "Counter" | "Shelve" | "Shop"

interface VendorInfo {
  userName: string
  storeName: string
  email: string
  phoneNumber: string
  craftCategories: string
  country: string
  address1: string
  verificationStatus: string
  createdAt: string
  logo?: string
  storeType: string
  description?: string
  storePhone:string
}

const RequestDetailPage: React.FC = () => {
  const { id } = useParams() as { id: string }
  const navigate = useNavigate()
  const [request, setRequest] = useState<VendorInfo | null>(null)
  const user = useSelector((state:any)=> state.admin)
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const getVendor = async () => {
      try {
        const adminData = await get_vendor_details(id)
        setRequest(adminData)
      } catch (error) {
        console.error("Error fetching vendor details:", error)
      }
    }
    if (id) getVendor()
  }, [id])

  const handleAction = async (action: "Approved" | "Rejected" | "Pending") => {
    setLoading(action);
    try {
      await validate_reject_vendor(id, action, user.token);
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleStoreTypeChange = (newType: StoreType) => {
    if (request) {
      setRequest({ ...request, storeType: newType })
    }
  }

  // const handleApprove = () => {
  //   console.log("Approve clicked")
  // }

  // const handleReject = () => {
  //   console.log("Reject clicked")
  // }

  // const handleReserve = () => {
  //   console.log("Reserve clicked")
  // }

  if (!request) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 max-w-4xl"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="mb-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm"
      >
        Back to List
      </motion.button>
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="w-[50px] h-[50px] rounded-full bg-orange-300 mr-2 flex items-center justify-center text-white text-[20px]">
            <p>{request.userName.charAt(0).toUpperCase()}</p>
          </div>
          <div>
            <h1 className="text-xl font-bold">{request.userName}</h1>
            <p className="text-gray-600 text-xs">{request.storeName}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <h2 className="text-lg font-semibold mb-1">Vendor Information</h2>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.storePhone}</p>
            <p><strong>Category:</strong> {request.craftCategories}</p>
            <div className="mt-1">
              <strong>Store Type:</strong>
              <div className="mt-1 flex space-x-1">
                {(["Counter", "Shelve", "Shop"] as StoreType[]).map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStoreTypeChange(type)}
                    className={`py-0.5 px-2 rounded-full text-xs font-medium ${
                      request.storeType === type
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Store Details</h2>
            <p><strong>Country:</strong> {request.country}</p>
            <p><strong>Address:</strong> {request.address1}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  request.verificationStatus === "Approved"
                    ? "text-green-600"
                    : request.verificationStatus === "Rejected"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {request.verificationStatus}
              </span>
            </p>
            <p>
              <strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold mb-1">Store Logo</h2>
          <img
            src={mbayy}
            alt={`${request.storeName} logo`}
            className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
          />
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="text-xs text-gray-700">{request.description}</p>
        </div>
        <div className="mt-2 flex space-x-2">
          {request.verificationStatus === "Pending" && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction("Approved")}
                style={{width:"100px",height:"40px"}}
                disabled={loading === "Approved"}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs"
              >
                {loading === "Approved" ? "Loading..." : "Approve"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction("Rejected")}
                style={{width:"100px",height:"40px"}}
                disabled={loading === "Rejected"}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
              >
                {loading === "Rejected" ? "Loading..." : "Reject"}
              </motion.button>
            </>
          )}
          {(request.verificationStatus === "Approved" || request.verificationStatus === "Rejected") && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{width:"100px",height:"40px"}}
              onClick={() => handleAction("Pending")}
              disabled={loading === "Pending"}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs"
            >
              {loading === "Pending" ? "Loading..." : "Revert"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RequestDetailPage
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  get_vendor_details,
  validate_reject_vendor,
} from "../../../services/adminApi";
import { FiX, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

interface VendorInfo {
  _id: string;
  storeName: string;
  email: string;
  storePhone: string;
  craftCategories: string[];
  verificationStatus: string;
  logo?: string;
  storeType: string;
  createdAt: string;
}

const formatPhoneNumber = (phone: string) => {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234") && cleaned.length === 13) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "text-green-600 bg-green-100 border-green-200";
    case "rejected":
      return "text-red-600 bg-red-100 border-red-200";
    case "pending":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return <FiCheckCircle className="mr-1.5" />;
    case "rejected":
      return <FiXCircle className="mr-1.5" />;
    case "pending":
      return <FiClock className="mr-1.5" />;
    default:
      return null;
  }
};

const RequestDetailPage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [request, setRequest] = useState<VendorInfo | null>(null);
  const user = useSelector((state: any) => state.admin);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const getVendor = async () => {
      try {
        const adminData = await get_vendor_details(id);
        setRequest(adminData);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      }
    };
    if (id) getVendor();
  }, [id]);

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

  if (!request) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
      >
        {/* Header / Banner */}
        <div className="relative h-28 bg-gradient-to-r from-orange-400 to-orange-500">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-8">
          {/* Avatar & Title */}
          <div className="relative flex flex-col items-center -mt-14 mb-6">
            <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-lg mb-3">
              <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold overflow-hidden border border-gray-100">
                {request.logo ? (
                  <img src={request.logo} alt={request.storeName} className="w-full h-full object-cover" />
                ) : (
                  request.storeName?.charAt(0).toUpperCase() || "S"
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">{request.storeName}</h2>
            <div className={`mt-2 flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.verificationStatus)}`}>
              {getStatusIcon(request.verificationStatus)}
              {request.verificationStatus || "Pending"}
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-5 border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-sm text-gray-500">Email Address</span>
              <span className="font-semibold text-gray-800 text-right">{request.email || "N/A"}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-sm text-gray-500">Phone Number</span>
              <span className="font-semibold text-gray-800 text-right">{formatPhoneNumber(request.storePhone)}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-sm text-gray-500">Registration Date</span>
              <span className="font-semibold text-gray-800 text-right">
                {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-sm text-gray-500">Store Type</span>
              <span className="font-semibold text-gray-800 text-right">{request.storeType || "N/A"}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 mt-1">Categories</span>
              <div className="flex flex-wrap gap-2 justify-end max-w-[60%]">
                {request.craftCategories?.length > 0 ? (
                  request.craftCategories.map((cat, idx) => (
                    <span key={idx} className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-orange-200">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 font-medium text-sm">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex gap-3">
            {request.verificationStatus === "Pending" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction("Rejected")}
                  disabled={loading === "Rejected"}
                  className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loading === "Rejected" ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : "Reject"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction("Approved")}
                  disabled={loading === "Approved"}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-md hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loading === "Approved" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Approve"}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction("Pending")}
                disabled={loading === "Pending"}
                className="w-full py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-md hover:bg-yellow-600 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading === "Pending" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Revert to Pending"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestDetailPage;
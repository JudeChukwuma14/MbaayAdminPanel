import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Search,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { VendorKYCModal } from "./KycDetail";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { getAllKycRequests } from "../../../services/adminApi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { DocumentViewerModal } from "./DocumentViewerModal";

interface Vendor {
  _id: string;
  businessName: string;
  email: string;
  kycStatus: "Pending" | "Approved" | "Rejected";
  kycSubmittedAt: string;
  storeName: string;
  kycDocuments: {
    front: string;
    back?: string;
    documentType: string;
    country: string;
  };
}


// Inline Card components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ""
      }`}
    {...props}
  />
));

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 border-b border-gray-100 ${className || ""}`}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-semibold text-gray-800 leading-none tracking-tight ${className || ""
      }`}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ""}`} {...props} />
));

// Inline Input component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 mt-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""
        }`}
      ref={ref}
      {...props}
    />
  );
});

const Spinner = () => (
  <div className="flex items-center justify-center py-10">
    <div className="w-10 h-10 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

const AdminKYC = () => {
  //   const navigate = useNavigate();
  // const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [viewDoc, setViewDoc] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Approved" | "Rejected"
  >("all");

  // Fetch KYC requests using React Query
  const admin = useSelector((state: RootState) => state.admin);
  console.log("Admin from state:", admin);
  const queryClient = new QueryClient();

  // inside useQuery
  const { data: KYC, isLoading } = useQuery({
    queryKey: ["kycRequests"],
    queryFn: () => getAllKycRequests(admin?.token || null),
    enabled: !!admin?.token, // only run if token exists
  });
  console.log("Fetched KYC Requests:", KYC);
  const vendors: Vendor[] = KYC?.data.vendors || [];

  const filteredVendors = (vendors || []).filter((vendor) => {
    const matchesSearch =
      vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      vendor.kycStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  console.log("Filtered Vendors:", filteredVendors);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const getStatusCount = (status: "Pending" | "Approved" | "Rejected") => {
    return vendors.filter((vendor) => vendor.kycStatus === status).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6 bg-[#F5F8FA]"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Vendor KYC Management
              </h1>
              <p className="text-gray-500">
                Review and manage vendor Know Your Customer (KYC) submissions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardContent className="p-6 pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Building className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Vendors
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {vendors.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardContent className="p-6 pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getStatusCount("Pending")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardContent className="p-6 pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getStatusCount("Approved")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardContent className="p-6 pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-100">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Rejected
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getStatusCount("Rejected")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6 pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 mt-1.5" />
                    <Input
                      placeholder="Search vendors by name, contact person, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  {(["all", "Pending", "Approved", "Rejected"] as const).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${statusFilter === f
                            ? "bg-[#F87645] text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                          }`}
                      >
                        {f === "all" ? "All" : f}
                      </button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Vendor Applications ({isLoading ? "…" : filteredVendors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Spinner />
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredVendors.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-8 text-center"
                      >
                        <User className="w-12 h-12 mx-auto text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-700">
                          No vendors found
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Try adjusting your search or filters.
                        </p>
                      </motion.div>
                    ) : (
                      filteredVendors.map((vendor, index) => (
                        <motion.div
                          key={vendor._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* optional document thumbnail */}
                            {vendor.kycDocuments?.front && (
                              <img
                                src={vendor.kycDocuments.front}
                                alt="KYC"
                                className="object-cover w-16 h-16 rounded-md cursor-pointer ring-2 ring-transparent hover:ring-orange-400 transition-all"
                                onClick={() =>
                                  setViewDoc(vendor.kycDocuments.front)
                                }
                              />
                            )}

                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {vendor.businessName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {vendor.email}
                              </p>
                              <p className="text-sm text-gray-400">
                                Submitted: {vendor.kycSubmittedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getStatusBadge(vendor.kycStatus)}
                            <button
                              onClick={() => handleViewDetails(vendor)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-700 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* KYC Detail Modal */}
      {selectedVendor && (
        <VendorKYCModal
          vendor={selectedVendor}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
          }}
          // onStatusUpdate={handleStatusUpdate}
          onStatusUpdate={() => {
            // simply invalidate the list so React-Query refetches
            queryClient.invalidateQueries({ queryKey: ["kycRequests"] });
          }}
        />
      )}
      {/* Global viewer overlay */}
      <DocumentViewerModal
        imageUrl={viewDoc || ""}
        isOpen={!!viewDoc}
        onClose={() => setViewDoc(null)}
      />
    </motion.div>
  );
};

export default AdminKYC;

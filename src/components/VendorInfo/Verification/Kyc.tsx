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
import { getAllKycRequests } from "../../../services/adminKycApi";
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

// Inline Button component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm mt-2 h-10 font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        className || ""
      }`}
      ref={ref}
      {...props}
    />
  );
});

// Inline Badge component
const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className || ""}`}
      ref={ref}
      {...props}
    />
  );
});

// Inline Card components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
      className || ""
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
    className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${
      className || ""
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
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 mt-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
      ref={ref}
      {...props}
    />
  );
});

const Spinner = () => (
  <div className="flex items-center justify-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
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
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-700 border-yellow-200 bg-yellow-50"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="text-green-700 border-green-200 bg-green-50"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-red-700 border-red-200 bg-red-50"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      className="min-h-screen p-6 bg-gray-50"
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
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Vendor KYC Management
              </h1>
              <p className="text-gray-600">
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
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Total Vendors
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
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
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
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
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
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
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Rejected
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
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
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      placeholder="Search vendors by name, contact person, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "Pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("Pending")}
                    size="sm"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={
                      statusFilter === "Approved" ? "default" : "outline"
                    }
                    onClick={() => setStatusFilter("Approved")}
                    size="sm"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={
                      statusFilter === "Rejected" ? "default" : "outline"
                    }
                    onClick={() => setStatusFilter("Rejected")}
                    size="sm"
                  >
                    Rejected
                  </Button>
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
            <CardContent>
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
                        <User className="w-12 h-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No vendors found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
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
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-4">
                            {/* optional document thumbnail */}
                            {vendor.kycDocuments?.front && (
                              <img
                                src={vendor.kycDocuments.front}
                                alt="KYC"
                                className="object-cover w-16 h-16 rounded-md"
                                onClick={() =>
                                  setViewDoc(vendor.kycDocuments.front)
                                }
                              />
                            )}

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {vendor.businessName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {vendor.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Submitted: {vendor.kycSubmittedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getStatusBadge(vendor.kycStatus)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(vendor)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
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

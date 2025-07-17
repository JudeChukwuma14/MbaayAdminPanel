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

interface Vendor {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  businessType: string;
  status: "pending" | "approved" | "rejected";
  submissionDate: string;
  documents: {
    nationalId: string;
    passport: string;
    driversLicense: string;
    residencePermit: string;
  };
  notes?: string;
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

// Mock data for vendors with updated document types
const mockVendors: Vendor[] = [
  {
    id: "1",
    businessName: "Tech Solutions Inc.",
    contactPerson: "John Smith",
    email: "john@techsolutions.com",
    phone: "+1 234 567 8900",
    registrationNumber: "REG123456",
    taxId: "TAX789012",
    address: "123 Business St, City, State 12345",
    businessType: "Technology",
    status: "pending",
    submissionDate: "2024-01-15",
    documents: {
      nationalId: "national_id_john_smith.pdf",
      passport: "passport_john_smith.pdf",
      driversLicense: "drivers_license_john_smith.pdf",
      residencePermit: "residence_permit_john_smith.pdf",
    },
  },
  {
    id: "2",
    businessName: "Green Energy Corp",
    contactPerson: "Sarah Johnson",
    email: "sarah@greenenergy.com",
    phone: "+1 234 567 8901",
    registrationNumber: "REG654321",
    taxId: "TAX210987",
    address: "456 Energy Blvd, Green City, State 54321",
    businessType: "Energy",
    status: "approved",
    submissionDate: "2024-01-10",
    documents: {
      nationalId: "national_id_sarah_johnson.pdf",
      passport: "passport_sarah_johnson.pdf",
      driversLicense: "drivers_license_sarah_johnson.pdf",
      residencePermit: "residence_permit_sarah_johnson.pdf",
    },
  },
  {
    id: "3",
    businessName: "Quick Delivery Services",
    contactPerson: "Mike Wilson",
    email: "mike@quickdelivery.com",
    phone: "+1 234 567 8902",
    registrationNumber: "REG987654",
    taxId: "TAX456789",
    address: "789 Logistics Ave, Transport City, State 67890",
    businessType: "Logistics",
    status: "rejected",
    submissionDate: "2024-01-12",
    documents: {
      nationalId: "national_id_mike_wilson.pdf",
      passport: "passport_mike_wilson.pdf",
      driversLicense: "drivers_license_mike_wilson.pdf",
      residencePermit: "residence_permit_mike_wilson.pdf",
    },
    notes: "Incomplete documentation - residence permit expired",
  },
];

const AdminKYC = () => {
  //   const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
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

  const handleStatusUpdate = (
    vendorId: string,
    newStatus: "approved" | "rejected",
    notes?: string
  ) => {
    setVendors((prevVendors) =>
      prevVendors.map((vendor) =>
        vendor.id === vendorId
          ? { ...vendor, status: newStatus, notes }
          : vendor
      )
    );
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  const getStatusCount = (status: "pending" | "approved" | "rejected") => {
    return vendors.filter((vendor) => vendor.status === status).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mt-2">
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
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mt-2">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("pending")}
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
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mt-2">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("approved")}
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
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mt-2">
                      Rejected
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("rejected")}
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                    size="sm"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={
                      statusFilter === "approved" ? "default" : "outline"
                    }
                    onClick={() => setStatusFilter("approved")}
                    size="sm"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={
                      statusFilter === "rejected" ? "default" : "outline"
                    }
                    onClick={() => setStatusFilter("rejected")}
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
                Vendor Applications ({filteredVendors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredVendors.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <User className="mx-auto h-12 w-12 text-gray-400" />
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
                        key={vendor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {vendor.businessName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {vendor.contactPerson} • {vendor.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                {vendor.businessType} • Submitted:{" "}
                                {vendor.submissionDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(vendor.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(vendor)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
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
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </motion.div>
  );
};

export default AdminKYC;

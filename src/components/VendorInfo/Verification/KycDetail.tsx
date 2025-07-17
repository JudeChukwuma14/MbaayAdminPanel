import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  CreditCard,
  X,
} from "lucide-react";

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

interface VendorKYCModalProps {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (
    vendorId: string,
    status: "approved" | "rejected",
    notes?: string
  ) => void;
}

// Inline Dialog components
const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-lg shadow-lg ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
    {children}
  </div>
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${
      className || ""
    }`}
    {...props}
  />
));

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
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

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

// Inline Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
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

// Inline Separator component
const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`shrink-0 bg-border h-[1px] w-full ${className || ""}`}
    {...props}
  />
));

// Document Viewer Modal
const DocumentViewer = ({
  documentType,
  documentUrl,
  isOpen,
  onClose,
}: {
  documentType: string;
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{documentType}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8 min-h-[400px]">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Document: {documentUrl}</p>
                  <p className="text-sm text-gray-500">
                    In a real application, this would display the actual
                    document content
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const VendorKYCModal: React.FC<VendorKYCModalProps> = ({
  vendor,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [notes, setNotes] = useState(vendor.notes || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{
    type: string;
    url: string;
  } | null>(null);

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate(vendor.id, "approved", notes);
      setIsProcessing(false);
    }, 1000);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate(vendor.id, "rejected", notes);
      setIsProcessing(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDocument = (documentType: string, documentUrl: string) => {
    setViewingDocument({ type: documentType, url: documentUrl });
  };

  const documentTypes = {
    nationalId: "National ID Card",
    passport: "Passport",
    driversLicense: "Driver's License",
    residencePermit: "Residence Permit",
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  Vendor KYC Details
                </DialogTitle>
                <div className="flex items-center gap-3">
                  {getStatusBadge(vendor.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Business Name
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.businessName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Business Type
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.businessType}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        Registration Number
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.registrationNumber}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        Tax ID
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.taxId}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Business Address
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {vendor.address}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Person
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.contactPerson}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Submission Date
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.submissionDate}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {vendor.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(vendor.documents).map(([key, filename]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {documentTypes[key as keyof typeof documentTypes]}
                            </p>
                            <p className="text-xs text-gray-500">{filename}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewDocument(
                              documentTypes[key as keyof typeof documentTypes],
                              filename
                            )
                          }
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Review Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add notes about this vendor application (optional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              <Separator />

              {/* Action Buttons */}
              {vendor.status === "pending" && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-red-600 hover:text-white hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Reject Application"}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 hover:text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Approve Application"}
                  </Button>
                </div>
              )}

              {vendor.status !== "pending" && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          documentType={viewingDocument.type}
          documentUrl={viewingDocument.url}
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </>
  );
};

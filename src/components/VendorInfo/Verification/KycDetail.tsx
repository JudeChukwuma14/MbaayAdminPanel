import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, FileText, Eye, CheckCircle, XCircle, X } from "lucide-react";
import { approveKyc, rejectKyc } from "../../../services/adminKycApi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useGesture } from "react-use-gesture";
import { useGesture } from "@use-gesture/react";

interface Vendor {
  _id: string;
  businessName: string;
  email: string;
  kycStatus: "Pending" | "Approved" | "Rejected" | "Processing";
  kycSubmittedAt: string;
  storeName: string;
  kycDocuments: {
    front: string;
    back?: string;
    documentType: string;
    country: string;
  };
}

interface VendorKYCModalProps {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
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

// Document Viewer Modal
// import { useState, useRef } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { useGesture } from "@use-gesture/react";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

const DocumentViewer = ({
  documentType,
  documentUrl,
  isOpen,
  onClose,
  side,
}: {
  side: "Front" | "Back";
  documentType: string;
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [scale, setScale] = useState(1);
  const dragRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        setCrop({ x: dx, y: dy });
      },
    },
    {
      target: dragRef,
    }
  );

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {side} – {documentType}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-6 h-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* body */}
            <div className="relative flex items-center justify-center bg-gray-50 min-h-[400px] max-h-[calc(90vh-100px)]">
              {/* draggable wrapper */}
              <div
                ref={dragRef}
                className="relative"
                style={{
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${scale})`,
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                <img
                  src={documentUrl}
                  alt={`${side} ${documentType}`}
                  className="max-h-[75vh] rounded"
                  draggable={false}
                />
              </div>

              {/* zoom controls */}
              <div className="absolute flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
                <Button onClick={zoomOut} size="sm" variant="outline">
                  Zoom Out
                </Button>
                <span className="px-3 py-1 mt-1 text-sm font-medium bg-white rounded">
                  {Math.round(scale * 100)}%
                </span>
                <Button onClick={zoomIn} size="sm" variant="outline">
                  Zoom In
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// const DocumentViewer = ({
//   side,
//   documentType,
//   documentUrl,
//   isOpen,
//   onClose,
// }: {
//   side: "Front" | "Back";
//   documentType: string;
//   documentUrl: string;
//   isOpen: boolean;
//   onClose: () => void;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//           exit={{ scale: 0.9 }}
//           className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-2 bg-white rounded-t">
//             <h3 className="text-lg font-semibold">
//               {side} – {documentType}
//             </h3>
//             <button
//               onClick={onClose}
//               className="p-1 rounded-full hover:bg-gray-200"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Zoom & Pan area */}
//           <div className="flex-1 overflow-hidden bg-white rounded-b">
//             <TransformWrapper
//               initialScale={1}
//               minScale={0.5}
//               maxScale={5}
//               wheel={{ step: 0.1 }}
//               doubleClick={{ disabled: true }}
//             >
//               {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
//                 <>
//                   <div className="absolute z-10 flex gap-1 top-2 right-2">
//                     <Button size="sm" onClick={() => zoomOut()}>
//                       −
//                     </Button>
//                     <Button size="sm" onClick={() => zoomIn()}>
//                       +
//                     </Button>
//                     <Button size="sm" onClick={() => resetTransform()}>
//                       Reset
//                     </Button>
//                   </div>
//                   <TransformComponent
//                     wrapperClass="w-full h-full"
//                     contentClass="w-full h-full"
//                   >
//                     <img
//                       src={documentUrl}
//                       alt={`${side} ${documentType}`}
//                       className="block max-h-full mx-auto max-w-none"
//                     />
//                   </TransformComponent>
//                 </>
//               )}
//             </TransformWrapper>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

export const VendorKYCModal: React.FC<VendorKYCModalProps> = ({
  vendor,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const admin = useSelector((state: RootState) => state.admin);
  console.log(admin.token);
  const [viewDoc, setViewDoc] = useState<{
    side: "Front" | "Back";
    url: string;
  } | null>(null);
  const queryClient = useQueryClient();
  console.log(vendor._id);

  // Approve mutation
  const approveMut = useMutation({
    mutationFn: () => approveKyc(admin.token, vendor._id),
    onSuccess: () => {
      toast.success("KYC approved");
      queryClient.invalidateQueries({ queryKey: ["kycRequests"] });
      onStatusUpdate();
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Approval failed"),
  });
  // Replace the stub handlers
  const handleApprove = () => approveMut.mutate();

  // Reject mutation
  const rejectMut = useMutation({
    mutationFn: () => rejectKyc(admin?.token, vendor._id),
    onSuccess: () => {
      toast.success("KYC rejected");
      queryClient.invalidateQueries({ queryKey: ["kycRequests"] });
      onStatusUpdate();
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Rejection failed"),
  });
  const handleReject = () => rejectMut.mutate();
  // const handleApprove = async () => {
  //   setIsProcessing(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     // onStatusUpdate(vendor.id, "approved", notes);
  //     setIsProcessing(false);
  //   }, 1000);
  // };

  // const handleReject = async () => {
  //   setIsProcessing(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     // onStatusUpdate(vendor.id, "rejected", notes);
  //     setIsProcessing(false);
  //   }, 1000);
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-700 border-yellow-200 bg-yellow-50"
          >
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="text-green-700 border-green-200 bg-green-50"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-red-700 border-red-200 bg-red-50"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  Vendor KYC Details
                </DialogTitle>
                <div className="flex items-center gap-3">
                  {getStatusBadge(vendor.kycStatus)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="w-6 h-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Store Name
                    </label>
                    <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                      {vendor.storeName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                      {vendor.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Submitted
                    </label>
                    <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                      {new Date(vendor.kycSubmittedAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* FRONT */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Front
                          </p>
                          <p className="text-xs text-gray-500">
                            {vendor?.kycDocuments?.documentType}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setViewDoc({
                            side: "Front",
                            url: vendor?.kycDocuments?.front,
                          })
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>

                    {/* BACK (only if it exists) */}
                    {vendor.kycDocuments?.back && (
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Back
                            </p>
                            <p className="text-xs text-gray-500">
                              {vendor?.kycDocuments?.documentType}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setViewDoc({
                              side: "Back",
                              url: vendor?.kycDocuments?.back!,
                            })
                          }
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {vendor.kycStatus === "Processing" && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={approveMut.isPending || rejectMut.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMut.isPending || approveMut.isPending}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {rejectMut.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approveMut.isPending || rejectMut.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approveMut.isPending ? "Approving..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {viewDoc && (
        <DocumentViewer
          side={viewDoc.side}
          documentType={`KYC Document - ${vendor.kycDocuments.documentType}`}
          documentUrl={viewDoc.url}
          isOpen
          onClose={() => setViewDoc(null)}
        />
      )}
    </>
  );
};

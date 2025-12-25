"use client";

import type React from "react";
import MbaayReturnPolicy from "../../../assets/policies/MbaayReturnPolicy.pdf";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FiDownload, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

interface ReturnPolicyPopupProps {
  showReturnPolicyPopup: boolean;
  setShowReturnPolicyPopup: React.Dispatch<React.SetStateAction<boolean>>;
  returnPolicyRef: React.RefObject<HTMLInputElement>;
}

export default function ReturnPolicyPopup({
  showReturnPolicyPopup,
  setShowReturnPolicyPopup,
}: // returnPolicyRef,
ReturnPolicyPopupProps) {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  if (!showReturnPolicyPopup) return null;

  const handleUploadClick = () => {
    setShowReturnPolicyPopup(false);
    navigate("/app/edit-vendor-profile?open=return-policy");
  };

  const handleDownloadPolicy = async () => {
    try {
      setIsDownloading(true);

      // Fetch the PDF file from the imported asset
      const response = await fetch(MbaayReturnPolicy);

      if (!response.ok) {
        throw new Error("Failed to fetch PDF file");
      }

      // Get the PDF as a blob
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Mbaay-Return-Policy.pdf";
      link.setAttribute("type", "application/pdf");

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      // Mark as downloaded and show success
      setHasDownloaded(true);

      // Auto-upload the Mbaay policy to the vendor profile
      await uploadMbaayPolicyToProfile(blob);

      toast.success(
        "Mbaay Return Policy downloaded and uploaded to your profile successfully!",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );

      // Auto-close popup after successful upload
      setTimeout(() => {
        setShowReturnPolicyPopup(false);
        // Optionally navigate to edit profile to show the uploaded policy
        navigate("/app/edit-vendor-profile");
      }, 2000);
    } catch (error) {
      console.error("Error downloading PDF:", error);

      // Fallback method - direct link approach
      try {
        const link = document.createElement("a");
        link.href = MbaayReturnPolicy;
        link.download = "Mbaay-Return-Policy.pdf";
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setHasDownloaded(true);
        toast.success(
          "PDF downloaded successfully! Please upload it manually to your profile.",
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      } catch (fallbackError) {
        console.error("Fallback download method also failed:", fallbackError);
        toast.error(
          "Unable to download the PDF. Please try again or contact support.",
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to automatically upload Mbaay policy to vendor profile
  const uploadMbaayPolicyToProfile = async (policyBlob: Blob) => {
    try {
      // Create a File object from the blob
      const policyFile = new File([policyBlob], "Mbaay-Return-Policy.pdf", {
        type: "application/pdf",
        lastModified: Date.now(),
      });

      // Store the policy file in localStorage for the edit profile component to pick up
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;

        // Store policy data in localStorage
        localStorage.setItem(
          "mbaay_return_policy",
          JSON.stringify({
            file: base64Data,
            name: "Mbaay-Return-Policy.pdf",
            type: "application/pdf",
            size: policyFile.size,
            uploadedAt: new Date().toISOString(),
            isMbaayDefault: true,
          })
        );

        // Trigger a custom event to notify the edit profile component
        window.dispatchEvent(
          new CustomEvent("mbaayPolicyUploaded", {
            detail: {
              fileName: "Mbaay-Return-Policy.pdf",
              fileSize: policyFile.size,
              isMbaayDefault: true,
            },
          })
        );
      };
      reader.readAsDataURL(policyFile);
    } catch (error) {
      console.error("Error uploading Mbaay policy to profile:", error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-500">
            Return Policy Required
          </h2>
          <motion.button
            onClick={() => setShowReturnPolicyPopup(false)}
            className="text-gray-500 hover:text-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoMdClose size={24} />
          </motion.button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-gray-700">
            You must have a return policy before adding products. Choose one of
            these options:
          </p>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">
              Option 1: Use Mbaay's Default Policy
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Download and automatically upload our standard return policy that
              meets all platform requirements.
            </p>
            <button
              onClick={handleDownloadPolicy}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full justify-center ${
                hasDownloaded
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              } ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  Downloading & Uploading...
                </>
              ) : hasDownloaded ? (
                <>
                  <FiCheck />
                  Policy Downloaded & Uploaded Successfully
                </>
              ) : (
                <>
                  <FiDownload />
                  Accept and Download Mbaay Return Policy
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {hasDownloaded
                ? "The Mbaay return policy has been automatically uploaded to your profile."
                : "By using this option, you agree to apply Mbaay's default return policy to your store and it will be automatically uploaded to your profile."}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">
              Option 2: Upload Your Own Policy
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload a custom return policy that meets or exceeds Mbaay's
              minimum standards.
            </p>
            <button
              onClick={handleUploadClick}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Upload Custom Policy
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowReturnPolicyPopup(false)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

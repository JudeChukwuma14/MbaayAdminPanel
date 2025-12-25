"use client";

import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface BankAccountPopupProps {
  showBankAccountPopup: boolean;
  setShowBankAccountPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BankAccountPopup({
  showBankAccountPopup,
  setShowBankAccountPopup,
}: BankAccountPopupProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  if (!showBankAccountPopup) return null;

  const handleSetupClick = () => {
    setIsNavigating(true);
    // Navigate to edit vendor profile where bank details can be set
    navigate("/app/edit-vendor-profile?open=account");
    setShowBankAccountPopup(false);
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
          <h2 className="text-xl font-semibold text-orange-600">Bank Account Required</h2>
          <motion.button
            onClick={() => setShowBankAccountPopup(false)}
            className="text-gray-500 hover:text-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoMdClose size={24} />
          </motion.button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-gray-700">
            You must set up your payout bank account before adding products. This ensures we can process your payments securely.
          </p>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Set Up Your Bank Details</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add your account name, number and bank to enable payouts for your sales.
            </p>
            <button
              onClick={handleSetupClick}
              disabled={isNavigating}
              className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isNavigating
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              <FiExternalLink />
              {isNavigating ? "Opening settings..." : "Go to Bank Settings"}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowBankAccountPopup(false)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon, Save, Upload } from "lucide-react";
import { useEditMbaayCommunity } from "../../../services/adminApi";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store";

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialDescription: string;
  initialImage: string;
}

export default function EditCommunityModal({
  isOpen,
  onClose,
  initialName,
  initialDescription,
  initialImage,
}: EditCommunityModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: editCommunity, isPending } = useEditMbaayCommunity();
  const admin = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setImagePreview(initialImage);
      setImage(null);
    }
  }, [isOpen, initialName, initialDescription, initialImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for API call
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("logo", image);
    }

    // Get token from Redux store
    const token = admin?.token;

    if (!token) {
      console.error("No token available");
      return;
    }

    editCommunity(
      { token, communityData: formData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-auto md:top-[10%] md:left-[35%] md:max-w-lg w-full md:-translate-x-[50%] bg-white rounded-lg shadow-xl overflow-hidden z-50 flex flex-col max-h-[80vh] md:max-h-[85vh]"
          >
            <div className="flex items-center justify-between flex-shrink-0 p-4 border-b">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Edit Mbaay Community</h2>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* Name Field */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Community Name
                  </label>
                  <motion.input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter community name"
                    required
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Community Description
                  </label>
                  <motion.textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Describe your community..."
                    required
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Community Logo
                  </label>
                  <div
                    onClick={triggerFileInput}
                    className="relative flex flex-col items-center justify-center p-6 transition-all border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 group"
                  >
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img
                          src={imagePreview}
                          alt="Community preview"
                          className="object-cover w-24 h-24 mx-auto mb-3 rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-xs text-center text-gray-500">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Upload community logo
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <motion.input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end flex-shrink-0 gap-3 p-4 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-[#FF6B00] rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

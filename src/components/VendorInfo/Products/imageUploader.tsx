import type React from "react";
import { useRef, useCallback, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FiImage } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ImageUploaderProps {
  productImages: File[];
  imagePreviewUrls: string[];
  setProductImages: React.Dispatch<React.SetStateAction<File[]>>;
  setImagePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

const MIN_IMAGES = 4;
const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export default function ImageUploader({
  productImages,
  imagePreviewUrls,
  setProductImages,
  setImagePreviewUrls,
}: ImageUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const validateImageFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        `Invalid file type: ${file.name}. Please upload JPEG, PNG, or WebP images only.`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `Image "${file.name}" is too large (${formatFileSize(
          file.size
        )}). Maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}.`,
        {
          position: "top-right",
          autoClose: 6000,
        }
      );
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle image drop
  const handleImageDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageFiles(e.dataTransfer.files);
      }
    },
    [productImages]
  );

  // Handle image files with validation
  const handleImageFiles = (files: FileList) => {
    const currentImageCount = productImages.length;
    const availableSlots = MAX_IMAGES - currentImageCount;

    if (availableSlots <= 0) {
      toast.warning(`You can only upload a maximum of ${MAX_IMAGES} images.`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    const newFiles = Array.from(files)
      .filter((file) => file.type.includes("image"))
      .filter(validateImageFile)
      .slice(0, availableSlots); // Only take files that fit in available slots

    if (newFiles.length === 0) {
      return;
    }

    // Check if trying to upload more than available slots
    if (files.length > availableSlots) {
      toast.warning(
        `You can only upload ${availableSlots} more image${
          availableSlots !== 1 ? "s" : ""
        }. Only the first ${newFiles.length} valid image${
          newFiles.length !== 1 ? "s" : ""
        } will be uploaded.`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    }

    if (newFiles.length > 0) {
      setProductImages((prev) => [...prev, ...newFiles]);

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      toast.success(
        `Successfully uploaded ${newFiles.length} image${
          newFiles.length !== 1 ? "s" : ""
        }.`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Handle image input change
  const handleImageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(e.target.files);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = "";
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...productImages];
    const newPreviewUrls = [...imagePreviewUrls];

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);

    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setProductImages(newImages);
    setImagePreviewUrls(newPreviewUrls);

    toast.info("Image removed successfully.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Replace image
  const replaceImage = (index: number) => {
    // Create a new file input and trigger click
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ALLOWED_TYPES.join(",");
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];

        // Validate the new file
        if (!validateImageFile(file)) {
          return;
        }

        // Revoke old URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);

        // Create new preview URL
        const newPreviewUrl = URL.createObjectURL(file);

        // Update arrays
        const newImages = [...productImages];
        const newPreviewUrls = [...imagePreviewUrls];

        newImages[index] = file;
        newPreviewUrls[index] = newPreviewUrl;

        setProductImages(newImages);
        setImagePreviewUrls(newPreviewUrls);

        toast.success("Image replaced successfully.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };
    input.click();
  };

  // Check if upload is disabled
  const isUploadDisabled = productImages.length >= MAX_IMAGES;

  return (
    <motion.div
      className="bg-white p-5 rounded-lg shadow space-y-4"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Product Images</h2>
        <div className="text-sm text-gray-500">
          {productImages.length}/{MAX_IMAGES} images
          {productImages.length < MIN_IMAGES && (
            <span className="text-red-500 ml-2">({MIN_IMAGES} required)</span>
          )}
        </div>
      </div>

      {/* Image requirements info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-1">
          Image Requirements:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Exactly {MIN_IMAGES} images required</li>
          <li>• Maximum file size: {formatFileSize(MAX_FILE_SIZE)}</li>
          <li>• Supported formats: JPEG, PNG, WebP</li>
          <li>• Recommended resolution: 1000x1000px or higher</li>
        </ul>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Upload area - only show if not at max capacity */}
          {!isUploadDisabled && (
            <div
              className={`border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer h-40 transition-colors ${
                isUploadDisabled
                  ? "bg-gray-100 cursor-not-allowed"
                  : "hover:border-orange-400 hover:bg-orange-50"
              }`}
              onClick={() =>
                !isUploadDisabled && imageInputRef.current?.click()
              }
              onDragOver={handleDragOver}
              onDrop={handleImageDrop}
            >
              <FiImage
                className={`w-8 h-8 mb-2 ${
                  isUploadDisabled ? "text-gray-400" : "text-orange-500"
                }`}
              />
              <div className="text-center">
                <p
                  className={`font-medium ${
                    isUploadDisabled ? "text-gray-400" : "text-blue-600"
                  }`}
                >
                  Click to upload images
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
              <motion.input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept={ALLOWED_TYPES.join(",")}
                multiple
                onChange={handleImageInputChange}
                disabled={isUploadDisabled}
              />
            </div>
          )}

          {/* Image previews */}
          {imagePreviewUrls.map((url, index) => (
            <div
              key={index}
              className="relative border border-gray-200 rounded-lg overflow-hidden h-40 group"
            >
              <img
                src={url || "/placeholder.svg"}
                alt={`Product preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  className="bg-white text-gray-800 px-4 py-1 rounded mb-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    replaceImage(index);
                  }}
                >
                  Replace
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  Remove
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {formatFileSize(productImages[index]?.size || 0)}
              </div>
            </div>
          ))}

          {/* Empty slots - show remaining slots needed */}
          {imagePreviewUrls.length < MAX_IMAGES &&
            Array.from({ length: MAX_IMAGES - imagePreviewUrls.length }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className={`border border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center ${
                    !isUploadDisabled
                      ? "cursor-pointer hover:border-orange-400 hover:bg-orange-50"
                      : ""
                  }`}
                  onClick={() =>
                    !isUploadDisabled && imageInputRef.current?.click()
                  }
                >
                  <div className="text-center text-gray-400">
                    <FiImage className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">
                      Image {imagePreviewUrls.length + index + 1}
                      {imagePreviewUrls.length + index + 1 <= MIN_IMAGES && (
                        <span className="text-red-500"> *</span>
                      )}
                    </p>
                  </div>
                </div>
              )
            )}
        </div>

        {/* Upload status message */}
        {productImages.length < MIN_IMAGES && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Required:</span> Please upload{" "}
              {MIN_IMAGES - productImages.length} more image
              {MIN_IMAGES - productImages.length !== 1 ? "s" : ""} to meet the
              minimum requirement.
            </p>
          </div>
        )}

        {productImages.length === MAX_IMAGES && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Complete:</span> All {MAX_IMAGES}{" "}
              required images have been uploaded.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

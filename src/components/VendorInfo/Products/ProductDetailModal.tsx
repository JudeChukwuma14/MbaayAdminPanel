import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Edit,
  Trash2,
  Play,
  Save,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getVendorProductById,
  updateVendorProduct,
  deleteVendorProduct,
} from "@/utils/VendorProductApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  shippingprice: number;
  inventory: number;
  category: string;
  sub_category: string;
  sub_category2: string;
  createdAt: string;
  images: string[];
  product_video?: string;
  productType?: string;
  listingType?: string;
  originalPrice?: number;
  flashSalePrice?: number;
  flashSaleStartDate?: string;
  flashSaleEndDate?: string;
  flashSaleDiscount?: number;
  startingPrice?: number;
  reservePrice?: number;
  auctionDuration?: string;
  auctionStartDate?: string;
  auctionEndDate?: string;
  auctionStatus?: string;
  flashSaleStatus?: string;
  highestBid?: { amount: number };
  bids?: any[];
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, children }) => (
  <div
    className={`${
      open
        ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        : "hidden"
    }`}
    role="dialog"
    aria-modal="true"
  >
    <div className="w-full max-w-[95%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      {children}
    </div>
  </div>
);

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
}) => (
  <div
    className={`bg-white rounded-lg shadow-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
      className || ""
    }`}
  >
    {children}
  </div>
);

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => (
  <h2 className={`text-lg sm:text-xl font-semibold ${className || ""}`}>
    {children}
  </h2>
);

interface BadgeProps {
  className?: string;
  variant?: "default" | "secondary" | "outline";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
}) => {
  const variants: { [key: string]: string } = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
        variants[variant] || variants.default
      } ${className || ""}`}
    >
      {children}
    </span>
  );
};

const Separator: React.FC = () => (
  <hr className="my-3 border-gray-200 sm:my-4" />
);

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  productId: any;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  productId,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isVideoSelected, setIsVideoSelected] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [newImages, setNewImages] = useState<(File | null)[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // LocalStorage keys
  const getLocalStorageImageKey = (id: string, index: number) =>
    `product_image_${id}_${index}`;
  const getLocalStorageVideoKey = (id: string) => `product_video_${id}`;

  const { data: vendor_products } = useQuery({
    queryKey: ["one_product", productId],
    queryFn: () => getVendorProductById(productId),
    enabled: !!productId,
  });
  console.log("product", vendor_products);

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedProduct: Partial<Product>) => {
      const formData = new FormData();
      // Append text fields
      if (updatedProduct.name) formData.append("name", updatedProduct.name);
      if (updatedProduct.description)
        formData.append("description", updatedProduct.description);
      if (updatedProduct.price)
        formData.append("price", updatedProduct.price.toString());
      if (updatedProduct.shippingprice)
        formData.append("price", updatedProduct.shippingprice.toString());
      if (updatedProduct.inventory)
        formData.append("inventory", updatedProduct.inventory.toString());
      // Flash sale / auction fields
      if (updatedProduct.originalPrice != null)
        formData.append(
          "originalPrice",
          updatedProduct.originalPrice.toString()
        );
      if (updatedProduct.flashSalePrice != null)
        formData.append(
          "flashSalePrice",
          updatedProduct.flashSalePrice.toString()
        );
      if (updatedProduct.flashSaleEndDate)
        formData.append(
          "flashSaleEndDate",
          new Date(updatedProduct.flashSaleEndDate).toISOString()
        );
      if (updatedProduct.flashSaleDiscount != null)
        formData.append(
          "flashSaleDiscount",
          updatedProduct.flashSaleDiscount.toString()
        );
      if (updatedProduct.startingPrice != null)
        formData.append(
          "startingPrice",
          updatedProduct.startingPrice.toString()
        );
      if (updatedProduct.reservePrice != null)
        formData.append("reservePrice", updatedProduct.reservePrice.toString());
      if (updatedProduct.auctionDuration)
        formData.append(
          "auctionDuration",
          updatedProduct.auctionDuration.toString()
        );
      // Append new images
      newImages.forEach((image, index) => {
        // Handle start dates: only append updated start date if the event hasn't started yet
        if (
          updatedProduct.flashSaleStartDate &&
          !hasStarted(productData?.flashSaleStartDate)
        ) {
          formData.append(
            "flashSaleStartDate",
            new Date(updatedProduct.flashSaleStartDate).toISOString()
          );
        }
        const existingAuctionStart =
          productData?.auctionStartDate ||
          deriveStartFromEnd(
            productData?.auctionEndDate,
            productData?.auctionDuration
          );
        if (
          updatedProduct.auctionStartDate &&
          !hasStarted(existingAuctionStart, productData?.auctionStatus)
        ) {
          formData.append(
            "auctionStartDate",
            new Date(updatedProduct.auctionStartDate).toISOString()
          );
        }
        if (image) {
          formData.append(`images[${index}]`, image);
        }
      });
      // Append new video
      if (newVideo) {
        formData.append("product_video", newVideo);
      }
      return updateVendorProduct(productId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one_product", productId] });
      queryClient.invalidateQueries({ queryKey: ["vendor_products"] });
      toast.success("Product updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Failed to update product", {
        position: "top-right",
        autoClose: 4000,
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteVendorProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_products"] });
      toast.success("Product deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      // Clear localStorage for this product
      clearProductFromLocalStorage();
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product", {
        position: "top-right",
        autoClose: 4000,
      });
    },
  });

  // Use vendor_products if available, otherwise fall back to product prop
  const productData = vendor_products || product;

  // Clear all localStorage items related to this product
  const clearProductFromLocalStorage = () => {
    if (productId) {
      // Clear images
      if (productData?.images) {
        productData.images.forEach((_: string, index: number) => {
          localStorage.removeItem(getLocalStorageImageKey(productId, index));
        });
      }
      // Clear video
      localStorage.removeItem(getLocalStorageVideoKey(productId));
    }
  };

  // Load images and video from localStorage
  useEffect(() => {
    if (productId && productData) {
      const updatedImages = [...(productData.images || [])];
      let hasLocalStorageImages = false;

      // Load images from localStorage
      productData.images?.forEach((_: string, index: number) => {
        const localStorageImage = localStorage.getItem(
          getLocalStorageImageKey(productId, index)
        );
        if (localStorageImage) {
          updatedImages[index] = localStorageImage;
          hasLocalStorageImages = true;
        }
      });

      // Load video from localStorage
      const localStorageVideo = localStorage.getItem(
        getLocalStorageVideoKey(productId)
      );

      // Update state with localStorage data if available
      if (hasLocalStorageImages || localStorageVideo) {
        setEditedProduct({
          ...productData,
          images: updatedImages,
          product_video: localStorageVideo || productData.product_video,
        });
      } else {
        setEditedProduct({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          shippingprice: productData.shippingprice,
          inventory: productData.inventory,
          images: productData.images,
          product_video: productData.product_video,
          productType: productData.productType,
          listingType: productData.listingType,
          originalPrice: productData.originalPrice,
          flashSalePrice: productData.flashSalePrice,
          flashSaleStartDate: productData.flashSaleStartDate,
          flashSaleEndDate: productData.flashSaleEndDate,
          flashSaleDiscount: productData.flashSaleDiscount,
          startingPrice: productData.startingPrice,
          reservePrice: productData.reservePrice,
          auctionDuration: productData.auctionDuration,
          auctionStartDate: productData.auctionStartDate,
        });
      }

      // Initialize newImages array
      setNewImages(new Array(productData.images?.length || 0).fill(null));

      // Set selected media
      if (updatedImages.length > 0) {
        setSelectedMedia(updatedImages[0]);
      }
    }
  }, [productId, productData]);

  if (!productData) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return "₦0.00";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(value as number);
    } catch (e) {
      return `₦${value}`;
    }
  };

  const deriveStartFromEnd = (
    end?: string | null | undefined,
    durationHours?: string | number | null | undefined
  ) => {
    if (!end || !durationHours) return undefined;
    const endDate = new Date(end);
    const hours = Number(durationHours);
    if (Number.isNaN(hours)) return undefined;
    const start = new Date(endDate.getTime() - hours * 3600 * 1000);
    return start.toISOString();
  };

  const toInputDate = (iso?: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    // convert to local datetime-local format: YYYY-MM-DDTHH:MM
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzOffset).toISOString();
    return localISO.slice(0, 16);
  };

  const handleMediaSelect = (media: string, isVideo = false): void => {
    setSelectedMedia(media);
    setIsVideoSelected(isVideo);
  };

  // Get YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string): string => {
    let videoId = "";
    if (url.includes("youtube.com")) {
      const params = new URL(url).searchParams;
      videoId = params.get("v") || "";
    } else if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : "/video-placeholder.jpg";
  };

  // Use editedProduct.images if available, otherwise fall back to productData.images
  const displayImages = editedProduct.images || productData.images || [];

  const hasStarted = (
    dateStr?: string | null | undefined,
    status?: string | null | undefined
  ) => {
    // If a start date exists, use it
    if (dateStr) {
      const d = new Date(dateStr);
      const now = new Date();
      return d <= now;
    }
    // Fallback to status, consider Started/Ongoing/Ended as started
    if (!status) return false;
    const s = status.toLowerCase();
    return (
      s === "started" || s === "ongoing" || s === "ended" || s === "active"
    );
  };

  // Video handling
  const videoUrl = editedProduct.product_video || productData.product_video;
  const hasVideo = !!videoUrl;
  const isYouTube =
    hasVideo &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));

  const embedUrl =
    hasVideo && isYouTube
      ? videoUrl
          .replace("watch?v=", "embed/")
          .replace("youtu.be/", "youtube.com/embed/")
      : videoUrl;

  const videoThumbnail =
    hasVideo && isYouTube
      ? getYouTubeThumbnail(videoUrl)
      : hasVideo
      ? "/video-placeholder.jpg"
      : null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = new Set([
      "price",
      "inventory",
      "shippingprice",
      "originalPrice",
      "flashSalePrice",
      "flashSaleDiscount",
      "startingPrice",
      "reservePrice",
      "auctionDuration",
    ]);
    setEditedProduct({
      ...editedProduct,
      [name]: numberFields.has(name) ? Number.parseFloat(value) : value,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setEditedProduct({
      ...editedProduct,
      description: value,
    });
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);

      // Update the editedProduct images array
      const updatedImages = [...displayImages];
      updatedImages[index] = newImageUrl;
      setEditedProduct({ ...editedProduct, images: updatedImages });

      // Store the file for submission
      const updatedNewImages = [...newImages];
      updatedNewImages[index] = file;
      setNewImages(updatedNewImages);

      // Update selected media if the changed image is currently selected
      if (selectedMedia === displayImages[index]) {
        setSelectedMedia(newImageUrl);
      }

      // Store in localStorage
      if (productId) {
        localStorage.setItem(
          getLocalStorageImageKey(productId, index),
          newImageUrl
        );
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...displayImages];
    updatedImages.splice(index, 1);
    setEditedProduct({ ...editedProduct, images: updatedImages });

    const updatedNewImages = [...newImages];
    updatedNewImages.splice(index, 1);
    setNewImages(updatedNewImages);

    // Remove from localStorage
    if (productId) {
      localStorage.removeItem(getLocalStorageImageKey(productId, index));
    }

    // Update selected media if needed
    if (selectedMedia === displayImages[index]) {
      setSelectedMedia(updatedImages[0] || null);
      setIsVideoSelected(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newVideoUrl = URL.createObjectURL(file);
      setEditedProduct({ ...editedProduct, product_video: newVideoUrl });
      setNewVideo(file);

      if (isVideoSelected) {
        setSelectedMedia(newVideoUrl);
      }

      // Store in localStorage
      if (productId) {
        localStorage.setItem(getLocalStorageVideoKey(productId), newVideoUrl);
      }
    }
  };

  const handleRemoveVideo = () => {
    setEditedProduct({ ...editedProduct, product_video: undefined });
    setNewVideo(null);
    setSelectedMedia(displayImages[0] || null);
    setIsVideoSelected(false);

    // Remove from localStorage
    if (productId) {
      localStorage.removeItem(getLocalStorageVideoKey(productId));
    }
  };

  const handleSave = () => {
    if (formRef.current?.checkValidity()) {
      updateMutation.mutate(editedProduct);
    } else {
      formRef.current?.reportValidity();
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Prevent delete if product is a flash sale or auction
    if (
      productData?.productType === "flash sale" ||
      productData?.productType === "auction"
    ) {
      toast.error("Cannot delete flash sale or auction products", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowDeleteConfirm(false);
      return;
    }
    deleteMutation.mutate();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0">
        <ToastContainer />
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-white border-b sm:p-4 md:p-6">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">
              {isEditing ? "Edit Product" : "Product Details"}
            </DialogTitle>
            {productData?.productType && (
              <Badge variant="secondary">{productData.productType}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isEditing ? (
              <motion.button
                onClick={handleSave}
                className="p-2 rounded-full sm:p-3 hover:bg-green-100"
                whileHover={{ scale: 1.1 }}
                aria-label="Save"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-green-200 rounded-full border-t-green-500 animate-spin" />
                ) : (
                  <Save size={18} className="text-green-600" />
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={toggleEdit}
                className="p-2 rounded-full sm:p-3 hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                aria-label="Edit"
              >
                <Edit size={18} className="text-gray-600" />
              </motion.button>
            )}
            <motion.button
              onClick={handleDelete}
              className="p-2 rounded-full sm:p-3 hover:bg-red-100 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              aria-label="Delete"
              disabled={
                deleteMutation.isPending ||
                productData?.productType === "flash sale" ||
                productData?.productType === "auction"
              }
              title={
                productData?.productType === "flash sale" ||
                productData?.productType === "auction"
                  ? "Cannot delete flash sale or auction products"
                  : "Delete"
              }
            >
              {deleteMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-red-200 rounded-full border-t-red-500 animate-spin" />
              ) : (
                <Trash2 size={18} className="text-red-500" />
              )}
            </motion.button>
            <motion.button
              onClick={() => {
                if (isEditing) {
                  toggleEdit(); // Exit edit mode
                }
                onClose();
              }}
              className="p-2 rounded-full sm:p-3 hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
              aria-label="Close"
            >
              <X size={18} className="text-gray-600" />
            </motion.button>
          </div>
        </div>

        <form
          ref={formRef}
          className="p-3 space-y-4 sm:p-4 md:p-6 sm:space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6 md:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-full overflow-hidden bg-gray-100 rounded-lg shadow-lg aspect-video">
                {isVideoSelected && hasVideo ? (
                  isYouTube ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Product Video"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error("Failed to load video", e);
                        e.currentTarget.poster = "/video-error.svg";
                      }}
                    />
                  )
                ) : displayImages.length > 0 ? (
                  <img
                    src={selectedMedia || displayImages[0]}
                    alt={productData.name}
                    className="object-cover w-full h-full rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5 sm:gap-3">
                {displayImages.map((image: string, index: number) => (
                  <div
                    key={`img-${index}`}
                    className={`w-full aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer 
                      relative transition-all duration-300 ${
                        selectedMedia === image && !isVideoSelected
                          ? "ring-2 ring-blue-500"
                          : "opacity-80"
                      }`}
                    onClick={() => handleMediaSelect(image)}
                  >
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    {isEditing && (
                      <>
                        <label
                          className="absolute inset-0 flex items-center justify-center transition-opacity bg-black cursor-pointer bg-opacity-30 hover:bg-opacity-50"
                          title="Replace image"
                        >
                          <Upload className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                          <motion.input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, index)}
                          />
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* Video thumbnail - only show if video exists */}
                {hasVideo && (
                  <div
                    key="video"
                    className={`w-full aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer relative 
                      transition-all duration-300 hover:scale-105 ${
                        isVideoSelected ? "ring-2 ring-blue-500" : "opacity-80"
                      }`}
                    onClick={() => handleMediaSelect(videoUrl, true)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="w-6 h-6 text-white sm:w-8 sm:h-8" />
                    </div>
                    <img
                      src={videoThumbnail || "/video-placeholder.jpg"}
                      alt="Video thumbnail"
                      className="object-cover w-full h-full opacity-70"
                      onError={(e) => {
                        e.currentTarget.src = "/video-placeholder.jpg";
                      }}
                    />
                    {isEditing && (
                      <>
                        <label
                          className="absolute inset-0 flex items-center justify-center transition-opacity bg-black cursor-pointer bg-opacity-30 hover:bg-opacity-50"
                          title="Replace video"
                        >
                          <Upload className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                          <motion.input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoChange}
                          />
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVideo();
                          }}
                          className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                          title="Remove video"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Add video button (only in edit mode when no video exists) */}
                {isEditing && !hasVideo && (
                  <div className="relative w-full overflow-hidden bg-gray-100 rounded-md cursor-pointer aspect-square">
                    <label className="absolute inset-0 flex flex-col items-center justify-center transition-colors bg-gray-100 hover:bg-gray-200">
                      <Play className="w-8 h-8 mb-1 text-gray-400" />
                      <span className="text-xs text-gray-500">Add Video</span>
                      <motion.input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-1 text-sm font-medium text-gray-700 sm:text-base"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editedProduct.name || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md sm:p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block mb-1 text-sm font-medium text-gray-700 sm:text-base"
                      >
                        Description
                      </label>
                      <motion.textarea
                        id="description"
                        name="description"
                        placeholder="Product Description"
                        value={editedProduct.description || ""}
                        onChange={handleDescriptionChange}
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none min-h-[100px] max-h-[200px]"
                        style={{ minHeight: "100px" }}
                        rows={4}
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>
                          Characters: {(editedProduct.description || "").length}
                        </span>
                        <span>
                          Words:{" "}
                          {editedProduct.description?.trim()
                            ? editedProduct.description.trim().split(/\s+/)
                                .length
                            : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
                      {productData.name}
                    </h1>
                    <p className="text-sm text-gray-700 sm:text-base">
                      {productData.description}
                    </p>
                  </>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Price
                  </h3>
                  {isEditing ? (
                    <div className="">
                      <div className="flex">
                        <span className="flex items-center pl-3 mr-2 text-gray-500 ">
                          ₦
                        </span>
                        <motion.input
                          type="number"
                          id="price"
                          name="price"
                          value={editedProduct.price || ""}
                          onChange={handleInputChange}
                          className="w-[80%] pl-7 p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg font-bold sm:text-xl">
                      ₦{productData.price?.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Shipping fee
                  </h3>
                  {isEditing ? (
                    <div className="">
                      <div className="flex ">
                        <span className="flex items-center pl-3 mr-2 text-gray-500">
                          ₦
                        </span>
                        <motion.input
                          type="number"
                          id="price"
                          name="price"
                          value={editedProduct.shippingprice || "50"}
                          onChange={handleInputChange}
                          className="w-[80%] pl-7 p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg font-bold sm:text-xl">
                      ₦{productData.shippingprice?.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Inventory
                  </h3>
                  {isEditing ? (
                    <div className="mt-1">
                      <motion.input
                        type="number"
                        id="inventory"
                        name="inventory"
                        value={editedProduct.inventory || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md sm:p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <p className="text-lg font-bold sm:text-xl">
                      {productData.inventory}
                    </p>
                  )}
                </div>
              </div>
              <Separator />

              {/* Listing-specific fields (Flash Sale or Auction) */}
              {productData?.productType === "flash sale" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Flash Sale Details
                  </h3>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Original Price
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">₦</span>
                          <input
                            type="number"
                            name="originalPrice"
                            value={
                              editedProduct.originalPrice ??
                              productData.originalPrice ??
                              ""
                            }
                            onChange={handleInputChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Flash Sale Price
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">₦</span>
                          <input
                            type="number"
                            name="flashSalePrice"
                            value={
                              editedProduct.flashSalePrice ??
                              productData.flashSalePrice ??
                              ""
                            }
                            onChange={handleInputChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Flash Sale Start
                        </label>
                        <input
                          type="datetime-local"
                          name="flashSaleStartDate"
                          value={
                            editedProduct.flashSaleStartDate
                              ? toInputDate(
                                  editedProduct.flashSaleStartDate as string
                                )
                              : toInputDate(productData.flashSaleStartDate)
                          }
                          onChange={handleInputChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md"
                          disabled={hasStarted(
                            productData.flashSaleStartDate,
                            productData.flashSaleStatus
                          )}
                        />
                        {hasStarted(
                          productData.flashSaleStartDate,
                          productData.flashSaleStatus
                        ) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Flash sale has started — start date cannot be
                            modified.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Flash Sale End
                        </label>
                        <input
                          type="datetime-local"
                          name="flashSaleEndDate"
                          value={
                            editedProduct.flashSaleEndDate
                              ? toInputDate(
                                  editedProduct.flashSaleEndDate as string
                                )
                              : toInputDate(productData.flashSaleEndDate)
                          }
                          onChange={handleInputChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          name="flashSaleDiscount"
                          value={
                            editedProduct.flashSaleDiscount ??
                            productData.flashSaleDiscount ??
                            ""
                          }
                          onChange={handleInputChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">
                          Original Price
                        </div>
                        <div className="text-sm font-semibold">
                          ₦{productData.originalPrice}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Flash Sale Price
                        </div>
                        <div className="text-sm font-semibold">
                          ₦{productData.flashSalePrice}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Flash Sale Start
                        </div>
                        <div className="text-sm">
                          {productData.flashSaleStartDate
                            ? formatDate(productData.flashSaleStartDate)
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Flash Sale End
                        </div>
                        <div className="text-sm">
                          {productData.flashSaleEndDate
                            ? formatDate(productData.flashSaleEndDate)
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Discount</div>
                        <div className="text-sm">
                          {productData.flashSaleDiscount ?? "-"}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {productData?.productType === "auction" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Auction Details
                  </h3>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Starting Price
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">₦</span>
                          <input
                            type="number"
                            name="startingPrice"
                            value={
                              editedProduct.startingPrice ??
                              productData.startingPrice ??
                              ""
                            }
                            onChange={handleInputChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Reserve Price
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">₦</span>
                          <input
                            type="number"
                            name="reservePrice"
                            value={
                              editedProduct.reservePrice ??
                              productData.reservePrice ??
                              ""
                            }
                            onChange={handleInputChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Auction Start
                        </label>
                        <input
                          type="datetime-local"
                          name="auctionStartDate"
                          value={
                            editedProduct.auctionStartDate
                              ? toInputDate(
                                  editedProduct.auctionStartDate as string
                                )
                              : toInputDate(
                                  productData.auctionStartDate ||
                                    deriveStartFromEnd(
                                      productData.auctionEndDate,
                                      productData.auctionDuration
                                    )
                                )
                          }
                          onChange={handleInputChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md"
                          disabled={hasStarted(
                            productData.auctionStartDate ||
                              deriveStartFromEnd(
                                productData.auctionEndDate,
                                productData.auctionDuration
                              ),
                            productData.auctionStatus
                          )}
                        />
                        {hasStarted(
                          productData.auctionStartDate ||
                            deriveStartFromEnd(
                              productData.auctionEndDate,
                              productData.auctionDuration
                            ),
                          productData.auctionStatus
                        ) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Auction has started — start date cannot be modified.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-500">
                          Auction Duration (hours)
                        </label>
                        <input
                          type="number"
                          name="auctionDuration"
                          value={
                            editedProduct.auctionDuration ??
                            productData.auctionDuration ??
                            ""
                          }
                          onChange={handleInputChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">
                          Starting Price
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(productData.startingPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Reserve Price
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(productData.reservePrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Auction Start
                        </div>
                        <div className="text-sm">
                          {productData.auctionStartDate ||
                          deriveStartFromEnd(
                            productData.auctionEndDate,
                            productData.auctionDuration
                          )
                            ? formatDate(
                                productData.auctionStartDate ||
                                  deriveStartFromEnd(
                                    productData.auctionEndDate,
                                    productData.auctionDuration
                                  )
                              )
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="text-sm">
                          {productData.auctionDuration ?? "-"} hours
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Highest Bid</div>
                        <div className="text-sm">
                          {formatCurrency(productData.highestBid?.amount ?? 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Auction End</div>
                        <div className="text-sm">
                          {productData.auctionEndDate
                            ? formatDate(productData.auctionEndDate)
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Auction Status
                        </div>
                        <div className="text-sm">
                          {productData.auctionStatus ?? "-"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary">{productData.category}</Badge>
                    <Badge variant="outline">{productData.sub_category}</Badge>
                    <Badge variant="outline">{productData.sub_category2}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 sm:text-base">
                    Added on
                  </h3>
                  <p className="text-sm sm:text-base">
                    {formatDate(productData.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-[90%] sm:max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3 text-red-600 sm:gap-3 sm:mb-4">
                <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
                <h3 className="text-base font-semibold sm:text-lg">
                  Delete Product
                </h3>
              </div>

              <p className="mb-4 text-sm sm:mb-6 sm:text-base">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{productData.name}</span>? This
                action cannot be undone.
              </p>

              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 min-w-[80px] text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 min-w-[80px] text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ProductDetailModal;

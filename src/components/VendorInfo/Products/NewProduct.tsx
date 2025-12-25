import React from 'react'

const NewProduct = () => {
  return (
    <div>
      NewProduct
    </div>
  )
}

export default NewProduct


// import { useState, useEffect, type ChangeEvent } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useSelector } from "react-redux";
// import { useQuery } from "@tanstack/react-query";
// import { get_single_vendor } from "@/utils/vendorApi";
// import {
//   getVendorProducts,
//   uploadVendorProduct,
// } from "@/utils/VendorProductApi";
// import CategorySelector from "./CategorySelector";
// import CategorySpecificUI from "./categorySpecificUi";
// import DescriptionSection from "./descriptionSection";
// import ImageUploader from "./imageUploader";
// import VideoUploader from "./Video-Uploader";
// // import ReturnPolicyPopup from "./ReturnPolicyPopup";
// // import BankAccountPopup from "./BankAccountPopup";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ChevronDown } from "lucide-react";
// // import Swal from "sweetalert2";

// import CurrencyInput from "./CurrencyInput";
// // import { useNavigate } from "react-router-dom";

// const NewProduct = () => {
//   const user = useSelector((state: any) => state.vendor);
//   const { data: vendors } = useQuery({
//     queryKey: ["vendor"],
//     queryFn: () => get_single_vendor(user.token),
//   });

//   // const { data: products } = useQuery({
//   //   queryKey: ["products"],
//   //   queryFn: () => getVendorProducts(user.token),
//   // });

//   console.log("Vendor data", vendors);

//   const subCategories: Record<string, string[]> = {
//     "Beauty and Wellness": ["Skincare", "Haircare", "Makeup", "Fragrance"],
//     "Jewelry and Gemstones": ["Necklaces", "Rings", "Earrings", "Bracelets"],
//     "Books and Poetry": ["Fiction", "Non-fiction", "Poetry", "Academic"],
//     "Home Décor and Accessories": [
//       "Wall Art",
//       "Furniture",
//       "Lighting",
//       "Textiles",
//     ],
//     "Vintage Stocks": [
//       "Clothing",
//       "Accessories",
//       "Collectibles",
//       "Memorabilia",
//     ],
//     "Plant and Seeds": [
//       "Indoor Plants",
//       "Outdoor Plants",
//       "Seeds",
//       "Gardening Tools",
//     ],
//     "Spices, Condiments, and Seasonings": [
//       "Herbs",
//       "Spices",
//       "Condiments",
//       "Blends",
//     ],
//     "Local & Traditional Foods": [
//       "Snacks",
//       "Beverages",
//       "Preserves",
//       "Staples",
//     ],
//     "Traditional Clothing & Fabrics": [
//       "Men's Wear",
//       "Women's Wear",
//       "Fabrics",
//       "Accessories",
//     ],
//   };

//   const defaultCategory = vendors?.craftCategories[0];
//   const defaultSubCategory = subCategories[defaultCategory]?.[0];
//   // const navigate = useNavigate();
//   const [productName, setProductName] = useState("");
//   const [value, setValue] = useState("");
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([
//     defaultCategory,
//     "",
//   ]);
//   const [activeCategory, setActiveCategory] = useState(defaultCategory);
//   const [subCategory, setSubCategory] = useState(defaultSubCategory);
//   const [subSubCategory, setSubSubCategory] = useState("");
//   const [quantity, setQuantity] = useState("0");
//   const [sku, setSku] = useState("");
//   const [price, setPrice] = useState("");
//   const [shippingprice, setShippingPrice] = useState("");
//   const [productImages, setProductImages] = useState<File[]>([]);
//   const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
//   const [descriptionFileName, setDescriptionFileName] = useState("");
//   const [showYoutubeInput, setShowYoutubeInput] = useState(false);
//   const [youtubeUrl, setYoutubeUrl] = useState("");
//   const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState("");
//   const [uploadedVideoInfo, setUploadedVideoInfo] = useState<{
//     name?: string;
//     size?: number;
//     type?: string;
//     thumbnailUrl?: string;
//     file?: File;
//   } | null>(null);
//   // const [showReturnPolicyPopup, setShowReturnPolicyPopup] = useState(false);
//   // const [showBankAccountPopup, setShowBankAccountPopup] = useState(false);
//   const [vendorPlan] = useState<"Shelves" | "Counter" | "Shop" | "Premium">(
//     "Counter"
//   );
//   const [isDirty, setIsDirty] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
//   const [vendorCountry, setVendorCountry] = useState("");
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
//   const [showListingTypeDropdown, setShowListingTypeDropdown] = useState(false);
//   const [listingType, setListingType] = useState<
//     "sales" | "auction" | "flash sale"
//   >("sales");
//   const [auctionDetails, setAuctionDetails] = useState<{
//     startingPrice: string;
//     reservePrice: string;
//     auctionDuration: string;
//     Inventory: number;
//     auctionstartTime: string;
//   }>({
//     startingPrice: "",
//     reservePrice: "",
//     auctionDuration: "",
//     Inventory: 0,
//     auctionstartTime: "",
//   });
//   const [flashSaleDetails, setFlashSaleDetails] = useState<{
//     flashSalePrice: string;
//     flashSaleStartDate: string;
//     flashSaleEndDate: string;
//   }>({
//     flashSalePrice: "",
//     flashSaleStartDate: "",
//     flashSaleEndDate: "",
//   });

//   // const returnPolicyRef = useRef<HTMLInputElement>(null);

//   const categoryThemes: Record<
//     string,
//     { primary: string; secondary: string; accent: string }
//   > = {
//     "Beauty and Wellness": {
//       primary: "pink-500",
//       secondary: "pink-100",
//       accent: "pink-700",
//     },
//     "Jewelry and Gemstones": {
//       primary: "purple-500",
//       secondary: "purple-100",
//       accent: "purple-700",
//     },
//     "Books and Poetry": {
//       primary: "blue-500",
//       secondary: "blue-100",
//       accent: "blue-700",
//     },
//     "Home Décor and Accessories": {
//       primary: "yellow-500",
//       secondary: "yellow-100",
//       accent: "yellow-700",
//     },
//     "Vintage Stocks": {
//       primary: "red-500",
//       secondary: "red-100",
//       accent: "red-700",
//     },
//     "Plant and Seeds": {
//       primary: "green-500",
//       secondary: "green-100",
//       accent: "green-700",
//     },
//     "Spices, Condiments, and Seasonings": {
//       primary: "orange-500",
//       secondary: "orange-100",
//       accent: "orange-700",
//     },
//     "Local & Traditional Foods": {
//       primary: "amber-500",
//       secondary: "amber-100",
//       accent: "amber-700",
//     },
//     "Traditional Clothing & Fabrics": {
//       primary: "indigo-500",
//       secondary: "indigo-100",
//       accent: "indigo-700",
//     },
//   };

//   useEffect(() => {
//     const fetchVendorCountry = async () => {
//       try {
//         setVendorCountry(vendors?.country || "United States");
//       } catch (error) {
//         console.error("Error fetching vendor country:", error);
//       }
//     };
//     fetchVendorCountry();
//   }, [vendors]);

//   useEffect(() => {
//     if (
//       productName ||
//       value ||
//       subCategory ||
//       quantity !== "0" ||
//       sku ||
//       price ||
//       shippingprice ||
//       productImages?.length > 0 ||
//       youtubeEmbedUrl ||
//       uploadedVideoInfo
//     ) {
//       setIsDirty(true);
//     }
//   }, [
//     productName,
//     value,
//     subCategory,
//     quantity,
//     sku,
//     price,
//     productImages,
//     youtubeEmbedUrl,
//     uploadedVideoInfo,
//   ]);

//   // Add these utility functions
//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const base64ToFile = (base64: string, filename: string): File => {
//     const arr = base64.split(",");
//     const mime = arr[0].match(/:(.*?);/)![1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, { type: mime });
//   };

//   // Update the draft loading in useEffect
//   useEffect(() => {
//     const savedDraft = localStorage.getItem("productDraft");
//     if (savedDraft) {
//       try {
//         const draftData = JSON.parse(savedDraft) as any;

//         // Restore all basic fields
//         if (draftData.productName) setProductName(draftData.productName);
//         if (draftData.description) setValue(draftData.description);
//         if (draftData.descriptionFileName)
//           setDescriptionFileName(draftData.descriptionFileName);
//         if (draftData.activeCategory)
//           setActiveCategory(draftData.activeCategory);
//         if (draftData.subCategory) setSubCategory(draftData.subCategory);
//         if (draftData.subSubCategory)
//           setSubSubCategory(draftData.subSubCategory);
//         if (draftData.quantity) setQuantity(draftData.quantity);
//         if (draftData.sku) setSku(draftData.sku);
//         if (draftData.price) setPrice(draftData.price);
//         if (draftData.shippingprice) setShippingPrice(draftData.shippingprice);
//         if (draftData.listingType) setListingType(draftData.listingType);
//         if (draftData.auctionDetails)
//           setAuctionDetails(draftData.auctionDetails);
//         if (draftData.vendorCountry) setVendorCountry(draftData.vendorCountry);
//         if (draftData.youtubeUrl) setYoutubeUrl(draftData.youtubeUrl);
//         if (draftData.youtubeEmbedUrl)
//           setYoutubeEmbedUrl(draftData.youtubeEmbedUrl);
//         if (draftData.selectedCategories) {
//           setSelectedCategories(draftData.selectedCategories);
//           // If draft didn't include an explicit activeCategory but has selectedCategories, use the first
//           if (
//             !draftData.activeCategory &&
//             draftData.selectedCategories.length
//           ) {
//             setActiveCategory(draftData.selectedCategories[0]);
//           }
//         }

//         // Restore images from base64
//         if (draftData.imagePreviewsWithBase64?.length > 0) {
//           const restoredImages = draftData.imagePreviewsWithBase64.map(
//             (img: any) => base64ToFile(img.base64, img.name)
//           );
//           setProductImages(restoredImages);

//           // Create preview URLs
//           const urls = restoredImages.map((file: File) =>
//             URL.createObjectURL(file)
//           );
//           setImagePreviewUrls(urls);
//         }

//         // Restore flashSaleDetails if present
//         if (draftData.flashSaleDetails)
//           setFlashSaleDetails(draftData.flashSaleDetails);

//         // Restore video from base64 if present
//         if (draftData.uploadedVideoInfo?.base64) {
//           const videoFile = base64ToFile(
//             draftData.uploadedVideoInfo.base64,
//             draftData.uploadedVideoInfo.name || "video"
//           );
//           setUploadedVideoInfo({
//             ...draftData.uploadedVideoInfo,
//             file: videoFile,
//           });
//         }
//       } catch (error) {
//         console.error("Error loading draft:", error);
//       }
//     }
//   }, []);

//   // Add auto-save effect
//   useEffect(() => {
//     if (isDirty) {
//       const timer = setTimeout(() => {
//         saveDraft();
//       }, 2000); // Save after 2 seconds of inactivity

//       return () => clearTimeout(timer);
//     }
//   }, [
//     productName,
//     value,
//     activeCategory,
//     subCategory,
//     subSubCategory,
//     quantity,
//     sku,
//     price,
//     shippingprice,
//     productImages,
//     youtubeUrl,
//     youtubeEmbedUrl,
//     uploadedVideoInfo,
//     selectedCategories,
//     isDirty,
//   ]);

//   const handleCategoryChange = (category: string) => {
//     if (category && selectedCategories.includes(category)) {
//       setActiveCategory(category);
//       const firstSubCategory = subCategories[category]?.[0] || "";
//       setSubCategory(firstSubCategory);
//       setSubSubCategory("");
//     }
//   };

//   const handleDescriptionFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files?.length > 0) {
//       const file = e.target?.files[0];
//       if (file.type === "text/plain") {
//         setDescriptionFileName(file.name);
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           if (event.target?.result) setValue(event.target.result as string);
//         };
//         reader.readAsText(file);
//       } else {
//         toast.error("Please upload a .txt file for description", {
//           position: "top-right",
//           autoClose: 4000,
//         });
//       }
//     }
//   };

//   const removeDescriptionFile = () => setDescriptionFileName("");

//   const handleVideoInfoUpdate = (
//     info: {
//       name?: string;
//       size?: number;
//       type?: string;
//       thumbnailUrl?: string;
//       file?: File;
//     } | null
//   ) => {
//     setUploadedVideoInfo(info);
//   };

//   // Update the saveDraft function
//   const saveDraft = async () => {
//     setIsLoading(true);

//     try {
//       // Convert images to base64 for storage
//       const imagePreviewsWithBase64 = await Promise.all(
//         productImages.map(async (file) => {
//           return {
//             name: file.name,
//             type: file.type,
//             size: file.size,
//             lastModified: file.lastModified,
//             base64: await fileToBase64(file),
//           };
//         })
//       );

//       // Convert video to base64 if present
//       let videoBase64 = null;
//       if (uploadedVideoInfo?.file) {
//         videoBase64 = {
//           ...uploadedVideoInfo,
//           base64: await fileToBase64(uploadedVideoInfo.file),
//         };
//       }

//       const draftData = {
//         productName,
//         description: value,
//         descriptionFileName,
//         activeCategory,
//         subCategory,
//         subSubCategory,
//         quantity,
//         sku,
//         price,
//         shippingprice,
//         vendorCountry,
//         youtubeUrl,
//         youtubeEmbedUrl,
//         uploadedVideoInfo: videoBase64,
//         imagePreviewsWithBase64, // Save the base64 versions
//         selectedCategories,
//         flashSaleDetails,
//         listingType,
//         auctionDetails,

//         // Don't try to save File objects directly
//       };

//       localStorage.setItem("productDraft", JSON.stringify(draftData));
//       // toast.success("Draft saved successfully!", {
//       //   position: "top-right",
//       //   autoClose: 3000,
//       // });
//     } catch (error) {
//       console.error("Error saving draft:", error);
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Failed to save draft. Please try again.",
//         {
//           position: "top-right",
//           autoClose: 4000,
//         }
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDiscard = () => {
//     if (isDirty) setShowDiscardConfirm(true);
//     else discardChanges();
//   };

//   const discardChanges = () => {
//     localStorage.removeItem("productDraft");
//     setProductName("");
//     setValue("");
//     setDescriptionFileName("");
//     setActiveCategory(defaultCategory);
//     setSubCategory(defaultSubCategory);
//     setSubSubCategory("");
//     setQuantity("0");
//     setSku("");
//     setPrice("");
//     setShippingPrice("");
//     setProductImages([]);
//     setImagePreviewUrls([]);
//     setYoutubeUrl("");
//     setYoutubeEmbedUrl("");
//     setUploadedVideoInfo(null);
//     setSelectedCategories([defaultCategory, "Jewelry and Gemstones"]);
//     toast.success("Changes discarded successfully", {
//       position: "top-right",
//       autoClose: 3000,
//     });
//   };

//   const handleSaveDraft = () => saveDraft();

//   const resetForm = () => {
//     setProductName("");
//     setValue("");
//     setDescriptionFileName("");
//     setActiveCategory(defaultCategory);
//     setSubCategory(defaultSubCategory);
//     setSubSubCategory("");
//     setQuantity("0");
//     setSku("");
//     setPrice("");
//     setShippingPrice("");
//     setProductImages([]);
//     setImagePreviewUrls([]);
//     setYoutubeUrl("");
//     setYoutubeEmbedUrl("");
//     setUploadedVideoInfo(null);
//     setSelectedCategories([defaultCategory, "Jewelry and Gemstones"]);
//     setIsDirty(false);
//   };

//   const handleAddProduct = async () => {
//     // // Require bank account details before allowing upload
//     // const hasBankAccountFlag = Boolean(vendors?.bankAccount);
//     // const hasBankFields = Boolean(
//     //   vendors?.accountName && vendors?.accountNumber && vendors?.bankName
//     // );
//     // if (!hasBankAccountFlag && !hasBankFields) {
//     //   setShowBankAccountPopup(true);
//     //   return;
//     // }

//     // if (!vendors?.returnPolicy) {
//     //   setShowReturnPolicyPopup(true);
//     //   return;
//     // }

//     // if (products?.length === 5) {
//     //   const vendorPlan = vendors?.subscription?.currentPlan;
//     //   if (vendorPlan === "Starter") {
//     //     const vendorCategories = vendors?.craftCategories || [];
//     //     Swal.fire({
//     //       title: "Plan Limit Reached",
//     //       text: `Sorry, your ${vendorPlan} plan limits you to 5 product uploads. Kindly upgrade to Starter Plus.`,
//     //       icon: "warning",
//     //       confirmButtonText: "Upgrade Now",
//     //     }).then(() => {
//     //       navigate("/app/upgrade", {
//     //         state: {
//     //           plan: "Starter plus",
//     //           selectedCategories: vendorCategories,
//     //           maxCategories: 1,
//     //         },
//     //       });
//     //     });
//     //   }
//     // }

//     setIsLoading(true);

//     try {
//       if (!productName.trim()) throw new Error("Product name is required");
//       if (!activeCategory) throw new Error("Please select a category");
//       if (!subCategory || subCategory === "")
//         throw new Error("Please select a subcategory");

//       /* ----------  inventory / quantity validation  ---------- */
//       // Inventory/quantity is required for sales, auction and flash sale
//       let inventoryRaw: number;
//       if (listingType === "auction") {
//         inventoryRaw = Number(auctionDetails.Inventory);
//       } else {
//         inventoryRaw = Number(quantity);
//       }

//       if (isNaN(inventoryRaw))
//         throw new Error("Please enter a valid inventory / quantity");
//       if (inventoryRaw < 0) throw new Error("Inventory cannot be negative");

//       /* ----------  price validation  ---------- */
//       const toNumber = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0;
//       const numericPrice =
//         listingType === "auction"
//           ? toNumber(auctionDetails.startingPrice)
//           : toNumber(price);
//       if (isNaN(numericPrice)) throw new Error("Please enter a valid price");

//       if (productImages.length === 0)
//         throw new Error("Please upload at least one product image");

//       /* ----------  flash sale validation  ---------- */
//       if (listingType === "flash sale") {
//         // Ensure original price exists for flash sale validations
//         if (!price || isNaN(toNumber(price)) || toNumber(price) <= 0) {
//           throw new Error("Please enter a valid original price for flash sale");
//         }
//         if (!flashSaleDetails.flashSalePrice.trim())
//           throw new Error("Flash sale price is required");
//         if (!flashSaleDetails.flashSaleStartDate)
//           throw new Error("Flash sale start date is required");
//         if (!flashSaleDetails.flashSaleEndDate)
//           throw new Error("Flash sale end date is required");

//         const flashPrice = toNumber(flashSaleDetails.flashSalePrice);
//         const regularPrice = toNumber(price);
//         console.log(flashPrice >= regularPrice);
//         if (flashPrice >= regularPrice)
//           throw new Error("Flash sale price must be lower than regular price");

//         const startDate = new Date(flashSaleDetails.flashSaleStartDate);
//         const endDate = new Date(flashSaleDetails.flashSaleEndDate);
//         const now = new Date();
//         now.setHours(0, 0, 0, 0);
//         if (startDate < now)
//           throw new Error("Flash sale start date must be in the future");
//         if (endDate < now)
//           throw new Error("Flash sale end date must be in the future");
//         if (endDate <= startDate)
//           throw new Error("Flash sale end date must be after start date");
//       }

//       /* ----------  build FormData  ---------- */
//       const formData = new FormData();

//       /* --- core fields (always sent where applicable) --- */
//       formData.append("name", productName);
//       formData.append("description", value);
//       formData.append("category", activeCategory);
//       formData.append("sub_category", subCategory);
//       formData.append("sub_category2", subSubCategory);
//       if (inventoryRaw !== undefined && inventoryRaw !== null) {
//         formData.append("inventory", String(inventoryRaw));
//       }
//       formData.append("sku", sku);

//       /* --- product type flag --- */
//       formData.append("productType", listingType); // "sales" | "auction"

//       /* --- pricing / auction fields --- */
//       if (listingType === "sales") {
//         const shipFee = toNumber(shippingprice);
//         if (isNaN(shipFee))
//           throw new Error("Please enter a valid shipping fee");

//         formData.append("price", toNumber(price).toString());
//         formData.append("shippingfee", shipFee.toString());
//       } else if (listingType === "auction") {
//         formData.append("startingPrice", numericPrice.toString());
//         formData.append(
//           "reservePrice",
//           toNumber(auctionDetails.reservePrice).toString()
//         );
//         formData.append("auctionDuration", auctionDetails.auctionDuration);
//         formData.append(
//           "auctionStartDate",
//           new Date(auctionDetails.auctionstartTime).toISOString()
//         );
//         formData.append("shippingfee", "0");
//       } else if (listingType === "flash sale") {
//         // originalPrice is required by backend; use the regular price value here
//         formData.append("originalPrice", toNumber(price).toString());
//         formData.append("price", toNumber(price).toString());
//         // Flash sale does not require shipping price; set shipping fee to 0
//         formData.append("shippingfee", "0");
//         formData.append(
//           "flashSalePrice",
//           toNumber(flashSaleDetails.flashSalePrice).toString()
//         );
//         formData.append(
//           "flashSaleStartDate",
//           flashSaleDetails.flashSaleStartDate
//         );
//         formData.append("flashSaleEndDate", flashSaleDetails.flashSaleEndDate);
//         // Compute and append flashSaleDiscount (avoid NaN)
//         const rp = toNumber(price); // regular price
//         const fp = toNumber(flashSaleDetails.flashSalePrice);
//         if (!isNaN(rp) && rp > 0 && !isNaN(fp) && fp >= 0 && fp < rp) {
//           const discount = Math.round(((rp - fp) / rp) * 100);
//           formData.append("flashSaleDiscount", discount.toString());
//         }
//       }

//       /* --- media --- */
//       productImages.forEach((image) => formData.append("images", image));

//       if (uploadedVideoInfo?.file) {
//         formData.append("upload_type", "upload");
//         formData.append("product_video", uploadedVideoInfo.file);
//       } else if (youtubeEmbedUrl) {
//         formData.append("upload_type", "link");
//         formData.append("product_video", youtubeEmbedUrl);
//       }

//       await uploadVendorProduct(user.token, formData);
//       localStorage.removeItem("productDraft");
//       toast.success("Product added successfully!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       resetForm();
//     } catch (error) {
//       console.error("Error adding product:", error);
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Failed to add product. Please try again.",
//         { position: "top-right", autoClose: 4000 }
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   console.log(flashSaleDetails);

//   const getCurrentTheme = () => {
//     if (!activeCategory)
//       return {
//         primary: "orange-500",
//         secondary: "orange-100",
//         accent: "orange-700",
//       };
//     return categoryThemes[activeCategory];
//   };

//   const isUpgraded =
//     vendorPlan === "Shelves" ||
//     vendorPlan === "Counter" ||
//     vendorPlan === "Shop" ||
//     vendorPlan === "Premium";

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest(".relative")) {
//         setShowCategoryDropdown(false);
//         setShowListingTypeDropdown(false);
//       }
//     };

//     if (showCategoryDropdown || showListingTypeDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showCategoryDropdown, showListingTypeDropdown]);

//   useEffect(() => {
//     // Set initial category based on vendor's craftCategories — but do not override restored draft
//     const hasDraft = !!localStorage.getItem("productDraft");
//     // console.log("has", localStorage.getItem("productDraft"));
//     if (hasDraft) return; // If draft exists, do not override draft values with vendor defaults

//     if (vendors?.craftCategories && vendors.craftCategories?.length > 0) {
//       const firstCategory = vendors.craftCategories[0];
//       // Only set activeCategory if it is empty or not included in vendor categories
//       if (
//         !activeCategory ||
//         !vendors.craftCategories.includes(activeCategory)
//       ) {
//         setActiveCategory(firstCategory);
//         const firstSubCategory = subCategories[firstCategory]?.[0] || "";
//         setSubCategory(firstSubCategory);
//       }
//       // Only set selectedCategories if user hasn't restored a draft with categories
//       const noSelectedCategoriesSaved =
//         !selectedCategories ||
//         selectedCategories.length === 0 ||
//         selectedCategories.every((c) => !c || c === defaultCategory);
//       if (noSelectedCategoriesSaved) {
//         setSelectedCategories(vendors.craftCategories);
//       }
//     }
//   }, [vendors?.craftCategories]);

//   return (
//     <motion.div
//       className="max-w-full min-h-screen p-4 space-y-6 overflow-x-hidden bg-gray-100 sm:p-6"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <ToastContainer />
//       {/* <BankAccountPopup
//         showBankAccountPopup={showBankAccountPopup}
//         setShowBankAccountPopup={setShowBankAccountPopup}
//       /> */}
//       <div className="flex flex-col justify-between gap-3 p-4 mb-6 bg-white rounded-lg shadow sm:flex-row sm:items-center">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//           <h1 className="text-xl font-bold sm:text-2xl">New Product</h1>

//           {/* Category Dropdown - only show if vendor has multiple categories */}
//           {vendors?.craftCategories && vendors.craftCategories?.length > 1 && (
//             <div className="relative">
//               <button
//                 onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
//                 className="flex items-center w-full gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
//               >
//                 <span className="truncate">
//                   Categories ({vendors.craftCategories?.length})
//                 </span>
//                 <motion.div
//                   animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   <ChevronDown className="flex-shrink-0 w-4 h-4" />
//                 </motion.div>
//               </button>

//               <AnimatePresence>
//                 {showCategoryDropdown && (
//                   <motion.div
//                     className="absolute left-0 z-10 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full"
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <div className="p-2">
//                       <div className="px-2 mb-2 text-xs text-gray-500">
//                         Your Categories:
//                       </div>
//                       {vendors.craftCategories.map(
//                         (category: string, index: number) => (
//                           <button
//                             key={index}
//                             onClick={() => {
//                               setActiveCategory(category);
//                               const firstSubCategory =
//                                 subCategories[category]?.[0] || "";
//                               setSubCategory(firstSubCategory);
//                               setSubSubCategory("");
//                               setShowCategoryDropdown(false);
//                             }}
//                             className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm flex items-center justify-between ${
//                               activeCategory === category
//                                 ? "bg-blue-50 text-blue-600"
//                                 : ""
//                             }`}
//                           >
//                             <span>{category}</span>
//                             {activeCategory === category && (
//                               <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
//                                 Active
//                               </span>
//                             )}
//                           </button>
//                         )
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           )}

//           {/*  =====  Listing Type Dropdown (custom)  =====  */}
//           <div className="relative" role="listbox" aria-label="Listing type">
//             <button
//               onClick={() => setShowListingTypeDropdown((v) => !v)}
//               className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
//               aria-haspopup="listbox"
//               aria-expanded={showListingTypeDropdown}
//             >
//               <span>
//                 {listingType === "sales"
//                   ? "Regular"
//                   : listingType === "auction"
//                   ? "Auction"
//                   : "Flash Sale"}
//               </span>
//               <motion.div
//                 animate={{ rotate: showListingTypeDropdown ? 180 : 0 }}
//                 transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
//               >
//                 <ChevronDown className="w-4 h-4" />
//               </motion.div>
//             </button>

//             <AnimatePresence>
//               {showListingTypeDropdown && (
//                 <motion.div
//                   className="absolute left-0 z-10 w-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full"
//                   initial={{ opacity: 0, y: -8, scale: 0.98 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -8, scale: 0.98 }}
//                   transition={{
//                     type: "tween",
//                     duration: 0.15,
//                     ease: "easeOut",
//                   }}
//                 >
//                   <div className="p-1">
//                     <button
//                       className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
//                         listingType === "sales"
//                           ? "bg-blue-50 text-blue-600"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         setListingType("sales");
//                         setShowListingTypeDropdown(false);
//                       }}
//                       role="option"
//                       aria-selected={listingType === "sales"}
//                     >
//                       Regular
//                     </button>
//                     <button
//                       className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
//                         listingType === "auction"
//                           ? "bg-blue-50 text-blue-600"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         setListingType("auction");
//                         setShowListingTypeDropdown(false);
//                       }}
//                       role="option"
//                       aria-selected={listingType === "auction"}
//                     >
//                       Auction
//                     </button>
//                     <button
//                       className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
//                         listingType === "flash sale"
//                           ? "bg-blue-50 text-blue-600"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         setListingType("flash sale");
//                         setShowListingTypeDropdown(false);
//                       }}
//                       role="option"
//                       aria-selected={listingType === "flash sale"}
//                     >
//                       Flash Sale
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {selectedCategories?.length > 0 && !isUpgraded && (
//           <CategorySelector
//             selectedCategories={selectedCategories}
//             activeCategory={activeCategory}
//             handleCategoryChange={handleCategoryChange}
//             vendorPlan={vendorPlan}
//             selectedSubCategory={subCategory}
//             setSelectedSubCategory={setSubCategory}
//             selectedSubSubCategory={subSubCategory}
//             setSelectedSubSubCategory={setSubSubCategory}
//           />
//         )}
//       </div>

//       {!isUpgraded && activeCategory && (
//         <CategorySpecificUI
//           activeCategory={activeCategory}
//           getCurrentTheme={getCurrentTheme}
//         />
//       )}

//       <div className="space-y-6">
//         <div className="p-4 bg-white rounded-lg shadow">
//           <h2 className="pb-2 mb-4 text-lg font-semibold border-b">
//             Basic Information
//           </h2>
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <DescriptionSection
//               productName={productName}
//               value={value}
//               descriptionFileName={descriptionFileName}
//               setProductName={setProductName}
//               setValue={setValue}
//               removeDescriptionFile={removeDescriptionFile}
//               handleDescriptionFileUpload={handleDescriptionFileUpload}
//             />
//             <ImageUploader
//               productImages={productImages}
//               imagePreviewUrls={imagePreviewUrls}
//               setProductImages={setProductImages}
//               setImagePreviewUrls={setImagePreviewUrls}
//             />
//           </div>
//         </div>

//         <div className="p-4 bg-white rounded-lg shadow">
//           <h2 className="pb-2 mb-4 text-lg font-semibold border-b">
//             Categories and Media
//           </h2>
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             {isUpgraded ? (
//               <CategorySelector
//                 selectedCategories={selectedCategories}
//                 activeCategory={activeCategory}
//                 handleCategoryChange={handleCategoryChange}
//                 vendorPlan={vendorPlan}
//                 selectedSubCategory={subCategory}
//                 setSelectedSubCategory={setSubCategory}
//                 selectedSubSubCategory={subSubCategory}
//                 setSelectedSubSubCategory={setSubSubCategory}
//               />
//             ) : (
//               <motion.div
//                 className="p-4 space-y-4 bg-white border rounded-lg"
//                 initial={{ x: -50, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 <h2 className="text-lg font-semibold">Subcategory</h2>
//                 <motion.select
//                   className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                   value={subCategory}
//                   onChange={(e) => setSubCategory(e.target.value)}
//                   required
//                 >
//                   {activeCategory &&
//                     subCategories[activeCategory]?.map((subCat) => (
//                       <option key={subCat} value={subCat}>
//                         {subCat}
//                       </option>
//                     ))}
//                 </motion.select>
//               </motion.div>
//             )}

//             <VideoUploader
//               youtubeUrl={youtubeUrl}
//               youtubeEmbedUrl={youtubeEmbedUrl}
//               showYoutubeInput={showYoutubeInput}
//               setYoutubeUrl={setYoutubeUrl}
//               setYoutubeEmbedUrl={setYoutubeEmbedUrl}
//               setShowYoutubeInput={setShowYoutubeInput}
//               onVideoInfoUpdate={handleVideoInfoUpdate}
//               uploadedVideoInfo={uploadedVideoInfo}
//             />
//           </div>
//         </div>
//       </div>
//       <div className="p-4 bg-white rounded-lg shadow">
//         <h2 className="pb-2 mb-4 text-lg font-semibold border-b">
//           {listingType === "sales"
//             ? "Inventory and Pricing"
//             : listingType === "auction"
//             ? "Auction Settings"
//             : "Flash Sale Settings"}
//         </h2>

//         {listingType === "sales" ? (
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             <div className="space-y-4 md:col-span-2">
//               <h3 className="font-medium">Inventory</h3>
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-1 text-sm text-gray-600">
//                     Quantity
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="Quantity"
//                     className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     min="0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm text-gray-600">
//                     SKU (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="SKU"
//                     className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                     value={sku}
//                     onChange={(e) => setSku(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="font-medium">Pricing</h3>
//               <div>
//                 <label className="block mb-1 text-sm text-gray-600">
//                   Product Price
//                 </label>
//                 <CurrencyInput
//                   value={price}
//                   onChange={setPrice}
//                   country="Nigeria"
//                 />
//               </div>
//             </div>

//             <div className="space-y-4">
//               <label className="block mb-1 text-sm text-gray-600">
//                 Shipping fee
//               </label>
//               <CurrencyInput
//                 value={shippingprice}
//                 onChange={setShippingPrice}
//                 country="Nigeria"
//               />
//             </div>
//           </div>
//         ) : listingType === "auction" ? (
//           /* =====  AUCTION  ===== */
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Starting Price *
//               </label>
//               <CurrencyInput
//                 value={auctionDetails.startingPrice}
//                 onChange={(v) =>
//                   setAuctionDetails({ ...auctionDetails, startingPrice: v })
//                 }
//                 country="Nigeria"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Reserve Price (Optional)
//               </label>
//               <CurrencyInput
//                 value={auctionDetails.reservePrice}
//                 onChange={(v) =>
//                   setAuctionDetails({ ...auctionDetails, reservePrice: v })
//                 }
//                 country="Nigeria"
//               />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Inventory
//               </label>
//               <input
//                 type="number"
//                 placeholder="Inventory"
//                 className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                 onChange={(e) =>
//                   setAuctionDetails({
//                     ...auctionDetails,
//                     Inventory: Number(e.target.value),
//                   })
//                 }
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Auction Duration *
//               </label>
//               <select
//                 className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                 value={auctionDetails.auctionDuration}
//                 onChange={(e) =>
//                   setAuctionDetails({
//                     ...auctionDetails,
//                     auctionDuration: e.target.value,
//                   })
//                 }
//               >
//                 <option value="" disabled>
//                   Select duration
//                 </option>
//                 <option value="1">1 day</option>
//                 <option value="3">3 days</option>
//                 <option value="5">5 days</option>
//                 <option value="7">7 days</option>
//                 <option value="10">10 days</option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Auction StartTime
//               </label>

//               <input
//                 type="date"
//                 onChange={(e) =>
//                   setAuctionDetails({
//                     ...auctionDetails,
//                     auctionstartTime: e.target.value,
//                   })
//                 }
//                 className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//               />
//             </div>
//           </div>
//         ) : (
//           /* =====  FLASH SALE  ===== */
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div className="space-y-4 md:col-span-2">
//               <h3 className="font-medium">Original Price</h3>
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-1 text-sm text-gray-600">
//                     Original Product Price
//                   </label>
//                   <CurrencyInput
//                     value={price}
//                     onChange={setPrice}
//                     country="Nigeria"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm text-gray-600">
//                     Inventory
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="Inventory"
//                     className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     min="0"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="font-medium">Flash Sale Details</h3>
//               <div>
//                 <label className="block mb-1 text-sm text-gray-600">
//                   Flash Sale Price *
//                 </label>
//                 <CurrencyInput
//                   value={flashSaleDetails.flashSalePrice}
//                   onChange={(v) =>
//                     setFlashSaleDetails({
//                       ...flashSaleDetails,
//                       flashSalePrice: v,
//                     })
//                   }
//                   country="Nigeria"
//                 />
//               </div>
//             </div>

//             <div className="mt-10">
//               <label className="block mb-1 text-sm text-gray-600">
//                 Flash Sale Start Date *
//               </label>

//               <input
//                 type="date"
//                 onChange={(e) =>
//                   setFlashSaleDetails({
//                     ...flashSaleDetails,
//                     flashSaleStartDate: e.target.value,
//                   })
//                 }
//                 className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//               />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm text-gray-600">
//                 Flash Sale End Date *
//               </label>

//               <input
//                 type="date"
//                 onChange={(e) =>
//                   setFlashSaleDetails({
//                     ...flashSaleDetails,
//                     flashSaleEndDate: e.target.value,
//                   })
//                 }
//                 className="w-full p-2 border border-orange-500 rounded outline-orange-500"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col justify-end p-4 space-y-3 bg-white rounded-lg shadow sm:flex-row sm:space-y-0 sm:space-x-4">
//         <button
//           className="order-3 px-4 py-2 text-red-500 border border-orange-500 rounded-lg sm:order-1"
//           onClick={handleDiscard}
//           // disabled={isLoading}
//         >
//           Discard
//         </button>
//         <button
//           className="flex items-center justify-center order-2 px-4 py-2 text-white bg-red-500 rounded-lg"
//           onClick={handleSaveDraft}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <>
//               <svg
//                 className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Saving...
//             </>
//           ) : (
//             "Save Draft"
//           )}
//         </button>
//         <button
//           className="flex items-center justify-center order-1 px-4 py-2 text-white bg-green-500 rounded-lg sm:order-3"
//           onClick={handleAddProduct}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <>
//               <svg
//                 className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Adding...
//             </>
//           ) : (
//             "Add Product"
//           )}
//         </button>
//       </div>

//       <AnimatePresence>
//         {/* {showReturnPolicyPopup && (
//           <ReturnPolicyPopup
//             showReturnPolicyPopup={showReturnPolicyPopup}
//             setShowReturnPolicyPopup={setShowReturnPolicyPopup}
//             returnPolicyRef={returnPolicyRef}
//           />
//         )} */}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showDiscardConfirm && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//             <motion.div
//               className="w-full max-w-md overflow-hidden bg-white rounded-lg"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ type: "spring", damping: 25, stiffness: 300 }}
//             >
//               <div className="p-6">
//                 <div className="mb-4">
//                   <h2 className="text-xl font-semibold text-red-500">
//                     Discard Changes?
//                   </h2>
//                   <p className="mt-2 text-gray-600">
//                     You have unsaved changes. Are you sure you want to discard
//                     them? This action cannot be undone.
//                   </p>
//                 </div>
//                 <div className="flex justify-end space-x-3">
//                   <button
//                     className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg"
//                     onClick={() => setShowDiscardConfirm(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="px-4 py-2 text-white bg-red-500 rounded-lg"
//                     onClick={() => {
//                       setShowDiscardConfirm(false);
//                       discardChanges();
//                     }}
//                   >
//                     Discard Changes
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default NewProduct;

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost, get_communities, getAllVendor } from "@/services/adminApi";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// interface Vendor {
//   _id: string;
//   storeName: string;
//   avatar?: string;
// }

// interface Community {
//   _id: string;
//   name: string;
//   community_Images?: string;
// }

interface VendorItem {
  _id: string;
  storeName: string;
  avatar?: string;
  name?: string;
}

interface CommunityItem {
  _id: string;
  name: string;
  community_Images?: string;
  storeName?: string;
}

interface Tag {
  id: string;
  type: "vendors" | "community";
  name: string;
  avatar?: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagType, setTagType] = useState<"vendor" | "community">("vendor");

  const admin = useSelector((state: RootState) => state.admin);

  // Fetch vendors and communities
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getAllVendor(admin?.token),
    enabled: !!admin?.token,
  });

  const { data: communities = [], isLoading: isLoadingCommunities } = useQuery({
    queryKey: ["communities"],
    queryFn: () => get_communities(),
  });
const queryClient = useQueryClient();
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => createPost(formData, admin?.token),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["mbaay_community"] });
      setContent("");
      setSelectedFiles([]);
      setSelectedTags([]);
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleTagToggle = (
    id: string,
    type: "vendor" | "community",
    name: string,
    avatar?: string
  ) => {
    // Convert to backend enum values
    const backendType = type === "vendor" ? "vendors" : "community";
    
    setSelectedTags((prev) => {
      const existing = prev.find((tag) => tag.id === id);
      if (existing) {
        return prev.filter((tag) => tag.id !== id);
      } else {
        return [...prev, { id, type: backendType as "vendors" | "community", name, avatar }];
      }
    });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      alert("Post content cannot be empty.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("content", trimmedContent);
      // formData.append("posterType", "admin");
      formData.append("posterId", admin?.admin?.id || "");

      // Add tags
      if (selectedTags.length > 0) {
        selectedTags.forEach((tag, index) => {
          formData.append(`tags[${index}][tagId]`, tag.id);
          formData.append(`tags[${index}][tagType]`, tag.type);
        });
      }

      // Add images
      selectedFiles.forEach((file) => {
        formData.append("posts_Images", file);
      });

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log("FROM", formData.values());
      await createPostMutation.mutateAsync(formData);
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create post. Please try again.";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  console.log("comm", communities);
  const filteredItems =
    Array.isArray(vendors) || Array.isArray(communities)
      ? (tagType === "vendor" ? vendors : communities)?.filter(
          (item: VendorItem | CommunityItem) =>
            item.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
      : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl">
              <div className="p-4 border-b">
                <motion.button
                  onClick={onClose}
                  className="absolute text-white top-4 left-4"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h2 className="text-lg font-semibold text-center">
                  Create Community Post
                </h2>
              </div>

              <div className="p-4">
                <form onSubmit={handlePost} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 font-semibold text-white bg-orange-500 rounded-full">
                      A
                    </div>
                    <div>
                      <h3 className="font-semibold">Admin</h3>
                      <p className="text-sm text-gray-600">
                        Community Administrator
                      </p>
                    </div>
                  </div>

                  <textarea
                    placeholder="Share your thoughts with the community..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-3 text-gray-700 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full ${
                            tag.type === "vendors"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {tag.avatar ? (
                            <img
                              src={tag.avatar}
                              alt={tag.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-5 h-5 text-xs bg-gray-300 rounded-full">
                              {tag.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          @{tag.name}
                          <span className="text-xs opacity-75">
                            ({tag.type === "vendors" ? "vendor" : tag.type})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleTagToggle(
                                tag.id,
                                tag.type === "vendors" ? "vendor" : "community",
                                tag.name,
                                tag.avatar
                              )
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Images ({selectedFiles.length})
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => setSelectedFiles([])}
                          className="px-3 py-1 text-xs text-gray-600 transition-colors rounded-full hover:text-gray-800 hover:bg-gray-100"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear All
                        </motion.button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-24 h-24 transition-shadow duration-300 rounded-lg shadow-md group-hover:shadow-xl"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute w-6 h-6 text-white transition-colors bg-red-500 rounded-full shadow-lg opacity-0 -top-2 -right-2 hover:bg-red-600 group-hover:opacity-100"
                            >
                              ×
                            </button>
                            <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded bottom-1 left-1">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-4">
                      <motion.button
                        type="button"
                        onClick={() => setShowTagSelector(!showTagSelector)}
                        className="flex items-center p-2 space-x-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Users className="w-6 h-6" />
                        <span>Tag</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() =>
                          document.getElementById("file-input")?.click()
                        }
                        className="flex items-center p-2 space-x-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ImageIcon className="w-6 h-6" />
                        <span>Image</span>
                      </motion.button>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isUploading || createPostMutation.isPending}
                      className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                        isUploading || createPostMutation.isPending
                          ? "bg-orange-400 text-white cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                      whileHover={!isUploading ? { scale: 1.02 } : {}}
                      whileTap={!isUploading ? { scale: 0.98 } : {}}
                    >
                      {isUploading || createPostMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Posting...</span>
                        </div>
                      ) : (
                        "Post"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Tag Selector Modal */}
          {showTagSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed z-50 bg-white border rounded-lg shadow-xl top-24 left-4 right-4 md:left-auto md:right-4 md:top-24 md:w-80"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Tag Users</h3>
                  <button
                    onClick={() => setShowTagSelector(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => setTagType("vendor")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tagType === "vendor"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Vendors
                  </button>
                  <button
                    onClick={() => setTagType("community")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tagType === "community"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Communities
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Search ${tagType}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 mt-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="p-4 overflow-y-auto max-h-64">
                {isLoadingVendors || isLoadingCommunities ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No {tagType}s found
                  </div>
                ) : (
                  filteredItems.map((item: VendorItem | CommunityItem) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        const name =
                          tagType === "vendor"
                            ? (item as VendorItem).storeName ||
                              (item as VendorItem).name ||
                              "Unknown"
                            : (item as CommunityItem).name ||
                              (item as CommunityItem).storeName ||
                              "Unknown";
                        const avatar =
                          tagType === "vendor"
                            ? (item as VendorItem).avatar
                            : (item as CommunityItem).community_Images;

                        handleTagToggle(item._id, tagType, name, avatar);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {tagType === "vendor" ? (
                          (item as VendorItem).avatar ? (
                            <img
                              src={(item as VendorItem).avatar!}
                              alt={
                                (item as VendorItem).storeName ||
                                (item as VendorItem).name ||
                                "Vendor"
                              }
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 text-sm bg-gray-300 rounded-full">
                              {(
                                (item as VendorItem).storeName ||
                                (item as VendorItem).name ||
                                "V"
                              )
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )
                        ) : (item as CommunityItem).community_Images ? (
                          <img
                            src={(item as CommunityItem).community_Images!}
                            alt={
                              (item as CommunityItem).name ||
                              (item as CommunityItem).storeName ||
                              "Community"
                            }
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 text-sm bg-gray-300 rounded-full">
                            {(
                              (item as CommunityItem).name ||
                              (item as CommunityItem).storeName ||
                              "C"
                            )
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {tagType === "vendor"
                              ? (item as VendorItem).storeName ||
                                (item as VendorItem).name ||
                                "Unknown"
                              : (item as CommunityItem).name ||
                                (item as CommunityItem).storeName ||
                                "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">{tagType}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedTags.some(
                          (tag) => tag.id === item._id
                        )}
                        onChange={() => {}}
                        className="w-4 h-4 text-orange-500"
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </AnimatePresence>
  );
}

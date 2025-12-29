import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatePostModal from "./CreatePostModal";
import EditMbaayCommunityModal from "./EditMbaayCommunityModal";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getMbaayCommunity } from "@/services/adminApi";
import { RootState } from "@/components/redux/store";

export default function MbaayCommunity() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.admin);
  const role = admin?.role;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["mbaay_community"],
    queryFn: () => getMbaayCommunity(admin?.token),
    enabled: !!admin?.token,
  });

  const community = data?.data;
  console.log("m", community);
  const members: any[] = community?.members || [];
  const communityPosts = community?.communityPosts || [];

  // // Empty state component for no membersN
  // const EmptyMembersState = () => (
  //   <div className="flex flex-col items-center justify-center py-8 text-center">
  //     <div className="mb-4">
  //       <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
  //         <svg
  //           className="w-8 h-8 text-orange-500"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           stroke="currentColor"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
  //           />
  //         </svg>
  //       </div>
  //       <h4 className="mb-2 text-sm font-semibold text-gray-900">
  //         No Members Yet
  //       </h4>
  //       <p className="max-w-xs text-xs text-gray-600">
  //         Start inviting users to join the Mbaay community to see them here.
  //       </p>
  //     </div>
  //     <motion.button
  //       whileHover={{ scale: 1.05 }}
  //       whileTap={{ scale: 0.95 }}
  //       onClick={() => refetch()}
  //       className="px-4 py-2 text-xs font-medium text-orange-600 transition-colors rounded-full bg-orange-50 hover:bg-orange-100"
  //     >
  //       Refresh Community
  //     </motion.button>
  //   </div>
  // );

  // // Empty state component for no posts
  // const EmptyPostsState = () => (
  //   <div className="flex flex-col items-center justify-center py-8 text-center">
  //     <div className="mb-4">
  //       <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
  //         <svg
  //           className="w-8 h-8 text-orange-500"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           stroke="currentColor"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
  //           />
  //         </svg>
  //       </div>
  //       <h4 className="mb-2 text-sm font-semibold text-gray-900">
  //         No Posts Yet
  //       </h4>
  //       <p className="max-w-xs text-xs text-gray-600">
  //         Be the first to share something with the community or wait for others
  //         to post.
  //       </p>
  //     </div>
  //     <motion.button
  //       whileHover={{ scale: 1.05 }}
  //       whileTap={{ scale: 0.95 }}
  //       onClick={() => setIsModalOpen(true)}
  //       className="px-4 py-2 text-xs font-medium text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
  //     >
  //       Create Your First Post
  //     </motion.button>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
        <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-6 py-3 border border-orange-200 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Official Community
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-5xl font-bold text-transparent md:text-7xl bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text"
            >
              Mbaay Community
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-4xl mx-auto mt-6 text-xl leading-relaxed text-gray-600 md:text-2xl"
            >
              Connecting cultural enthusiasts and artisans worldwide. Share your
              passion, discover new talents, and be part of something beautiful.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{members.length} active members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{communityPosts.length} community posts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Global community</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Members */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-1"
          >
            {/* Community Stats Card */}
            <div className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Community Stats
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-orange-500 hover:bg-orange-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-700">
                    {members.length}
                  </div>
                  <div className="text-sm text-orange-600">Members</div>
                </div>
                <div className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-700">
                    {communityPosts.length}
                  </div>
                  <div className="text-sm text-orange-600">Posts</div>
                </div>
              </div>
            </div>

            {/* Active Members */}
            <div className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Active Members
              </h3>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-3 bg-gray-300 rounded" />
                        <div className="w-1/2 h-2 bg-gray-300 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="mb-3 text-sm text-red-600">
                    Failed to load members
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => refetch()}
                    className="px-3 py-1 text-xs font-medium text-red-600 transition-colors rounded-full bg-red-50 hover:bg-red-100"
                  >
                    Try Again
                  </motion.button>
                </div>
              ) : members.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No members yet
                </div>
              ) : (
                <div className="space-y-3">
                  {members.slice(0, 6).map((m) => (
                    <motion.div
                      key={m?._id || m}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-orange-50"
                    >
                      {m?.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m?.storeName || m?.name || "U"}
                          className="w-10 h-10 rounded-full ring-2 ring-orange-200"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full shadow-sm bg-gradient-to-br from-orange-400 to-orange-600">
                          {(m?.storeName || m?.name || String(m))
                            .toString()
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {m?.storeName || m?.name || m}
                        </div>
                        {m?.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {m.email}
                          </div>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </motion.div>
                  ))}
                  {members.length > 6 && (
                    <div className="py-2 text-sm text-center text-gray-500">
                      +{members.length - 6} more members
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content - Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Create Post CTA */}
            <div className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share with the Community
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Start a conversation or share something inspiring
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl hover:-translate-y-1"
                >
                  Create Post
                </motion.button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl animate-pulse"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-300 rounded-full w-14 h-14" />
                          <div className="flex-1 space-y-4">
                            <div className="w-1/3 h-4 bg-gray-300 rounded" />
                            <div className="w-2/3 h-6 bg-gray-300 rounded" />
                            <div className="h-20 bg-gray-300 rounded" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center bg-white border border-orange-100 shadow-lg rounded-2xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                      <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="mb-4 text-sm text-red-600">
                      Failed to load posts
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => refetch()}
                      className="px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-full bg-red-50 hover:bg-red-100"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : communityPosts.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-orange-100 shadow-lg rounded-2xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
                      <svg
                        className="w-8 h-8 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">
                      No Posts Yet
                    </h4>
                    <p className="max-w-md mb-6 text-gray-600">
                      Be the first to share something with the community or wait
                      for others to post.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl hover:-translate-y-1"
                    >
                      Create Your First Post
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {communityPosts.slice().reverse().map((post: any) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="p-6 transition-shadow duration-300 bg-white border border-orange-100 shadow-lg rounded-2xl hover:shadow-xl"
                      >
                        {/* Post Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center text-lg font-bold text-white rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600">
                              M
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {community?.name || "Mbaay Community"}
                              </h4>
                              <span className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
                                Official
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Community Post
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(post.createdTime).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-6">
                          <p className="text-lg leading-relaxed text-gray-700">
                            {post.content}
                          </p>
                        </div>

                        {/* Post Images */}
                        {post.posts_Images && post.posts_Images.length > 0 && (
                          <div className="mb-6">
                            <div className="grid grid-cols-2 gap-3">
                              {post.posts_Images
                                .slice(0, 4)
                                .map((image: string, index: number) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={image}
                                      alt={`Post image ${index + 1}`}
                                      className="object-cover w-full h-48 transition-shadow duration-300 rounded-lg shadow-md group-hover:shadow-xl"
                                    />
                                    {index === 3 &&
                                      post.posts_Images.length > 4 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                          <span className="text-2xl font-bold text-white">
                                            +{post.posts_Images.length - 4}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Post Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag: any, index: number) => (
                              <span
                                key={index}
                                className="px-4 py-2 text-sm font-medium text-orange-700 transition-colors bg-orange-100 rounded-full cursor-pointer hover:bg-orange-200"
                              >
                                #{tag.tagType}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-orange-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span className="font-medium">
                                {post.likes?.length || 0} likes
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-orange-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span className="font-medium">
                                {post.comments?.length || 0} comments
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-orange-600 transition-colors rounded-full bg-orange-50 hover:bg-orange-100 hover:text-orange-700"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              Like
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-orange-600 transition-colors rounded-full bg-orange-50 hover:bg-orange-100 hover:text-orange-700"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              Comment
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Sidebar - Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6 lg:col-span-1"
          >
            {/* About Card */}
            <div className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                About Mbaay
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {community?.description ||
                  "The official Mbaay community - a vibrant space where cultural enthusiasts, artisans, and creatives come together to share, inspire, and connect."}
              </p>

              {/* Edit Button */}
              {
                role === "Super Admin" &&  (
                     <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-3 mt-3 font-medium text-white transition-all duration-300 transform rounded-md shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl hover:-translate-y-1 text-center text-[15px]"
                >
                  Edit Connunity Profile
                </motion.button>
                )
              }
            </div>

            {/* Quick Stats */}
            <div className="p-6 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-lg font-bold text-orange-600">
                    {members.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="text-lg font-bold text-orange-600">
                    {communityPosts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <span className="text-sm text-gray-600">Community Age</span>
                  <span className="text-sm text-gray-500">
                    {community?.createdAt
                      ? Math.floor(
                          (Date.now() -
                            new Date(community.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + " days"
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Create Post CTA */}
            <div className="p-6 text-white shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold">
                  Join the Conversation
                </h3>
                <p className="mb-4 text-sm text-orange-100">
                  Share your thoughts and connect with the community
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 font-semibold text-orange-600 transition-all duration-300 transform bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Create Post
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditMbaayCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialName={community?.name || ""}
        initialDescription={community?.description || ""}
        initialImage={community?.community_Images || ""}
      />
    </div>
  );
}

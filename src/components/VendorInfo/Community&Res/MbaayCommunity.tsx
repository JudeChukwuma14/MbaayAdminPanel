import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatePostModal from "./CreatePostModal";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getMbaayCommunity } from "@/services/adminApi";
import { RootState } from "@/components/redux/store";

export default function MbaayCommunity() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.admin);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["mbaay_community"],
    queryFn: () => getMbaayCommunity(admin?.token),
    enabled: !!admin?.token,
  });

  const community = data?.data;
  const members: any[] = community?.members || [];

  // Empty state component for no members
  const EmptyMembersState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4">
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h4 className="mb-2 text-sm font-semibold text-gray-900">
          No Members Yet
        </h4>
        <p className="max-w-xs text-xs text-gray-600">
          Start inviting users to join the Mbaay community to see them here.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => refetch()}
        className="px-4 py-2 text-xs font-medium text-orange-600 transition-colors rounded-full bg-orange-50 hover:bg-orange-100"
      >
        Refresh Community
      </motion.button>
    </div>
  );

  // Empty state component for no posts
  const EmptyPostsState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4">
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
        <h4 className="mb-2 text-sm font-semibold text-gray-900">
          No Posts Yet
        </h4>
        <p className="max-w-xs text-xs text-gray-600">
          Be the first to share something with the community or wait for others
          to post.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-xs font-medium text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
      >
        Create Your First Post
      </motion.button>
    </div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 lg:gap-6 p-4 min-h-screen max-w-full">
        {/* Left Sidebar - Members */}
        <div className="order-3 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white border border-orange-100 shadow-lg rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Community Members
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs text-gray-500 rounded-full bg-orange-50">
                  {members.length} members
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  className="p-1 text-gray-400 transition-colors rounded-full hover:text-orange-500 hover:bg-orange-50"
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
            </div>

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
              <EmptyMembersState />
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <motion.div
                    key={m?._id || m}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100 hover:shadow-md"
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
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {m?.storeName || m?.name || m}
                      </div>
                      {m?.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {m.email}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          className="order-2 lg:order-2 space-y-4 lg:space-y-6 overflow-visible lg:overflow-y-auto lg:max-h-[calc(100vh-2rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Community Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white border border-orange-100 shadow-lg rounded-xl"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {community?.name || "Mbaay Community"}
                  </h1>
                </div>
                <p className="max-w-2xl leading-relaxed text-gray-600">
                  {community?.description ||
                    "Connecting cultural enthusiasts and artisans worldwide. Share your passion, discover new talents, and be part of something beautiful."}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 p-4 rounded-lg bg-orange-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {members.length}
                  </div>
                  <div className="text-xs text-gray-600">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {community?.communityPosts?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-orange-100">
              <div className="text-xs text-gray-500">
                Created:{" "}
                {community?.createdAt
                  ? new Date(community.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-orange-600 transition-colors border border-orange-200 rounded-full bg-orange-50 hover:bg-orange-100"
              >
                Refresh Community
              </motion.button>
            </div>
          </motion.div>

          {/* Community Posts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-orange-100 shadow-lg rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
                Community Posts
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs text-gray-500 rounded-full bg-orange-50">
                  {community?.communityPosts?.length || 0} posts
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {community?.communityPosts &&
              community.communityPosts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-sm text-gray-600 border border-orange-200 rounded-lg bg-orange-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Posts Management</span>
                  </div>
                  <p>
                    Community posts are managed through the main community
                    interface. Visit the community dashboard to view, create,
                    and manage posts.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 py-1 text-xs font-medium text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
                    >
                      Create Post
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 text-xs font-medium text-orange-600 transition-colors bg-orange-100 rounded-full hover:bg-orange-200"
                    >
                      View All Posts
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <EmptyPostsState />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Sidebar - About */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-1 w-full mx-auto lg:order-3 lg:max-w-md lg:min-h-screen"
        >
          <div className="p-4 bg-white border border-orange-100 shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                About Mbaay
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                className="p-1 text-gray-400 transition-colors rounded-full hover:text-orange-500 hover:bg-orange-50"
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

            <div className="space-y-4">
              <div>
                <p className="text-sm leading-relaxed text-gray-600">
                  {community?.description ||
                    "The official Mbaay community - a vibrant space where cultural enthusiasts, artisans, and creatives come together to share, inspire, and connect."}
                </p>
              </div>

              <div className="pt-4 border-t border-orange-100">
                <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                  <span>Community Stats</span>
                  <span className="text-xs text-gray-400">Updated</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <div className="text-lg font-bold text-orange-600">
                      {members.length}
                    </div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50">
                    <div className="text-lg font-bold text-orange-600">
                      {community?.communityPosts?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Posts</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-orange-100">
                <div className="mb-2 text-xs text-gray-500">Created</div>
                <div className="text-sm font-medium text-gray-700">
                  {community?.createdAt
                    ? new Date(community.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Unknown"}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 mt-2 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  Create Community Post
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

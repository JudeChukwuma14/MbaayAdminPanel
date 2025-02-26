"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import CreatePostModal from "./CreatePostModal";
import SocialList from "./SocailPost";

interface Recommendation {
  id: string;
  name: string;
  mutuals: number;
  avatar: string;
}

interface Topic {
  id: string;
  name: string;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    name: "James Chariton",
    mutuals: 8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Madio Mane",
    mutuals: 15,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Javier Afritin",
    mutuals: 12,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Terry Jones",
    mutuals: 15,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const topics: Topic[] = [
  { id: "1", name: "Design" },
  { id: "2", name: "Beauty & Skincare" },
  { id: "3", name: "Photography" },
  { id: "4", name: "Marketing" },
];

interface User {
  id: string;
  name: string;
  category: string;
  avatar: string;
  following?: boolean;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  replies: Comment[];
}

interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  hashtags: string[];
}

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

function Avatar({ src, alt, size = "sm" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary";
}

function Badge({ children, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-orange-100 text-orange-600",
    secondary: "bg-gray-100 text-gray-600",
  };

  return (
    <motion.span
      className={`${variantClasses[variant]} text-xs px-2.5 py-0.5 rounded-full font-medium`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
}

export default function SocialFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendors] = useState<User[]>([
    {
      id: "1",
      name: "Taiwo Abdulazeez",
      category: "Beauty and SkinCare",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-11%20155402-wwKdVWRsVk3GSf9hj0qFBrLAejWRnq.png",
      following: true,
    },
    {
      id: "2",
      name: "James Charlton",
      category: "Fashion",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-11%20155402-wwKdVWRsVk3GSf9hj0qFBrLAejWRnq.png",
      following: false,
    },
    {
      id: "3",
      name: "Anya Gerald",
      category: "Arts and Culture",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-11%20155402-wwKdVWRsVk3GSf9hj0qFBrLAejWRnq.png",
      following: false,
    },
    ...Array(10)
      .fill(null)
      .map((_, index) => ({
        id: `${index + 4}`,
        name: `Vendor ${index + 4}`,
        category: "Various",
        avatar:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-11%20155402-wwKdVWRsVk3GSf9hj0qFBrLAejWRnq.png",
        following: false,
      })),
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: vendors[0],
      content:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.",
      timestamp: "3 hours ago",
      likes: 3134,
      comments: [],
      hashtags: ["Tips", "BeautyandSkincare", "Productivity"],
    },
    ...Array(10)
      .fill(null)
      .map((_, index) => ({
        id: `${index + 2}`,
        author: vendors[Math.floor(Math.random() * vendors.length)],
        content:
          "This is a sample post content. It can be longer or shorter depending on the user's input.",
        timestamp: `${index + 1} hours ago`,
        likes: Math.floor(Math.random() * 1000),
        comments: [],
        hashtags: ["Sample", "Post", `Tag${index + 1}`],
      })),
  ]);

  const [showEmojiPicker, setShowEmojiPicker] = useState<
    Record<string, boolean>
  >({});
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now().toString(),
                  author: vendors[0], // Assuming the current user is the first vendor
                  content,
                  timestamp: "Just now",
                  reactions: [],
                  replies: [],
                },
              ],
            }
          : post
      )
    );
  };

  // const handleReply = (postId: string, commentId: string, content: string) => {
  //   setPosts(
  //     posts.map((post) =>
  //       post.id === postId
  //         ? {
  //             ...post,
  //             comments: post.comments.map((comment) =>
  //               comment.id === commentId
  //                 ? {
  //                     ...comment,
  //                     replies: [
  //                       ...comment.replies,
  //                       {
  //                         id: Date.now().toString(),
  //                         author: vendors[0], // Assuming the current user is the first vendor
  //                         content,
  //                         timestamp: "Just now",
  //                         reactions: [],
  //                         replies: [],
  //                       },
  //                     ],
  //                   }
  //                 : comment
  //             ),
  //           }
  //         : post
  //     )
  //   );
  // };

  const handleReaction = (postId: string, commentId: string, emoji: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      reactions: updateReactions(
                        comment.reactions,
                        emoji,
                        vendors[0].id
                      ),
                    }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const updateReactions = (
    reactions: Reaction[],
    emoji: string,
    userId: string
  ): Reaction[] => {
    const existingReaction = reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        // Remove user's reaction
        return reactions
          .map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count - 1,
                  users: r.users.filter((u) => u !== userId),
                }
              : r
          )
          .filter((r) => r.count > 0);
      } else {
        // Add user's reaction to existing emoji
        return reactions.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, users: [...r.users, userId] }
            : r
        );
      }
    } else {
      // Add new reaction
      return [...reactions, { emoji, count: 1, users: [userId] }];
    }
  };

  const handleEmojiSelect = (emojiData: EmojiClickData, postId: string) => {
    const input = document.querySelector(
      `input[data-post-id="${postId}"]`
    ) as HTMLInputElement;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = input.value;
      const newText =
        text.substring(0, start) + emojiData.emoji + text.substring(end);
      input.value = newText;
      input.focus();
      input.setSelectionRange(
        start + emojiData.emoji.length,
        start + emojiData.emoji.length
      );
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target as Node)
    ) {
      setShowEmojiPicker({});
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker, emojiPickerRef, handleClickOutside]); // Added handleClickOutside to dependencies

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-6 p-4 h-screen">
        {/* Left Sidebar */}
        {/* <motion.div
          className="space-y-6 overflow-y-auto max-h-[calc(100vh-2rem)]"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sticky top-0 bg-gray-50 z-10 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search People or Group"
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">VENDORS</h2>
            <motion.div className="space-y-3">
              {vendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={vendor.avatar} alt={vendor.name} />
                    <div>
                      <p className="text-sm font-medium">{vendor.name}</p>
                      <p className="text-xs text-gray-500">{vendor.category}</p>
                    </div>
                  </div>
                  <motion.button className="focus:outline-none" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <svg
                      className={`w-4 h-4 ${vendor.following ? "fill-red-500 stroke-red-500" : "stroke-gray-400"}`}
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
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div> */}
        <SocialList />

        {/* Main Content */}
        <motion.div
          className="space-y-6 overflow-y-auto max-h-[calc(100vh-2rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="bg-white rounded-lg shadow p-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <Avatar src={post.author.avatar} alt={post.author.name} />
                  <div>
                    <h3 className="font-semibold">{post.author.name}</h3>
                    <p className="text-sm text-gray-500">
                      {post.author.category} • {post.timestamp}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                </motion.button>
              </div>

              <p className="text-sm mb-4">{post.content}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <motion.button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 hover:text-red-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className={`w-4 h-4 ${
                      post.likes > 0 ? "fill-red-500 stroke-red-500" : ""
                    }`}
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
                  <span>{post.likes.toLocaleString()}</span>
                </motion.button>
                <span>{post.comments.length} Comments</span>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {post.comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    className="mt-4 bg-gray-50 p-3 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        size="sm"
                      />
                      <div className="flex-grow">
                        <p className="text-sm font-medium">
                          {comment.author.name}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{comment.timestamp}</span>
                          <motion.button
                            className="hover:text-gray-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reply
                          </motion.button>
                        </div>
                        {/* Comment Reactions */}
                        <div className="flex items-center gap-1 mt-1">
                          {comment.reactions.map((reaction) => (
                            <motion.button
                              key={reaction.emoji}
                              className="text-sm hover:bg-gray-200 rounded-full px-2 py-1"
                              onClick={() =>
                                handleReaction(
                                  post.id,
                                  comment.id,
                                  reaction.emoji
                                )
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {reaction.emoji} {reaction.count}
                            </motion.button>
                          ))}
                          <motion.button
                            className="text-sm hover:bg-gray-200 rounded-full px-2 py-1"
                            onClick={() =>
                              setShowEmojiPicker((prev) => ({
                                ...prev,
                                [comment.id]: !prev[comment.id],
                              }))
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            😊
                          </motion.button>
                        </div>
                        {showEmojiPicker[comment.id] && (
                          <div ref={emojiPickerRef} className="absolute z-10">
                            <EmojiPicker
                              onEmojiClick={(emojiData) => {
                                handleReaction(
                                  post.id,
                                  comment.id,
                                  emojiData.emoji
                                );
                                setShowEmojiPicker((prev) => ({
                                  ...prev,
                                  [comment.id]: false,
                                }));
                              }}
                            />
                          </div>
                        )}
                        {/* Replies */}
                        <AnimatePresence>
                          {comment.replies.map((reply) => (
                            <motion.div
                              key={reply.id}
                              className="ml-6 mt-2 bg-white p-2 rounded-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <div className="flex items-start gap-2">
                                <Avatar
                                  src={reply.author.avatar}
                                  alt={reply.author.name}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {reply.author.name}
                                  </p>
                                  <p className="text-sm">{reply.content}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>{reply.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Comment Input */}
              <div className="mt-4 flex items-center gap-2">
                <Avatar
                  src={vendors[0].avatar}
                  alt={vendors[0].name}
                  size="sm"
                />
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    data-post-id={post.id}
                    className="w-full p-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleComment(post.id, e.currentTarget.value);
                        e.currentTarget.value = "";
                        setShowEmojiPicker((prev) => ({
                          ...prev,
                          [post.id]: false,
                        }));
                      }
                    }}
                  />
                  <motion.button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      setShowEmojiPicker((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    😊
                  </motion.button>
                </div>
                {showEmojiPicker[post.id] && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-10 bottom-full right-0"
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        handleEmojiSelect(emojiData, post.id)
                      }
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Right Sidebar */}
        <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="font-semibold">Ogbonna Friskart</h2>
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-4 text-sm">
              <div className="text-center">
                <div className="font-bold">201</div>
                <div className="text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold">12</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold">17</div>
                <div className="text-gray-600">Following</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-orange-500 text-white py-2 rounded-md font-medium"
            >
              Create Post
            </motion.button>
          </motion.div>

          <div className="mt-4 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">RECOMMENDATION</h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-3"
            >
              {recommendations.map((recommendation) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={recommendation.avatar || "/placeholder.svg"}
                      alt={recommendation.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{recommendation.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {recommendation.mutuals} Mutuals
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="mt-4 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">TOPICS YOU FOLLOW</h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2"
            >
              {topics.map((topic) => (
                <motion.span
                  key={topic.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                >
                  {topic.name}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <CreatePostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

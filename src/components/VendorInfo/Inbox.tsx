import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Paperclip,
  Smile,
  SendIcon,
  Edit,
  Trash,
  Reply,
  Pin,
  X,
  Video,
  Play,
  Pause,
  Copy,
  Forward,
  ChevronRight,
  Save,
  VolumeX,
  Volume2,
  Maximize,
  // MessageSquare,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
// import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isVendor: boolean;
  files?: {
    type: "image" | "document" | "video";
    url: string;
    name: string;
    size: number;
    duration?: string;
  }[];
  replyTo?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  deletedFor: "none" | "me" | "everyone";
  unreadCount?: number;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isVendor: boolean;
  isOnline: boolean;
  messages: Message[];
  pinnedMessageId?: string;
  unreadCount: number;
}

interface DeleteDialogState {
  isOpen: boolean;
  messageId: string | null;
}

interface VideoPlayerState {
  isOpen: boolean;
  videoUrl: string | null;
}

interface ForwardDialogState {
  isOpen: boolean;
  messageId: string | null;
}

interface ImageViewerState {
  isOpen: boolean;
  images: { url: string; name: string }[];
  currentIndex: number;
}

const LOCAL_STORAGE_KEY = "chatInterfaceData";

interface StoredData {
  chats: Chat[];
  activeChat: string;
}

export default function ChatInterface() {
  const adminToken = useSelector((state: RootState) => state.admin.token);

  const API_CHAT_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/admin";
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    messageId: null,
  });
  const [deleteType, setDeleteType] = useState<"me" | "everyone">("me");
  const [videoPlayer, setVideoPlayer] = useState<VideoPlayerState>({
    isOpen: false,
    videoUrl: null,
  });
  const [forwardDialog, setForwardDialog] = useState<ForwardDialogState>({
    isOpen: false,
    messageId: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [imageViewer, setImageViewer] = useState<ImageViewerState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const fallbackStorage = useRef(new Map<string, string>());

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Fetch all customer care chats for the sidebar
  useEffect(() => {
    if (adminToken) {
      fetchCustomerCareChats();
    }
  }, [adminToken]);

  useEffect(() => {
    saveToLocalStorage();
  }, [chats, activeChat]);

  const isLocalStorageAvailable = () => {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchCustomerCareChats = async () => {
    try {
      const res = await axios.get(
        `${API_CHAT_BASE_URL}/customer_care_messages`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      console.log("Res", res);
      const raw = (res.data?.chats ||
        res.data?.data ||
        res.data ||
        []) as any[];
      const mapped: Chat[] = raw.map((c: any) => {
        const last =
          c.lastMessage ||
          c.latestMessage ||
          c.messages?.[c.messages?.length - 1] ||
          {};
        return {
          id: c._id || c.id,
          name:
            c.user?.name ||
            c.customer?.name ||
            c.vendor?.name ||
            c.title ||
            "Conversation",
          avatar:
            c.user?.avatar || c.customer?.avatar || c.vendor?.avatar || "",
          lastMessage: last.content || last.text || "",
          timestamp: new Date(
            c.updatedAt || last.createdAt || Date.now()
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isVendor: !!c.vendor,
          isOnline: Boolean(c.user?.isOnline || c.customer?.isOnline || false),
          messages: Array.isArray(c.messages)
            ? c.messages.map((m: any) => ({
                id: m._id || m.id,
                content: m.content || m.text || "",
                sender: m.senderName || m.sender?.name || "User",
                timestamp: new Date(
                  m.createdAt || Date.now()
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isVendor: !!m.isVendor,
                deletedFor: "none",
              }))
            : [],
          pinnedMessageId: undefined,
          unreadCount: typeof c.unreadCount === "number" ? c.unreadCount : 0,
        } as Chat;
      });
      setChats(mapped);
      if (mapped.length && !activeChat) {
        setActiveChat(mapped[0].id);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch customer care chats:",
        error.response?.data || error.message
      );
    }
  };

  const loadFromLocalStorage = () => {
    let storedData: StoredData | null = null;
    if (isLocalStorageAvailable()) {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
          storedData = JSON.parse(data);
        }
      } catch (error) {
        console.error("Failed to load from localStorage:", error);
      }
    }

    if (!storedData) {
      storedData = loadFallback();
    }

    if (storedData) {
      setChats(storedData.chats);
      setActiveChat(storedData.activeChat);
    } else {
      initializeDefaultData();
    }
  };

  const saveToLocalStorage = () => {
    const dataToStore: StoredData = {
      chats,
      activeChat,
    };
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        if (
          error instanceof DOMException &&
          (error.name === "QuotaExceededError" ||
            error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          showFeedback(
            "Local storage is full. Your changes may not persist across sessions."
          );
        } else {
          showFeedback(
            "Unable to save data locally. Your changes may not persist."
          );
        }
        saveFallback(dataToStore);
      }
    } else {
      console.warn("localStorage is not available. Using fallback storage.");
      saveFallback(dataToStore);
      showFeedback(
        "Unable to use local storage. Your changes may not persist across sessions."
      );
    }
  };

  const saveFallback = (data: StoredData) => {
    try {
      fallbackStorage.current.set(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to fallback storage:", error);
      showFeedback("Unable to save data. Your changes may not persist.");
    }
  };

  const loadFallback = (): StoredData | null => {
    const data = fallbackStorage.current.get(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error("Failed to parse fallback data:", error);
        return null;
      }
    }
    return null;
  };

  const initializeDefaultData = () => {
    const defaultChats: Chat[] = [
      {
        id: "1",
        name: "Ricky Smith",
        avatar:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-11%20170005-w7p56CC6KmLQ43N0vioZq5pqM0k03k.png",
        lastMessage: "Hi!, How are You? 👋",
        timestamp: "2 min ago",
        isVendor: true,
        isOnline: true,
        unreadCount: 3,
        messages: [
          {
            id: "1",
            content: "Hi!, How are You? 👋",
            sender: "Ricky Smith",
            timestamp: "11:00AM",
            isVendor: true,
            deletedFor: "none",
          },
        ],
      },
      {
        id: "2",
        name: "Sarah Johnson",
        avatar: "",
        lastMessage: "When will my order arrive?",
        timestamp: "30 min ago",
        isVendor: false,
        isOnline: false,
        unreadCount: 1,
        messages: [
          {
            id: "1",
            content: "When will my order arrive?",
            sender: "Sarah Johnson",
            timestamp: "10:30AM",
            isVendor: false,
            deletedFor: "none",
          },
        ],
      },
    ];
    setChats(defaultChats);
    setActiveChat("1");
  };

  const activeMessages =
    chats.find((chat) => chat.id === activeChat)?.messages || [];
  const activeChatDetails = chats.find((chat) => chat.id === activeChat);
  const pinnedMessage = activeChatDetails?.messages.find(
    (msg) => msg.id === activeChatDetails.pinnedMessageId
  );

  useEffect(() => {
    scrollToBottom();
  }, [chats, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 5); // Limit to 5 files
      const fileReaders = newFiles.map((file) => {
        return new Promise<{
          type: "image" | "document";
          url: string;
          name: string;
          size: number;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              type: file.type.startsWith("image/") ? "image" : "document",
              url: reader.result as string,
              name: file.name,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(fileReaders).then((fileData) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: `Sent ${fileData.length} ${
            fileData.length === 1 ? "file" : "files"
          }`,
          sender: "You",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isVendor: false,
          files: fileData,
          replyTo: replyingTo || undefined,
          deletedFor: "none",
        };
        addMessageToChat(newMessage);
        setReplyingTo(null);
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const durationString = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;

          const newMessage: Message = {
            id: Date.now().toString(),
            content: `Video: ${file.name}`,
            sender: "You",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isVendor: false,
            files: [
              {
                type: "video",
                url: reader.result as string,
                name: file.name,
                size: file.size,
                duration: durationString,
              },
            ],
            replyTo: replyingTo || undefined,
            deletedFor: "none",
          };
          addMessageToChat(newMessage);
          setReplyingTo(null);
          URL.revokeObjectURL(video.src);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isVendor: false,
        replyTo: replyingTo || undefined,
        deletedFor: "none",
      };
      addMessageToChat(newMessage);
      setMessage("");
      setReplyingTo(null);
      setShowEmojiPicker(false);
    }
  };

  const addMessageToChat = (newMessage: Message) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: `You: ${newMessage.content.slice(0, 20)}${
              newMessage.content.length > 20 ? "..." : ""
            }`,
            timestamp: "Just now",
            unreadCount: 0, // Reset unread count when admin sends a message
          };
        } else if (newMessage.sender !== "You") {
          // Increment unread count for other chats when receiving a message
          return {
            ...chat,
            unreadCount: chat.unreadCount + 1,
          };
        }
        return chat;
      })
    );
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    // Reset unread count when selecting a chat
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  // ... (keep all other existing handler functions)

  const handleForwardMessage = (targetChatId: string) => {
    if (!forwardDialog.messageId) return;
    const messageToForward = activeMessages.find(
      (msg) => msg.id === forwardDialog.messageId
    );
    if (!messageToForward) return;

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === targetChatId) {
          const forwardedMessage: Message = {
            ...messageToForward,
            id: Date.now().toString(),
            sender: "You",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            replyTo: undefined,
            isVendor: false,
            deletedFor: "none",
          };
          return {
            ...chat,
            messages: [...chat.messages, forwardedMessage],
            lastMessage: `You: ${forwardedMessage.content.slice(0, 20)}${
              forwardedMessage.content.length > 20 ? "..." : ""
            }`,
            timestamp: "Just now",
            unreadCount: 0,
          };
        }
        return chat;
      })
    );
    setForwardDialog({ isOpen: false, messageId: null });
    showFeedback("Message forwarded!");
  };

  const handleDeleteClick = (messageId: string) => {
    setDeleteDialog({ isOpen: true, messageId });
    setDeleteType("me");
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, messageId: null });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.messageId) return;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === deleteDialog.messageId
                ? {
                    ...msg,
                    deletedFor: deleteType === "everyone" ? "everyone" : "me",
                  }
                : msg
            ),
          };
        }
        return chat;
      })
    );
    setDeleteDialog({ isOpen: false, messageId: null });
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    setShowEmojiPicker(false);
    setEditingMessageId(null);
  };

  const handleForward = (messageId: string) => {
    setForwardDialog({ isOpen: true, messageId });
  };

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => showFeedback("Copied to clipboard!"),
        () => showFeedback("Failed to copy text.")
      );
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showFeedback("Copied to clipboard!");
      } catch {
        showFeedback("Failed to copy text.");
      }
      document.body.removeChild(textarea);
    }
  };

  const handlePin = (messageId: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat) {
          const isCurrentlyPinned = chat.pinnedMessageId === messageId;
          return {
            ...chat,
            pinnedMessageId: isCurrentlyPinned ? undefined : messageId,
            messages: chat.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, isPinned: !isCurrentlyPinned }
                : { ...msg, isPinned: false }
            ),
          };
        }
        return chat;
      })
    );
  };

  const handleEdit = (messageId: string) => {
    setEditingMessageId(messageId);
    const msg = activeMessages.find((m) => m.id === messageId);
    if (msg) {
      setMessage(msg.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editingMessageId) return;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === editingMessageId
                ? {
                    ...msg,
                    content: message,
                    isEdited: true,
                  }
                : msg
            ),
            lastMessage: `You: ${message.slice(0, 20)}${
              message.length > 20 ? "..." : ""
            }`,
            timestamp: "Just now",
          };
        }
        return chat;
      })
    );
    setEditingMessageId(null);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const handleViewImages = (
    images: { url: string; name: string }[],
    index: number = 0
  ) => {
    setImageViewer({
      isOpen: true,
      images,
      currentIndex: index,
    });
  };

  const handleNextImage = () => {
    setImageViewer((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const handlePrevImage = () => {
    setImageViewer((prev) => ({
      ...prev,
      currentIndex:
        (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayVideo = (videoUrl: string) => {
    setVideoPlayer({
      isOpen: true,
      videoUrl,
    });
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setIsMuted(false);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  const handleSaveVideo = (videoUrl: string) => {
    // Download the video file
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Video saved!");
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayer({
      isOpen: false,
      videoUrl: null,
    });
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsMuted(false);
  };

  const handleToggleFullscreen = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } else if ((videoElement as any).webkitRequestFullscreen) {
          (videoElement as any).webkitRequestFullscreen();
        } else if ((videoElement as any).mozRequestFullScreen) {
          (videoElement as any).mozRequestFullScreen();
        } else if ((videoElement as any).msRequestFullscreen) {
          (videoElement as any).msRequestFullscreen();
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white border-r w-80"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <motion.button className="p-2 rounded-full hover:bg-gray-100">
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search message"
              className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full p-4 flex items-start gap-3 border-b relative ${
                  activeChat === chat.id ? "bg-orange-50" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{chat.name}</p>
                      <span className="text-xs text-orange-500">
                        {chat.isVendor ? "Vendor" : "Customer"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="absolute px-2 py-1 text-xs font-bold text-white transform -translate-y-1/2 bg-orange-500 rounded-full right-4 top-1/2">
                    {chat.unreadCount}
                  </span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {activeChat ? (
          <>
            {/* Chat Header */}
            {activeChatDetails && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-white border-b"
              >
                <div className="relative">
                  <img
                    src={activeChatDetails.avatar || "/placeholder.svg"}
                    alt={activeChatDetails.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {activeChatDetails.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{activeChatDetails.name}</h2>
                  <span className="text-xs text-green-500">
                    {activeChatDetails.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Pinned Message */}
            {pinnedMessage && (
              <div className="flex items-center justify-between p-2 bg-orange-100">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-orange-500" />
                  <p className="text-sm text-orange-700 truncate">
                    {pinnedMessage.content}
                  </p>
                </div>
                <motion.button
                  onClick={() => handlePin(pinnedMessage.id)}
                  className="text-orange-500 hover:text-orange-700"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className="p-2 text-center text-green-800 bg-green-100">
                {feedbackMessage}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence>
                {activeMessages.length > 0 ? (
                  activeMessages
                    .filter(
                      (msg) =>
                        msg.deletedFor !== "everyone" && msg.deletedFor !== "me"
                    )
                    .map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-3 mb-4 ${
                          msg.isVendor ? "" : "justify-end"
                        }`}
                      >
                        {msg.isVendor && activeChatDetails && (
                          <img
                            src={activeChatDetails.avatar || "/placeholder.svg"}
                            alt={msg.sender}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div
                          className={`max-w-[70%] ${
                            msg.isVendor ? "order-2" : "order-1"
                          }`}
                        >
                          {msg.replyTo && (
                            <div className="p-2 mb-1 text-sm text-gray-600 bg-gray-100 rounded-t-lg">
                              Replying to:{" "}
                              {activeMessages
                                .find((m) => m.id === msg.replyTo)
                                ?.content.slice(0, 50)}
                              ...
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              msg.isVendor
                                ? "bg-white border"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {msg.files && msg.files.length > 0 && (
                              <div className="mb-2">
                                {msg.files[0].type === "image" ? (
                                  <div className="grid gap-2">
                                    {msg.files.length <= 4 ? (
                                      <div
                                        className={`grid ${
                                          msg.files.length === 1
                                            ? "grid-cols-1"
                                            : msg.files.length === 2
                                            ? "grid-cols-2"
                                            : "grid-cols-2"
                                        } gap-2`}
                                      >
                                        {msg.files.map((file, i) => (
                                          <div
                                            key={i}
                                            className="relative overflow-hidden rounded-lg cursor-pointer aspect-square"
                                            onClick={() =>
                                              handleViewImages(
                                                msg
                                                  .files!.filter(
                                                    (f) => f.type === "image"
                                                  )
                                                  .map((f) => ({
                                                    url: f.url,
                                                    name: f.name,
                                                  })),
                                                i
                                              )
                                            }
                                          >
                                            <img
                                              src={file.url}
                                              alt={file.name}
                                              className="object-cover w-full h-full"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-2">
                                        {msg.files
                                          .slice(0, 4)
                                          .map((file, i) => (
                                            <div
                                              key={i}
                                              className="relative overflow-hidden rounded-lg cursor-pointer aspect-square"
                                              onClick={() =>
                                                handleViewImages(
                                                  msg
                                                    .files!.filter(
                                                      (f) => f.type === "image"
                                                    )
                                                    .map((f) => ({
                                                      url: f.url,
                                                      name: f.name,
                                                    })),
                                                  i
                                                )
                                              }
                                            >
                                              <img
                                                src={file.url}
                                                alt={file.name}
                                                className="object-cover w-full h-full"
                                              />
                                              {i === 3 &&
                                                msg.files &&
                                                msg.files.length > 4 && (
                                                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white bg-black bg-opacity-50">
                                                    +{msg.files.length - 4}
                                                  </div>
                                                )}
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                ) : msg.files[0].type === "video" ? (
                                  <div className="relative">
                                    <div
                                      className="relative overflow-hidden bg-black rounded-lg cursor-pointer"
                                      onClick={() =>
                                        msg.files &&
                                        handlePlayVideo(msg.files[0].url)
                                      }
                                    >
                                      <video
                                        src={msg.files[0].url}
                                        className="w-full"
                                        poster={msg.files[0].url}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                        <Play className="w-12 h-12 text-white" />
                                      </div>
                                      <div className="absolute text-sm text-white bottom-2 left-2">
                                        {msg.files[0].duration}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    {msg.files.map((file, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 p-2 rounded bg-white/10"
                                      >
                                        <Paperclip className="w-4 h-4" />
                                        <span>
                                          {file.name} (
                                          {formatFileSize(file.size)})
                                        </span>
                                        <button
                                          onClick={() =>
                                            window.open(file.url, "_blank")
                                          }
                                          className="ml-2 text-blue-500 hover:text-blue-700"
                                        >
                                          View
                                        </button>
                                        <a
                                          href={file.url}
                                          download={file.name}
                                          className="ml-2 text-green-500 hover:text-green-700"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                              msg.isVendor ? "justify-start" : "justify-end"
                            }`}
                          >
                            {msg.timestamp}
                            {msg.isEdited && (
                              <span className="ml-1 text-gray-400">
                                (edited)
                              </span>
                            )}
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => handleReply(msg.id)}
                                className="relative hover:text-orange-500 group"
                              >
                                <Reply className="w-4 h-4" />
                                <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                  Reply
                                </span>
                              </button>
                              <button
                                onClick={() => handleCopyText(msg.content)}
                                className="relative hover:text-orange-500 group"
                              >
                                <Copy className="w-4 h-4" />
                                <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                  Copy
                                </span>
                              </button>
                              <button
                                onClick={() => handleForward(msg.id)}
                                className="relative hover:text-orange-500 group"
                              >
                                <Forward className="w-4 h-4" />
                                <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                  Forward
                                </span>
                              </button>
                              {!msg.isVendor && (
                                <>
                                  <button
                                    onClick={() => handleEdit(msg.id)}
                                    className="relative hover:text-orange-500 group"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                      Edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(msg.id)}
                                    className="relative hover:text-orange-500 group"
                                  >
                                    <Trash className="w-4 h-4" />
                                    <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                      Delete
                                    </span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handlePin(msg.id)}
                                className="relative hover:text-orange-500 group"
                              >
                                <Pin className="w-4 h-4" />
                                <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
                                  {msg.isPinned ? "Unpin" : "Pin"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                        {!msg.isVendor && (
                          <img
                            src="/placeholder.svg"
                            alt="You"
                            className="order-3 w-8 h-8 rounded-full"
                          />
                        )}
                      </motion.div>
                    ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <img
                        src="https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif"
                        alt="No messages"
                        className="w-64 h-64 mx-auto"
                      />
                      <h3 className="mt-4 text-xl font-semibold">
                        No messages yet
                      </h3>
                      <p className="text-gray-500">
                        Start the conversation with {activeChatDetails?.name}
                      </p>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="flex items-center justify-between p-2 bg-gray-100">
                <p className="text-sm text-gray-600">
                  Replying to:{" "}
                  {activeMessages
                    .find((m) => m.id === replyingTo)
                    ?.content.slice(0, 50)}
                  ...
                </p>
                <motion.button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Message Input */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative p-4 bg-white border-t"
            >
              <div className="flex items-center gap-2">
                <motion.input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                />
                <motion.input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </motion.button>
                <motion.button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Video className="w-5 h-5 text-gray-500" />
                </motion.button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      editingMessageId
                        ? "Edit message..."
                        : "Write Something..."
                    }
                    className="w-full py-2 pl-4 pr-10 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (editingMessageId
                        ? handleSaveEdit()
                        : handleSendMessage())
                    }
                  />
                  <motion.button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute p-1 transform -translate-y-1/2 rounded-full right-10 top-1/2 hover:bg-gray-200"
                  >
                    <Smile className="w-5 h-5 text-gray-500" />
                  </motion.button>
                  <motion.button
                    onClick={
                      editingMessageId ? handleSaveEdit : handleSendMessage
                    }
                    className="absolute p-1 text-white transform -translate-y-1/2 bg-orange-500 rounded-full right-2 top-1/2 hover:bg-orange-600"
                  >
                    <SendIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute right-0 mb-2 bg-white border rounded-lg shadow-lg bottom-full">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) =>
                      handleEmojiSelect(emojiObject.emoji)
                    }
                    autoFocusSearch={false}
                  />
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <img
                src="https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif"
                alt="Select a chat"
                className="w-64 h-64 mx-auto"
              />
              <h3 className="mt-4 text-xl font-semibold">No chat selected</h3>
              <p className="text-gray-500">
                Select a chat from the sidebar to start messaging
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-lg font-semibold">Delete message?</h3>
            <p className="mb-4 text-sm text-gray-600">
              You can delete messages for everyone or just for yourself.
            </p>
            <div className="mb-6 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deleteType"
                  value="me"
                  checked={deleteType === "me"}
                  onChange={() => setDeleteType("me")}
                  className="mr-2"
                />
                <span>Delete for me</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deleteType"
                  value="everyone"
                  checked={deleteType === "everyone"}
                  onChange={() => setDeleteType("everyone")}
                  className="mr-2"
                />
                <span>Delete for everyone</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Video Player */}
      {videoPlayer.isOpen && videoPlayer.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl p-4 bg-white rounded-lg aspect-video">
            <div className="absolute z-10 flex items-center gap-2 top-2 right-2">
              <motion.button
                onClick={() => handleSaveVideo(videoPlayer.videoUrl!)}
                className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <Save className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={handleCloseVideoPlayer}
                className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={videoPlayer.videoUrl}
                className="object-contain w-full h-full rounded-lg"
                onClick={handlePlayPause}
                controls
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleToggleMute}
                      className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <div className="text-sm text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={handleToggleFullscreen}
                      className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
                    >
                      <Maximize className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {imageViewer.isOpen && imageViewer.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl p-4 bg-white rounded-lg aspect-video">
            <div className="absolute z-10 flex items-center gap-2 top-2 right-2">
              <motion.button
                onClick={() =>
                  setImageViewer({
                    isOpen: false,
                    images: [],
                    currentIndex: 0,
                  })
                }
                className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="relative w-full h-full">
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={imageViewer.images[imageViewer.currentIndex].url}
                  alt={imageViewer.images[imageViewer.currentIndex].name}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              {imageViewer.images.length > 1 && (
                <>
                  <motion.button
                    onClick={handlePrevImage}
                    className="absolute p-2 text-white transform -translate-y-1/2 bg-gray-800 rounded-full left-4 top-1/2 hover:bg-gray-700"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </motion.button>
                  <motion.button
                    onClick={handleNextImage}
                    className="absolute p-2 text-white transform -translate-y-1/2 bg-gray-800 rounded-full right-4 top-1/2 hover:bg-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                  <div className="absolute left-0 right-0 flex justify-center bottom-4">
                    <div className="px-3 py-1 text-sm text-white bg-gray-800 bg-opacity-50 rounded-full">
                      {imageViewer.currentIndex + 1} /{" "}
                      {imageViewer.images.length}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forward Dialog */}
      {forwardDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-lg font-semibold">Forward Message</h3>
            <div className="overflow-y-auto max-h-96">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleForwardMessage(chat.id)}
                  className="flex items-center w-full gap-3 p-3 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{chat.name}</p>
                    <span className="text-xs text-orange-500">
                      {chat.isVendor ? "Vendor" : "Customer"}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() =>
                  setForwardDialog({ isOpen: false, messageId: null })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

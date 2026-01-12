import { useState, useRef, useMemo, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MessageCircle, Users, Clock, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateOrGetChat,
  useSearchContacts,
  useUnreadChatCount,
  useMarkChatAsRead,
} from "@/hook/userVendorQueries";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserChats } from "@/utils/vendorChatApi";
import { useSocket } from "./Inbox";


interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: string;
  isVendor: boolean;
  files?: any[];
  replyTo?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  deletedFor?: "none" | "me" | "everyone";
  isOptimistic?: boolean;
  isMe?: boolean;
  tempId?: string;
  status: "pending" | "delivered" | "read" | "failed";
  clientKey?: string;
}

interface Chat {
  _id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isVendor: any;
  isOnline: boolean;
  messages: Message[];
  pinnedMessages: {
    messageId: string;
    unpinTimestamp: number;
  }[];
}

interface Contact {
  _id: string;
  name: string;
  avatar?: string;
  isVendor: boolean;
  email?: string;
  storeName?: string;
  profileImage?: string;
}

interface ApiChat {
  _id: string;
  participants: {
    _id: string;
    name?: string;
    storeName?: string;
    profileImage?: string;
    avatar?: string;
    isVendor?: boolean;
    isOnline?: boolean;
  }[];
  lastMessage?: {
    content: string;
  };
  updatedAt?: string;
  messages?: Message[];
}

interface ChatListSidebarProps {
  chats: Chat[];
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  token: any;
  onNewChatCreated: (newChat: Chat) => void;
  typingMap: Record<string, boolean>;
  showOnMobile?: boolean;
}

// Utility functions
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const getInitials = (name: string) => {
  return `${name?.charAt(0)?.toUpperCase()}${
    name?.split(" ")[1]?.charAt(0)?.toUpperCase() || ""
  }`;
};

const getContactName = (contact: Contact) => {
  return contact?.storeName || contact?.name;
};

// Skeleton loading component
const ChatSkeleton = memo(() => (
  <div className="flex items-start gap-3 p-4 border-b animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
));


const ContactItem = memo(
  ({
    contact,
    onSelect,
  }: {
    contact: Contact;
    onSelect: (contact: Contact) => void;
  }) => (
    <button
      onClick={() => onSelect(contact)}
      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 border-b last:border-b-0"
    >
      <div className="relative">
        {contact.avatar ? (
          <img
            src={contact.avatar}
            alt={contact.name}
            className="object-cover w-8 h-8 rounded-full"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-200 rounded-full">
            {getInitials(getContactName(contact))}
          </div>
        )}
        <div
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            contact.isVendor ? "bg-orange-500" : "bg-blue-500"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-medium truncate">{getContactName(contact)}</p>
        <p className="text-xs text-gray-500 truncate">
          {contact.storeName ? "Vendor" : "User"}
        </p>
      </div>
    </button>
  )
);

// Memoized chat item component
const ChatItem = memo(
  ({
    chat,
    isActive,
    onSelect,

    typingMap, // ← rename prop to match parent
    itemRef,
    unread = 0,
  }: {
    chat: Chat;
    isActive: boolean;
    onSelect: (chatId: string) => void;

    typingMap: Record<string, boolean>; // ← correct type
    itemRef?: (el: HTMLButtonElement | null) => void;
    unread?: number;
  }) => {
    const isVendor = chat.isVendor === "vendors";
    const hasAvatar = chat.avatar && chat.avatar !== "/placeholder.svg";
    const lastLine =
      chat.lastMessage && chat.lastMessage.trim().length > 0
        ? chat.lastMessage
        : "No messages yet";

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(chat._id)}
        ref={itemRef}
        className={`w-full p-4 flex items-start gap-3 border-b transition-all duration-200 ${
          isActive
            ? "bg-orange-50/60 border-l-4 border-l-orange-500"
            : "hover:bg-gray-50"
        }`}
      >
        {/* avatar / online dot */}

        <div className="relative">
          {hasAvatar ? (
            <img
              src={chat.avatar}
              alt={chat.name}
              className="object-cover w-12 h-12 rounded-full ring-1 ring-gray-200"
              loading="lazy"
            />
          ) : (
            <div
              className={`flex items-center justify-center w-12 h-12 text-white rounded-full text-[17px] font-bold shadow ${
                isVendor
                  ? "bg-gradient-to-br from-orange-500 to-orange-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              {getInitials(chat.name)}
            </div>
          )}
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          )}
        </div>

        {/* text column */}

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-start justify-between">
            <div className="truncate">
              <p className="font-semibold text-gray-900 truncate">
                {chat.name}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isVendor
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isVendor ? "Vendor" : "User"}
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              {unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-2 text-xs font-semibold text-white bg-red-500 rounded-full">
                  {unread}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatTime(chat.timestamp)}
              </div>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gray-600 truncate">
            {lastLine}
          </p>

          {/* typing indicator */}
          {typingMap[chat._id] && (
            <span className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              typing…
            </span>
          )}
        </div>
      </motion.button>
    );
  }
);


export function ChatListSidebar({
  activeChat,
  setActiveChat,
  onNewChatCreated,
  typingMap,
  showOnMobile = false,
}: ChatListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatMode, setIsNewChatMode] = useState(false);

  const user = useSelector((state: any) => state.vendor);
  const { data: unreadData } = useUnreadChatCount(user?.vendor?._id);
  const unreadCount = Number(unreadData?.count || 0);
  const perChatUnread: Record<string, number> =
    (unreadData as any)?.chats || {};
  const markReadMutation = useMarkChatAsRead();

  const {
    data: my_chats,
    isLoading: isChatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getUserChats(user.token),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: searchResults = [], isLoading: isSearchLoading } =
    useSearchContacts(searchQuery);
  const createChatMutation = useCreateOrGetChat();

  const handleSelectContact = useCallback(
    async (contact: Contact) => {
      try {
        const result = await createChatMutation.mutateAsync({
          receiverId: contact._id,
          token: user.token,
        });

        const newChat: Chat = {
          _id: result.chatId,
          name: getContactName(contact),
          avatar: contact.profileImage || contact.avatar || "/placeholder.svg",
          lastMessage: "Chat started",
          timestamp: new Date().toISOString(),
          isVendor: contact.isVendor,
          isOnline: true,
          messages: [],
          pinnedMessages: [],
        };

        onNewChatCreated(newChat);
        setActiveChat(result.chatId);
        setSearchQuery("");
        setIsNewChatMode(false); // Switch back to chat list
        refetchChats();
      } catch (error) {
        // Error handling is managed by the mutation
      }
    },
    [
      createChatMutation,
      user.token,
      onNewChatCreated,
      setActiveChat,
      refetchChats,
    ]
  );

  const toggleNewChatMode = useCallback(() => {
    setIsNewChatMode((prev) => !prev);
    setSearchQuery(""); // Clear search when toggling
  }, []);

  // Helper function to get the other participant in the chat
  const getOtherParticipant = useCallback(
    (participants: any[], currentUserId: any) => {
      return (
        participants?.find((p) => p.participantId !== currentUserId) ||
        participants?.[1]
      );
    },
    []
  );

  // Transform API response to match Chat interface with useMemo for performance
  const queryClient = useQueryClient();

  const chatList = useMemo(() => {
    return (
      my_chats?.map((chat: ApiChat) => {
        const participant = getOtherParticipant(
          chat.participants,
          user.vendor._id
        );

        // read cached messages for this chat (no hook inside loop)
        const cached = queryClient.getQueryData(["messages", chat._id]) as any;
        const chatMessages = cached?.messages ?? [];

        // Prefer the last non-deleted cached message; if none, fall back to API lastMessage
        const lastNonDeleted = [...chatMessages]
          .reverse()
          .find((m: any) => (m?.deletedFor ?? "none") === "none");

        const lastMsg = lastNonDeleted || chat.lastMessage;

        // Build preview: prefer text; otherwise specific media labels; else show No messages yet
        let lastMessagePreview = "";
        if (lastMsg) {
          const m: any = lastMsg;
          const content = m?.content;
          const hasFiles = Array.isArray(m?.files) && m.files.length > 0;
          const hasImages =
            hasFiles && m.files.some((f: any) => f.type === "image");
          const hasVideo =
            hasFiles && m.files.some((f: any) => f.type === "video");
          const hasDocs =
            hasFiles && m.files.some((f: any) => f.type === "document");
          const hasLegacyImages =
            Array.isArray(m?.images) && m.images.length > 0;
          const hasLegacyDocs =
            Array.isArray(m?.documents) && m.documents.length > 0;
          const hasLegacyVideo = Boolean(m?.video);

          if (typeof content === "string" && content.trim().length > 0) {
            lastMessagePreview = content;
          } else if (hasImages || hasLegacyImages) {
            lastMessagePreview = "Photo";
          } else if (hasVideo || hasLegacyVideo) {
            lastMessagePreview = "Video";
          } else if (hasDocs || hasLegacyDocs) {
            lastMessagePreview = "Document";
          } else {
            lastMessagePreview = "No messages yet";
          }
        }

        return {
          _id: chat._id,
          name: participant?.details?.name || participant?.details?.storeName,
          avatar:
            participant?.profileImage ||
            participant?.details?.avatar ||
            "/placeholder.svg",
          lastMessage: lastMessagePreview,
          timestamp: (lastNonDeleted as any)?.createdAt || chat.updatedAt,
          isVendor: participant?.model || false,
          isOnline: participant?.isOnline || false,
          messages: chatMessages,
          pinnedMessages: [],
        };
      }) || []
    );
  }, [my_chats, getOtherParticipant, user.vendor._id, queryClient]);

  // const typingMap = useMemo(() => {
  //   const map: Record<string, boolean> = {};
  //   chats.forEach((chat:any) => {
  //     const other = chat.participants?.find(
  //       (p) => p.participantId !== user.vendor._id
  //     );
  //     if (other) map[chat._id] = isTyping(other.participantId);
  //   });
  //   return map;
  // }, [chatList, isTyping, user.vendor._id]);
  console.log("chatList", chatList);
  const socket = useSocket(user.token);

  // Local typing map sourced directly from socket events per chatId
  const [sidebarTypingMap, setSidebarTypingMap] = useState<
    Record<string, boolean>
  >({});
  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    const query = searchQuery.toLowerCase();
    return chatList.filter(
      (chat: any) =>
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [chatList, searchQuery]);

  useEffect(() => {
    if (!socket) return;

    const ids = chatList.map((c: any) => c._id).filter(Boolean);
    ids.forEach((id: any) => socket.emit("joinChat", id));

    // Listen for typing events to update local typing map for any chat in the list
    const onTyping = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== user.vendor._id) {
        setSidebarTypingMap((m) => ({ ...m, [chatId]: true }));
      }
    };
    const onStopTyping = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== user.vendor._id) {
        setSidebarTypingMap((m) => ({ ...m, [chatId]: false }));
      }
    };

    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      ids.forEach((id: any) => socket.emit("leaveChat", id));
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [socket, chatList]);

  // On new incoming message in any other chat, refresh unread count immediately
  useEffect(() => {
    if (!socket) return;

    const onNew = (payload: any) => {
      try {
        const chatId = payload?.chatId || payload?.chat?._id || payload?._id;
        const sender = payload?.sender || payload?.from;
        if (
          chatId &&
          chatId !== activeChat &&
          sender &&
          sender !== user?.vendor?._id
        ) {
          queryClient.invalidateQueries({
            queryKey: ["unread-chat-count", user?.vendor?._id],
          });
        }
      } catch {}
    };

    socket.on("newMessage", onNew);
    return () => {
      socket.off("newMessage", onNew);
    };
  }, [socket, activeChat, user?.vendor?._id, queryClient]);

  const handleChatSelect = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      // Mark this chat as read for this user
      const userId = user?.vendor?._id;
      if (userId && chatId) {
        markReadMutation.mutate({ chatId, userId });
      }
    },
    [setActiveChat, markReadMutation, user?.vendor?._id]
  );

  // Keep a ref to each chat item to auto-scroll active into view
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChat) return;
    // Defer until layout is settled
    const id = requestAnimationFrame(() => {
      const el = itemRefs.current[activeChat];
      const container = listContainerRef.current;
      if (el && container) {
        try {
          const elTop = el.offsetTop;
          const elHeight = el.offsetHeight;
          const containerHeight = container.clientHeight;
          const targetTop = Math.max(
            0,
            elTop - (containerHeight - elHeight) / 2
          );
          container.scrollTo({ top: targetTop, behavior: "smooth" });
        } catch {
          // Fallback
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
    return () => cancelAnimationFrame(id);
  }, [activeChat, filteredChats.length]);

  // Loading state with skeleton
  if (isChatsLoading) {
    return (
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${
          showOnMobile ? "flex" : "hidden md:flex"
        } flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 w-full md:w-80`}
      >
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <ChatSkeleton key={index} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Error state
  if (chatsError) {
    return (
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${
          showOnMobile ? "flex" : "hidden md:flex"
        } flex-col items-center justify-center p-4 text-center text-red-500 bg-white dark:bg-gray-800 border-r dark:border-gray-700 w-full md:w-80`}
      >
        <div className="p-4 rounded-lg bg-red-50">
          <p className="font-semibold">Error loading chats</p>
          <p className="mt-2 text-sm text-red-600">Please try again later</p>
          <button
            onClick={() => refetchChats()}
            className="px-4 py-2 mt-3 text-sm text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`${
        showOnMobile ? "flex" : "hidden md:flex"
      } flex-col bg-white dark:bg-gray-800 w-full md:w-80 h-full border-r dark:border-gray-700`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isNewChatMode ? (
              <Users className="w-6 h-6 text-orange-500" />
            ) : (
              <MessageCircle className="w-6 h-6 text-orange-500" />
            )}
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {isNewChatMode ? "New Chat" : "Chats"}
              {!isNewChatMode && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-2 text-xs text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          <motion.button
            onClick={toggleNewChatMode}
            className="p-2 transition-colors rounded-full hover:bg-orange-100 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isNewChatMode ? (
              <X className="w-5 h-5 text-orange-500 cursor-pointer" />
            ) : (
              <Plus className="w-5 h-5 text-orange-500 cursor-pointer" />
            )}
          </motion.button>
        </div>
        <div className="relative">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder={
              isNewChatMode ? "Search users/vendors..." : "Search chats..."
            }
            className="w-full py-2 pl-10 pr-4 text-sm transition-all duration-200 border-0 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <AnimatePresence mode="wait">
          {isNewChatMode ? (
            // New Chat Mode - Contact Search
            <motion.div
              key="new-chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {isSearchLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner className="w-5 h-5 text-orange-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((contact: Contact) => (
                    <ContactItem
                      key={contact._id}
                      contact={contact}
                      onSelect={handleSelectContact}
                    />
                  ))}
                </div>
              ) : searchQuery.trim() !== "" ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
                  <Users className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-semibold text-gray-400">
                    No results found
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Try searching for a different user or vendor
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
                  <Users className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-semibold text-gray-400">
                    Search for users
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Start typing to find and chat with users or vendors
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            // Chat List Mode
            <motion.div
              key="chat-list"
              ref={listContainerRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {filteredChats.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500"
                >
                  <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-semibold text-gray-400">
                    No chats yet
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Start a new chat by clicking the + button
                  </p>
                </motion.div>
              ) : (
                filteredChats.map((chat: Chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isActive={activeChat === chat._id}
                    onSelect={handleChatSelect}
                    typingMap={{ ...typingMap, ...sidebarTypingMap }}
                    itemRef={(el) => (itemRefs.current[chat._id] = el)}
                    unread={Number(perChatUnread[chat._id] || 0)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

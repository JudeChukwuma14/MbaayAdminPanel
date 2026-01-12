import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookMessenger } from "react-icons/fa";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import {
  Paperclip,
  Smile,
  SendIcon,
  Edit,
  Trash,
  Pin,
  X,
  Video,
  Play,
  Pause,
  Copy,
  Save,
  VolumeX,
  Volume2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  CheckCheck,
  Maximize,
  Reply,
  AlertCircle,
} from "lucide-react";
import { ChatListSidebar } from "./chat-list-sidebar";
import {
  useChats,
  useDeleteMessage,
  useEditMessage,
  useMessages,
  useSendMediaMessage,
  useSendMessage,
} from "@/hook/chatQueries";
import { markChatAsRead } from "@/utils/vendorChatApi";

// Constants
const SOCKET_URL = "https://ilosiwaju-mbaay-2025.com";

// Types
interface FileAttachment {
  type: "image" | "document" | "video";
  url: string;
  name: string;
  size: number;
  duration?: string;
}

type Status = "pending" | "delivered" | "read" | "failed";

interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: string;
  isVendor: boolean;
  files?: FileAttachment[];
  replyTo?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  deletedFor?: "none" | "me" | "everyone";
  isOptimistic?: boolean;
  isMe?: boolean;
  tempId?: string;
  status: Status;
  clientKey?: string;
}

interface ChatParticipant {
  participantId: string;
  model: string;
  details?: {
    storeName?: string;
    name?: string;
    avatar?: string;
    businessLogo?: string;
  };
  isOnline?: boolean;
}

interface Chat {
  _id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isVendor: boolean;
  isOnline: boolean;
  messages: Message[];
  storeName?: string;
  pinnedMessages: {
    messageId: string;
    unpinTimestamp: number;
  }[];
  participants?: ChatParticipant[];
}

// interface UserOrVendor {
//   _id: string;
//   name: string;
//   avatar: string;
//   isVendor: boolean;
//   userName?: string;
//   storeName?: string;
// }

interface DeleteDialogState {
  isOpen: boolean;
  messageId: string | null;
}

interface VideoPlayerState {
  isOpen: boolean;
  videoUrl: string | null;
}

interface MediaGalleryState {
  isOpen: boolean;
  files: FileAttachment[] | null;
  startIndex: number;
}

interface PinDurationDialogState {
  isOpen: boolean;
  messageId: string | null;
}

// Custom hooks
export const useSocket = (token?: string) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    socket.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [token]);

  return socket.current;
};

const useFeedback = () => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = useCallback((msg: string) => {
    setFeedbackMessage(msg);
    const timer = setTimeout(() => setFeedbackMessage(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  return { feedbackMessage, showFeedback };
};

const useTyping = (socket: Socket | null, chatId: string) => {
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket || !chatId) return;

    const onTyping = ({ sender }: { sender: string }) =>
      setTyping((t) => ({ ...t, [sender]: true }));

    const onStopTyping = ({ sender }: { sender: string }) =>
      setTyping((t) => ({ ...t, [sender]: false }));

    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [socket, chatId]);

  return (participantId: string) => !!typing[participantId];
};

const useChatData = (user: any) => {
  const [activeChat, setActiveChat] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const { data: apiChats = [] } = useChats(user.token);

  useEffect(() => {
    if (!apiChats.length) return;

    const mapped = apiChats.map((apiChat: any) => {
      const participant =
        apiChat.participants.find(
          (p: any) => p.participantId !== user.vendor._id
        ) || apiChat.participants[0];

      return {
        _id: apiChat._id,
        name:
          participant?.details?.storeName ||
          participant?.details?.name ||
          "Unknown",
        storeName: participant?.details?.storeName,
        avatar:
          participant?.details?.avatar || participant?.details?.businessLogo,
        lastMessage: apiChat.lastMessage?.content || "No messages yet",
        timestamp: apiChat?.updatedAt,
        isVendor: participant?.model === "vendors",
        isOnline: participant?.isOnline || false,
        messages: [],
        pinnedMessages: [],
        participants: apiChat.participants,
      };
    });

    setChats(mapped);
  }, [apiChats, user.vendor._id]);

  return { activeChat, setActiveChat, chats, setChats };
};

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Normalize attachments coming from API
const normalizeAttachmentType = (t: any): FileAttachment["type"] => {
  const s = typeof t === "string" ? t.toLowerCase() : "";
  if (s.startsWith("image")) return "image";
  if (s.startsWith("video")) return "video";
  return "document";
};

const extractFileUrl = (f: any): string => {
  return f?.url || f?.location || f?.src || f?.secure_url || "";
};

const extractFileName = (f: any, url: string): string => {
  const fromUrl = typeof url === "string" ? url.split("/").pop() : "";
  return f?.name || fromUrl || "file";
};

// Components
const Toast = React.memo(({ message }: { message: string }) => (
  <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -50, opacity: 0 }}
    className="fixed z-50 px-4 py-2 text-white bg-green-600 rounded shadow-lg top-4 right-4"
  >
    {message}
  </motion.div>
));

// const TypingIndicator = React.memo(() => (
//   <span className="flex items-center gap-1 text-xs text-gray-500">
//     <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
//     typing…
//   </span>
// ));

const FilePreview = React.memo(
  ({ file, onClick }: { file: FileAttachment; onClick?: () => void }) => {
    const isImage = file.type === "image";
    const isVideo = file.type === "video";

    /* skeleton while thumb is loading */
    const [ready, setReady] = React.useState(!isImage);

    const handleDownload = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        // Force download even for cross-origin by fetching as a Blob
        const res = await fetch(file.url, { mode: "cors" });
        if (!res.ok) throw new Error("Network error");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = file.name || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        // As a last resort, try the direct anchor download (still no new tab)
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <div
        onClick={onClick}
        className="group relative w-full max-w-[290px] cursor-pointer rounded-2xl
                   bg-white shadow-md ring-1 ring-black/5
                   transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full "
      >
        {/* visual area */}
        <div className="relative w-full h-full overflow-hidden aspect-video rounded-t-2xl">
          {!ready && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}

          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              draggable={false}
              loading="lazy"
              onLoad={() => setReady(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                ready ? "opacity-100" : "opacity-0 blur-sm"
              }`}
            />
          ) : isVideo ? (
            <>
              <video
                src={file.url}
                preload="metadata"
                className="object-cover w-full h-full"
              />
              {/* play icon */}
              <div className="absolute inset-0 grid place-content-center bg-black/20">
                <Play className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </>
          ) : (
            /* generic document */
            <div className="grid w-full h-full place-content-center bg-gradient-to-br from-orange-50 to-amber-100">
              <FileText className="w-12 h-12 text-orange-400" />
            </div>
          )}
        </div>

        {/* info footer */}

        {/* floating download icon */}
        <button
          type="button"
          onClick={handleDownload}
          title={`Download ${file.name}`}
          className="absolute grid w-8 h-8 transition rounded-full shadow opacity-0 pointer-events-auto right-3 top-3 place-content-center bg-white/80 backdrop-blur group-hover:opacity-100 hover:bg-white"
        >
          <Download className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    );
  }
);

// Extracted Components
const PinnedMessagesSection = React.memo(
  ({
    pinnedMessages,
    activeMessages,
    onUnpin,
  }: {
    pinnedMessages: Chat["pinnedMessages"];
    activeMessages: Message[];
    onUnpin: (messageId: string) => void;
  }) => {
    return (
      <div className="flex flex-col flex-shrink-0 p-3 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Pin className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            Pinned Messages
          </span>
        </div>
        {pinnedMessages.map((pinnedMsg) => {
          const originalMessage = activeMessages.find(
            (msg: any) => msg._id === pinnedMsg.messageId
          );
          if (!originalMessage) return null;

          const unpinDate = new Date(pinnedMsg.unpinTimestamp);
          const timeLeft = unpinDate.getTime() - Date.now();
          const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
          const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

          return (
            <motion.div
              key={pinnedMsg.messageId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-orange-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center flex-1 gap-2">
                <Pin className="flex-shrink-0 w-4 h-4 text-orange-500" />
                <p className="text-sm text-orange-800 truncate">
                  {originalMessage.content}
                </p>
                {timeLeft > 0 && (
                  <span className="flex-shrink-0 px-2 py-1 text-xs text-orange-600 bg-orange-100 rounded-full">
                    {daysLeft > 0 ? `${daysLeft}d left` : `${hoursLeft}h left`}
                  </span>
                )}
              </div>
              <motion.button
                onClick={() => onUnpin(pinnedMsg.messageId)}
                className="p-1 text-orange-500 transition-colors rounded-full hover:text-orange-700 hover:bg-orange-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    );
  }
);

const EmptyState = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 text-center text-gray-500"
  >
    <div className="p-6 mb-4 bg-white rounded-full shadow-lg">
      <FaFacebookMessenger size={40} className="text-gray-300" />
    </div>
    <p className="text-lg font-semibold text-gray-400">No messages yet</p>
    <p className="text-sm text-gray-400">Start the conversation!</p>
  </motion.div>
));

const MessageItem = React.memo(
  ({
    message: msg,
    activeChatDetails,
    user,
    allMessages,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onPin,
    onOpenMedia,
  }: {
    message: Message;
    activeChatDetails: Chat;
    user: any;
    allMessages: Message[];
    onReply: (messageId: string) => void;
    onCopy: (text: string) => void;
    onEdit: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onOpenMedia: (files: FileAttachment[], index: number) => void;
  }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${msg.isMe ? "justify-end" : ""}`}
    >
      {!msg.isMe && activeChatDetails && (
        <>
          {activeChatDetails?.avatar &&
          activeChatDetails?.avatar !== "/placeholder.svg" ? (
            <img
              src={activeChatDetails?.avatar}
              alt={msg.sender}
              className="self-end object-cover w-8 h-8 rounded-full"
              loading="lazy"
            />
          ) : (
            <div
              className={`self-end object-cover w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg  ${
                activeChatDetails?.isVendor === true
                  ? "bg-gradient-to-br from-orange-500 to-orange-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              {activeChatDetails?.name.charAt(0).toUpperCase()}
            </div>
          )}
        </>
      )}

      <div className={`max-w-[70%] ${msg.isMe ? "order-1" : "order-2"}`}>
        <div
          className={`p-3 rounded-lg shadow-sm ${
            msg.isMe
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          {msg.replyTo && (
            <ReplyPreview
              replyingTo={msg.replyTo}
              activeMessages={allMessages}
              isInline
            />
          )}
          {msg.files && msg.files.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2 h-[200px]">
              {msg.files.map((file, idx) => (
                <FilePreview
                  key={idx}
                  file={file}
                  onClick={() => onOpenMedia(msg.files!, idx)}
                />
              ))}
            </div>
          )}
          <p>{msg.content}</p>
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span>{msg.timestamp}</span>
            {msg.status === "pending" && (
              <Clock size={12} className="animate-spin" />
            )}
            {msg.status === "delivered" && <CheckCircle2 size={12} />}
            {msg.status === "read" && <CheckCheck size={12} />}
            {msg.status === "failed" && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle size={12} /> Failed
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 mt-2 text-xs ${
            msg.isMe ? "justify-end" : "justify-start"
          } ${msg.isMe ? "text-orange-200" : "text-gray-500"}`}
        >
          <div className="flex items-center gap-1">
            <div
              className={`w-1 h-1 rounded-full ${
                msg.isMe ? "bg-orange-300" : "bg-gray-400"
              }`}
            />
            {msg.timestamp}
          </div>
          {msg.isEdited && (
            <span
              className={`ml-1 ${
                msg.isMe ? "text-orange-200" : "text-gray-400"
              }`}
            >
              (edited)
            </span>
          )}

          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onReply(msg._id)}
              className="relative p-1 transition-colors rounded-full group hover:bg-white/10"
            >
              <Reply className="w-4 h-4" />
            </button>
            {(!msg.files || msg.files.length === 0) && (
              <button
                onClick={() => onCopy(msg.content)}
                className="relative group"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {msg.isMe && msg.status === "failed" && (
              <>
                {(!msg.files || msg.files.length === 0) && (
                  <button
                    onClick={() => onEdit(msg._id)}
                    className="relative group"
                    title="Edit message"
                  >
                    <Edit className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </>
            )}
            {msg.isMe && (
              <>
                {(!msg.files || msg.files.length === 0) && (
                  <button
                    onClick={() => onEdit(msg._id)}
                    className="relative group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(msg._id)}
                  className="relative group"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => onPin(msg._id)} className="relative group">
              <Pin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {msg.isMe && (
        <>
          {user.vendor.avatar && user.vendor.avatar !== "/placeholder.svg" ? (
            <img
              src={user.vendor.avatar}
              alt="You"
              className="self-end object-cover w-8 h-8 rounded-full"
              loading="lazy"
            />
          ) : (
            <div
              className={`self-end object-cover w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg 
   bg-gradient-to-br from-orange-500 to-orange-600
     `}
            >
              {user.vendor?.storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
);

const MessageList = React.memo(
  ({
    messages,
    activeChatDetails,
    user,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onPin,
    onOpenMedia,
  }: {
    messages: Message[];
    activeChatDetails: Chat;
    user: any;
    onReply: (messageId: string) => void;
    onCopy: (text: string) => void;
    onEdit: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onOpenMedia: (files: FileAttachment[], index: number) => void;
  }) => (
    <>
      {messages
        .filter((msg: any) => msg.deletedFor === "none")
        .map((msg: any) => (
          <MessageItem
            key={msg.clientKey || msg._id}
            message={msg}
            activeChatDetails={activeChatDetails}
            user={user}
            allMessages={messages}
            onReply={onReply}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
            onOpenMedia={onOpenMedia}
          />
        ))}
    </>
  )
);

const ReplyPreview = React.memo(
  ({
    replyingTo,
    activeMessages,
    onCancel,
    isInline = false,
  }: {
    replyingTo: string;
    activeMessages: Message[];
    onCancel?: () => void;
    isInline?: boolean;
  }) => {
    const replyMessage = activeMessages.find((m: any) => m._id === replyingTo);
    if (!replyMessage) return null;

    const trimmed = (replyMessage.content || "").trim();
    const hasFiles =
      Array.isArray(replyMessage.files) && replyMessage.files.length > 0;
    const hasImage =
      hasFiles && replyMessage?.files?.some((f) => f.type === "image");
    const hasVideo =
      hasFiles && replyMessage?.files?.some((f) => f.type === "video");
    const hasDoc =
      hasFiles && replyMessage?.files?.some((f) => f.type === "document");
    const mediaLabel = hasVideo
      ? "Video"
      : hasImage
      ? "Photo"
      : hasDoc
      ? "Document"
      : "Message";
    const previewText =
      trimmed.length > 0
        ? `${trimmed.slice(0, 50)}${trimmed.length > 50 ? "…" : ""}`
        : mediaLabel;

    return isInline ? (
      <div className="p-2 mb-1 text-sm text-gray-600 bg-gray-100 border-l-4 border-orange-500 rounded-t-lg">
        <div className="flex items-center gap-1 mb-1 text-xs text-orange-600">
          <Reply className="w-3 h-3" />
          Replying to:
        </div>
        {previewText}
      </div>
    ) : (
      <div className="flex items-center justify-between flex-shrink-0 p-3 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-2">
          <Reply className="w-4 h-4 text-orange-600" />
          <p className="text-sm font-medium text-orange-800">
            Replying to: <span className="text-orange-600">{previewText}</span>
          </p>
        </div>
        {onCancel && (
          <motion.button
            onClick={onCancel}
            className="p-1 text-orange-500 transition-colors rounded-full hover:text-orange-700 hover:bg-orange-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    );
  }
);

const MessageInput = React.memo(
  ({
    message,
    editingMessageId,
    showEmojiPicker,
    isUploading,
    uploadProgress,
    inputRef,
    imageInputRef,
    videoInputRef,
    docInputRef,
    onChange,
    onKeyDown,
    onEmojiSelect,
    onToggleEmojiPicker,
    onFileUpload,
    onSaveEdit,
    onSend,
    onCancelEdit,
  }: {
    message: string;
    editingMessageId: string | null;
    showEmojiPicker: boolean;
    isUploading: boolean;
    uploadProgress?: number | null;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    imageInputRef: React.RefObject<HTMLInputElement>;
    videoInputRef: React.RefObject<HTMLInputElement>;
    docInputRef: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onEmojiSelect: (emoji: string) => void;
    onToggleEmojiPicker: () => void;
    onFileUpload: (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "images" | "video" | "documents"
    ) => void;
    onSaveEdit: () => void;
    onSend: () => void;
    onCancelEdit: () => void;
  }) => (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative flex-shrink-0 p-4 border-t shadow-lg bg-gradient-to-r from-gray-50 to-white"
    >
      <div className="flex items-center gap-3">
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileUpload(e, "images")}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => onFileUpload(e, "video")}
        />
        <input
          ref={docInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => onFileUpload(e, "documents")}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading}
        >
          <ImageIcon className="w-5 h-5 text-orange-500" />
        </button>
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading}
        >
          <Video className="w-5 h-5 text-orange-500" />
        </button>
        <button
          onClick={() => docInputRef.current?.click()}
          disabled={isUploading}
        >
          <FileText className="w-5 h-5 text-orange-500" />
        </button>

        <div className="relative flex w-full">
          <textarea
            ref={inputRef}
            value={message}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={
              editingMessageId ? "Editing message…" : "Type your message…"
            }
            rows={1}
            className="flex-1 px-4 py-2 border border-orange-500 rounded-xl resize-none leading-6 min-h-[44px] max-h-40 focus:outline-orange-500"
            disabled={isUploading}
          />

          <button
            type="button"
            onClick={onToggleEmojiPicker}
            className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:text-orange-500 hover:bg-blue-50"
            title="Add emoji"
            disabled={isUploading}
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={editingMessageId ? onSaveEdit : onSend}
            className="p-2 text-orange-500 rounded-full hover:bg-orange-100"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingMessageId ? (
              <Save className="w-5 h-5" />
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </button>

          {editingMessageId && (
            <button
              onClick={onCancelEdit}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-200"
              title="Cancel edit"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute right-0 mb-2 bg-white border rounded-lg shadow-lg bottom-full">
          <EmojiPicker
            onEmojiClick={({ emoji }) => onEmojiSelect(emoji)}
            autoFocusSearch={false}
          />
        </div>
      )}

      {isUploading && (
        <div className="mt-2">
          <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
            <div
              className="h-2 transition-all bg-orange-500"
              style={{ width: `${Math.min(uploadProgress ?? 0, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Uploading… {Math.min(uploadProgress ?? 0, 100)}%
          </div>
        </div>
      )}
    </motion.div>
  )
);

const DeleteDialog = React.memo(
  ({
    isOpen,
    onCancel,
    onConfirm,
  }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }) =>
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="p-4 sm:p-6 bg-white rounded-lg w-full max-w-sm sm:max-w-md">
          <h3 className="mb-4 text-lg font-semibold">Delete message?</h3>
          <p className="mb-4 text-sm text-gray-600">
            This message will be permanently deleted.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
);

const VideoPlayer = React.memo(
  ({
    isOpen,
    videoUrl,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    videoRef,
    onClose,
    onPlayPause,
    onToggleMute,
    onSave,
    onToggleFullscreen,
  }: {
    isOpen: boolean;
    videoUrl: string | null;
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    videoRef: React.RefObject<HTMLVideoElement>;
    onClose: () => void;
    onPlayPause: () => void;
    onToggleMute: () => void;
    onSave: (videoUrl: string) => void;
    onToggleFullscreen: () => void;
  }) =>
    isOpen &&
    videoUrl && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
        <div className="relative w-full max-w-full sm:max-w-4xl p-2 sm:p-4 bg-white rounded-lg aspect-video">
          <div className="absolute z-10 flex items-center gap-2 top-2 right-2">
            <motion.button
              onClick={() => onSave(videoUrl)}
              className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
            >
              <Save className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={videoUrl}
              className="object-contain w-full h-full rounded-lg"
              onClick={onPlayPause}
              controls
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onPlayPause}
                    className="p-2 text-white bg-gray-800 rounded-full hover:bg-gray-700"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={onToggleMute}
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
                    onClick={onToggleFullscreen}
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
    )
);

const MediaGallery = React.memo(
  ({
    isOpen,
    files,
    startIndex,
    onClose,
    onNext,
    onPrev,
  }: {
    isOpen: boolean;
    files: FileAttachment[] | null;
    startIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
  }) =>
    isOpen &&
    files && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-2 sm:p-4">
        <div className="relative flex items-center justify-center w-full h-full max-w-full sm:max-w-5xl max-h-full sm:max-h-5xl">
          <motion.button
            onClick={onClose}
            className="absolute z-10 p-2 text-white bg-gray-800 rounded-full top-4 right-4 hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </motion.button>
          {files.length > 1 && (
            <>
              <motion.button
                onClick={onPrev}
                className="absolute z-10 p-2 text-white bg-gray-800 rounded-full left-4 hover:bg-gray-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={onNext}
                className="absolute z-10 p-2 text-white bg-gray-800 rounded-full right-4 hover:bg-gray-700"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
          <div className="relative flex items-center justify-center w-full h-full">
            {files[startIndex]?.type === "image" ? (
              <img
                src={files[startIndex].url || "/placeholder.svg"}
                alt={files[startIndex].name}
                className="object-contain max-w-full max-h-full"
              />
            ) : files[startIndex]?.type === "video" ? (
              <video
                src={files[startIndex].url}
                controls
                className="object-contain max-w-full max-h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-white">
                <Paperclip className="w-12 h-12 mb-4" />
                <p className="text-xl font-semibold">
                  {files[startIndex].name}
                </p>
                <p className="text-sm">
                  {formatFileSize(files[startIndex].size)}
                </p>
                <a
                  href={files[startIndex].url}
                  download={files[startIndex].name}
                  className="px-4 py-2 mt-4 text-white bg-orange-500 rounded-md hover:bg-orange-600"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
);

const PinDurationDialog = React.memo(
  ({
    isOpen,
    onSelectDuration,
    onClose,
  }: {
    isOpen: boolean;
    onSelectDuration: (durationHours: number) => void;
    onClose: () => void;
  }) =>
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="p-4 sm:p-6 bg-white rounded-lg w-full max-w-sm sm:max-w-md">
          <h3 className="mb-4 text-lg font-semibold">
            Pin message for how long?
          </h3>
          <div className="mb-6 space-y-2">
            {[24, 168, 720].map((hours) => (
              <label key={hours} className="flex items-center">
                <input
                  type="radio"
                  name="pinDuration"
                  value={hours}
                  onChange={() => onSelectDuration(hours)}
                  className="mr-2"
                />
                <span>
                  {hours === 24
                    ? "24 Hours"
                    : hours === 168
                    ? "7 Days"
                    : "30 Days"}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
);

// Main Component
export default function ChatInterface() {
  const user = useSelector((state: any) => state.vendor);
  const { feedbackMessage, showFeedback } = useFeedback();
  const { activeChat, setActiveChat, chats, setChats } = useChatData(user);
  const { data: apiMessagesResponse = null } = useMessages(activeChat);

  // State
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    messageId: null,
  });
  const [videoPlayer, setVideoPlayer] = useState<VideoPlayerState>({
    isOpen: false,
    videoUrl: null,
  });
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryState>({
    isOpen: false,
    files: null,
    startIndex: 0,
  });
  const [showShared, setShowShared] = useState(false);
  const [pinDurationDialog, setPinDurationDialog] =
    useState<PinDurationDialogState>({
      isOpen: false,
      messageId: null,
    });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [currentTime] = useState(0);
  const [duration] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  // Upload progress (null when idle)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  // We rely on React Query's optimistic updates instead of local duplicates

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const currentGalleryIndex = useRef(0);
  const queryClient = useQueryClient();
  const socket = useSocket(user.token);
  const markReadTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced mark-as-read to avoid spamming the API when multiple messages arrive quickly
  const scheduleMarkAsRead = React.useCallback(() => {
    if (!activeChat || !user?.vendor?._id) return;
    if (markReadTimeout.current) clearTimeout(markReadTimeout.current);
    markReadTimeout.current = setTimeout(async () => {
      try {
        await markChatAsRead(activeChat, user.vendor._id);
        // Refresh chat list and unread counters
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        queryClient.invalidateQueries({
          queryKey: ["unread-chat-count", user.vendor._id],
        });
      } catch (e) {
        // Silently ignore; next schedule will retry
      }
    }, 500);
  }, [activeChat, user?.vendor?._id, queryClient]);

  // Clear any pending mark-as-read timer when chat changes or component unmounts
  useEffect(() => {
    return () => {
      if (markReadTimeout.current) {
        clearTimeout(markReadTimeout.current);
        markReadTimeout.current = null;
      }
    };
  }, [activeChat]);

  // API Queries
  // const createOrGetChatMutation = useCreateOrGetChat();
  const sendMessageMutation = useSendMessage();
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const sendMediaMessageMutation = useSendMediaMessage();

  // Derived state
  const apiMessages = apiMessagesResponse?.messages || [];
  const activeChatDetails = useMemo(
    () => chats.find((chat) => chat._id === activeChat),
    [chats, activeChat]
  );

  // const serverMessages = useMemo(
  //   () =>
  //     (apiMessages || []).map((m: any) => ({
  //       _id: m._id,
  //       content: m.content,
  //       sender:
  //         m.sender?._id === user.vendor._id
  //           ? "You"
  //           : m.sender?.storeName || "Unknown",
  //       timestamp: new Date(m.createdAt).toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }),
  //       isMe: m.sender?._id === user.vendor._id,
  //       status: "delivered" as Status,
  //     })),
  //   [apiMessages, user.vendor._id]
  // );

  const otherParticipantId = useMemo(() => {
    if (!activeChatDetails) return null;
    return activeChatDetails.participants?.find(
      (p: any) => p.participantId !== user.vendor._id
    )?.participantId;
  }, [activeChatDetails, user.vendor._id]);

  const activeMessages = useMemo(
    () =>
      apiMessages.map((m: any) => {
        const rawSenderId =
          typeof m?.sender === "string" ? m.sender : m?.sender?._id;
        const senderId = rawSenderId != null ? String(rawSenderId) : undefined;
        const myId =
          user?.vendor?._id != null ? String(user.vendor._id) : undefined;
        const senderName =
          typeof m?.sender === "object"
            ? m.sender?.storeName || m.sender?.name
            : undefined;
        return {
          _id: m._id,
          content: m.content,
          sender:
            senderId && myId && senderId === myId
              ? "You"
              : senderName || "Unknown",
          timestamp: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          // Treat react-query optimistic entries (sender._id === "current-user") as me
          isMe:
            (senderId && myId && senderId === myId) ||
            senderId === "current-user",
          status: m.failed
            ? "failed"
            : m.isOptimistic
            ? "pending"
            : ("delivered" as Status),
          clientKey: m.clientKey || m._id,
          files:
            Array.isArray(m.files) && m.files.length > 0
              ? m.files.map((f: any) => ({
                  type: normalizeAttachmentType(
                    f?.type || f?.mimetype || f?.mime
                  ),
                  url: extractFileUrl(f),
                  name: extractFileName(f, extractFileUrl(f)),
                  size: typeof f?.size === "number" ? f.size : 0,
                }))
              : [
                  ...(m.images || []).map((url: string) => ({
                    type: "image" as const,
                    url,
                    name: url.split("/").pop() || "image",
                    size: 0,
                  })),
                  ...(m.video
                    ? [
                        {
                          type: "video" as const,
                          url: m.video,
                          name: m.video.split("/").pop() || "video",
                          size: 0,
                        },
                      ]
                    : []),
                  ...(m.documents || []).map((url: string) => ({
                    type: "document" as const,
                    url,
                    name: url.split("/").pop() || "document",
                    size: 0,
                  })),
                ],
          replyTo:
            typeof m.replyTo === "string"
              ? m.replyTo
              : m.replyTo?.id || m.replyTo?._id || undefined,
          isEdited: m.isEdited || false,
          deletedFor: m.deletedFor || "none",
        };
      }),
    [apiMessages, user.vendor._id]
  );

  // Render messages directly from the query cache mapping
  const visibleMessages = activeMessages;

  const isTyping = useTyping(socket, activeChat);
  // const messagesContainerRef = useRef<HTMLDivElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [visibleMessages]);

  // useEffect(() => {
  //   if (!activeChat || !socket) return;
  //   socket.emit("joinChat", activeChat);

  //   const editHandler = (updated: any) => {
  //     queryClient.setQueryData(["messages", activeChat], (old: any) => ({
  //       ...old,
  //       messages: (old?.messages || []).map((m: any) =>
  //         m._id === updated._id ? updated : m
  //       ),
  //     }));
  //   };

  //   const deleteHandler = ({ messageId }: { messageId: string }) => {
  //     queryClient.setQueryData(["messages", activeChat], (old: any) => ({
  //       ...old,
  //       messages: (old?.messages || []).filter((m: any) => m._id !== messageId),
  //     }));
  //   };

  //   socket.on("newMessage", (msg) => {
  //     queryClient.setQueryData(["messages", activeChat], (old: any) => ({
  //       ...old,
  //       messages: [...(old?.messages || []), msg],
  //     }));
  //   });
  //   socket.on("messageEdited", editHandler);
  //   socket.on("messageDeleted", deleteHandler);

  //   return () => {
  //     socket.emit("leaveChat", activeChat);
  //     socket.off("newMessage");
  //     socket.off("messageEdited", editHandler);
  //     socket.off("messageDeleted", deleteHandler);
  //   };
  // }, [activeChat, socket, queryClient]);

  /* 1.  server-cache sync (edit / delete / new) */
  useEffect(() => {
    if (!activeChat || !socket) return;
    socket.emit("joinChat", activeChat);
    const onNew = (m: any) => {
      queryClient.setQueryData(["messages", activeChat], (o: any) => {
        const existing: any[] = Array.isArray(o?.messages) ? o.messages : [];
        // 1) If server ID already present, replace that entry
        const idxById = existing.findIndex((x) => x?._id === m._id);
        if (idxById !== -1) {
          const copy = existing.slice();
          const preservedReplyTo = existing[idxById]?.replyTo;
          copy[idxById] = {
            ...existing[idxById],
            ...m,
            // if server payload is missing fields, keep optimistic
            replyTo: m.replyTo ?? preservedReplyTo,
            sender: m.sender ?? existing[idxById]?.sender,
            clientKey: existing[idxById].clientKey || existing[idxById]._id,
          };
          return { ...o, messages: copy };
        }
        // 2) If there is an optimistic entry that matches by content+time, replace IN PLACE
        const idxOptimisticSimilar = existing.findIndex(
          (x: any) =>
            x?.isOptimistic &&
            x?.content === m?.content &&
            Math.abs(
              new Date(x?.createdAt).getTime() -
                new Date(m?.createdAt).getTime()
            ) < 10000
        );
        if (idxOptimisticSimilar !== -1) {
          const copy = existing.slice();
          const preservedReplyTo = existing[idxOptimisticSimilar]?.replyTo;
          copy[idxOptimisticSimilar] = {
            ...existing[idxOptimisticSimilar],
            ...m,
            replyTo: m.replyTo ?? preservedReplyTo,
            sender: m.sender ?? existing[idxOptimisticSimilar]?.sender,
            clientKey:
              existing[idxOptimisticSimilar].clientKey ||
              existing[idxOptimisticSimilar]._id,
          };
          return { ...o, messages: copy };
        }
        // 3) Fallback: if any optimistic exists, replace the latest one in-place
        const lastOptimisticIdx = [...existing]
          .map((x, i) => ({ x, i }))
          .filter(({ x }) => x?.isOptimistic)
          .map(({ i }) => i)
          .pop();
        if (lastOptimisticIdx !== undefined) {
          const copy = existing.slice();
          const preservedReplyTo = copy[lastOptimisticIdx]?.replyTo;
          copy[lastOptimisticIdx] = {
            ...copy[lastOptimisticIdx],
            ...m,
            replyTo: m.replyTo ?? preservedReplyTo,
            sender: m.sender ?? copy[lastOptimisticIdx]?.sender,
            clientKey:
              copy[lastOptimisticIdx].clientKey || copy[lastOptimisticIdx]._id,
          };
          return { ...o, messages: copy };
        }
        // 4) Otherwise, append but first drop other stale optimistics (rare)
        const withoutOptimistic = existing.filter((x: any) => !x?.isOptimistic);
        const updated = {
          ...o,
          messages: [...withoutOptimistic, { ...m, clientKey: m._id }],
        };
        return updated;
      });
      // If the new message is from the other participant and this chat is active, mark as read
      const senderId =
        typeof m?.sender === "string" ? m.sender : m?.sender?._id;
      if (activeChat && senderId && senderId !== user?.vendor?._id) {
        scheduleMarkAsRead();
      }
    };
    const onEdit = (u: any) =>
      queryClient.setQueryData(["messages", activeChat], (o: any) => ({
        ...o,
        messages: o?.messages?.map((m: any) =>
          m._id === u._id ? { ...m, ...u, sender: u.sender ?? m.sender } : m
        ),
      }));
    const onDelete = ({ messageId }: { messageId: string }) =>
      queryClient.setQueryData(["messages", activeChat], (o: any) => ({
        ...o,
        messages: o?.messages?.filter((m: any) => m._id !== messageId),
      }));
    socket.on("newMessage", onNew);
    socket.on("messageEdited", onEdit);
    socket.on("messageDeleted", onDelete);

    /* optimistic -> delivered tick */
    const onDelivered = (_payload: { tempId: string; _id: string }) => {
      // We no longer keep local optimistic messages; nothing to do here.
    };
    socket.on("messageDelivered", onDelivered);

    return () => {
      socket.emit("leaveChat", activeChat);
      socket.off("newMessage", onNew);
      socket.off("messageEdited", onEdit);
      socket.off("messageDeleted", onDelete);
      socket.off("messageDelivered", onDelivered);
    };
  }, [activeChat, socket, queryClient]);

  // Scroll to bottom and focus input when switching chats
  useEffect(() => {
    if (!activeChat) return;
    // Let content render first
    const id = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // Focus and bring input into view
      messageInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      messageInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [activeChat]);

  // Keep view pinned to bottom when new messages arrive
  useEffect(() => {
    if (!activeChat) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, visibleMessages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChats((prevChats: Chat[]) =>
        prevChats.map((chat: Chat) => {
          const now = Date.now();
          const updatedPinnedMessages = chat.pinnedMessages.filter(
            (p) => p.unpinTimestamp > now
          );
          if (updatedPinnedMessages.length !== chat.pinnedMessages.length) {
            const unpinnedCount =
              chat.pinnedMessages.length - updatedPinnedMessages.length;
            if (unpinnedCount > 0) {
              showFeedback(
                `${unpinnedCount} pinned message(s) unpinned automatically.`
              );
            }
            return { ...chat, pinnedMessages: updatedPinnedMessages };
          }
          return chat;
        })
      );
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [showFeedback]);

  // Handlers
  const handleTyping = useCallback(() => {
    if (!socket || !activeChat) return;
    socket.emit("typing", { chatId: activeChat, sender: user.vendor._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit("stopTyping", {
          chatId: activeChat,
          sender: user.vendor._id,
        });
      }, 800)
    );
  }, [socket, activeChat, user.vendor._id, typingTimeout]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    setMessage("");
    setReplyingTo(null);
    try {
      await sendMessageMutation.mutateAsync({
        chatId: activeChat,
        content: message.trim(),
        token: user.token,
        replyTo: replyingTo || undefined,
      });
      // Do not emit via socket here; server will broadcast newMessage
    } catch {
      // react-query will rollback its optimistic update on error
    }
  };

  const handleFileUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "images" | "video" | "documents"
    ) => {
      const files = e.target.files;
      if (!files || !activeChat) return;
      const authToken = user.token;
      if (!authToken) return;
      try {
        setUploadProgress(0);
        const payload = {
          chatId: activeChat,
          files:
            type === "images"
              ? { images: Array.from(files) }
              : type === "documents"
              ? { documents: Array.from(files) }
              : { video: files[0] },
          token: authToken,
          content: message.trim() || undefined,
          replyTo: replyingTo || undefined,
          onProgress: (p: number) => setUploadProgress(p),
        };
        await sendMediaMessageMutation.mutateAsync(payload);
        setMessage("");
        setReplyingTo(null);
        setUploadProgress(null);
      } catch {
      } finally {
        // Ensure we clear progress on error as well
        setUploadProgress(null);
      }
    },
    [activeChat, user.token, message, replyingTo]
  );

  const handleSaveEdit = async () => {
    if (!editingMessageId || !message.trim()) return;
    try {
      // Optimistic local update so sender sees edit instantly
      queryClient.setQueryData(["messages", activeChat], (old: any) => ({
        ...old,
        messages: (old?.messages || []).map((m: any) =>
          m._id === editingMessageId
            ? {
                ...m,
                content: message.trim(),
                isEdited: true,
                // ensure sender is me locally (only authors can edit)
                sender: { _id: user.vendor._id, name: "You", isVendor: true },
              }
            : m
        ),
      }));

      const res = await editMessageMutation.mutateAsync({
        messageId: editingMessageId,
        text: message.trim(),
        token: user.token,
      });
      // Update locally immediately so the sender sees the change without waiting for socket echo
      queryClient.setQueryData(["messages", activeChat], (old: any) => ({
        ...old,
        messages: (old?.messages || []).map((m: any) =>
          m._id === res._id
            ? {
                ...m,
                ...res,
                // if server doesn't send sender, keep as me
                sender: res.sender ?? m.sender ?? { _id: user.vendor._id },
              }
            : m
        ),
      }));
      socket?.emit("messageEdited", { chatId: activeChat, ...res });
      setEditingMessageId(null);
      setMessage("");
      // Do not emit via socket here; server will broadcast newMessage
    } catch {
      // react-query will rollback its optimistic update on error
    }
  };

  // const handleSaveEdit = useCallback(async () => {
  //   if (!editingMessageId || !message.trim()) return;
  //   try {
  //     const res = await editMessageMutation.mutateAsync({
  //       messageId: editingMessageId,
  //       text: message.trim(),
  //       token: user.token,
  //     });
  //     socket?.emit("messageEdited", { chatId: activeChat, ...res });
  //   } catch {}
  //   setEditingMessageId(null);
  //   setMessage("");
  // }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteDialog.messageId) return;
    deleteMessageMutation.mutate({
      messageId: deleteDialog.messageId,
      token: user.token,
    });
    socket?.emit("messageDeleted", {
      chatId: activeChat,
      messageId: deleteDialog.messageId,
    });
    setDeleteDialog({ isOpen: false, messageId: null });
  }, [deleteDialog.messageId, user.token, activeChat, socket]);

  const handleEdit = useCallback(
    (messageId: string) => {
      const target = activeMessages.find((m: any) => m._id === messageId);
      if (!target) return;
      setEditingMessageId(messageId);
      setMessage(target.content);
      setReplyingTo(null);
      setTimeout(() => messageInputRef.current?.focus(), 0);
    },
    [activeMessages]
  );

  const handlePinClick = useCallback(
    (messageId: string) => {
      const currentChat = chats.find((chat) => chat._id === activeChat);
      const isAlreadyPinned = currentChat?.pinnedMessages.some(
        (p) => p.messageId === messageId
      );

      if (isAlreadyPinned) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === activeChat
              ? {
                  ...chat,
                  pinnedMessages: chat.pinnedMessages.filter(
                    (p) => p.messageId !== messageId
                  ),
                }
              : chat
          )
        );
        showFeedback("Message unpinned");
      } else {
        setPinDurationDialog({ isOpen: true, messageId });
      }
    },
    [chats, activeChat, showFeedback]
  );

  const handleSelectPinDuration = useCallback(
    (durationHours: number) => {
      if (pinDurationDialog.messageId && activeChatDetails) {
        const unpinTimestamp = Date.now() + durationHours * 60 * 60 * 1000;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === activeChat
              ? {
                  ...chat,
                  pinnedMessages: [
                    ...chat.pinnedMessages,
                    {
                      messageId: pinDurationDialog.messageId!,
                      unpinTimestamp,
                    },
                  ],
                }
              : chat
          )
        );
        showFeedback(`Message pinned for ${durationHours} hours`);
      }
      setPinDurationDialog({ isOpen: false, messageId: null });
    },
    [pinDurationDialog.messageId, activeChat, showFeedback]
  );

  const handleOpenMediaGallery = useCallback(
    (files: FileAttachment[], startIndex: number) => {
      setMediaGallery({ isOpen: true, files, startIndex });
      currentGalleryIndex.current = startIndex;
    },
    []
  );

  // Aggregate shared files from current chat messages
  const sharedFiles = useMemo(() => {
    const items: { files: FileAttachment[]; index: number }[] = [];
    try {
      const list = Array.isArray(activeMessages)
        ? activeMessages
        : ([] as any[]);
      list.forEach((m: any) => {
        if (Array.isArray(m?.files) && m.files.length > 0) {
          m.files.forEach((_f: FileAttachment, idx: number) => {
            items.push({ files: m.files as FileAttachment[], index: idx });
          });
        }
      });
    } catch {}
    return items;
  }, [activeMessages]);

  const handleNewChatCreated = useCallback((newChat: Chat) => {
    setChats((prev) => {
      if (prev.find((c) => c._id === newChat._id)) return prev;
      return [...prev, newChat];
    });
  }, []);

  // Video player handlers
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleToggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  }, []);

  // Media gallery navigation handlers
  const handleNextMedia = useCallback(() => {
    if (!mediaGallery.files) return;
    setMediaGallery((prev) => ({
      ...prev,
      startIndex:
        prev.files && prev.startIndex < prev.files.length - 1
          ? prev.startIndex + 1
          : 0,
    }));
    currentGalleryIndex.current =
      mediaGallery.files &&
      currentGalleryIndex.current < mediaGallery.files.length - 1
        ? currentGalleryIndex.current + 1
        : 0;
  }, [mediaGallery.files]);

  const handlePrevMedia = useCallback(() => {
    if (!mediaGallery.files) return;
    setMediaGallery((prev) => ({
      ...prev,
      startIndex:
        prev.startIndex > 0
          ? prev.startIndex - 1
          : (prev.files?.length ?? 1) - 1,
    }));
    currentGalleryIndex.current =
      currentGalleryIndex.current > 0
        ? currentGalleryIndex.current - 1
        : mediaGallery.files.length - 1;
  }, [mediaGallery.files]);

  const handleSaveVideo = useCallback(
    (videoUrl: string) => {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showFeedback("Video saved to device");
    },
    [showFeedback]
  );

  const typingMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    chats.forEach((chat) => {
      const other = chat.participants?.find(
        (p) => p.participantId !== user.vendor._id
      );
      if (other) map[chat._id] = isTyping(other.participantId);
    });
    return map;
  }, [chats, isTyping, user.vendor._id]);

  const handleCopyText = useCallback(
    (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => showFeedback("Message copied to clipboard"))
        .catch(() => showFeedback("Failed to copy message"));
    },
    [showFeedback]
  );

  const getInitials = (name: string) => {
    return `${name.charAt(0).toUpperCase()}${
      name.split(" ")[1]?.charAt(0).toUpperCase() || ""
    }`;
  };

  const isVendor = activeChatDetails?.isVendor === true;
  console.log(activeChatDetails);
  const hasAvatar =
    activeChatDetails?.avatar &&
    activeChatDetails?.avatar !== "/placeholder.svg";
  console.log(user.vendor);
  // Render
  return (
    <div className="flex h-full bg-gray-50 overflow-x-hidden max-w-full">
      <ChatListSidebar
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        token={user.token}
        onNewChatCreated={handleNewChatCreated}
        typingMap={typingMap}
        showOnMobile={!activeChat}
      />

      <div
        className={`${
          !activeChat ? "hidden md:flex" : "flex"
        } flex-col flex-1 overflow-hidden`}
      >
        {activeChatDetails ? (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center flex-shrink-0 gap-4 p-3 sm:p-4 border-b shadow-sm bg-gradient-to-r from-white to-gray-50 flex-wrap"
          >
            {/* Mobile back button */}
            <button
              type="button"
              onClick={() => setActiveChat("")}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100"
              aria-label="Back to chats"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {hasAvatar ? (
              <img
                src={activeChatDetails?.avatar}
                alt={activeChatDetails?.name}
                className="object-cover w-12 h-12 rounded-full"
                loading="lazy"
              />
            ) : (
              <div
                className={`flex items-center justify-center w-12 h-12 text-white rounded-full text-[17px] font-bold shadow-lg ${
                  isVendor
                    ? "bg-gradient-to-br from-orange-500 to-orange-600"
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                }`}
              >
                {getInitials(activeChatDetails?.name)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex-1">
                <h2
                  className="text-lg font-semibold truncate"
                  title={activeChatDetails.name}
                >
                  {activeChatDetails.name}
                </h2>
                {otherParticipantId && isTyping(otherParticipantId) && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    typing…
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {activeChatDetails.isVendor ? "Vendor" : "User"}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaFacebookMessenger size={80} className="text-orange-500" />
            <h2 className="mt-4 text-2xl">No Messages Yet</h2>
            <p className="mt-2">Start a conversation</p>
          </div>
        )}

        {activeChatDetails &&
          (activeChatDetails.pinnedMessages?.length ?? 0) > 0 && (
            <PinnedMessagesSection
              pinnedMessages={activeChatDetails.pinnedMessages ?? []}
              activeMessages={activeMessages}
              onUnpin={handlePinClick}
            />
          )}

        {feedbackMessage && <Toast message={feedbackMessage} />}

        {/* Shared Files (collapsible) */}
        {activeChatDetails && sharedFiles.length > 0 && (
          <div className="flex flex-col p-3 border-b bg-white/70">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Shared Files
                <span className="ml-2 text-xs text-gray-500">
                  ({sharedFiles.length})
                </span>
              </h3>
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700"
                onClick={() => setShowShared((s) => !s)}
              >
                {showShared ? "Hide" : "Show"}
              </button>
            </div>
            {showShared && (
              <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3 lg:grid-cols-4">
                {sharedFiles.map(({ files, index }, i) => (
                  <FilePreview
                    key={`${i}-${files[index]?.url}`}
                    file={files[index]}
                    onClick={() => handleOpenMediaGallery(files, index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeChatDetails && (
          <div
            key={activeChat}
            className="flex-1 p-3 sm:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            <AnimatePresence>
              {activeMessages.length === 0 ? (
                <EmptyState />
              ) : (
                <MessageList
                  messages={visibleMessages}
                  activeChatDetails={activeChatDetails}
                  user={user}
                  onReply={setReplyingTo}
                  onCopy={handleCopyText}
                  onEdit={handleEdit}
                  onDelete={(messageId: string) =>
                    setDeleteDialog({ isOpen: true, messageId })
                  }
                  onPin={handlePinClick}
                  onOpenMedia={handleOpenMediaGallery}
                />
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeChatDetails && replyingTo && (
          <ReplyPreview
            replyingTo={replyingTo}
            activeMessages={activeMessages}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        {activeChatDetails && (
          <MessageInput
            message={message}
            editingMessageId={editingMessageId}
            showEmojiPicker={showEmojiPicker}
            isUploading={uploadProgress !== null}
            uploadProgress={uploadProgress}
            inputRef={messageInputRef as React.RefObject<HTMLTextAreaElement>}
            imageInputRef={imageInputRef as React.RefObject<HTMLInputElement>}
            videoInputRef={videoInputRef as React.RefObject<HTMLInputElement>}
            docInputRef={docInputRef as React.RefObject<HTMLInputElement>}
            onChange={(e) => {
              setMessage(e.target.value);
              // auto-grow textarea for better UX
              const el = messageInputRef.current;
              if (el) {
                el.style.height = "auto";
                const max = 160; // ~max-h-40
                el.style.height = Math.min(el.scrollHeight, max) + "px";
              }
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                editingMessageId ? handleSaveEdit() : handleSendMessage();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setEditingMessageId(null);
                setMessage("");
              }
            }}
            onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)}
            onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
            onFileUpload={handleFileUpload}
            onSaveEdit={handleSaveEdit}
            onSend={handleSendMessage}
            onCancelEdit={() => {
              setEditingMessageId(null);
              setMessage("");
            }}
          />
        )}
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onCancel={() => setDeleteDialog({ isOpen: false, messageId: null })}
        onConfirm={handleDeleteConfirm}
      />

      <VideoPlayer
        isOpen={videoPlayer.isOpen}
        videoUrl={videoPlayer.videoUrl}
        isPlaying={isPlaying}
        isMuted={isMuted}
        currentTime={currentTime}
        duration={duration}
        videoRef={videoRef as React.RefObject<HTMLVideoElement>}
        onClose={() => setVideoPlayer({ isOpen: false, videoUrl: null })}
        onPlayPause={handlePlayPause}
        onToggleMute={handleToggleMute}
        onSave={handleSaveVideo}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <MediaGallery
        isOpen={mediaGallery.isOpen}
        files={mediaGallery.files}
        startIndex={mediaGallery.startIndex}
        onClose={() =>
          setMediaGallery({ isOpen: false, files: null, startIndex: 0 })
        }
        onNext={handleNextMedia}
        onPrev={handlePrevMedia}
      />

      <PinDurationDialog
        isOpen={pinDurationDialog.isOpen}
        onSelectDuration={handleSelectPinDuration}
        onClose={() => setPinDurationDialog({ isOpen: false, messageId: null })}
      />
    </div>
  );
}

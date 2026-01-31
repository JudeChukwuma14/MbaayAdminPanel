import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  TextField,
  Button,
  Typography,
  Avatar,
  Divider,
  Badge,
  IconButton,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Inbox as InboxIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { RootState } from "../redux/store";
import { io, Socket } from "socket.io-client";

// Interface for conversation type
interface Conversation {
  id: string;
  name: string;
  userType: "User" | "Vendor" | "Customer Care";
  lastMessage: string;
  time: string;
  unread: number;
}

// Interface for message type
interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  senderModel: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#F25E40",
    color: "#fff",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid",
      borderColor: "#F25E40",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Inbox = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const adminToken = useSelector((state: RootState) => state.admin.token);
  const API_CHAT_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/admin";
  const token = adminToken ? jwtDecode(adminToken as string) as {
    _id: string;
    name: string;
  } : null;
  const REFRESH_INTERVAL = 10000; // 10 seconds
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  console.log(isBackgroundRefresh);
  const [typingStatus, setTypingStatus] = useState<{
    [key: string]: { isTyping: boolean; name: string };
  }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const SOCKET_SERVER_URL = "https://ilosiwaju-mbaay-2025.com";
  const TYPING_INDICATOR_TIMEOUT = 3000; // 3 seconds

  const fetchConversations = useCallback(
    async (isBackground = false) => {
      if (!adminToken) {
        if (!isBackground) {
          setLoading(false);
          setError("Please log in to view conversations");
        }
        return;
      }
      try {
        if (!isBackground) {
          setLoading(true);
        } else {
          setIsBackgroundRefresh(true);
        }
        const res = await axios.get(
          `${API_CHAT_BASE_URL}/customer_care_messages`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        const formattedConversations: Conversation[] = res.data.chats
          .map((item: any) => {
            try {
              const participant = Array.isArray(item.participants)
                ? item.participants.find(
                    (p: any) =>
                      (p?.model === "users" || p?.model === "vendors") &&
                      p?.details &&
                      p.details._id !== item.customerCare,
                  )
                : null;
              if (!item || typeof item !== "object") {
                console.warn("Invalid chat item:", item);
                return null;
              }
              let participantName = "Customer";
              if (participant?.details) {
                if (participant.model === "vendors") {
                  participantName = participant.details.storeName || "Vendor";
                } else {
                  participantName =
                    participant.details.name ||
                    participant.details.email?.split("@")[0] ||
                    "Customer";
                }
              }
              return {
                id:
                  item._id || `chat-${Math.random().toString(36).substr(2, 9)}`,
                name: participantName,
                userType:
                  participant?.model === "vendors"
                    ? "Vendor"
                    : participant?.model === "users"
                      ? "User"
                      : "Customer Care",
                lastMessage: item.lastMessage?.content
                  ? String(item.lastMessage.content).substring(0, 50) +
                    (String(item.lastMessage.content).length > 50 ? "..." : "")
                  : "No messages yet",
                time: item.updatedAt
                  ? new Date(item.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                unread: item.lastMessage?.isRead === false ? 1 : 0,
              };
            } catch (err) {
              console.error("Error formatting conversation:", err, item);
              return null;
            }
          })
          .filter(
            (conv: Conversation | null): conv is Conversation => conv !== null,
          );
        setConversations(formattedConversations);
        setError(null);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        if (!isBackground) {
          setError("Failed to load conversations. Please try again later.");
        }
      } finally {
        if (!isBackground) {
          setLoading(false);
        } else {
          setIsBackgroundRefresh(false);
        }
      }
    },
    [adminToken],
  );

  const fetchMessages = useCallback(
    async (chatId: string, isBackground = false) => {
      if (!adminToken || !chatId) {
        if (!isBackground) {
          setMessagesLoading(false);
          setError("Please log in to view messages");
        }
        return;
      }
      try {
        if (!isBackground) {
          setMessagesLoading(true);
        }
        const res = await axios.get(
          `${API_CHAT_BASE_URL}/customer_care_chatmessages/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        if (res.data.success && res.data.messages) {
          setMessages(res.data.messages);
          setTimeout(scrollToBottom, 100);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (!isBackground) {
          setError("Failed to load messages. Please try again.");
        }
      } finally {
        if (!isBackground) {
          setMessagesLoading(false);
        }
      }
    },
    [adminToken],
  );

  // Initialize Socket.IO connection
  useEffect(() => {
    // Only initialize Socket.IO if we have an admin token
    if (adminToken) {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create new Socket.IO connection
      socketRef.current = io(SOCKET_SERVER_URL, {
        auth: {
          token: adminToken,
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection established
      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected");
        // Join the selected chat room if available
        if (selectedChat) {
          socketRef.current?.emit("joinChat", { chatId: selectedChat });
        }
      });

      // Handle new messages
      socketRef.current.on(
        "customerCareMessage",
        (data: { chatId: string; message: Message }) => {
          if (data.chatId === selectedChat) {
            // Add the new message to the current chat
            setMessages((prev) => [...prev, data.message]);
            // Scroll to bottom to show the new message
            setTimeout(scrollToBottom, 100);
          }
          // Update conversation list when a new message is received in any chat
          fetchConversations(true);
        },
      );

      // Handle typing indicators
      socketRef.current.on(
        "typing",
        (data: { chatId: string; isTyping: boolean; senderName: string }) => {
          setTypingStatus((prev) => ({
            ...prev,
            [data.chatId]: {
              isTyping: data.isTyping,
              name: data.senderName,
            },
          }));

          // Clear typing indicator after timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          if (data.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setTypingStatus((prev) => ({
                ...prev,
                [data.chatId]: {
                  isTyping: false,
                  name: "",
                },
              }));
            }, TYPING_INDICATOR_TIMEOUT);
          }
        },
      );

      // Handle connection errors
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });

      // Handle disconnection
      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
      });

      // Clean up on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [adminToken, selectedChat, fetchConversations]);

  // Initial load effect - runs only once on component mount
  useEffect(() => {
    fetchConversations();

    // Set up interval for background refresh
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedChat) {
        fetchMessages(selectedChat, true);
      }
    }, REFRESH_INTERVAL);

    // Clean up interval on component unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchConversations, fetchMessages]); // Removed selectedChat from dependencies

  // Effect to handle chat selection changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat, fetchMessages]); // Only runs when selectedChat changes

  // Scroll to bottom of messages when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);
  // Don't select first conversation by default
  // User needs to explicitly select a conversation

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add this effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, selectedChat]); // Re-run when messages or selectedChat changes

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    fetchMessages(chatId);
    if (isMobile) setMobileOpen(false);
  };

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedChat || !socketRef.current?.connected || !token) return;

      socketRef.current.emit("typing", {
        chatId: selectedChat,
        isTyping,
        senderId: token._id || "",
        senderName: token.name || "Admin",
        senderModel: "admins",
      });
    },
    [selectedChat, token?._id, token?.name],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Only send typing start if user wasn't already typing
    if (e.target.value.length === 1) {
      handleTyping(true);
    } else if (e.target.value.length === 0) {
      handleTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !adminToken || !socketRef.current || !token)
      return;

    // Notify that typing has stopped
    handleTyping(false);

    const tempMessageId = `temp-${Date.now()}`;
    const newMessage = {
      _id: tempMessageId,
      content: message,
      sender: {
        _id: token._id || "",
        name: token.name || "Admin",
        email: "support@example.com",
      },
      senderModel: "admins",
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically update the UI
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Send the message via Socket.IO
      socketRef.current.emit("customerCareMessage", {
        chatId: selectedChat,
        content: message,
        tempId: tempMessageId,
      });

      // Also send to the REST API as a fallback
      try {
        await axios.post(
          `${API_CHAT_BASE_URL}/send-message`,
          {
            chatId: selectedChat,
            content: message,
          },
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
            },
          },
        );
      } catch (apiError) {
        console.error("Error sending message via REST API:", apiError);
        // Don't show error to user as Socket.IO might have worked
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic update if there's an error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "79vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Conversations List */}
      <Box
        sx={{
          width: { xs: "100%", md: "350px" },
          borderRight: "1px solid",
          borderColor: "divider",
          display: { xs: mobileOpen ? "block" : "none", md: "block" },
          bgcolor: "background.paper",
          height: "100%",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6">Customer Support</Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search conversations..."
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{
                outline: "#F25E40",
              }}
            />
          </Box>
        </Box>
        <List>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2, textAlign: "center" }}>
              {error}
            </Typography>
          ) : conversations.length === 0 ? (
            <Typography
              sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
            >
              No conversations found
            </Typography>
          ) : (
            conversations.map((conversation) => (
              <React.Fragment key={conversation.id}>
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    selected={selectedChat === conversation.id}
                    onClick={() => handleChatSelect(conversation.id)}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "action.selected",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <StyledBadge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        variant="dot"
                        sx={{ mr: 2 }}
                      >
                        <Avatar>{conversation.name.charAt(0)}</Avatar>
                      </StyledBadge>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography noWrap sx={{ fontWeight: "medium" }}>
                            {conversation.name}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              ({conversation.userType})
                            </Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.time}
                          </Typography>
                        </Box>
                        <Typography
                          noWrap
                          variant="body2"
                          color="text.secondary"
                        >
                          {conversation.lastMessage}
                        </Typography>
                      </Box>
                      {conversation.unread > 0 && (
                        <Box sx={{ ml: 2 }}>
                          <Badge
                            color="primary"
                            badgeContent={conversation.unread}
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              "& .MuiBadge-badge": {
                                backgroundColor: "#F25E40",
                                color: "white",
                                border: "2px solid white",
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          bgcolor: "#f5f5f5",
        }}
      >
        {selectedChat ? (
          <>
            <AppBar
              position="static"
              color="default"
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: theme.zIndex.drawer + 1,
                position: "relative",
                boxShadow: "none",
                display: "flex",
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {conversations
                      .find((c) => c.id === selectedChat)
                      ?.name.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" noWrap>
                      {conversations.find((c) => c.id === selectedChat)?.name ||
                        "User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Online
                    </Typography>
                  </Box>
                </Box>
              </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f5f5f5" }}>
              {messagesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
                >
                  No messages yet. Start the conversation!
                </Typography>
              ) : (
                messages.map((msg) => {
                  // Ensure we have a valid message object
                  if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
                    console.warn("Invalid message format, skipping:", msg);
                    return null;
                  }

                  // Safely extract message properties with defaults
                  const messageId = msg._id
                    ? String(msg._id)
                    : `msg-${Math.random().toString(36).substr(2, 9)}`;
                  const content = msg.content ? String(msg.content) : "";
                  const senderModel = msg.senderModel
                    ? String(msg.senderModel)
                    : "";
                  const messageTime = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  // Skip rendering if we don't have valid content
                  if (!content) {
                    console.warn("Message has no content, skipping:", msg);
                    return null;
                  }

                  return (
                    <Box
                      key={messageId}
                      sx={{
                        display: "flex",
                        justifyContent:
                          senderModel === "admins" ? "flex-end" : "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "70%",
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            senderModel === "admins"
                              ? "#F25E40"
                              : "background.paper",
                          color:
                            senderModel === "admins"
                              ? "common.white"
                              : "text.primary",
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="body1">{content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "right",
                            mt: 0.5,
                            color:
                              senderModel === "admins"
                                ? "rgba(255, 255, 255, 0.7)"
                                : "text.secondary",
                          }}
                        >
                          {messageTime}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box
              sx={{
                p: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <form onSubmit={handleSendMessage}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ width: "100%", position: "relative" }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message..."
                      value={message}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      onBlur={() => handleTyping(false)}
                      variant="outlined"
                      multiline
                      maxRows={3}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          borderColor: "#F25E40",
                          padding: "8px 12px",
                          minHeight: "40px",
                          "& textarea": {
                            padding: "4px 0",
                          },
                        },
                      }}
                    />
                    {typingStatus[selectedChat!]?.isTyping && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "100%",
                          left: 0,
                          mb: 1,
                          p: 1,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          boxShadow: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {typingStatus[selectedChat!].name} is typing
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "text.secondary",
                              animation: "pulse 1.5s infinite",
                              animationDelay: "0s",
                              "@keyframes pulse": {
                                "0%, 100%": {
                                  opacity: 0.3,
                                  transform: "translateY(0)",
                                },
                                "50%": {
                                  opacity: 1,
                                  transform: "translateY(-3px)",
                                },
                              },
                            }}
                          />
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "text.secondary",
                              animation: "pulse 1.5s infinite",
                              animationDelay: "0.2s",
                              "@keyframes pulse": {
                                "0%, 100%": {
                                  opacity: 0.3,
                                  transform: "translateY(0)",
                                },
                                "50%": {
                                  opacity: 1,
                                  transform: "translateY(-3px)",
                                },
                              },
                            }}
                          />
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "text.secondary",
                              animation: "pulse 1.5s infinite",
                              animationDelay: "0.4s",
                              "@keyframes pulse": {
                                "0%, 100%": {
                                  opacity: 0.3,
                                  transform: "translateY(0)",
                                },
                                "50%": {
                                  opacity: 1,
                                  transform: "translateY(-3px)",
                                },
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!message.trim()}
                    sx={{
                      minWidth: "40px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      p: 0,
                      minHeight: "40px",
                      backgroundColor: "#F25E40",
                    }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </form>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              p: 3,
              bgcolor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "400px",
                p: 4,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <InboxIcon
                sx={{ fontSize: 48, color: "text.secondary", opacity: 0.6 }}
              />
              <Typography variant="h6" color="text.primary">
                No conversation selected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a conversation from the list to view messages or start a
                new one
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: "#F25E40",
                }}
                startIcon={<ChatIcon />}
                onClick={() => {
                  if (conversations.length > 0) {
                    setSelectedChat(conversations[0].id);
                  }
                }}
                disabled={conversations.length === 0}
              >
                Start Chatting
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Inbox;

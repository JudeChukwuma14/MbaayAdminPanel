import axios from "axios";

const API_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/chat";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Create or get existing chat
export const create_or_get_chat = async (
  data: { receiverId: string },
  token: any
) => {
  try {
    console.debug("[CHAT] POST /create_or_get_chat", { data });
    const response = await api.post("/create_or_get_chat", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.debug("[CHAT] RESP /create_or_get_chat", {
      status: response.status,
      data: response.data,
    });
    return response.data.chat;
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    throw error;
  }
};

// Send message in a chat
export const sendMessage = async (
  chatId: string,
  data: { content: string; replyTo?: string },
  token: string | null
) => {
  try {
    console.debug(`{CHAT} POST /chat/${chatId}/message`, { data });
    const response = await api.post(`/chat/${chatId}/message`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.debug("[CHAT] RESP message", {
      status: response.status,
      data: response.data,
    });
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get user's chats
export const getUserChats = async (token: string | null) => {
  try {
    console.debug("[CHAT] GET /chats");
    const response = await api.get("/chats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("[CHAT] RESP /chats", {
      status: response.status,
      data: response.data,
    });
    return response.data.chats;
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

// Get messages in a chat
export const getChatMessages = async (chatId: string) => {
  try {
    console.debug(`[CHAT] GET /chat/${chatId}/messages`);
    const response = await api.get(`/chat/${chatId}/messages`);
    console.debug("[CHAT] RESP messages", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
};

// Edit a message
export const editMessage = async (
  messageId: string,
  data: { text: string },
  token: string | null
) => {
  try {
    console.debug(`[CHAT] PATCH /edit/${messageId}`, { data });
    const response = await api.patch(`/edit/${messageId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.debug("[CHAT] RESP edit", {
      status: response.status,
      data: response.data,
    });
    // Normalize to return the updated message object directly
    return (response.data && (response.data.message || response.data.updated || response.data.data)) || response.data;
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (
  messageId: string,
  token: string | null
) => {
  try {
    console.debug(`[CHAT] DELETE /delete/${messageId}`);
    const response = await api.delete(`/delete/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("[CHAT] RESP delete", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const sendMediaMessage = async (
  chatId: string,
  formData: FormData,
  token: string | null,
  onUploadProgress?: (percent: number) => void
) => {
  try {
    console.debug(`[CHAT] POST /chat/${chatId}/send_media_message`);
    const response = await api.post(
      `/chat/${chatId}/send_media_message`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (!onUploadProgress) return;
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            onUploadProgress(percent);
          }
        },
      }
    );
    console.debug("[CHAT] RESP media", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sending media message:", error);
    throw error;
  }
};

// Prepare form data for media messages
export const prepareMediaFormData = (
  files: { images?: File[]; video?: File; documents?: File[] },
  content?: string,
  replyTo?: string
): FormData => {
  const formData = new FormData();

  // Add text content if provided
  if (content && content.trim()) {
    formData.append("content", content.trim());
  }

  // Add replyTo if provided
  if (replyTo) {
    formData.append("replyTo", replyTo);
  }

  // Add images if provided (max 5 as per backend)
  if (files.images && files.images.length > 0) {
    const imagesToUpload = files.images.slice(0, 5); // Limit to 5 images
    imagesToUpload.forEach((image) => {
      formData.append("images", image);
    });
  }

  // Add video if provided (max 1 as per backend)
  if (files.video) {
    formData.append("video", files.video);
  }

  // Add documents if provided (limit to 5 to be safe)
  if (files.documents && files.documents.length > 0) {
    const docsToUpload = files.documents.slice(0, 5);
    docsToUpload.forEach((doc) => {
      formData.append("documents", doc);
    });
  }

  return formData;
};

// Get total unread chat count for a user
export const getUnreadChatCount = async (userId: string) => {
  try {
    const url = `/get_unread_chat_count/${userId}`;
    console.log(`[CHAT] GET ${url}`);
    const res = await api.get(url);
    console.log("[CHAT] RESP unread-count", {
      status: res.status,
      data: res.data,
    });
    // Expecting a shape like { count: number }
    return res.data;
  } catch (error) {
    console.error("Error getting unread chat count:", error);
    throw error;
  }
};

// Mark a chat as read for a user
export const markChatAsRead = async (chatId: string, userId: string) => {
  try {
    const url = `/mark_chat_as_read/${chatId}/${userId}`;
    console.log(`[CHAT] PATCH ${url}`);
    const res = await api.patch(url);
    console.log("[CHAT] RESP mark-as-read", {
      status: res.status,
      data: res.data,
    });
    return res.data;
  } catch (error) {
    console.error("Error marking chat as read:", error);
    throw error;
  }
};




const API_BASE_URL_USER = "https://ilosiwaju-mbaay-2025.com/api/v1/user";

export const Api = axios.create({
  baseURL: API_BASE_URL_USER ,
});

export const GetUserAll = async () => {
  try {
    const response = await Api.get("/alll_users");
    console.log(response.data.data, "All users");
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

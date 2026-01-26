import axios from "axios";

const API_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/vendor";
const CHAT_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/chat";

export const api = axios.create({
  baseURL: API_BASE_URL,
});


export const get_single_vendor = async (token: string | null) => {
  try {
    const response = await api.get("/find_one_vendor", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error(error);
    throw error.response?.data?.message || "Check your network connection";
  }
};


export const getAllVendor = async () => {
  try {
    const response = await api.get("/get_all_vendors");
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error.response?.data?.message || "Check your network connection";
  }
};

export const getAlllVendor = async () => {
  try {
    const response = await api.get("/get_all_vendors");
    // console.log(response.data.vendors);
    return response.data.vendors;
  } catch (error: any) {
    console.error(error);
    throw error.response?.data?.message || "Check your network connection";
  }
};

// Verify Google ID token
export const verifyVendorGoogle = async (idToken: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/google-verify`,
      { token: idToken },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Google verification failed"
    );
  }
};

// Complete Google signup
export const completeVendorSignup = async (data: {
  tempToken: string;
  storeName: string;
  craftCategories: string[];
  storePhone: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/google-complete`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Signup completion failed"
    );
  }
};

export const getVendorStat = async (token: string | null) => {
  try {
    const response = await api.get("/vendorstats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const vendorKycUpload = async (token: string | null, data: any) => {
  try {
    const response = await api.post("/upload_kyc", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const NotBaseUrl = "https://ilosiwaju-mbaay-2025.com/api/v1/notifications";
export const getVendorNotification = async (id: string | null) => {
  try {
    const response = await axios.get(`${NotBaseUrl}/allnotifications/${id}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const markOneAsRead = async (
  vendorId: string | null,
  notificationId: string | null
) => {
  try {
    // Backend expects: {BASE}/notifications/{notificationId}/{vendorId}
    // Here BASE is .../api/v1/notifications, but routes are under an extra 'notifications' segment, consistent with read-all
    const response = await axios.patch(
      `${NotBaseUrl}/notifications/${notificationId}/${vendorId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const markVendorNotificationAsRead = async (id: string | null) => {
  try {
    const response = await axios.patch(
      `${NotBaseUrl}/notifications/read-all/${id}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// ---- Chat helpers (added per request) ----
export const get_unread_chat_count = async (userId: string) => {
  try {
    const res = await axios.get(
      `${CHAT_BASE_URL}/get_unread_chat_count/${userId}`
    );
    console.log("Data" + res);
    return res.data; // expected { count }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const mark_chat_as_read = async (chatId: string, userId: string) => {
  try {
    const res = await axios.patch(
      `${CHAT_BASE_URL}/mark_chat_as_read/${chatId}/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// --- Additional vendor endpoints requested ---
export const changeVendorPassword = async (
  token: string | null,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await api.patch(
      "/change_password",
      { newPassword, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // expected success message
  } catch (error: any) {
    console.error("changeVendorPassword error:", error);
    throw error.response?.data?.message || "Failed to change password";
  }
};

export const updateVendorLocation = async (
  token: string | null,
  location: {
    country?: string;
    state?: string;
    city?: string;
    address1?: string;
    address2?: string;
    postalCode?: string;
    [key: string]: any;
  }
) => {
  try {
    const response = await api.patch("/change_location", location, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // expected updated location
  } catch (error: any) {
    console.error("updateVendorLocation error:", error);
    throw error.response?.data?.message || "Failed to update location";
  }
};

export const initiateVendorEmailChange = async (
  token: string | null,
  email: string
) => {
  try {
    const response = await api.patch(
      "/change_email",
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // expected message: "Email OTP sent"
  } catch (error: any) {
    console.error("initiateVendorEmailChange error:", error);
    throw error.response?.data?.message || "Failed to initiate email change";
  }
};

export const verifyVendorEmail = async (
  token: string | null,
  email: string,
  otp: string
) => {
  try {
    const response = await api.patch(
      "/verify_email",
      { email, otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // expected message: "Email updated" or similar
  } catch (error: any) {
    console.error("verifyVendorEmail error:", error);
    throw error.response?.data?.message || "Failed to verify email";
  }
};

export const updateStoreDetails = async (
  token: string | null,
  details: { storeName?: string; storePhone?: string }
) => {
  try {
    const response = await api.patch("/update_store_details", details, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // expected updated details or success message
  } catch (error: any) {
    console.error("updateStoreDetails error:", error);
    throw error.response?.data?.message || "Failed to update store details";
  }
};

// ---- Reviews endpoints used by vendor ----
const REVIEWS_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/reviews";

/** Reply to a review (public or private reply)
 * PATCH /api/reviews/reply
 * body: { reviewId, message: string, isPublic?: boolean (default true), messageType?: string }
 */
export const replyToReview = async (
  reviewId: string,
  payload: { message: string; isPublic?: boolean; messageType?: string }
) => {
  try {
    // The backend expects reviewId in both the URL params and request body
    const body = { reviewId, ...payload } as Record<string, any>;

    const response = await axios.patch(
      `${REVIEWS_BASE_URL}/reply/${reviewId}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("replyToReview error:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to reply to review"
    );
  }
};

/** Send a private review message (vendor <-> customer)
 * POST /api/reviews/private-message
 * body: { reviewId, message, messageType }
 */
export const sendPrivateReviewMessage = async (
  token: string | null,
  body: { reviewId: string; message: string; messageType?: string }
) => {
  try {
    const response = await axios.post(
      `${REVIEWS_BASE_URL}/private-message`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("sendPrivateReviewMessage error:", error);
    throw error.response?.data?.message || "Failed to send private message";
  }
};

/** Get all reviews for vendor's products
 * GET /api/reviews/vendor
 * Query params: page, limit, status
 * Returns: { reviews: [], stats: {}, pagination: {} }
 */
export const getVendorReviews = async (token: string | null) => {
  try {
    const response = await axios.get(`${REVIEWS_BASE_URL}/vendor`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Re", response);
    return response.data;
  } catch (error: any) {
    console.error("getVendorReviews error:", error);
    throw error.response?.data?.message || "Failed to fetch vendor reviews";
  }
};

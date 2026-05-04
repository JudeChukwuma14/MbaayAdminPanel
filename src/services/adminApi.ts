import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import store from "../components/redux/store";
import { updateAccessToken, logout } from "../components/redux/slices/adminSlice";

const API_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/admin";
export const api = axios.create({
  baseURL: API_BASE_URL,
});

const API_BASE_URL_COM = "https://ilosiwaju-mbaay-2025.com/api/v1/community";

export const com = axios.create({
  baseURL: API_BASE_URL_COM,
});

const API_BASE_URL_PRO = "https://ilosiwaju-mbaay-2025.com/api/v1/products";

export const PRO = axios.create({
  baseURL: API_BASE_URL_PRO,
});

const API_BASE_URL_NOT =
  "https://ilosiwaju-mbaay-2025.com/api/v1/notifications";

export const notApi = axios.create({
  baseURL: API_BASE_URL_NOT,
});

// Axios interceptor to handle token refresh automatically
const instances = [api, com, PRO, notApi];

instances.forEach((instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error status is 401 and there is no originalRequest._retry flag,
      // it means the token has expired and we need to refresh it
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const state = store.getState();
          const refreshToken = state.admin?.refreshToken;
          
          if (refreshToken) {
            const res = await axios.post(`${API_BASE_URL}/refresh_token`, { refreshToken });
            const newAccessToken = res.data?.accessToken || res.data?.token;
            
            if (newAccessToken) {
              store.dispatch(updateAccessToken(newAccessToken));
              // Update the authorization header with the new token
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return instance(originalRequest);
            }
          }
        } catch (err) {
          // If the refresh token is also expired or invalid, log the user out
          store.dispatch(logout());
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
});
export const createAdmin = async (userData: any) => {
  try {
    const response = await api.post("/create_admin", userData);
    return response.data;
  } catch (error: any) {
    console.error("Signup Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to create account";
  }
};

export const loginAdmin = async (userData: any) => {
  try {
    const response = await api.post("/login_admin", userData);
    return response.data;
  } catch (error: any) {
    console.error("Signup Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to create account";
  }
};

export const findOneAdmin = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/find_one_admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Find One Admin Response:", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch admin";
  }
};

export const get_vendor_details = async (id: any) => {
  try {
    const response = await api.get(`/get_vendor_details/${id}`);
    console.log(response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch admin";
  }
};

export const validate_reject_vendor = async (
  id: any,
  action: string,
  token: string | null,
) => {
  try {
    if (!token) throw new Error("Authorization token is missing");

    const response = await api.patch(
      `/validate_requests/${id}`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "Failed to process request",
    );
  }
};

export const getAllVendor = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/vendors/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Fetch Vendor Requests Error:",
      error.response?.data || error,
    );
    throw error;
  }
};
export const getAllUsers = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/users/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Fetch User Requests Error:", error.response?.data || error);
    throw error;
  }
};

export const getAllAdmins = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/admins/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Fetch Admin Requests Error:", error.response?.data || error);
    throw error;
  }
};

export const getUserById = async (id: string | null) => {
  try {
    const response = await api.get(`/one_user/${id}`);

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getVendorById = async (id: string | null) => {
  try {
    const response = await api.get(`/one_vendor/${id}`);

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAdminById = async (
  adminId: string | null,
  token: string | null,
) => {
  try {
    const response = await api.get(`/get_admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllKycRequests = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/view_all_kyc_requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error: any) {
    console.error("Fetch KYC Requests Error:", error.response?.data || error);
    throw error;
  }
};

export const approveKyc = async (token: string | null, vendorId: string) => {
  try {
    const response = await api.patch(
      `/approve_kyc/${vendorId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Approve KYC Error:", error);
    throw error;
  }
};

export const rejectKyc = async (token: string | null, vendorId: string) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.patch(
      `/reject_kyc/${vendorId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Reject KYC Error:", error);
    throw error;
  }
};

export const getAllOrders = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/orders/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Fetch Orders Error:", error.response?.data || error);
    throw error;
  }
};

export const getAdminDashboardStats = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Fetch Dashboard Stats Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const getAdminNotifications = async (
  token: string | null,
  params?: { isRead?: boolean; page?: number; limit?: number },
) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Fetch Admin Notifications Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const getOneOrderForAdmin = async (
  token: string | null,
  orderId: string,
) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.order;
  } catch (error: any) {
    console.error(
      "Fetch One Order For Admin Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const markOneAsRead = async (
  notificationId: string,
  adminId: string,
) => {
  try {
    const response = await notApi.patch(
      `/notifications/${notificationId}/${adminId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Mark One As Read Error:", error);
    throw error;
  }
};

export const markAdminNotificationAsRead = async (adminId: string) => {
  try {
    const response = await notApi.patch(`/notifications/read-all/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    throw error;
  }
};

export const BlockUnblockDeleteUser = async (
  userId: string,
  userType: "user" | "vendor" | "admin" | "customerCare",
  action: "block" | "unblock" | "delete",
  token: string | null,
) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.post(
      "/user/action",
      {
        userId,
        userType,
        action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Block/Unblock/Delete Error:", error.response?.data || error);
    throw error;
  }
};

export const sendPrivateMessage = async (
  recipientId: string,
  recipientType: "user" | "vendor",
  title: string,
  message: string,
  token: string | null,
) => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const response = await api.post(
      "/private-message",
      {
        recipientId,
        recipientType,
        title,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Send Private Message Error:", error.response?.data || error);
    throw error;
  }
};

export const getAllReviews = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    const response = await api.get("/reviews/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Reviews Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Fetch Reviews Error:", error.response?.data || error);
    throw error;
  }
};

export const getAllCustomer_PaymentStats = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/customers/payments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Fetch Customers Payment Stats Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const broadcastMessage = async (
  title: string,
  message: string,
  targetUsers: "all" | "users" | "vendors" | "admins",
  token: string | null,
) => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const response = await api.post(
      "/broadcast",
      {
        title,
        message,
        targetUsers,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Broadcast Error:", error.response?.data || error);
    throw error;
  }
};

export const getAllCommunitysPosts = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/community/posts/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Fetch Communitys Posts Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const getMbaayCommunity = async (token: string | null) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/community/mbaay", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Fetch Mbaay Community Error:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const get_communities = async () => {
  try {
    const response = await com.get(`/all_communities`);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const createPost = async (data: any, token: string | null) => {
  try {
    const response = await api.post("/community/post", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const editMbaayCommunity = async (
  token: string,
  communityData: FormData,
) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.put(`/community/mbaay/edit`, communityData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadAdminProduct = async (
  token: string,
  productData: FormData,
) => {
  try {
    const response = await PRO.post(`/admin_upload_products`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error uploading vendor product:", error);
    throw error;
  }
};

export const getAdminProducts = async (token: any) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get(`/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Admin products response:", response);
    return response.data.products;
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

export const getOneAdminProduct = async (productId: string, token: any) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("One admin product response:", response);
    return response.data.product;
  } catch (error: any) {
    console.error("Error fetching one admin product:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

export const updateAdminProduct = async (
  productId: string,
  formData: FormData,
  token: any,
) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.put(`/products/${productId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Update admin product response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error updating admin product:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

export const deleteAdminProduct = async (productId: string, token: any) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.delete(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Delete admin product response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting admin product:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

export const getAdminPaymentsAndInvoices = async (token: any) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.get("/payments/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching admin payments and invoices:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

export const getVendorProducts = async (token: any) => {
  ``;
  try {
    const response = await PRO.get(`/admin_upload_products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data.products;
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    throw error;
  }
};

// React Query hooks
export const useEditMbaayCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      communityData,
    }: {
      token: string;
      communityData: FormData;
    }) => editMbaayCommunity(token, communityData),
    onSuccess: () => {
      // Invalidate and refetch the Mbaay community data
      queryClient.invalidateQueries({ queryKey: ["mbaay_community"] });
    },
  });
};

export const editAdminProfile = async (formData: FormData, token: any) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await api.put('/profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error editing admin profile:", error);
    throw error.response?.data?.message || error.message || error;
  }
};

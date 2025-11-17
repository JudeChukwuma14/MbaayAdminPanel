import axios from "axios";

const API_BASE_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/admin";
export const api = axios.create({
  baseURL: API_BASE_URL,
});

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
      }
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
      }
    );
    return response;
  } catch (error) {
    console.error("Reject KYC Error:", error);
    throw error;
  }
};

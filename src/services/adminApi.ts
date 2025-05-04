
import axios from "axios";

const API_BASE_URL = "https://mbayy-be.onrender.com/api/v1/admin";
export const api = axios.create({
  baseURL: API_BASE_URL,
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
    return response.data.data.requests

  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch admin";
  }
};

export const get_vendor_details = async (id: any) => {
  try {
   
    const response = await api.get(`/get_vendor_details/${id}`);
    console.log(response.data.data)
    return response.data.data

  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch admin";
  }
};

export const validate_reject_vendor = async (id: any, action: string,token:string | null) => {
  try {

    if (!token) throw new Error("Authorization token is missing");

    const response = await api.patch(
      `/validate_requests/${id}`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Fetch Admin Error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to process request");
  }
};



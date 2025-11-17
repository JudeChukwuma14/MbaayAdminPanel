import axios from "axios";

const API_BASE_URL_Vendor = "https://mbayy-be.onrender.com/api/v1/vendor";

export const vendor = axios.create({
  baseURL: API_BASE_URL_Vendor,
});

const API_BASE_URL_User = "https://mbayy-be.onrender.com/api/v1/user";

export const user = axios.create({
  baseURL: API_BASE_URL_User,
});
const API_BASE_URL_Admin = "https://mbayy-be.onrender.com/api/v1/admin";

export const admin = axios.create({
  baseURL: API_BASE_URL_Admin,
});

export const getAllVendor = async () => {
  try {
    const response = await vendor.get("/get_all_vendors");
    // console.log(response.data.vendors);
    return response.data.vendors;
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await user.get("/alll_users");
    // console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

// export const getAllAdmin = async () => {
//   try {
//     const response = await admin.get()
//   } catch (error) {
//      console.log(error);
//   }
// }

export const getUserById = async (id: string | null) => {
  try {
    const response = await admin.get(`/one_user/${id}`);

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};
export const getVendorById = async (id: string | null) => {
  try {
    const response = await admin.get(`/one_vendor/${id}`);

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User type
interface Admin {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

// Define the state type
interface AdminState {
  admin: Admin | null;
  token: string | null;
}

// Initial state
const initialState: AdminState = {
  admin: null,
  token: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<{ admin: Admin; token: string }>) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
    },
  },
});

// Export actions and reducer
export const { setAdmin, logout } = adminSlice.actions;
export default adminSlice.reducer;

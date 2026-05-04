import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User type
interface Admin {
  id: string;
  name: string;
}

// Define the state type
interface AdminState {
  admin: Admin | null;
  token: string | null;
  refreshToken: string | null;
  role: string | null;
}

// Initial state
const initialState: AdminState = {
  admin: null,
  token: null,
  refreshToken: null,
  role: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (
      state,
      action: PayloadAction<{ admin: Admin; token: string; refreshToken?: string; role: string }>
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.role = action.payload.role;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
    },
  },
});

// Export actions and reducer
export const { setAdmin, updateAccessToken, logout } = adminSlice.actions;
export default adminSlice.reducer;

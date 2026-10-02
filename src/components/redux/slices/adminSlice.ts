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
  sessionVersion: number;
}

// Initial state
const initialState: AdminState = {
  admin: null,
  token: null,
  refreshToken: null,
  role: null,
  sessionVersion: 0,
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
      state.refreshToken = action.payload.refreshToken ?? null;
      state.role = action.payload.role;
      state.sessionVersion = (state.sessionVersion ?? 0) + 1;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string; role?: string }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.role !== undefined) {
        state.role = action.payload.role;
      }
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.sessionVersion = (state.sessionVersion ?? 0) + 1;
    },
  },
});

// Export actions and reducer
export const { setAdmin, updateTokens, logout } = adminSlice.actions;
export default adminSlice.reducer;

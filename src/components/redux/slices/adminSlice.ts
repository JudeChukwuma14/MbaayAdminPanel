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
  role: string | null;
}

// Initial state
const initialState: AdminState = {
  admin: null,
  token: null,
  role: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (
      state,
      action: PayloadAction<{ admin: Admin; token: string; role: string }>
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.role = null;
    },
  },
});

// Export actions and reducer
export const { setAdmin, logout } = adminSlice.actions;
export default adminSlice.reducer;

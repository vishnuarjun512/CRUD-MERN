import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
  username: null,
  profilePic: null,
};

export const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.profilePic = action.payload.profilePic;
    },
    resetUser: (state) => {
      state.userId = null;
      state.username = null;
      state.profilePic = null;
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;

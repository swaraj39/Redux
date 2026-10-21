import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  actions: [],
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addAction: (state, action) => {
      state.actions.unshift({
        type: action.payload.type,
        value: action.payload.value,
        timestamp: new Date().toLocaleTimeString(),
      });
      if (state.actions.length > 20) {
        state.actions.pop();
      }
    },
    clearHistory: (state) => {
      state.actions = [];
    },
  },
});

export const { addAction, clearHistory } = historySlice.actions;

export default historySlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

const initialState: UiState = {
  sidebarOpen:      true,
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar:  (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    toggleCollapse: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleCollapse } = uiSlice.actions;
export default uiSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";
import userReducer from "@/features/userSlice/UserSlice";
import socketReducer from '@/features/socketSlice/SocketSlice'

// We can use redux-persist to resist the user info even after page refresh to improve the user Experience and overall Application's performance

const rootReducer = combineReducers({
  user: userReducer,
  socket : socketReducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only persist the 'user' slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export type RootState = ReturnType<typeof store.getState>

export const persistor = persistStore(store);

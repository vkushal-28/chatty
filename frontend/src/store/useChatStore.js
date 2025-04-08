import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const initialPaginationData = {
  totalMessages: 0,
  totalPages: 1,
  currentPage: 1,
  messagesLoaded: 20,
  hasNextPage: true,
  hasPrevPage: false,
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  pagination: initialPaginationData,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Modify the getMessages function to append messages
  getMessages: async ({ userId, page = 1, limit = 25 }) => {
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(
        `/messages/${userId}?page=${page}&limit=${limit}`
      );
      const { messages, pagination } = res.data;

      // Append new messages when the page is greater than 1
      if (page > 1) {
        set({
          messages: [...get().messages, ...messages],
          pagination,
        });
      } else {
        // Replace messages when it's the first page
        set({
          messages,
          pagination,
        });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  resetMessages: () => {
    console.log("reset called");
    set({
      messages: [],
      pagination: initialPaginationData,
    });
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({
        messages: [res.data, ...messages], // Insert the new message at the start
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // Ensure the message is only added for the selected user
      if (newMessage.senderId === selectedUser._id) {
        set({
          messages: [newMessage, ...get().messages], // Insert at the start for reverse order
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

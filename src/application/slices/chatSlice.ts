// Application State Slice: Chat (Zustand)
// This is the Application layer's state management — NOT Redux, using Zustand per project setup

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatMessage, ChatSession } from "@/domain/entities/Chat";

interface ChatState {
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface ChatActions {
  setSession: (session: ChatSession) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatSlice = create<ChatStore>()(
  devtools(
    (set) => ({
      // State
      session: null,
      messages: [],
      isLoading: false,
      error: null,

      // Actions
      setSession: (session) => set({ session, messages: session.messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearChat: () => set({ session: null, messages: [], error: null }),
    }),
    { name: "ChatSlice" }
  )
);

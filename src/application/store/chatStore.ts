import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatMessage, ChatSession } from "@/types/chat";

interface ChatStore {
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  setSession: (session: ChatSession) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      session: null,
      messages: [],
      isLoading: false,
      error: null,

      setSession: (session) => set({ session, messages: session.messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearChat: () => set({ session: null, messages: [], error: null }),
    }),
    { name: "ChatStore" }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat, Message } from "@/types/types";

interface ChatStore {
  chatHistory: Chat[];
  isWaitingForResponse: boolean;
  setIsWaitingForResponse: (isWaiting: boolean) => void;
  createNewChat: (title: string) => string;
  addNewMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isWaitingForResponse: false,
      setIsWaitingForResponse: (isWaitingForResponse: boolean) =>
        set({ isWaitingForResponse }),
      chatHistory: [],
      createNewChat: (title) => {
        const id = Date.now().toString();
        const newChat = {
          id,
          title,
          messages: [],
        };

        set((state) => ({
          chatHistory: [newChat, ...state.chatHistory],
        }));

        return id;
      },
      addNewMessage: (chatId, message) => {
        set((state) => ({
          chatHistory: state.chatHistory.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          ),
        }));
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

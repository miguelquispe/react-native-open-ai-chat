import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, Animated } from "react-native";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chatStore";
import MessageListItem from "@/components/MessageListItem";
import { useEffect, useRef, useState } from "react";
import {
  createAIImage,
  getResponseMessage,
  getSpeechResponse,
} from "@/services/chatService";

export default function ChatScreen() {
  const flatListRef = useRef<FlatList | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useChatStore((state) =>
    state.chatHistory.find((chat) => chat.id === id)
  );
  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  );
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [chat?.messages]);

  const addNewMessage = useChatStore((state) => state.addNewMessage);

  if (!chat) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Chat not found</Text>
      </View>
    );
  }

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageCreation: boolean,
    audioBase64: string | null
  ) => {
    if (!chat) return;
    setIsWaitingForResponse(true);

    if (!audioBase64) {
      const newMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        message,
        ...(imageBase64 && { image: imageBase64 }),
      };

      addNewMessage(id, newMessage);
    }

    const previousResponseId = chat.messages.findLast(
      (message) => message.responseId
    )?.responseId;

    try {
      let data;

      if (audioBase64) {
        data = await getSpeechResponse(audioBase64, previousResponseId);
        const newMessage = {
          id: Date.now().toString(),
          role: "user" as const,
          message: data.transcribedMessage,
        };

        addNewMessage(id, newMessage);
      } else if (isImageCreation) {
        data = await createAIImage(message);
        console.log("Image creation data:", data);
      } else {
        data = await getResponseMessage(
          message,
          imageBase64,
          previousResponseId
        );
      }

      const aiResponseMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        ...(isImageCreation
          ? { image: data.image }
          : {
              message: data.responseMessage,
              responseId: data.responseId,
            }),
      };

      addNewMessage(chat.id, aiResponseMessage);
    } catch (error) {
      console.error("Chat ID error:", error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={chat?.messages || []}
        keyExtractor={(item) => `key${item.id.toString()}`}
        renderItem={({ item }) => <MessageListItem messageItem={item} />}
        contentContainerStyle={{ paddingTop: 15 }}
        ListFooterComponent={() =>
          isWaitingForResponse && (
            <Animated.Text
              style={{ opacity: 0.5 }}
              className="text-[#939393] px-6 mb-4"
            >
              Waiting for response...
            </Animated.Text>
          )
        }
      />
      <ChatInput onSend={handleSend} />
    </View>
  );
}

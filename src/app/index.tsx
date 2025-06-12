import { View } from "react-native";
import { useRouter } from "expo-router";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chatStore";
import {
  createAIImage,
  getResponseMessage,
  getSpeechResponse,
} from "@/services/chatService";

export default function HomeScreen() {
  const router = useRouter();
  const createNewChat = useChatStore((state) => state.createNewChat);
  const addNewMessage = useChatStore((state) => state.addNewMessage);
  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  );

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageCreation: boolean,
    audioBase64: string | null
  ) => {
    setIsWaitingForResponse(true);
    const chatId = createNewChat(message.slice(0, 50));

    const newMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      message,
      ...(imageBase64 && { image: imageBase64 }),
    };

    addNewMessage(chatId, newMessage);

    router.push(`/chat/${chatId}`);

    try {
      let data;

      if (audioBase64) {
        data = await getSpeechResponse(audioBase64);

        const newMessage = {
          id: Date.now().toString(),
          role: "user" as const,
          message: data.transcribedMessage,
        };

        addNewMessage(chatId, newMessage);
      } else if (isImageCreation) {
        data = await createAIImage(message);
      } else {
        data = getResponseMessage(message, imageBase64);
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

      addNewMessage(chatId, aiResponseMessage);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1" />
      <ChatInput onSend={handleSend} />
    </View>
  );
}

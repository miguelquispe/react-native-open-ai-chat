import { Message } from "@/types/types";
import { Image, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface MessageListItemProps {
  messageItem: Message;
}

export default function MessageListItem({ messageItem }: MessageListItemProps) {
  const { role, message, image } = messageItem;
  console.log("MessageListItem Props:", messageItem);

  console.log(image);

  const isUser = role === "user";

  const markdownStyles = {
    body: {
      color: "white",
    },
    code_inline: {
      backgroundColor: "#1e1e1e",
      color: "white",
      borderRadius: 8,
      padding: 10,
      marginVertical: 10,
      lineHeight: 20,
    },
    code_block: {
      backgroundColor: "#1e1e1e",
      color: "white",
      borderRadius: 8,
      padding: 10,
      marginVertical: 10,
      lineHeight: 20,
    },
    fence: {
      backgroundColor: "#1e1e1e",
      color: "white",
      borderRadius: 8,
      padding: 10,
      marginVertical: 10,
      lineHeight: 20,
    },
    blockquote: {
      backgroundColor: "#2d2d2d",
      borderLeftColor: "#4d4d4d",
      borderLeftWidth: 4,
      paddingLeft: 16,
      paddingVertical: 8,
      marginVertical: 8,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
    },
    hr: {
      backgroundColor: "#4d4d4d",
      marginVertical: 16,
    },
    heading1: {
      marginVertical: 10,
    },
    heading2: {
      marginVertical: 10,
    },
    heading3: {
      marginVertical: 10,
    },
  };

  return (
    <View
      className={`flex-row mb-3 px-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!!image && (
        <Image
          source={{ uri: image }}
          className={`rounded-lg mb-2 ${
            isUser ? "w-[150px] h-[150px]" : "w-full aspect-square"
          }`}
          resizeMode="cover"
        />
      )}
      {!!message && (
        <View
          className={`px-4 py-1 rounded-2xl ${
            isUser && "bg-[#262626] max-w-[70%]"
          }`}
        >
          <Markdown style={markdownStyles}>{message}</Markdown>
        </View>
      )}
    </View>
  );
}

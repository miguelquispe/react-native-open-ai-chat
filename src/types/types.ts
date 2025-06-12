export interface Message {
  id: string;
  role: "user" | "assistant";
  message?: string;
  responseId?: string;
  image?: string; // Base64 encoded image
  audio?: string; // Base64 encoded audio
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

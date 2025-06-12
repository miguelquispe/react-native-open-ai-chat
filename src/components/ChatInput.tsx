import { use, useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  Platform,
  Text,
  ImageBackground,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { useChatStore } from "@/store/chatStore";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system";

interface ChatInputProps {
  onSend: (
    message: string,
    imageBase64: string | null,
    isImageCreation: boolean,
    audioBase64: string | null
  ) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  );
  const [isImageCreation, setIsImageCreation] = useState<boolean>(false);
  // Audio Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioPath, setRecordedAudioPath] = useState<string | null>(
    null
  );
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Image
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const pickImage = async () => {
    let resultImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 1,
    });

    if (!resultImage.canceled && resultImage.assets[0].base64) {
      setImageBase64(`data:image/jpeg;base64,${resultImage.assets[0].base64}`);
    }
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Microphone access denied",
          "Please enable microphone permissions in settings."
        );
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      Alert.alert(
        "Recording Error",
        "Could not start recording. Please try again."
      );
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      if (audioRecorder.uri) {
        setRecordedAudioPath(audioRecorder.uri);
      }
      setIsRecording(false);
    } catch (error) {
      Alert.alert("Recording Error", "Could not stop recording properly.");
    }
  };

  const handleConvertAudio = async () => {
    if (!recordedAudioPath) return null;

    return FileSystem.readAsStringAsync(recordedAudioPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
  };

  const handleSend = async () => {
    setMessage("");
    setImageBase64(null);
    setIsImageCreation(false);
    try {
      const audioBase64 = await handleConvertAudio();
      await onSend(message.trim(), imageBase64, isImageCreation, audioBase64);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View
        className="bg-[#262626] rounded-t-2xl"
        style={{ paddingBottom: insets.bottom }}
      >
        {imageBase64 && (
          <ImageBackground
            source={{ uri: imageBase64 }}
            className="w-[50px] h-[50px] mx-3 mt-2"
            imageStyle={{ borderRadius: 10 }}
          >
            <AntDesign
              name="closecircle"
              size={15}
              color="white"
              onPress={() => setImageBase64(null)}
              className="absolute right-1 top-1"
            />
          </ImageBackground>
        )}
        <TextInput
          placeholder={
            !!recordedAudioPath ? "Send audio message" : "Type a message..."
          }
          placeholderTextColor="grey"
          multiline
          className="text-white pt-6 pb-2 px-4"
          value={message}
          onChangeText={setMessage}
        />
        <View className="flex-row items-center px-4">
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={!!recordedAudioPath || isImageCreation ? "grey" : "white"}
            onPress={pickImage}
            disabled={isImageCreation}
          />
          <MaterialCommunityIcons
            name="palette"
            size={23}
            color={
              !!recordedAudioPath || !!imageBase64
                ? "grey"
                : isImageCreation
                ? "#2d89e5"
                : "white"
            }
            onPress={() => setIsImageCreation(!isImageCreation)}
            disabled={!!imageBase64}
          />
          {!!message || !imageBase64 || isImageCreation ? (
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={30}
              color="white"
              className="ml-auto"
              onPress={handleSend}
              disabled={isWaitingForResponse}
            />
          ) : (
            <View className="ml-auto">
              {!!recordedAudioPath ? (
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="close"
                    size={15}
                    color="black"
                    onPress={() => setRecordedAudioPath(null)}
                    className="bg-white rounded-full p-2"
                  />
                  <Text
                    className="text-black text-xs bg-white rounded-full px-3 py-2"
                    onPress={handleSend}
                  >
                    Send
                  </Text>
                </View>
              ) : (
                <Pressable
                  className="flex-row bg-white rounded-full p-2 items-center gap-1"
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <MaterialCommunityIcons
                    name="account-voice"
                    size={15}
                    color="black"
                  />
                  <Text className="text-black text-xs">
                    {isRecording ? "Stop Recording" : "Voice"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

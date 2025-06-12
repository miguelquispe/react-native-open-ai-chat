import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { StyleSheet } from "react-native";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomDrawerContent from "@/components/HistoryChatDrawer";

export default function RootLayout() {
  const myTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "white",
    },
  };
  return (
    <GestureHandlerRootView>
      <ThemeProvider value={myTheme}>
        <Drawer
          drawerContent={CustomDrawerContent}
          screenOptions={{
            headerTitle: "",
            headerStyle: { backgroundColor: "black" },
            drawerInactiveTintColor: "white",
            drawerStyle: {
              borderRightColor: "grey",
              borderWidth: StyleSheet.hairlineWidth,
            },
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "ChatGPT",
              drawerIcon: () => (
                <FontAwesome5 name="atom" size={18} color="white" />
              ),
            }}
          />
        </Drawer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

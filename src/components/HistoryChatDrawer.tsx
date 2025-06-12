import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { usePathname, router } from "expo-router";
import { useChatStore } from "@/store/chatStore";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const pathname = usePathname();
  const chatHistory = useChatStore((state) => state.chatHistory);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      {chatHistory?.map((item) => {
        const isActive = pathname === `/chat/${item.id}`;

        return (
          <DrawerItem
            key={item.id}
            label={item.title}
            inactiveTintColor="white"
            onPress={() => router.push(`/chat/${item.id}`)}
            focused={isActive}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}

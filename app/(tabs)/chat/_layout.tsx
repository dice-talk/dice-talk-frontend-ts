import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ChatRoom" />
      </Stack>
    );
}
import { Stack } from "expo-router";

export default function PlusLayout() {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="NoticePage" options={{ headerShown: false }} />
        <Stack.Screen name="NoticeDetailPage" options={{ headerShown: false }} />
        <Stack.Screen name="SettingPage" options={{ headerShown: false }} />
        <Stack.Screen name="DeleteReasonPage" options={{ headerShown: false }} />
        <Stack.Screen name="AccountDeletePage" options={{ headerShown: false }} />
      </Stack>
    );
}
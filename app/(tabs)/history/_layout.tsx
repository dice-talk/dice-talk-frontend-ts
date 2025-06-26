import { Stack } from "expo-router";

export default function HistoryLayout() {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="ChatHistoryDetail" options={{headerShown: false}} />
      </Stack>
    );
}
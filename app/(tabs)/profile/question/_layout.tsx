import { Stack } from "expo-router";

export default function () {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="index" /> */}
        <Stack.Screen name="QuestionRegisterPage" />
        <Stack.Screen name="QuestionDetailPage" />
        {/* <Stack.Screen name="QuestionPage" options={{ headerShown: false }} /> */}
      </Stack>
    );
}
import { Stack } from "expo-router";

export default function () {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="MyInfoPage" options={{ headerShown: false }} />
        <Stack.Screen name="QuestionPage" options={{ headerShown: false }} />
        <Stack.Screen name="UsagePage" options={{ headerShown: false }} />
        <Stack.Screen name="ChargePage" options={{ headerShown: false }} />
        <Stack.Screen name="ChangePasswordPage" options={{ headerShown: false }} />
      </Stack>
    );
}
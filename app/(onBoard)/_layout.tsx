import { Stack } from "expo-router";

export default function () {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Login" />
        <Stack.Screen name="FindInfo" />
        <Stack.Screen name="register/_layout" />
      </Stack>
    );
}
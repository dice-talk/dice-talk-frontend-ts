import { Stack } from "expo-router";

export default function () {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Agreement" />
        <Stack.Screen name="Congratulate" />
        <Stack.Screen name="DetailAgreement" />
        <Stack.Screen name="SignupInput" />
        <Stack.Screen name="VerifyCode" />
      </Stack>
    );
}
import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="MyInfoPage" />
        <Stack.Screen name="QuestionPage" />
        <Stack.Screen name="UsagePage" />
        <Stack.Screen name="ChargePage" />
        <Stack.Screen name="ChangePasswordPage" />
        <Stack.Screen name="PaymentScreen" />
        
        <Stack.Screen name="question" />
      </Stack>
    );
}
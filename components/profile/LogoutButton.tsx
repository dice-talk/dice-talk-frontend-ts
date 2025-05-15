// src/components/Profile/LogoutButton.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        onPress: async () => {
          await AsyncStorage.removeItem("accessToken");
          //router.replace("/login");
        },
      },
    ]);
  };

  return (
    <Pressable style={styles.container} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={20} color="#7d7d7d" />
      <Text style={styles.text}>로그아웃</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  text: {
    fontFamily: "Pretendard",
    marginLeft: 8,
    fontSize: 16,
    color: "#7d7d7d",
  },
});

// src/components/Profile/LogoutButton.tsx
import { logoutMember } from "@/api/memberApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text } from "react-native";
import ConfirmModal from "./ConfirmModal";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLogoutPress = () => {
    setIsModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setIsModalVisible(false);
    setIsLoading(true);
    try {
      const loggedOut = await logoutMember();
      if (loggedOut) {
        console.log('LogoutButton: 로그아웃 처리 완료, /(onBoard)로 이동합니다.');
        router.replace('/(onBoard)');
      } else {
        Alert.alert("로그아웃 실패", "로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("LogoutButton: 로그아웃 중 에러 발생", error);
      Alert.alert("로그아웃 오류", "로그아웃 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelLogout = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable style={styles.container} onPress={isLoading ? undefined : handleLogoutPress} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#7d7d7d" style={styles.icon} />
        ) : (
          <Ionicons name="log-out-outline" size={20} color="#7d7d7d" style={styles.icon} />
        )}
        <Text style={styles.text}>로그아웃</Text>
      </Pressable>
      <ConfirmModal 
        visible={isModalVisible}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        cancelText="취소"
        confirmText="로그아웃"
        confirmButtonColor="#B19ADE"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontFamily: "Pretendard",
    fontSize: 16,
    color: "#7d7d7d",
  },
});

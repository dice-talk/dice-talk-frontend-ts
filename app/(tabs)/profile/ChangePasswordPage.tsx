import { updatePassword } from "@/api/memberApi";
import GradientHeader from "@/components/common/GradientHeader";
import NewPassword from "@/components/common/NewPassword";
import MediumButton from "@/components/profile/myInfoPage/MediumButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


// ✅ 비밀번호 변경 API 요청 함수
const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
        Alert.alert("오류", "새 비밀번호가 일치하지 않습니다.");
        return;
    }

    if (!oldPassword || !newPassword) {
        Alert.alert("오류", "현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
        return;
    }
     setLoading(true);
    try {
        await updatePassword(oldPassword, newPassword); // response 변수 사용 안 함, 에러 없으면 성공 간주
        
        // 성공 시 로직 (updatePassword에서 에러가 throw되지 않으면 성공)
        Alert.alert("성공", "비밀번호가 성공적으로 변경되었습니다.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.replace("/profile/MyInfoPage");
        
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            Alert.alert("오류", "현재 비밀번호가 일치하지 않습니다. 다시 한번 확인 후 요청바랍니다.");
        } else if (error.response && error.response.data && error.response.data.message) {
            Alert.alert("오류", error.response.data.message);
        } else {
            Alert.alert("오류", "비밀번호 변경에 실패했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.");
        }
    } finally {
        setLoading(false);
    }
};

    return (
        <View style={styles.container}>
            <GradientHeader title="비밀번호 변경" />
            <View style={styles.content}>
                {/* 현재 비밀번호 입력 */}
                <Text style={styles.label}>현재 비밀번호</Text>
                <View style={styles.inputBlock}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.inputFlex}
                            placeholder="현재 비밀번호를 입력해주세요"
                            secureTextEntry={!showPassword}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            autoCapitalize="none"
                            keyboardType="default"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 새로운 비밀번호 입력 */}
                <NewPassword
                    password={newPassword}
                    confirmPassword={confirmPassword}
                    setPassword={setNewPassword}
                    setConfirmPassword={setConfirmPassword}
                />
            <MediumButton title="비밀번호 변경" onPress={handleChangePassword} />
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    marginTop: 48,
    paddingHorizontal: 24, // 가로 여백
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Pretendard-Bold",
  },
  inputBlock: {
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Pretendard",
  },
});
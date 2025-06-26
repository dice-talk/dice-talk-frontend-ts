import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// 🔹 비밀번호 컴포넌트 타입 지정
type PasswordInputProps = {
  password: string;
  confirmPassword: string;
  setPassword: (text: string) => void;
  setConfirmPassword: (text: string) => void;
};

export default function PasswordInput({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 비밀번호 유효성 검사 (영문 대소문자, 숫자, 특수문자 포함)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,16}$/;

  // 🔹 비밀번호 변경 처리
  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

    // 🔹 비밀번호 유효성 검사 결과
    const isPasswordValid = passwordRegex.test(password);

  // 🔹 비밀번호 일치 여부
  const isMatch = password === confirmPassword && password.length > 0;

  return (
    <View style={styles.container}>
      {/* 비밀번호 입력 */}
      <Text style={styles.label}>비밀번호</Text>
      <Text style={styles.condition}>비밀번호는 영어 대문자, 소문자, 숫자, 특수문자를 포함하며 8-16자여야 합니다.</Text>
      <View style={styles.inputBlock}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            placeholder="비밀번호를 입력해주세요"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={handlePasswordChange}
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
        {password.length === 0 && <Text style={styles.validationText} />} 
        {/* 비밀번호 유효성 검사 메시지 */}
        {password.length > 0 && (
          <Text
            style={[
              styles.validationText,
              { color: isPasswordValid ? "green" : "red" },
            ]}
          >
            {isPasswordValid ? "유효한 비밀번호 입니다." : "유효하지 않은 비밀번호 입니다."}
          </Text>
        )}
      </View>

      {/* 비밀번호 확인 */}
      <Text style={styles.label}>비밀번호 확인</Text>
      <View style={styles.inputBlock}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            placeholder="비밀번호를 다시 입력해주세요"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
        {confirmPassword.length === 0 && <Text style={styles.validationText} />} 
        {/* 비밀번호 일치 여부 메시지 */}
        {confirmPassword.length > 0 && (
          <Text
            style={[
              styles.validationText,
              { color: isMatch ? "green" : "red" }
            ]}
          >
            {isMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Pretendard-Bold",
  },
  condition: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontFamily: "Pretendard",
  },
  inputBlock: {
    marginBottom: 16,
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
  validationText: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
    marginRight: 2,
    fontFamily: "Pretendard",
  },
});

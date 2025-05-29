import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 확인 필요
import { Ionicons } from '@expo/vector-icons'; // 아이콘 라이브러리
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Expo Router 사용
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
//import { useEmail } from '../context/EmailContext'; // 경로 확인 필요 (로그인 시 이메일 저장/사용 여부 재검토)
//import { useMemberContext } from '../context/MemberContext'; // 경로 확인 필요
import { loginMember } from '@/api/loginApi'; // EmailAPI를 loginAPI 등으로 변경 고려, 경로 확인 필요
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // 스토어 상태 확인을 위해 유지
// AsyncStorage는 스토어 사용으로 대체 가능성 있음 (필요시 유지)
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView 사용

// LoginScreenProps 정의 (Expo Router 사용 시 페이지 컴포넌트는 별도 props를 잘 받지 않음)
// interface LoginScreenProps {} // 필요시 정의

export default function LoginScreen() {
  const router = useRouter();
  // 스토어 set 함수들은 loginApi.ts에서 호출하므로 여기서는 직접 사용하지 않음

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (text: string): void => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  const validatePassword = (text: string): void => {
    setPassword(text);
    setIsPasswordValid(text.length > 0); // 비밀번호는 비어있지 않은지만 체크
  };

  const canSubmit = isEmailValid && isPasswordValid && !isLoading;

  const handleLogin = async (): Promise<void> => {
    if (!canSubmit) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 올바르게 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // loginMember 함수는 성공 시 응답 객체를 반환하고,
      // 내부적으로 memberId와 token을 Zustand 스토어에 저장합니다.
      await loginMember(email, password); 
      
      // 스토어에 memberId와 token이 정상적으로 저장되었는지 확인 후 화면 전환
      const storedMemberId = useMemberInfoStore.getState().memberId;
      const storedToken = useMemberInfoStore.getState().token;

      if (storedMemberId && storedToken) {
        router.replace('/(tabs)/home');
      } else {
        // 이 경우는 loginApi.ts 내부 로직 오류 또는 응답 문제로 스토어 저장이 실패한 경우입니다.
        // loginApi.ts에서 이미 에러를 throw 하므로, 이 블록은 실행되지 않을 가능성이 높습니다.
        console.error('로그인 후 스토어 확인 실패: memberId 또는 token이 저장되지 않았습니다.');
        Alert.alert('로그인 실패', '로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      // loginApi.ts에서 발생한 에러 또는 네트워크 에러 등을 여기서 처리합니다.
      console.error('로그인 요청 실패:', error);
      const errMsg = error.message || '이메일 또는 비밀번호가 일치하지 않습니다.';
      Alert.alert('로그인 실패', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <LinearGradient
              colors={["#B28EF8", "#F476E5"]} // 기존 그라데이션 유지 [cite: 3]
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.iconContainer}
            >
              {/* 로그인에 어울리는 아이콘으로 변경 또는 기존 아이콘 활용 */}
              <Ionicons name="lock-closed-outline" size={30} color="white" />
            </LinearGradient>

            <Text style={styles.title}>로그인</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#8A8A8F" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="이메일 주소"
                placeholderTextColor="#B3B3B3" //[cite: 3]
                keyboardType="email-address" //[cite: 3]
                autoCapitalize="none" //[cite: 3]
                autoCorrect={false} //[cite: 3]
                value={email}
                onChangeText={validateEmail}
                returnKeyType="next"
                onSubmitEditing={() => { /* passwordInputRef.current.focus() */ }} // 다음 입력창으로 포커스 이동 (ref 필요)
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={22} color="#8A8A8F" style={styles.inputIcon} />
              <TextInput
                // ref={passwordInputRef} // 포커스 이동을 위해 ref 설정 가능
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#B3B3B3"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={validatePassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#8A8A8F"
                />
              </TouchableOpacity>
            </View>

            {/* "이메일/비밀번호 찾기"는 요구사항에 따라 제거됨 */}

            <View style={styles.buttonWrapper}>
              <MediumButton
                title="로그인"
                onPress={handleLogin}
                //disabled={!canSubmit} // 제출 가능 상태에 따라 비활성화
              />
                {/* {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>로그인</Text>
                )}
              </MediumButton> */}
            </View>

            {/* 회원가입 버튼 (선택 사항) */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={() => router.push('/(onBoard)/register')}>
                <Text style={[styles.signupText, styles.signupLink]}>회원가입</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 기존 배경색 유지 [cite: 3]
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 30, // 좌우 패딩 증가
  },
  iconContainer: {
    width: 80, // 아이콘 크기 증가
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5, // 그림자 효과
    shadowColor: '#B28EF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28, // 타이틀 크기 증가
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF', // 입력창 배경색
    borderRadius: 12, // 둥근 모서리
    paddingHorizontal: 15,
    marginBottom: 20, // 입력창 간 간격
    borderWidth: 1,
    borderColor: '#E0E0E0', // 부드러운 테두리 색상
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 16 : 12, // 플랫폼별 패딩 조정
    // borderBottomWidth: 0, // 기존 밑줄 제거
  },
  eyeIcon: {
    padding: 8, // 터치 영역 확보
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 20, // 버튼 위 간격
  },
  buttonText: {
    color: "white", //[cite: 3]
    fontSize: 18, // 버튼 텍스트 크기 증가
    fontWeight: '600',
  },
  // disabledButton 스타일은 LongButton 내부에서 disabled prop에 따라 처리되도록 가정
  signupContainer: {
    flexDirection: 'row',
    marginTop: 30, // 로그인 버튼과의 간격
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    color: '#B28EF8', // 그라데이션 색상 활용
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
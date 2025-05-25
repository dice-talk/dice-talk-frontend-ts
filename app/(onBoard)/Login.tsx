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
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // memberInfoStore 임포트
// AsyncStorage는 스토어 사용으로 대체 가능성 있음 (필요시 유지)
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView 사용

// LoginScreenProps 정의 (Expo Router 사용 시 페이지 컴포넌트는 별도 props를 잘 받지 않음)
// interface LoginScreenProps {} // 필요시 정의

export default function LoginScreen() {
  const router = useRouter();
  const setMemberInfoInStore = useMemberInfoStore((state) => state.setMemberInfo);
  const setTokenInStore = useMemberInfoStore((state) => state.setToken);
  // const setEmailInStore = useMemberInfoStore((state) => state.setEmail); // 필요시 이메일도 스토어에 저장

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false); // 비밀번호 유효성도 체크 가능

  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태 추가

  // 이메일 유효성 검사 (간단한 형식 체크)
  const validateEmail = (text: string): void => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  // 비밀번호 유효성 검사 (예: 최소 길이) - API 요구사항에 따라 조절
  const validatePassword = (text: string): void => {
    setPassword(text);
    //setIsPasswordValid(text.length >= 8); // 예시: 8자 이상일 때 유효
    // 로그인에서는 보통 길이 제한만 두거나, 서버에서 상세 유효성 검사를 합니다.
    // 기존 코드의 정규식은 회원가입용으로 보이므로, 로그인에서는 단순 길이 체크나 비어있지 않음 정도만 해도 무방합니다.
    setIsPasswordValid(text.length > 0); // 비어있지 않음으로 체크
  };

  const canSubmit = isEmailValid && isPasswordValid && !isLoading;

  const handleLogin = async (): Promise<void> => {
    if (!canSubmit) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 올바르게 입력해주세요.");
      return;
    }

    setIsLoading(true); // 로딩 시작
    try {
      // API 요청 시 username으로 email을 전달
      const result = await loginMember(email, password); // API 함수명 및 파라미터 확인
      console.log('로그인 서버 응답:', result);

      // 사용자 정보 및 토큰 저장 (Zustand 스토어 사용)
      if (result.body && result.body.memberInfo && result.body.token) { // API 응답 구조 확인 필요
        setMemberInfoInStore(result.body.memberInfo);
        setTokenInStore(result.body.token);
        // setEmailInStore(email); // 로그인 성공 시 이메일도 스토어에 저장하려면 활성화

        // AsyncStorage 사용은 주석 처리 (스토어가 주 저장소 역할)
        // await AsyncStorage.setItem('accessToken', result.body.token);
        // await AsyncStorage.setItem('memberId', result.body.memberInfo.memberId || ''); // memberInfo 구조에 따라 memberId 접근
        // await AsyncStorage.setItem('username', result.body.memberInfo.email || email); 

        // 로그인 성공 후 메인 화면 등으로 이동
        router.replace('/(tabs)/home'); 
      } else {
        // API 응답 구조가 예상과 다를 경우 에러 처리
        console.error('로그인 실패: 유효하지 않은 서버 응답 형식', result);
        Alert.alert('로그인 실패', '서버로부터 올바른 사용자 정보를 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || '이메일 또는 비밀번호가 일치하지 않습니다.';
      Alert.alert('로그인 실패', errMsg);
    } finally {
      setIsLoading(false); // 로딩 종료
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
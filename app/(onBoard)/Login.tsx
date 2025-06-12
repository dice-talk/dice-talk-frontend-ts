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
// AsyncStorage는 스토어 사용으로 대체 가능성 있음 (필요시 유지)
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPushTokenToServer } from '@/api/notificationApi'; // <<<<<< [수정] 주석 해제
import useAuthStore from '@/zustand/stores/authStore'; // <<<<<< 스토어 임포트
// import Constants from 'expo-constants'; // notificationUtils로 이동
// import * as Device from 'expo-device'; // notificationUtils로 이동
// import * as Notifications from 'expo-notifications'; // notificationUtils에서 주로 사용, 여기서는 직접 호출 X
import { registerForPushNotificationsAsync } from '@/utils/notificationUtils'; // << IMPORT 경로 수정
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView 사용

// 알림 핸들러: 앱이 실행 중일 때 알림이 오면 어떻게 처리할지 설정
// 이 부분은 _layout.tsx 로 이동될 예정이므로 여기서는 주석 처리하거나 삭제 가능.
// 만약 _layout.tsx에서 이미 설정했다면 여기서는 필요 없음.
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 앱 실행 중에도 알림을 표시할지 여부
    shouldPlaySound: false, // 소리 재생 여부 (앱 내 설정과 연동 가능)
    shouldSetBadge: false, // 뱃지 카운트 설정 여부
  }),
});
*/

// LoginScreenProps 정의 (Expo Router 사용 시 페이지 컴포넌트는 별도 props를 잘 받지 않음)
// interface LoginScreenProps {} // 필요시 정의

export default function LoginScreen() {
  const router = useRouter();
  // const { memberInfo } = useAuthStore((state) => ({ // memberInfo에 id가 있다고 가정
  //   memberInfo: state.memberInfo, // 이전 코드
  // }));
  // authStore에서 직접 memberId를 가져오도록 수정
  const memberId = useAuthStore((state) => state.memberId);

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
      // loginMember 함수는 성공 시 true를 반환합니다.
      const loginSuccess = await loginMember(email, password); 
      
      if (loginSuccess) {
        console.log('로그인 성공, 푸시 알림 토큰 등록 및 전송 시도');
        const expoPushToken = await registerForPushNotificationsAsync();

        // memberInfo가 업데이트 되는 시점을 고려해야 할 수 있음 (loginMember 내부에서 스토어 업데이트 후 비동기적일 수 있음)
        // authStore.getState().memberInfo?.id 와 같이 최신 상태를 직접 가져오는 것을 고려하거나,
        // memberInfo가 확실히 업데이트된 후 이 로직을 실행하도록 보장해야 함.
        // 여기서는 loginMember 후 memberInfo가 업데이트 되었다고 가정.
        const currentMemberId = useAuthStore.getState().memberId;

        if (expoPushToken && currentMemberId) {
          try {
            await sendPushTokenToServer(expoPushToken); // <<<<<< [수정] memberId 인자 제거
            console.log('Expo 푸시 토큰 서버 전송 성공:', expoPushToken, 'for memberId:', currentMemberId);
          } catch (tokenError) {
            console.error('Expo 푸시 토큰 서버 전송 실패 (LoginScreen catch):', tokenError);
            // 사용자에게 이 오류를 직접적으로 알릴 필요는 없을 수 있지만, 개발/디버깅 시에는 중요합니다.
            // Alert.alert('알림 설정 오류', '푸시 알림 설정을 완료하지 못했습니다. 나중에 다시 시도해주세요.');
          }
        } else {
          if (!expoPushToken) console.log('Expo 푸시 토큰을 얻지 못했거나 실제 기기가 아닙니다. (서버 전송 시도 안 함)');
          if (!currentMemberId) console.log('사용자 ID를 찾을 수 없어 토큰을 서버에 전송할 수 없습니다.');
        }
        
        // 스토어에 저장이 완료되었으므로, 여기서 스토어를 다시 읽을 필요 없이 바로 화면 전환
        console.log('로그인 성공 및 스토어 저장 확인, 홈으로 이동');
        router.replace('/(tabs)/home');
      } else {
        // loginMember 내부에서 false를 반환하는 경우는 현재 없지만, 방어적으로 로직 추가
        // (대부분의 실패는 에러를 throw하므로 catch 블록으로 감)
        console.error('loginMember가 false를 반환 (예상치 못한 경우)');
        Alert.alert('로그인 실패', '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      // loginMember 함수에서 throw된 에러를 여기서 처리합니다.
      console.error('로그인 요청 실패 (LoginScreen catch):', error);
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

            <TouchableOpacity style={styles.findInfoContainer} onPress={() => router.push('/(onBoard)/FindInfo')}>
              <Text style={styles.findInfoText}>이메일/비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>

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
  },
  buttonText: {
    color: "white", //[cite: 3]
    fontSize: 18, // 버튼 텍스트 크기 증가
    fontWeight: '600',
  },
  findInfoContainer: {
    marginTop: 30, // 로그인 버튼과의 간격
    alignItems: 'center',
  },
  findInfoText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  // disabledButton 스타일은 LongButton 내부에서 disabled prop에 따라 처리되도록 가정
  signupContainer: {
    flexDirection: 'row',
    marginTop: 25, // 로그인 버튼과의 간격
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
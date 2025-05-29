import PasswordInput from '@/components/common/NewPassword'; // 비밀번호 입력 컴포넌트
import Tab from '@/components/common/Tab'; // 생성한 탭 컴포넌트 임포트
import TossAuth from '@/components/common/TossAuth';
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { Ionicons } from '@expo/vector-icons'; // 뒤로가기 아이콘 사용
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView 추가

// API 호출 함수 (가상)
// 실제 API 주소 및 요청/응답 형식에 맞게 수정 필요
const findIdApi = async (authInfo: any) => { // Toss 인증 정보를 받아 이메일 반환 가정
  console.log('API CALL: findIdApi', authInfo);
  // 가상 응답 (실제로는 API 호출)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (authInfo) { // Toss 인증 성공했다고 가정
        resolve({ success: true, email: 'user***@example.com' });
      } else {
        reject({ success: false, message: '본인 인증에 실패했습니다.' });
      }
    }, 1000);
  });
};

const requestPasswordAuthCodeApi = async (email: string) => {
  console.log('API CALL: requestPasswordAuthCodeApi', email);
  // 가상 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '인증번호가 발송되었습니다.' });
    }, 1000);
  });
};

const verifyPasswordAuthCodeApi = async (email: string, code: string) => {
  console.log('API CALL: verifyPasswordAuthCodeApi', email, code);
  // 가상 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      if (code === '123456') { // 테스트용 인증번호
        resolve({ success: true, message: '인증되었습니다.' });
      } else {
        resolve({ success: false, message: '인증번호가 올바르지 않습니다.' });
      }
    }, 1000);
  });
};

const resetPasswordApi = async (email: string, newPassword: string) => {
  console.log('API CALL: resetPasswordApi', email, newPassword);
  // 가상 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '비밀번호가 변경되었습니다.' });
    }, 1000);
  });
};


export default function FindInfoScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'findId' | 'findPassword'>('findId');
  const tabs = ['아이디 찾기', '비밀번호 찾기']; // 탭 이름 변경

  // 아이디 찾기 관련 state
  const [showTossAuthForId, setShowTossAuthForId] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [idFindingLoading, setIdFindingLoading] = useState(false);
  const [idFindingError, setIdFindingError] = useState<string | null>(null);

  // 비밀번호 찾기 관련 state
  const [emailForPassword, setEmailForPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [codeVerifyLoading, setCodeVerifyLoading] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordFindingError, setPasswordFindingError] = useState<string | null>(null);
  const [authCodeRequestLoading, setAuthCodeRequestLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3분 타이머
  const [isTimerActive, setIsTimerActive] = useState(false);

  //const setEmailInStore = useMemberInfoStore((state) => state.setEmail); // 스토어 액션

  // 아이디 찾기 - Toss 인증 성공 콜백
  const handleFindIdAuthSuccess = async (tossAuthInfo: any) => {
    console.log('Toss 인증 성공 (아이디 찾기):', tossAuthInfo); 
    setShowTossAuthForId(false);
    setIdFindingLoading(true);
    setFoundEmail(null);
    setIdFindingError(null);
    try {
      // 백엔드에 이메일 조회 요청 (Toss 결과 기반) -> 이 부분은 TossAuth 내부에서 처리되거나, 별도 API 필요
      // 현재는 onAuthSuccess에서 사용자 정보가 바로 온다고 가정하고, 그 정보로 API 호출
      // 실제로는 tossAuthInfo에 txId등이 오고, 그걸로 백엔드에 다시 요청해야 할 수 있음
      // const response: any = await findIdApi(tossAuthInfo); // API 호출
      // if (response.success && response.email) {
      //   setFoundEmail(response.email);
      // } else {
      //   setIdFindingError(response.message || '가입된 이메일을 찾을 수 없습니다.');
      // }
      // TossAuth에서 이미 사용자 정보를 가져오므로, 해당 정보를 사용 (데모용)
      if (tossAuthInfo && tossAuthInfo.name) { // 이름이 있다는 것은 정보가 있다는 뜻으로 간주 (실제로는 email 필드 확인)
        // 이메일 정보를 스토어 또는 상태에 저장해야 함.
        // 백엔드에서 실제 이메일을 받아와야 하므로, 임시로 고정값 사용
        const mockEmail = `${tossAuthInfo.name.substring(0,1)}${tossAuthInfo.phone.slice(-4)}@example.com`; // 예시 이메일
        setFoundEmail(mockEmail); // 실제로는 API를 통해 받은 이메일
        //setEmailInStore(mockEmail); // 필요시 스토어에 저장
      } else {
        setIdFindingError('본인 인증 결과에서 사용자 정보를 가져올 수 없습니다.');
      }

    } catch (error) {
      console.error('아이디 찾기 에러:', error);
      setIdFindingError('아이디를 찾는 중 오류가 발생했습니다.');
    } finally {
      setIdFindingLoading(false);
    }
  };

  const handleFindIdAuthFailure = () => {
    setShowTossAuthForId(false);
    setIdFindingError('Toss 본인 인증에 실패했습니다.');
    Alert.alert('인증 실패', '본인 인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.');
  };

  // 비밀번호 찾기 - 인증번호 요청
  const handleRequestAuthCode = async () => {
    if (!emailForPassword) {
      Alert.alert('입력 오류', '이메일 주소를 입력해주세요.');
      return;
    }
    setAuthCodeRequestLoading(true);
    setPasswordFindingError(null);
    try {
      const response: any = await requestPasswordAuthCodeApi(emailForPassword);
      if (response.success) {
        Alert.alert('알림', response.message);
        setIsCodeSent(true);
        setTimer(180);
        setIsTimerActive(true);
      } else {
        setPasswordFindingError(response.message || '인증번호 요청에 실패했습니다.');
        Alert.alert('오류', response.message || '인증번호 요청에 실패했습니다.');
      }
    } catch (error) {
      setPasswordFindingError('인증번호 요청 중 오류가 발생했습니다.');
      Alert.alert('오류', '인증번호 요청 중 오류가 발생했습니다.');
    } finally {
      setAuthCodeRequestLoading(false);
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      if (interval) clearInterval(interval);
      // Alert.alert('시간 만료', '인증번호 유효 시간이 만료되었습니다. 다시 요청해주세요.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  // 비밀번호 찾기 - 인증번호 확인
  const handleVerifyAuthCode = async () => {
    if (!authCode) {
      Alert.alert('입력 오류', '인증번호를 입력해주세요.');
      return;
    }
    setCodeVerifyLoading(true);
    setPasswordFindingError(null);
    try {
      const response: any = await verifyPasswordAuthCodeApi(emailForPassword, authCode);
      if (response.success) {
        Alert.alert('인증 성공', response.message);
        setIsCodeVerified(true);
        setIsTimerActive(false); // 인증 성공 시 타이머 중지
      } else {
        setPasswordFindingError(response.message || '인증번호 확인에 실패했습니다.');
        Alert.alert('인증 실패', response.message || '인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setPasswordFindingError('인증번호 확인 중 오류가 발생했습니다.');
      Alert.alert('오류', '인증번호 확인 중 오류가 발생했습니다.');
    } finally {
      setCodeVerifyLoading(false);
    }
  };

  // 비밀번호 찾기 - 새 비밀번호 변경
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('입력 오류', '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    // NewPassword 컴포넌트 내부의 유효성 검사도 통과해야 함 (별도 상태로 관리하거나, NewPassword에서 콜백 받을 수 있음)
    // 여기서는 간단히 길이만 체크
    if (newPassword.length < 8) { // 실제 유효성 검사는 NewPassword 컴포넌트와 연동 필요
        Alert.alert('입력 오류', '비밀번호는 8자 이상이어야 합니다.');
        return;
    }

    setPasswordResetLoading(true);
    setPasswordFindingError(null);
    try {
      const response: any = await resetPasswordApi(emailForPassword, newPassword);
      if (response.success) {
        Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.', [
          { text: '확인', onPress: () => router.replace('/(onBoard)/Login') },
        ]);
        // 상태 초기화
        setEmailForPassword('');
        setAuthCode('');
        setIsCodeSent(false);
        setIsCodeVerified(false);
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordFindingError(response.message || '비밀번호 변경에 실패했습니다.');
        Alert.alert('오류', response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setPasswordFindingError('비밀번호 변경 중 오류가 발생했습니다.');
      Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const renderFindIdContent = () => (
    <View style={styles.contentInnerContainer}>
      <Text style={styles.infoText}>본인 인증을 통해 가입된 {'\n'} 이메일 주소를 확인할 수 있습니다.</Text>
      <MediumButton 
        title="Toss 본인 인증으로 아이디 찾기" 
        onPress={() => {
          setFoundEmail(null);
          setIdFindingError(null);
          setShowTossAuthForId(true); 
        }}
        // disabled={idFindingLoading || showTossAuthForId} // 버튼 비활성화 조건 추가
      />
      {showTossAuthForId && (
        <TossAuth 
          onAuthSuccess={handleFindIdAuthSuccess} 
          onAuthFailure={handleFindIdAuthFailure} 
          // targetScreen 설정 불필요 (여기서는 콜백으로 처리)
        />
      )}
      {idFindingLoading && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
      {idFindingError && <Text style={styles.errorText}>{idFindingError}</Text>}
      {foundEmail && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>회원님의 이메일 주소는 다음과 같습니다.</Text>
          <Text style={styles.resultEmail}>{foundEmail}</Text>
          <MediumButton title="로그인 하러 가기" onPress={() => router.replace('/(onBoard)/Login')} />
        </View>
      )}
    </View>
  );

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderFindPasswordContent = () => (
    <View style={styles.contentInnerContainer}>
      {!isCodeVerified ? (
        <>
          <Text style={styles.infoText}>가입하신 이메일 주소를 입력해주세요.</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일 주소 입력"
            value={emailForPassword}
            onChangeText={setEmailForPassword}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isCodeSent} // 코드 발송 후에는 수정 불가
          />
          {isCodeSent && (
            <View style={styles.authCodeContainer}>
              <TextInput
                style={styles.input}
                placeholder="인증번호 6자리 입력"
                value={authCode}
                onChangeText={setAuthCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              {isTimerActive && <Text style={styles.timerText}>{formatTime(timer)}</Text>}
            </View>
          )}
          
          {passwordFindingError && !isCodeSent && <Text style={styles.errorText}>{passwordFindingError}</Text>}

          {!isCodeSent ? (
            <MediumButton 
              title="인증번호 요청"
              onPress={handleRequestAuthCode} 
              //disabled={authCodeRequestLoading} // isLoading prop으로 대체 가능
              //isLoading={authCodeRequestLoading} // MediumButton에 isLoading prop 추가 시
            />
          ) : (
            <MediumButton 
              title="확인"
              onPress={handleVerifyAuthCode} 
              //disabled={codeVerifyLoading}
              //isLoading={codeVerifyLoading}
            />
          )}
          {isCodeSent && passwordFindingError && <Text style={styles.errorText}>{passwordFindingError}</Text>}
        </>
      ) : (
        <View style={styles.newPasswordContainer}>
          <Text style={styles.infoText}>새로운 비밀번호를 입력해주세요.</Text>
          <PasswordInput 
            password={newPassword}
            confirmPassword={confirmNewPassword}
            setPassword={setNewPassword}
            setConfirmPassword={setConfirmNewPassword}
          />
          {passwordFindingError && <Text style={styles.errorText}>{passwordFindingError}</Text>}
          <MediumButton 
            title="비밀번호 변경"
            onPress={handleChangePassword} 
            //disabled={passwordResetLoading}
            //isLoading={passwordResetLoading}
          />
        </View>
      )}
      {(authCodeRequestLoading || codeVerifyLoading || passwordResetLoading) && 
        <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />
      }
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 찾기</Text> 
        {/* 헤더 오른쪽에 공간 확보를 위한 빈 View (필요시 사용) */}
        <View style={styles.headerRightPlaceholder} /> 
      </View>
      <Tab 
          tabs={tabs} 
          activeTab={activeTab === 'findId' ? tabs[0] : tabs[1]} 
          onTabChange={(tabName) => setActiveTab(tabName === tabs[0] ? 'findId' : 'findPassword')} 
      />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        {activeTab === 'findId' ? renderFindIdContent() : renderFindPasswordContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10, // 상하 패딩 조정
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // marginTop 제거 또는 조정 (SafeAreaView가 상단 여백 처리)
  },
  backButton: {
    padding: 5, // 터치 영역 확보
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24, // 아이콘 크기와 유사하게 설정하여 균형 맞춤
    padding: 5,
  },
  scrollContainer: { // ScrollView 자체 스타일
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 50, 
  },
  contentContainer: { // 이 스타일은 이제 contentInnerContainer로 대체 또는 병합
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentInnerContainer: { // 각 탭 콘텐츠를 감싸는 View
    paddingHorizontal: 20,
    paddingTop: 20, // 탭과 콘텐츠 사이 여백
    paddingBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20, // 간격 조정
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20, // 간격 조정
    backgroundColor: '#f9f9f9',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 25, // 간격 조정
    alignItems: 'center',
    padding: 20, // 패딩 조정
    backgroundColor: '#F3EFFF', // 배경색 변경 (Tab 컴포넌트 비활성 배경과 유사하게)
    borderRadius: 12, // 둥근 모서리 강화
    borderWidth: 1,
    borderColor: '#E8D8FA',
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  resultEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 25, // 버튼과의 간격
  },
  authCodeContainer: {
    marginBottom: 20, // 간격 조정
  },
  timerText: {
    textAlign: 'right',
    color: '#B28EF8',
    fontSize: 14,
    marginTop: -10, // 위치 조정
    marginRight: 5,
    marginBottom: 10,
  },
  newPasswordContainer: {
    marginTop: 15, // 간격 조정
  }
});

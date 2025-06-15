import { findEmailByTxId, requestPasswordResetUriAfterToss, resetPasswordAfterTossAuth } from '@/api/findApi';
import AlertModal from '@/components/common/AlertModal';
import PasswordInput from '@/components/common/NewPassword';
import Tab from '@/components/common/Tab';
import Toast from '@/components/common/Toast';
import TossAuth, { TossAuthSuccessData } from '@/components/common/TossAuth';
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react'; // useCallback 추가
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PasswordResetContext {
  memberId: number;
  email: string; 
}

export default function FindInfoScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'findId' | 'findPassword'>('findId');
  const tabs = ['아이디 찾기', '비밀번호 찾기'];

  // 아이디 찾기 관련 state
  const [showTossAuthForId, setShowTossAuthForId] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [idFindingLoading, setIdFindingLoading] = useState(false);

  // 비밀번호 찾기 관련 state (새로운 흐름에 맞게 수정)
  const [emailForPassword, setEmailForPassword] = useState('');
  const [showTossAuthForPassword, setShowTossAuthForPassword] = useState(false);
  const [passwordAuthLoading, setPasswordAuthLoading] = useState(false); // Toss 인증 & URI 요청 로딩
  const [passwordResetContext, setPasswordResetContext] = useState<PasswordResetContext | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false); // 최종 비밀번호 변경 로딩
  
  // Toast 상태 추가
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // AlertModal 상태
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | null>(null);

  const showAlert = useCallback((title: string, message: string, onConfirm?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    if (onConfirm) {
      setAlertOnConfirm(() => onConfirm);
    } else {
      setAlertOnConfirm(null);
    }
    setIsAlertVisible(true);
  }, []); // state setter는 안정적이므로 의존성 배열은 비워둡니다.

  // 아이디 찾기 - Toss 인증 성공 콜백
  const handleFindIdAuthSuccess = useCallback(async (tossAuthResult: TossAuthSuccessData) => {
    setShowTossAuthForId(false);
    const { txId } = tossAuthResult;
    if (txId) { 
      setIdFindingLoading(true);
      setFoundEmail(null);
      try {
        const response = await findEmailByTxId(txId);
        if (response && response.email) {
          setFoundEmail(response.email);
          setToastMessage('인증이 완료되었습니다.');
          setIsToastVisible(true);
        } else {
          showAlert('아이디 찾기 실패', '가입된 이메일 정보를 찾을 수 없습니다.');
        }
      } catch (error: any) {
        const message = error.response?.data?.error || '아이디를 찾는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        showAlert('아이디 찾기 오류', message);
      } finally {
        setIdFindingLoading(false);
      }
    } else {
      // 이젠 TossAuth 컴포넌트가 내부적으로 AlertModal을 띄우므로, 여기서는 아무것도 하지 않습니다.
    }
  }, []); // 의존성 배열에서 showAlert 제거

  const handleFindIdAuthFailure = useCallback(() => {
    setShowTossAuthForId(false);
    if (router.canGoBack()) {
      router.back();
    }
    // TossAuth 컴포넌트가 AlertModal을 띄우고, 
    // 사용자가 '확인'을 누르면 onAuthFailure가 호출되어 이 함수가 실행됩니다.
    // 여기서는 TossAuth 컴포넌트를 화면에서 숨기는 역할만 수행합니다.
  }, []); // 의존성 배열에서 showAlert 제거

  // 비밀번호 찾기 - "Toss 본인 인증" 버튼 클릭 로직
  const handleInitiatePasswordTossAuth = () => {
    if (!emailForPassword.trim()) {
      showAlert('입력 오류', '이메일 주소를 입력해주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForPassword)) {
        showAlert('입력 오류', '올바른 이메일 형식이 아닙니다.');
        return;
    }
    setPasswordResetContext(null); // 이전 컨텍스트 초기화
    setShowTossAuthForPassword(true); // Toss 인증 UI 표시
  };

  // 비밀번호 찾기 - Toss 인증 성공 콜백 (requestPasswordResetUriAfterToss 호출)
  const handlePasswordTossSuccess = useCallback(async (tossAuthResult: TossAuthSuccessData) => {
    setShowTossAuthForPassword(false);
    const { txId } = tossAuthResult;
    if (!txId) {
      showAlert('인증 오류', 'Toss 인증 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    setPasswordAuthLoading(true);
    try {
      const response = await requestPasswordResetUriAfterToss({ txId, email: emailForPassword });
      if (response.email.toLowerCase() !== emailForPassword.toLowerCase()) {
          showAlert('인증 오류', '입력하신 이메일과 본인인증 정보가 일치하지 않습니다.');
          return;
      }
      setPasswordResetContext({ memberId: response.memberId, email: response.email });
      if (router.canGoBack()) {
        router.back();
      }
      setToastMessage('본인 인증이 완료되었습니다.');
      setIsToastVisible(true);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showAlert('오류 발생', '입력하신 이메일과 일치하는 가입 정보를 찾을 수 없습니다.');
      } else {
        const message = error.response?.data?.error || '본인 인증 처리 중 오류가 발생했습니다. 문제가 지속되면 고객센터로 문의해주세요.';
        showAlert('오류 발생', message);
      }
    } finally {
      setPasswordAuthLoading(false);
    }
  }, [emailForPassword, showAlert]);

  // 비밀번호 찾기 - Toss 인증 실패 콜백
  const handlePasswordTossFailure = useCallback(() => {
    setShowTossAuthForPassword(false);
    // 이 함수는 TossAuth 내부의 AlertModal에서 '확인'을 눌렀을 때 호출됩니다.
    // 여기서는 TossAuth 컴포넌트를 숨기는 역할만 합니다.
  }, []); // 의존성 배열에서 showAlert 제거
  
  // 비밀번호 찾기 - 새 비밀번호 변경 (resetPasswordAfterTossAuth 호출)
  const handleChangePassword = async () => {
    if (!passwordResetContext) {
      showAlert('오류', '사용자 정보가 없습니다. 처음부터 다시 시도해주세요.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert('입력 오류', '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) { 
        showAlert('입력 오류', '비밀번호는 8자 이상이어야 합니다.');
        return;
    }

    setPasswordResetLoading(true);
    try {
      const response = await resetPasswordAfterTossAuth(
        passwordResetContext.memberId,
        { email: passwordResetContext.email, newPassword: newPassword } 
      );
      showAlert(
        '성공', 
        response.message || '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.',
        () => router.replace('/(onBoard)/Login')
      );
      setEmailForPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordResetContext(null);
    } catch (error: any) {
      const message = error.response?.data?.error || '비밀번호 변경 중 오류가 발생했습니다. 문제가 지속되면 고객센터로 문의해주세요.';
      showAlert('오류 발생', message);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  // useEffect (타이머) 제거

  const renderFindIdContent = () => (
    <View style={styles.contentInnerContainer}>
      <Text style={styles.infoText}>본인 인증을 통해 가입된 {'\n'} 이메일 주소를 확인할 수 있습니다.</Text>
      <MediumButton 
        title="Toss 본인 인증으로 아이디 찾기" 
        onPress={() => {
          setFoundEmail(null);
          setShowTossAuthForId(true); 
        }}
        disabled={idFindingLoading || showTossAuthForId}
      />
      {showTossAuthForId && (
        <TossAuth 
          onAuthSuccess={handleFindIdAuthSuccess} 
          onAuthFailure={handleFindIdAuthFailure} 
        />
      )}
      {idFindingLoading && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
      {foundEmail && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>회원님의 이메일 주소는 다음과 같습니다.</Text>
          <Text style={styles.resultEmail}>{foundEmail}</Text>
          <MediumButton title="로그인 하러 가기" onPress={() => router.replace('/(onBoard)/Login')} />
        </View>
      )}
    </View>
  );

  // formatTime 함수 제거

  const renderFindPasswordContent = () => (
    <View style={styles.contentInnerContainer}>
      {!passwordResetContext ? (
        // 1단계: 이메일 입력 및 Toss 인증 요청
        <>
          <Text style={styles.infoText}>가입하신 이메일 주소를 입력하고,{'\n'}본인 인증을 진행해주세요.</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일 주소 입력"
            value={emailForPassword}
            onChangeText={setEmailForPassword}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!showTossAuthForPassword && !passwordAuthLoading} 
          />
          <MediumButton 
            title="Toss 본인 인증" // 버튼 텍스트 변경됨
            onPress={handleInitiatePasswordTossAuth} 
            disabled={showTossAuthForPassword || passwordAuthLoading || !emailForPassword.trim()} // 이메일 입력 시 활성화
          />
          {showTossAuthForPassword && (
            <TossAuth
              onAuthSuccess={handlePasswordTossSuccess}
              onAuthFailure={handlePasswordTossFailure}
            />
          )}
          {passwordAuthLoading && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
        </>
      ) : (
        // 2단계: 새 비밀번호 입력
        <View style={styles.newPasswordContainer}>
          <Text style={styles.infoText}>본인 인증이 완료되었습니다.{'\n'}새로운 비밀번호를 입력해주세요.</Text>
          <PasswordInput 
            password={newPassword}
            confirmPassword={confirmNewPassword}
            setPassword={setNewPassword}
            setConfirmPassword={setConfirmNewPassword}
          />
          <MediumButton 
            title="비밀번호 변경"
            onPress={handleChangePassword} 
            disabled={passwordResetLoading || !newPassword || !confirmNewPassword} // 비밀번호 입력 시 활성화
          />
          {passwordResetLoading && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
        </View>
      )}
    </View>
  );

  // 탭 변경 시 모든 관련 상태 초기화 함수
  const resetAllStates = () => {
    // 아이디 찾기 상태 초기화
    setFoundEmail(null);
    setShowTossAuthForId(false);
    setIdFindingLoading(false);

    // 비밀번호 찾기 상태 초기화
    setEmailForPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordResetContext(null);
    setPasswordResetLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 찾기</Text> 
        <View style={styles.headerRightPlaceholder} /> 
      </View>
      <Tab 
          tabs={tabs} 
          activeTab={activeTab === 'findId' ? tabs[0] : tabs[1]} 
          onTabChange={(tabName) => {
            const newActiveTab = tabName === tabs[0] ? 'findId' : 'findPassword';
            setActiveTab(newActiveTab);
            resetAllStates(); // 탭 변경 시 모든 상태 초기화
          }} 
      />
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled" // 중요: 키보드 열린 상태에서 다른 영역 터치 시 키보드 닫기
      >
        { activeTab === 'findId' ? renderFindIdContent() : renderFindPasswordContent() }
      </ScrollView>
      <AlertModal
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => {
          setIsAlertVisible(false);
          if (alertOnConfirm) {
            alertOnConfirm();
          }
        }}
      />
      <Toast
        message={toastMessage}
        visible={isToastVisible}
        onHide={() => setIsToastVisible(false)}
      />
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24,
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 50, 
  },
  contentInnerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
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
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15, 
    marginTop: -10, // 버튼과의 간격 조정
  },
  resultContainer: {
    marginTop: 25,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3EFFF',
    borderRadius: 12,
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
    marginBottom: 25,
  },
  // authCodeContainer 및 timerText 스타일 제거
  newPasswordContainer: {
    marginTop: 15,
  }
});

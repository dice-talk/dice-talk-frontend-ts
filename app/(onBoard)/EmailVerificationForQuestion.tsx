import { sendVerificationEmail, verifyCodeForNonMember } from '@/api/loginApi';
import GradientHeader from '@/components/common/GradientHeader';
import Toast from '@/components/common/Toast';
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmailVerificationForQuestionScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const [isEmailSent, setIsEmailSent] = useState(false); // 인증번호 전송 여부
  const [isLoadingEmailSend, setIsLoadingEmailSend] = useState(false);
  const [isLoadingCodeVerify, setIsLoadingCodeVerify] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const validateEmail = (text: string): boolean => {
    if (!text.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(text)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSendVerificationEmail = async () => {
    if (!validateEmail(email)) return;

    setIsLoadingEmailSend(true);
    setCodeError(null); // 이전 인증번호 오류 초기화
    try {
      const response = await sendVerificationEmail(email);
      setIsEmailSent(true);
      setToastMessage(response.message || '인증번호가 발송되었습니다. 이메일을 확인해주세요.');
      setShowToast(true);
    } catch (error: any) {
      const message = error.message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.';
      setToastMessage(message);
      setShowToast(true);
      setEmailError(message); // 이메일 필드 아래 에러 표시
    } finally {
      setIsLoadingEmailSend(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setCodeError('인증번호를 입력해주세요.');
      return;
    }
    setCodeError(null);
    setIsLoadingCodeVerify(true);
    try {
      await verifyCodeForNonMember({ email, code });
      setToastMessage('이메일 인증에 성공했습니다.');
      setShowToast(true);
      // 인증 성공 시 NonMemberQuestion 페이지로 인증된 이메일 전달하며 이동
      setTimeout(() => {
        router.replace({ 
          pathname: '/(onBoard)/NonMemberQuestion', 
          params: { verifiedEmail: email } 
        });
      }, 1000);
    } catch (error: any) {
      const message = error.message || '인증번호가 올바르지 않거나 만료되었습니다.';
      setToastMessage(message);
      setShowToast(true);
      setCodeError(message); // 인증번호 필드 아래 에러 표시
    } finally {
      setIsLoadingCodeVerify(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader title="비회원 문의 이메일 인증" />
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentInnerContainer}>
          {!isEmailSent ? (
            <>
              <Text style={styles.infoText}>문의 답변을 받으실 이메일 주소를 입력하고 인증번호를 요청해주세요.</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="이메일 주소 입력"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text); // 입력 시 실시간 유효성 검사 (에러 있을 때만)
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoadingEmailSend}
              />
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              <MediumButton 
                title="인증번호 요청" 
                onPress={handleSendVerificationEmail} 
                disabled={isLoadingEmailSend}
              />
              {isLoadingEmailSend && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
            </>
          ) : (
            <>
              <Text style={styles.infoText}>이메일로 발송된 인증번호 6자리를 입력해주세요.</Text>
              <TextInput
                style={[styles.input, styles.codeInput, codeError ? styles.inputError : null]}
                placeholder="인증번호 입력"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoadingCodeVerify}
              />
              {codeError && <Text style={styles.errorText}>{codeError}</Text>}
              <MediumButton 
                title="인증번호 확인" 
                onPress={handleVerifyCode} 
                disabled={isLoadingCodeVerify || !code.trim()}
              />
              {isLoadingCodeVerify && <ActivityIndicator size="large" color="#B28EF8" style={styles.loader} />}
              <TouchableOpacity onPress={() => {
                setIsEmailSent(false);
                setCode('');
                setEmailError(null);
                setCodeError(null);
              }} style={styles.resendButton}>
                <Text style={styles.resendButtonText}>이메일 재입력 / 인증번호 재요청</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <Toast
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 50, 
    flexGrow: 1, // Ensure content can be centered if not enough to scroll
    justifyContent: 'center', // Center content vertically
  },
  contentInnerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30, // Increased padding
  },
  infoText: {
    fontSize: 16, // Slightly larger
    color: '#333',
    marginBottom: 25, // Increased margin
    textAlign: 'center',
    lineHeight: 24, // Increased line height
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12, // Increased padding
    fontSize: 16,
    marginBottom: 10, // Margin for error text
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? 5 : 2, // Add letter spacing for code
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'left', // Align to left under the input
    marginBottom: 15, 
    marginLeft: 5, // Indent slightly
    fontSize: 13,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6B7280', // Gray color
    textDecorationLine: 'underline',
  }
}); 
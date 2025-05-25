// EmailInput 컴포넌트 (예: app/(onBoard)/register/components/EmailInputForm.tsx 또는 index.tsx에 통합)
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // memberInfoStore 임포트
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Expo Router의 useRouter 훅 사용
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
//import { sendEmail } from '@/api/axios/emailApi'; // 경로 예시 (emailApi.ts로 가정)
//import { useEmail } from '@/context/EmailContext'; // 경로 예시

export default function EmailInputForm() { // 컴포넌트 이름 변경 또는 index.tsx 내용으로 사용
    const router = useRouter();
    const setEmailInStore = useMemberInfoStore((state) => state.setEmail); // 스토어에서 setEmail 가져오기
    //const { setEmail } = useEmail();
    const [inputEmail, setInputEmail] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);

    const validateEmail = (text: string): void => {
        setInputEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValid(emailRegex.test(text));
    };

    const handleSendEmail = async (): Promise<void> => {
        if (isSending || !isValid) return;

        setIsSending(true);
        try {
            // setEmail(inputEmail);
            // const result = await sendEmail(inputEmail); // API 요청 결과 타입 정의 필요
            // console.log('서버 응답:', result);
            // Alert.alert('성공', '이메일을 성공적으로 전송했어요!');

            // UserFlow: 이메일 인증 성공 시 다음 단계로 이동 (VerifyCode 페이지)
            // Expo Router에서는 파일 시스템 경로로 이동합니다.
            // 예: (onBoard)/register/verifyCode.tsx 파일이 있다면
            setEmailInStore(inputEmail); // Zustand 스토어에 이메일 저장
            router.push('/(onBoard)/register/VerifyCode'); // VerifyCode 스크린 경로로 수정
        } catch (error: any) {
            const errMsg = error.response?.data?.error || '알 수 없는 오류입니다.';
            Alert.alert('오류', errMsg);

            if (errMsg === '이미 등록된 이메일입니다.') {
                // UserFlow: 이미 등록된 이메일이면 LendingPage로 router.replace
                router.replace('/(onBoard)/register/VerifyCode'); // LendingPage 경로로 수정
            }
            // UserFlow: 인증번호가 잘못되었습니다 Alert 후 LendingPage로 (이 부분은 VerifyCode 스크린에서 처리)
        } finally {
            setIsSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <LinearGradient
                        colors={["#B28EF8", "#F476E5"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.iconContainer}
                    >
                        <FontAwesome name='envelope' size={30} color='white' />
                    </LinearGradient>
                    <Text style={styles.titleText}>이메일 주소를 입력해주세요</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='sample@example.com'
                        placeholderTextColor='#B3B3B3'
                        keyboardType='email-address'
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={validateEmail}
                        value={inputEmail}
                    />
                    <View style={[!isValid && styles.disabledButton]} pointerEvents={!isValid ? "none" : "auto"}>
                        <MediumButton
                            title='확인 메일 보내기'
                            onPress={handleSendEmail}
                            //disabled={!isValid || isSending}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
    inner: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#B3B3B3',
        paddingVertical: 10,
        marginBottom: 40,
        color: '#000',
    },
    text: {
        color: "white",
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
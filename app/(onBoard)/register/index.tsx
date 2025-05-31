// EmailInput 컴포넌트 (예: app/(onBoard)/register/components/EmailInputForm.tsx 또는 index.tsx에 통합)
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
// import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore';
import { sendVerificationEmail } from '@/api/loginApi'; // sendVerificationEmail 함수 임포트
import useSignupProgressStore from '@/zustand/stores/signupProgressStore'; // signupProgressStore 임포트
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function EmailInputScreen() { // 컴포넌트 이름 변경
    const router = useRouter();
    // Zustand 스토어의 setEmail 함수를 가져옵니다.
    // const setEmailInStore = useMemberInfoStore((state) => state.setEmail);
    const { updateSignupData } = useSignupProgressStore((state) => state.actions); // 수정된 부분
    
    const [inputEmail, setInputEmail] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false); // API 호출 중복 방지용

    const validateEmail = (text: string): void => {
        setInputEmail(text);
        const emailRegex = /^[^​\s@]+@[^​\s@]+\.[^​\s@]+$/; // 제로 너비 공백 문자 제거
        setIsValid(emailRegex.test(text));
    };

    const handleSendEmail = async (): Promise<void> => {
        if (isSending || !isValid) return;

        setIsSending(true);
        try {
            // 실제 이메일 인증 API (sendVerificationEmail) 호출
            const result = await sendVerificationEmail(inputEmail);
            // console.log('이메일 발송 API 서버 응답:', result);

            updateSignupData({ email: inputEmail });
            // console.log(`스토어에 이메일 저장: ${inputEmail}`);

            // 인증번호 입력 페이지로 이동
            router.push('/(onBoard)/register/VerifyCode');
        } catch (error: any) {
            // console.error("이메일 발송 처리 중 에러:", error);
            Alert.alert('오류', error.message || '알 수 없는 오류로 이메일 발송에 실패했습니다.');
            // 실패 시에는 다음 단계로 넘어가지 않거나, 사용자의 선택에 따라 다르게 처리할 수 있습니다.
            // 여기서는 실패 시 다음 단계로 넘어가지 않도록 router.push를 주석 처리합니다.
            // updateSignupData({ email: inputEmail }); // 실패 시에는 스토어 업데이트 안 함
            // router.push('/(onBoard)/register/VerifyCode');
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
                    <View style={[styles.buttonWrapper, (!isValid || isSending) && styles.disabledButton]} pointerEvents={(!isValid || isSending) ? "none" : "auto"}>
                        <MediumButton
                            title={isSending ? '전송 중...' : '확인 메일 보내기'}
                            onPress={handleSendEmail}
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
    buttonWrapper: {
        width: '100%',
    },
    text: {
        color: "white",
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
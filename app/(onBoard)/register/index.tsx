// EmailInput 컴포넌트 (예: app/(onBoard)/register/components/EmailInputForm.tsx 또는 index.tsx에 통합)
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
// import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore';
import useSignupProgressStore from '@/zustand/stores/signupProgressStore'; // signupProgressStore 임포트
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
// import { sendEmail } from '@/api/axios/emailApi'; // 실제 API 연동 시 주석 해제

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValid(emailRegex.test(text));
    };

    const handleSendEmail = async (): Promise<void> => {
        if (isSending || !isValid) return;

        setIsSending(true);
        try {
            // TODO: 실제 이메일 인증 API (sendEmail) 호출 로직 구현
            // const result = await sendEmail(inputEmail);
            // console.log('이메일 발송 API 서버 응답:', result);
            // Alert.alert('성공', '입력하신 이메일로 인증번호를 보냈습니다.');

            // API 호출 성공 후 또는 데모/테스트 목적으로 스토어에 이메일 저장
            // setEmailInStore(inputEmail);
            updateSignupData({ email: inputEmail }); // 수정된 부분
            console.log(`스토어에 이메일 저장: ${inputEmail}`);

            // 인증번호 입력 페이지로 이동
            router.push('/(onBoard)/register/VerifyCode');
        } catch (error: any) {
            // const errMsg = error.response?.data?.error || '알 수 없는 오류로 이메일 발송에 실패했습니다.';
            // Alert.alert('오류', errMsg);

            // 데모용 임시 에러 처리 및 화면 이동 (실제 API 연동 시 수정)
            console.error("이메일 발송 처리 중 에러 (데모):", error);
            Alert.alert('알림', '이메일 발송에 실패했습니다. (데모 메시지). 다음 단계로 이동합니다.'); 
            // setEmailInStore(inputEmail); // 실패 시에도 테스트를 위해 임시로 저장
            updateSignupData({ email: inputEmail }); // 수정된 부분
            router.push('/(onBoard)/register/VerifyCode');

            // 이미 등록된 이메일 등의 분기 처리는 VerifyCode 또는 해당 API 응답에서 처리
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
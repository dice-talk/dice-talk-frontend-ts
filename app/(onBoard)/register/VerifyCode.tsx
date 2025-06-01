// VerifyCodeScreen 컴포넌트 (예: app/(onBoard)/register/verifyCode.tsx)
import { sendVerificationEmail, verifyAuthCode } from '@/api/loginApi'; // verifyAuthCode 함수 임포트
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import useSignupProgressStore from '@/zustand/stores/signupProgressStore'; // signupProgressStore 임포트
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router'; // useRouter 및 useFocusEffect 사용
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function VerifyCode() {
    const router = useRouter();
    const codeFieldRef = useRef<any>(null); 
    const email = useSignupProgressStore((state) => state.signupData.email); // 수정: state.signupData.email
    const { clearSignupData } = useSignupProgressStore((state) => state.actions); // clearSignupData 추가

    const [value, setValue] = useState<string>('');
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });
    const [timer, setTimer] = useState<number>(300);
    const isMounted = useRef<boolean>(true);
    const [isVerifying, setIsVerifying] = useState<boolean>(false); // 인증 중 상태 추가

    const isDisabled = value.length !== CELL_COUNT || timer === 0 || isVerifying;

    useFocusEffect(
        React.useCallback(() => {
            isMounted.current = true;
            // 이메일 값이 없는 경우 이전 화면으로 돌려보냄
            if (!email) {
                Alert.alert('오류', '이메일 정보가 없습니다. 이전 단계로 돌아갑니다.', [
                    { text: '확인', onPress: () => router.replace('/(onBoard)/register') }
                ]);
                return;
            }
            const focusTimer = setTimeout(() => {
                if (Platform.OS !== 'web') {
                    Keyboard.dismiss();
                }
                codeFieldRef.current?.focus?.();
            }, 300);

            return () => {
                clearTimeout(focusTimer);
                isMounted.current = false; 
            };
        }, [email, router])
    );

    useEffect(() => {
        if (!isMounted.current) return; 

        if (timer === 0) {
            Alert.alert(
                '시간 만료',
                '인증 요청에 실패하셨습니다.',
                [{ text: '확인', onPress: () => router.replace('/(onBoard)/register') }]
            );
            return;
        }

        if (timer <= 0) return;

        const interval = setInterval(() => {
            if (isMounted.current) { 
                setTimer((prev) => (prev > 0 ? prev - 1 : 0));
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [timer, router]); 

    const formatTime = (sec: number): string => {
        const min = String(Math.floor(sec / 60)).padStart(2, '0');
        const secStr = String(sec % 60).padStart(2, '0');
        return `${min}:${secStr}`;
    };

    const handleVerify = async (): Promise<void> => {
        if (!email) {
            Alert.alert('오류', '이메일 정보가 없습니다. 이전 단계로 돌아가세요.');
            router.replace('/(onBoard)/register');
            return;
        }
        if (value.length !== CELL_COUNT) {
            Alert.alert('알림', '인증번호 6자리를 모두 입력해주세요.');
            return;
        }
        setIsVerifying(true);
        try {
            await verifyAuthCode({ email, code: value });
            // 성공 시 Alert 없이 바로 다음 화면으로 이동
            router.replace('/(onBoard)/register/Agreement');
            // 성공 시 스토어의 이메일 외 다른 정보는 유지하고, 인증 완료 상태 등을 추가할 수 있음
        } catch (error: any) {
            // error 객체가 이제 서버 응답 본문이므로, 직접 프로퍼티에 접근합니다.
            const status = error?.status; 
            const responseMessage = error?.message;

            if (status === 409 && (responseMessage === "Member exists" || responseMessage === "이미 등록된 이메일입니다.")) {
                Alert.alert('알림', '이미 회원가입된 회원입니다.', [
                    { 
                        text: '확인',
                        onPress: () => {
                            clearSignupData(); // 스토어 데이터 클리어
                            router.replace('/(onBoard)/Login'); // 로그인 페이지로 이동
                        }
                    }
                ]);
            } else if (responseMessage === '인증번호가 올바르지 않거나 만료되었습니다.') {
                Alert.alert('오류', responseMessage);
                setValue(''); // 입력값 초기화
                codeFieldRef.current?.focus?.(); // 다시 입력하도록 포커스
            } else {
                Alert.alert('오류', responseMessage || '인증 실패, 다시 시도해주세요');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendEmail = async (): Promise<void> => {
        if (!email) {
            Alert.alert('오류', '이메일 정보가 없어 재전송할 수 없습니다.');
            return;
        }
        try {
            // TODO: 이메일 재전송 API 호출 (sendVerificationEmail 사용)
            await sendVerificationEmail(email); // loginApi에서 가져와야 함
            Alert.alert('알림', '재요청 되었습니다. 이메일을 확인해주세요.'); // 임시 알림
            setTimer(300);
            setValue('');
            codeFieldRef.current?.focus?.();
        } catch (error) {
            Alert.alert('오류', '이메일 재전송에 실패했습니다.');
        }
    };

    return (
        <>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#B28EF8', '#F476E5']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.iconContainer}
                >
                    <FontAwesome name='envelope' size={30} color='white' />
                </LinearGradient>
                <Text style={styles.title}>인증 코드를 입력해주세요</Text>
                {email && <Text style={styles.emailText}>{email} (으)로 전송됨</Text>}
                <Text style={styles.timer}>남은 시간: {formatTime(timer)}</Text>
                <CodeField
                    ref={codeFieldRef}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType='number-pad'
                    textContentType='oneTimeCode'
                    renderCell={({ index, symbol, isFocused }) => (
                        <View
                            key={index}
                            style={[styles.cell, isFocused && styles.focusCell]}
                            onLayout={getCellOnLayoutHandler(index)}
                        >
                            <Text style={styles.cellText}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        </View>
                    )}
                />
                <Text style={styles.helper}>수신된 이메일에 기재된 6자리 숫자를 입력해 주세요.</Text>
                <TouchableOpacity onPress={handleResendEmail} disabled={isVerifying}>
                    <Text style={styles.helperSmall}>이메일을 받지 못했어요</Text>
                </TouchableOpacity>
                <View style={[styles.buttonContainer, isDisabled && styles.disabled]} pointerEvents={isDisabled ? "none" : "auto"}>
                    <MediumButton title={isVerifying ? "인증 중..." : "인증하기"} onPress={handleVerify} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({ 
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8, // 간격 조정
    },
    emailText: { // 이메일 표시 스타일
        fontSize: 14,
        color: '#555',
        marginBottom: 16,
    },
    timer: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    codeFieldRoot: {
        marginTop: 20,
        width: 280,
        justifyContent: 'space-between',
    },
    cell: {
        width: 40,
        height: 50,
        lineHeight: 48,
        borderRadius: 10,
        backgroundColor: '#F2E5FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusCell: {
        borderWidth: 2,
        borderColor: '#B28EF8',
    },
    cellText: {
        fontSize: 24,
        color: '#000',
        textAlign: 'center',
    },
    helper: {
        marginTop: 20,
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
    },
    helperSmall: {
        marginTop: 10,
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
});
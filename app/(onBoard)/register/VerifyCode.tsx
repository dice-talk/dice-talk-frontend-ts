// VerifyCodeScreen 컴포넌트 (예: app/(onBoard)/register/verifyCode.tsx)
import EmailExistModal from '@/components/login/EmailExistsModal'; // 경로 예시
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
//import { useEmail } from '@/context/EmailContext'; // 경로 예시
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router'; // useRouter 및 useFocusEffect 사용
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function VerifyCode() {
    const router = useRouter();
    const codeFieldRef = useRef<any>(null); // CodeField 타입이 있다면 구체화
    //const { email } = useEmail();
    const [value, setValue] = useState<string>('');
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });
    const [timer, setTimer] = useState<number>(300);
    const [showModal, setShowModal] = useState<boolean>(false);
    const isMounted = useRef<boolean>(true); // 컴포넌트 마운트 상태 추적

    const isDisabled = value.length !== CELL_COUNT || timer === 0;

    // 화면이 포커스될 때마다 실행 (useFocusEffect 사용)
    useFocusEffect(
        React.useCallback(() => {
            isMounted.current = true;
            const focusTimer = setTimeout(() => {
                if (Platform.OS !== 'web') {
                    Keyboard.dismiss();
                }
                codeFieldRef.current?.focus?.();
            }, 300);

            return () => {
                clearTimeout(focusTimer);
                isMounted.current = false; // 화면 벗어날 때 false
            };
        }, [])
    );

    useEffect(() => {
        if (!isMounted.current) return; // 컴포넌트가 마운트되지 않았으면 타이머 로직 실행 안 함

        if (timer === 0) {
            Alert.alert(
                '시간 만료',
                '인증 요청에 실패하셨습니다.',
                [{ text: '확인', onPress: () => router.replace('/(onBoard)/register') }] // EmailInput 페이지로 이동
            );
            return;
        }

        if (timer <= 0) return;

        const interval = setInterval(() => {
            if (isMounted.current) { // 마운트 상태일 때만 타이머 업데이트
                setTimer((prev) => (prev > 0 ? prev - 1 : 0));
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [timer, router]); // router도 의존성 배열에 추가 (onPress에서 사용 시)

    const formatTime = (sec: number): string => {
        const min = String(Math.floor(sec / 60)).padStart(2, '0');
        const secStr = String(sec % 60).padStart(2, '0');
        return `${min}:${secStr}`;
    };

    const handleVerify = async (): Promise<void> => {
        // if (!email) {
        //     Alert.alert('오류', '이메일 정보가 없습니다.');
        //     router.replace('/(onBoard)/register'); // EmailInput 페이지로 이동
        //     return;
        // }
        try {
            // await verifyCodeApi({ email, code: value }); // API 요청 결과 타입 정의 필요
            Alert.alert(
                '인증 성공',
                '본인인증을 시작하겠습니다!',
                // UserFlow: 정보수집이용 동의 페이지로 이동
                [{ text: '확인', onPress: () => router.replace('/(onBoard)/register/Agreement') }] // Agreement 스크린 경로
            );
        } catch (error: any) {
            const errMsg = error.response?.data?.error || '인증 실패, 다시 시도해주세요';
            if (errMsg === '인증번호가 잘못되었습니다') {
                Alert.alert('오류', errMsg, [
                    { text: '확인', onPress: () => router.replace('/(onBoard)') } // LendingPage 경로
                ]);
            } else if (errMsg === '이미 등록된 이메일입니다.') {
                setShowModal(true);
            } else {
                Alert.alert('오류', errMsg);
            }
        }
    };

    const handleResendEmail = async (): Promise<void> => {
        // if (!email) {
        //     Alert.alert('오류', '이메일 정보가 없어 재전송할 수 없습니다.');
        //     return;
        // }
        try {
            // await sendEmail(email);
            Alert.alert('알림', '재요청 되었습니다. 이메일을 확인해주세요.');
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
                <TouchableOpacity onPress={handleResendEmail}>
                    <Text style={styles.helperSmall}>이메일을 받지 못했어요</Text>
                </TouchableOpacity>
                <View style={[styles.buttonContainer, isDisabled && styles.disabled]} pointerEvents={isDisabled ? "none" : "auto"}>
                    <MediumButton title="인증하기" onPress={handleVerify} /*disabled={isDisabled} */ />
                </View>
            </View>
            <EmailExistModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onLogin={() => { // UserFlow: 이미 등록된 이메일이면 LendingPage로
                    setShowModal(false);
                    router.replace('/(onBoard)'); // LendingPage 경로
                }}
                onFindEmail={() => {
                    setShowModal(false);
                    /*router.push('/(onBoard)/register/agreement'); // 비밀번호 찾기 페이지 경로 예시*/
                }}
            />
        </>
    );
}

// 스타일 정의는 이전 답변과 동일하게 사용 가능 (styles 객체)
const styles = StyleSheet.create({ /* ... 이전 스타일 복사 ... */
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
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        opacity: 0.5,
    },
});
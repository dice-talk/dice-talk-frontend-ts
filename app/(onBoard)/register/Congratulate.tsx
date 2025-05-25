// CongratulateScreen 컴포넌트 (예: app/(onBoard)/register/congratulate.tsx)
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// SVG 컴포넌트 임포트 (실제 경로로 수정)

// SVG 임시 플레이스홀더
const PlaceholderSvg = ({ width, height, style, color = 'grey' }: { width: number, height: number, style?: object, color?: string }) => (
    <View style={[{ width, height, backgroundColor: color, opacity: 0.3 }, style]} />
);

export default function CongratulateScreen() {
    const router = useRouter();

    const handleLoginPress = (): void => {
        // 로그인 페이지로 이동 (경로 확인 필요)
        // 예: app/login/index.tsx 또는 app/(auth)/login.tsx 등
        router.replace('/Login'); // 로그인 페이지 경로로 수정
    };

    return (
        <View style={styles.container}>
            <PlaceholderSvg width={250} height={250} style={[styles.svg, { top: 0, left: 0 }]} color="blue" />
            <PlaceholderSvg width={100} height={100} style={[styles.svg, { top: 100, right: 20 }]} color="pink" />
            <PlaceholderSvg width={120} height={120} style={[styles.svg, { top: 400, left: -30 }]} color="purple" />
            <PlaceholderSvg width={250} height={250} style={[styles.svg, { bottom: 200, right: -50 }]} color="orange" />
            <PlaceholderSvg width={100} height={100} style={[styles.svg, { bottom: -20, left: '15%' }]} color="black" />

            <Text style={styles.title}>회원가입에 성공했습니다!</Text>

            <View style={styles.buttonWrapper}>
                <MediumButton title="로그인하러 가기" onPress={handleLoginPress} />
            </View>
        </View>
    );
}

// 스타일 정의는 이전 답변과 동일하게 사용 가능 (styles 객체)
const styles = StyleSheet.create({ /* ... 이전 스타일 복사 ... */
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 80,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    svg: {
        position: 'absolute',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 60,
        zIndex: 1,
        textAlign: 'center',
    },
    buttonWrapper: {
        width: '80%',
        zIndex: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
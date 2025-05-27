// SignupInputScreen 컴포넌트 (예: app/(onBoard)/register/signupInput.tsx)
import { createMemberInfo } from '@/api/memberApi'; // createMemberInfo API 임포트
import RegionDropDown from '@/components/profile/RegionDropDown'; // 경로 예시
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // memberInfoStore 임포트
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // useLocalSearchParams 제거
import { useEffect, useState } from 'react'; // useMemo 제거
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// UserInfo 타입 정의는 스토어 사용으로 불필요해질 수 있음
// type UserInfoFromAuth = {
// name?: string;
// gender?: '남성' | '여성'; // 또는 'MALE' | 'FEMALE'
// birth?: string; // 'YYYY-MM-DD'
// };

// Helper 함수들 (별도 utils 파일로 분리 권장) - getRandom 함수들은 스토어 사용으로 불필요
// function getRandomElement<T>(arr: T[]): T {
// return arr[Math.floor(Math.random() * arr.length)];
// }
// function getRandomName(): string {
// const lastNames = ['김', '이', '박', '최', '정', '윤', '장', '임', '한', '조'];
// const firstNames = ['민', '서', '지', '우', '하', '윤', '준', '아', '유', '수'];
// return getRandomElement(lastNames) + getRandomElement(firstNames) + getRandomElement(firstNames);
// }
// function getRandomGender(): '남성' | '여성' {
// const genders: Array<'남성' | '여성'> = ['남성', '여성'];
// return getRandomElement(genders);
// }
// function getRandomBirth(): string {
// const year = Math.floor(Math.random() * (2005 - 1930 + 1)) + 1930;
// const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
// const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
// return `${year}-${month}-${day}`;
// }


export default function SignupInput() {
    const router = useRouter();
    // const params = useLocalSearchParams<UserInfoFromAuth & { /* 다른 파라미터 타입 */ }>(); // 스토어 사용으로 대체
    const registrationInfo = useMemberInfoStore((state) => state.registrationInfo);

    // 스토어에서 가져온 값들을 사용합니다.
    const emailFromStore = registrationInfo?.email || '';
    const nameFromStore = registrationInfo?.name || '';
    const phoneFromStore = registrationInfo?.phone || '';
    const birthFromStore = registrationInfo?.birth || ''; // YYYY-MM-DD 또는 YYYYMMDD 형식
    // 화면 표시용 성별 변환
    const genderDisplay = registrationInfo?.gender === 'MALE' ? '남성' : registrationInfo?.gender === 'FEMALE' ? '여성' : '';

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,16}$/;

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const [age, setAge] = useState<string>('');

    useEffect(() => {
        if (birthFromStore) {
            const birthDateStr = birthFromStore.replace(/-/g, ''); // YYYYMMDD로 통일
            const birthYear = parseInt(birthDateStr.substring(0, 4), 10);
            const currentYear = new Date().getFullYear();
            // 정확한 만나이 계산은 월, 일을 고려해야 하지만, 여기서는 연도 기준으로 간단히 계산합니다.
            setAge((currentYear - birthYear).toString());
        }
    }, [birthFromStore]);

    const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordValid = passwordRegex.test(password);
    const isFormValid = isPasswordMatch && isPasswordValid && selectedCity && selectedDistrict &&
                        emailFromStore && nameFromStore && registrationInfo?.gender && birthFromStore && phoneFromStore;

    const handlePasswordChange = (text: string): void => {
        setPassword(text);
    };

    const handleSignup = async (): Promise<void> => {
        if (!isFormValid) {
            let alertMessage = '모든 필수 정보를 올바르게 입력해주세요.';
            if (!emailFromStore) alertMessage = '이메일 정보가 없습니다. 처음부터 다시 시도해주세요.';
            else if (!nameFromStore) alertMessage = '이름 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            // ... 다른 필수 값들에 대한 검사 ...
            else if (!selectedCity || !selectedDistrict) alertMessage = '지역을 선택해주세요.';
            else if (!isPasswordValid) alertMessage = '비밀번호 형식이 올바르지 않습니다.';
            else if (!isPasswordMatch) alertMessage = '비밀번호가 일치하지 않습니다.';
            
            Alert.alert('입력 오류', alertMessage);
            if (!emailFromStore || !nameFromStore || !registrationInfo?.gender || !birthFromStore || !phoneFromStore) {
                router.replace('/(onBoard)/register'); // 중요 정보 누락 시 처음으로
            }
            return;
        }

        // 스토어의 gender 값 ('MALE' | 'FEMALE')을 직접 사용
        const genderForApi = registrationInfo?.gender;
        if (!genderForApi) { // null 또는 undefined 체크
            Alert.alert('오류', '성별 정보가 올바르지 않습니다. 본인인증을 다시 시도해주세요.');
            router.replace('/(onBoard)/register/Agreement');
            return;
        }

        const region = `${selectedCity} ${selectedDistrict}`;
        const payload = {
            email: emailFromStore,
            name: nameFromStore,
            gender: genderForApi, // 스토어의 MALE/FEMALE 값
            birth: birthFromStore.replace(/-/g, ''), // API가 YYYYMMDD 형식을 원한다면
            password,
            phone: phoneFromStore.replace(/-/g, ''), // API가 하이픈 없는 형식을 원한다면
            region,
        };
        console.log('🔗 회원가입 요청 데이터:', payload);

        try {
            const response = await createMemberInfo(payload);
            console.log('📡 회원가입 요청 성공:', response);
            // 회원가입 성공 후 스토어의 registrationInfo 초기화 (선택적)
            // useMemberInfoStore.getState().clearRegistrationInfo();
            router.replace('/(onBoard)/register/Congratulate');
        } catch (err: any) {
            console.error('회원가입 실패:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || '회원가입 중 문제가 발생했습니다.';
            Alert.alert('오류', errMsg);
        }
    };

    const handleRegionChange = (city: string, district: string) => {
        setSelectedCity(city);
        setSelectedDistrict(district);
      };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#FFFFFF'}}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContainer, { paddingBottom: Platform.OS === 'ios' ? 100 : 120 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={['#B28EF8', '#F476E5']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.iconCircle}
                    >
                        <Ionicons name='person-outline' size={30} color='white' />
                    </LinearGradient>
                    <Text style={styles.titleHeader}>정보를 입력해주세요</Text>
                </View>

                <Text style={styles.label}>이메일</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={emailFromStore} editable={false} />

                <Text style={styles.label}>비밀번호</Text>
                <Text style={styles.condition}>비밀번호는 영어 대문자, 소문자, 숫자, 특수문자를 1개씩 포함하여 8~16자여야 합니다.</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.inputFlex}
                        placeholder='비밀번호를 입력해주세요'
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={handlePasswordChange}
                        autoCapitalize="none"
                    />
                </View>
                {password.length > 0 && !isPasswordValid && (
                    <Text style={styles.errorText}>비밀번호 형식이 올바르지 않습니다.</Text>
                )}

                <Text style={styles.label}>비밀번호 확인</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.inputFlex}
                        placeholder='비밀번호를 다시 입력해주세요'
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color='#666' />
                    </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && (
                    <Text style={{ color: isPasswordMatch ? 'green' : 'red', fontSize: 12, marginTop: 4 }}>
                        {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                    </Text>
                )}

                <Text style={styles.label}>휴대폰 번호</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={phoneFromStore}
                    editable={false}
                />

                <Text style={styles.label}>성함</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={nameFromStore} editable={false} />

                <Text style={styles.label}>성별</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={genderDisplay} editable={false} />

                <Text style={styles.label}>나이 (만)</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={age} editable={false} />

                <Text style={styles.label}>지역</Text>
                <RegionDropDown 
                city={selectedCity} 
                district={selectedDistrict} 
                onChange={handleRegionChange} 
                />

                <View style={[styles.buttonContainer, { opacity: isFormValid ? 1 : 0.5, marginTop: 30 }]}>
                    <MediumButton title="가입하기" onPress={handleSignup} /* disabled={!isFormValid} */ />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// 스타일 정의는 이전 답변과 동일하게 사용 가능 (styles 객체)
const styles = StyleSheet.create({
    scrollContainer: {
        marginTop: 60,
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginTop: 16,
        marginBottom: 6,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#BEBEBE',
        paddingVertical: 10,
        fontSize: 15,
        color: '#000',
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#777',
    },
    inputRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#BEBEBE',
        alignItems: 'center',
    },
    inputFlex: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 10,
        color: '#000',
    },
    eyeIcon: {
        padding: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    condition: {
        fontSize: 11,
        color: '#666',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        color: 'red',
        marginTop: 4,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});
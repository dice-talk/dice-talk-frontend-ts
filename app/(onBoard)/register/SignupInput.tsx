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
    const memberInfo = useMemberInfoStore((state) => state.memberInfo);
    const storeEmail = useMemberInfoStore((state) => state.email);

    const emailToUse = storeEmail || memberInfo?.email || '';
    const nameFromStore = memberInfo?.name || '';
    // 스토어의 gender는 MALE/FEMALE 일 수 있으므로, 화면 표시는 '남성'/'여성'으로 변환 필요
    const genderFromStore = memberInfo?.gender === 'MALE' ? '남성' : memberInfo?.gender === 'FEMALE' ? '여성' : '';
    const birthFromStore = memberInfo?.birth || ''; // YYYY-MM-DD 형식으로 가정
    const phoneFromStore = memberInfo?.phone || ''; // 010-xxxx-xxxx 형식으로 가정

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]).{8,16}$/;

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    // 휴대폰 번호는 스토어에서 가져오므로, 여기서 phone state는 제거하고 phoneFromStore 직접 사용
    // const [phone, setPhone] = useState<string>('');
    // const phoneRegex = /^010-\d{4}-\d{4}$/;

    const [age, setAge] = useState<string>('');

    useEffect(() => {
        if (birthFromStore) {
            const birthYear = parseInt(birthFromStore.substring(0, 4), 10);
            const currentYear = new Date().getFullYear();
            setAge((currentYear - birthYear).toString());
        }
    }, [birthFromStore]);

    const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordValid = passwordRegex.test(password);
    // 스토어의 phoneFromStore는 이미 인증된 값이므로, 추가적인 phoneRegex 유효성 검사는 불필요할 수 있음
    // const isPhoneValid = phoneRegex.test(phoneFromStore);

    const isFormValid = isPasswordMatch && isPasswordValid && selectedCity && selectedDistrict && emailToUse && nameFromStore && genderFromStore && birthFromStore && phoneFromStore;

    const handlePasswordChange = (text: string): void => {
        setPassword(text);
    };

    // 휴대폰 번호 입력 로직은 스토어에서 가져오므로 validatePhone 함수 불필요
    // const validatePhone = (value: string): void => { ... };

    const handleSignup = async (): Promise<void> => {
        if (!isFormValid) {
            Alert.alert('입력 오류', '모든 필수 정보를 올바르게 입력해주세요.');
            return;
        }
        if (!emailToUse) {
             Alert.alert('오류', '이메일 정보가 없습니다. 다시 시도해주세요.');
             router.replace('/(onBoard)/register'); // 이메일 입력부터 다시
             return;
        }

        const normalizedGender = memberInfo?.gender; // 스토어에 MALE/FEMALE로 저장되어 있다고 가정
        if (!normalizedGender || (normalizedGender !== 'MALE' && normalizedGender !== 'FEMALE')) {
            Alert.alert('오류', '성별 정보가 올바르지 않습니다.');
            return;
        }

        const region = `${selectedCity} ${selectedDistrict}`;

        const payload = {
            email: emailToUse,
            name: nameFromStore,
            gender: normalizedGender,
            birth: birthFromStore,
            password,
            phone: phoneFromStore, // 스토어에서 가져온 phone 사용
            region,
        };
        console.log('🔗 보낸 데이터:', payload);

        try {
            const response = await createMemberInfo(payload); // API 호출
            console.log('📡 회원가입 요청 성공:', response);
            router.replace('/(onBoard)/register/Congratulate'); // 성공 페이지로 이동
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
                <TextInput style={[styles.input, styles.disabledInput]} value={emailToUse} editable={false} />

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
                    style={[styles.input, styles.disabledInput]} // disabledInput 스타일 추가
                    value={phoneFromStore} // 스토어 값 사용
                    editable={false} // 수정 불가
                    // placeholder='010-1234-5678' // 불필요
                    // onChangeText={validatePhone} // 불필요
                    // keyboardType="numeric" // 불필요
                    // maxLength={13} // 불필요
                />
                 {/* 스토어 값은 유효하다고 가정하므로 에러 메시지 제거 */}
                 {/* {phoneFromStore.length > 0 && !isPhoneValid && (
                    <Text style={styles.errorText}>휴대폰 번호 형식이 올바르지 않습니다. (010-xxxx-xxxx)</Text>
                )} */}

                <Text style={styles.label}>성함</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={nameFromStore} editable={false} />

                <Text style={styles.label}>성별</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={genderFromStore} editable={false} />

                <Text style={styles.label}>나이</Text>
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
const styles = StyleSheet.create({ /* ... 이전 스타일 복사 ... */
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
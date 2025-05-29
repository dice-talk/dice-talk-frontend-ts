// SignupInputScreen 컴포넌트 (예: app/(onBoard)/register/signupInput.tsx)
import { createMemberInfo } from '@/api/memberApi'; // createMemberInfo API 임포트
import RegionDropDown from '@/components/profile/RegionDropDown'; // 경로 예시
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // memberInfoStore 임포트
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // useLocalSearchParams 제거
import { useState } from 'react'; // useEffect 제거 (age 계산 불필요)
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

export default function SignupInput() {
    const router = useRouter();
    // const params = useLocalSearchParams<UserInfoFromAuth & { /* 다른 파라미터 타입 */ }>(); // 스토어 사용으로 대체
    const registrationInfo = useMemberInfoStore((state) => state.registrationInfo);

    // 스토어에서 가져온 값들을 사용합니다.
    const emailFromStore = registrationInfo?.email || '';
    const nameFromStore = registrationInfo?.name || '';
    const phoneFromStore = registrationInfo?.phone || '010-1234-5670';
    const birthFromStore = registrationInfo?.birth || ''; // YYYYMMDD 형식
    const ageGroupFromStore = registrationInfo?.ageGroup || '';
    // 화면 표시용 성별 변환
    const genderDisplay = registrationInfo?.gender === 'MALE' ? '남성' : registrationInfo?.gender === 'FEMALE' ? '여성' : '';
      // 화면 표시용 생년월일 (YYYY-MM-DD)
      const birthDisplay = birthFromStore && birthFromStore.length === 8
        ? `${birthFromStore.substring(0, 4)}-${birthFromStore.substring(4, 6)}-${birthFromStore.substring(6, 8)}`
        : '';

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'\",.<>/?]).{8,16}$/;

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordValid = passwordRegex.test(password);

    // 가입하기 버튼 활성화 조건
    const isFormValid = 
        !!emailFromStore &&       // 이메일 (스토어)
        !!nameFromStore &&        // 이름 (스토어)
        !!registrationInfo?.gender && // 성별 (스토어)
        !!birthFromStore &&       // 생년월일 (스토어)
        !!phoneFromStore &&       // 전화번호 (스토어, Toss에서 못 받으면 기본값이라도 있어야 함)
        isPasswordValid &&        // 비밀번호 유효성
        isPasswordMatch &&        // 비밀번호 일치
        !!selectedCity &&         // 지역 (시/도 선택)
        !!selectedDistrict;       // 지역 (구/군 선택)

    const handleSignup = async (): Promise<void> => {
        if (!isFormValid) {
            let alertMessage = '모든 필수 정보를 올바르게 입력해주세요.';
            if (!emailFromStore) alertMessage = '이메일 정보가 없습니다. 처음부터 다시 시도해주세요.';
            else if (!nameFromStore) alertMessage = '이름 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!registrationInfo?.gender) alertMessage = '성별 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!birthFromStore) alertMessage = '생년월일 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!phoneFromStore || phoneFromStore === '010-1234-5670') alertMessage = '휴대폰 번호 인증이 필요합니다.'; // 기본값인 경우도 오류로 간주 (Toss에서 못 받았다는 의미)
            else if (!selectedCity || !selectedDistrict) alertMessage = '지역을 선택해주세요.';
            else if (!isPasswordValid) alertMessage = '비밀번호 형식이 올바르지 않습니다.';
            else if (!isPasswordMatch) alertMessage = '비밀번호가 일치하지 않습니다.';
            
            Alert.alert('입력 오류', alertMessage);
            // 필수 본인인증 정보 누락 시 Agreement 화면으로 돌려보내는 것이 더 적절할 수 있음
            if (!emailFromStore || !nameFromStore || !registrationInfo?.gender || !birthFromStore || (!phoneFromStore || phoneFromStore === '010-1234-5670')) {
                router.replace('/(onBoard)/register/Agreement'); 
            }
            return;
        }

        const genderForApi = registrationInfo?.gender;
        // genderForApi null 체크는 isFormValid에서 이미 수행됨

        const region = `${selectedCity} ${selectedDistrict}`; 
        // API 요청 시 phoneFromStore이 기본값이면 실제로는 인증되지 않은 번호일 수 있으므로 서버측 검증 필요
        const payload = {
            email: emailFromStore,
            name: nameFromStore,
            gender: genderForApi!,
            birth: birthDisplay,
            password,
            phone: phoneFromStore,
            region,
        };
        console.log('🔗 회원가입 요청 데이터:', payload);

        try {
            const response = await createMemberInfo(payload);
            console.log('📡 회원가입 요청 성공:', response);
            useMemberInfoStore.getState().clearRegistrationInfo(); // 성공 시 스토어 정보 클리어
            router.replace('/(onBoard)/register/Congratulate');
        } catch (err: any) {
            console.error('회원가입 실패:', err);
            let errMsg = '회원가입 중 문제가 발생했습니다.'; // 기본 에러 메시지

            if (err.response) {
                const { status, data } = err.response;
                const message = data?.message;
                const error = data?.error; // 혹시 error 필드도 사용될 경우 대비

                if (status === 409 && message === "Member exists") {
                    errMsg = '이미 회원가입한 내역이 있습니다.';
                } else if (message) {
                    errMsg = message;
                } else if (error) {
                    errMsg = error;
                }
            }
            // err.response가 없는 네트워크 오류 등의 경우 기본 errMsg 사용
            
            Alert.alert('오류', errMsg);
        }
    };

    const handleRegionChange = (city: string, district: string) => {
        setSelectedCity(city);
        setSelectedDistrict(district);
        console.log('Region Changed:', city, district); // 선택 확인용 로그
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
                        onChangeText={setPassword}
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

                <Text style={styles.label}>생일</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={birthDisplay} editable={false} />

                <Text style={styles.label}>지역</Text>
                <RegionDropDown 
                city={selectedCity} 
                district={selectedDistrict} 
                onChange={handleRegionChange} 
                />

                <View 
                    style={[styles.buttonContainer, { marginTop: 30, opacity: isFormValid ? 1 : 0.5}]}
                    pointerEvents={isFormValid ? 'auto' : 'none'}
                >
                    <MediumButton title="가입하기" onPress={handleSignup} />
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
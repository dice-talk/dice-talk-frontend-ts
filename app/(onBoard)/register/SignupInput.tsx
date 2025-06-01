// SignupInputScreen 컴포넌트 (예: app/(onBoard)/register/signupInput.tsx)
import { createMemberInfo } from '@/api/memberApi'; // createMemberInfo API 임포트
import RegionDropDown from '@/components/profile/RegionDropDown'; // 경로 예시
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import useAuthStore from '@/zustand/stores/authStore'; // authStore 임포트 (로그인 성공 시 사용)
import useSignupProgressStore from '@/zustand/stores/signupProgressStore'; // 새 스토어 임포트
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
    const signupProgress = useSignupProgressStore((state) => state.signupData);
    const { clearSignupData } = useSignupProgressStore((state) => state.actions);
    const { setAuthInfo } = useAuthStore((state) => state.actions); // 로그인 정보 저장을 위해 추가

    // 스토어에서 가져온 값들을 사용합니다.
    const nameFromStore = signupProgress?.name || '';
    const birthFromStore = signupProgress?.birth || ''; // YYYYMMDD 형식
    const ageGroupFromStore = signupProgress?.ageGroup || '';
    const emailFromStore = signupProgress?.email || ''; // 스토어에서 이메일 가져오기
    // 화면 표시용 성별 변환
    const genderFromStore = signupProgress?.gender;
    const genderDisplay = genderFromStore === 'MALE' ? '남성' : genderFromStore === 'FEMALE' ? '여성' : '';
    // 화면 표시용 생년월일 (YYYY-MM-DD)
    const birthDisplay = birthFromStore && birthFromStore.length === 8
        ? `${birthFromStore.substring(0, 4)}-${birthFromStore.substring(4, 6)}-${birthFromStore.substring(6, 8)}`
        : birthFromStore; 

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}\[\]|;:'",.<>/?]).{8,16}$/;

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordValid = passwordRegex.test(password);

    // 가입하기 버튼 활성화 조건
    const isFormValid = 
        !!emailFromStore && // 스토어 이메일 사용
        !!nameFromStore &&
        !!genderFromStore &&
        !!birthFromStore &&
        isPasswordValid &&
        isPasswordMatch &&
        !!selectedCity &&
        !!selectedDistrict;

    const handleSignup = async (): Promise<void> => {
        if (!isFormValid) {
            let alertMessage = '모든 필수 정보를 올바르게 입력해주세요.';
            if (!emailFromStore) alertMessage = '이메일 정보가 없습니다. 이전 단계로 돌아가주세요.'; // 스토어 이메일 기준
            else if (!nameFromStore) alertMessage = '이름 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!genderFromStore) alertMessage = '성별 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!birthFromStore) alertMessage = '생년월일 정보가 없습니다. 본인인증을 다시 시도해주세요.';
            else if (!selectedCity || !selectedDistrict) alertMessage = '지역을 선택해주세요.';
            else if (!isPasswordValid) alertMessage = '비밀번호 형식이 올바르지 않습니다.';
            else if (!isPasswordMatch) alertMessage = '비밀번호가 일치하지 않습니다.';

            console.log('--- isFormValid Check ---');
            console.log('emailFromStore:', !!emailFromStore, emailFromStore);
            console.log('nameFromStore:', !!nameFromStore, nameFromStore);
            console.log('genderFromStore:', !!genderFromStore, genderFromStore);
            console.log('birthFromStore:', !!birthFromStore, birthFromStore);
            console.log('isPasswordValid:', isPasswordValid, password);
            console.log('isPasswordMatch:', isPasswordMatch, password, confirmPassword);
            console.log('selectedCity:', !!selectedCity, selectedCity);
            console.log('selectedDistrict:', !!selectedDistrict, selectedDistrict);
            console.log('-------------------------');
            
            Alert.alert('입력 오류', alertMessage);
            if (!nameFromStore || !genderFromStore || !birthFromStore) { 
                router.replace('/(onBoard)/register/Agreement'); 
            }
            return;
        }

        const region = `${selectedCity} ${selectedDistrict}`; 
        const payload = {
            email: emailFromStore, // 스토어 이메일 사용
            name: nameFromStore,
            gender: genderFromStore!,
            birth: birthDisplay,
            password,
            region,
        };
        console.log('🔗 회원가입 요청 데이터:', payload);

        try {
            const response = await createMemberInfo(payload);
            console.log('📡 회원가입 요청 성공:', response);
            
            if (response && response.data) {
                const { memberId, token, refreshToken: newRefreshToken } = response.data;
                if (memberId && token) {
                    setAuthInfo({ memberId, accessToken: token, refreshToken: newRefreshToken || '' });
                    console.log('회원가입 후 로그인 정보 저장됨', {memberId});
                } else {
                    console.error('회원가입 응답에 memberId 또는 token이 없습니다.', response.data);
                    Alert.alert('오류', '회원가입은 되었으나, 로그인 정보 처리에 실패했습니다. 다시 로그인해주세요.');
                    router.replace('/(onBoard)');
                    return;
                }
            } else {
                console.error('회원가입 응답 구조가 예상과 다릅니다.', response);
                Alert.alert('오류', '회원가입 처리 중 예기치 않은 오류가 발생했습니다.');
                return;
            }

            clearSignupData();
            router.replace('/(onBoard)/register/Congratulate');
        } catch (err: any) {
            console.error('회원가입 실패:', err);
            let errMsg = '회원가입 중 문제가 발생했습니다.';
            if (err.response) {
                const { status, data } = err.response;
                const message = data?.message;
                const error = data?.error;
                if (status === 409 && message === "Member exists") {
                    errMsg = '이미 가입된 이메일이거나 사용자 정보가 존재합니다.';
                } else if (message) {
                    errMsg = message;
                } else if (error) {
                    errMsg = error;
                }
            }
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
                <TextInput 
                    style={[styles.input, styles.disabledInput]} // 비활성화 스타일 적용
                    value={emailFromStore} // 스토어 이메일 사용
                    placeholder="이메일 주소"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={false} // 입력 비활성화
                />

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
                    editable={false}
                />

                <Text style={styles.label}>이름</Text>
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
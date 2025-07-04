// AgreementScreen 컴포넌트 (예: app/(onBoard)/register/agreement.tsx)
import LogoIcon from '@/assets/images/login/logo_icon.svg'; // SVG 사용 시
import TossAuth from '@/components/common/TossAuth';
import UnderageRestrictionModal from '@/components/login/UnderageRestrictionModal'; // 미성년자 모달 임포트
import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 예시
import useSignupProgressStore, { SignupData } from '@/zustand/stores/signupProgressStore'; // 새 스토어 및 타입 임포트
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // useLocalSearchParams 임포트
import { useEffect, useState } from "react"; // React 임포트
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Term {
    id: number;
    label: string;
    required: boolean;
}

const terms: Term[] = [
    { id: 1, label: '서비스 이용약관 동의 (필수)', required: true },
    { id: 2, label: '개인정보 수집 및 이용 동의 (필수)', required: true },
    { id: 3, label: '만 18세 이상 여부 확인 (필수)', required: true },
    { id: 4, label: '개인정보 제 3자 제공 동의 (필수)', required: true },
    { id: 5, label: '마케팅 및 광고 수신 동의 (선택)', required: false },
    { id: 6, label: '맞춤형 광고 및 분석 활용 동의 (선택)', required: false },
];

export default function Agreement() {
    const router = useRouter();
    const params = useLocalSearchParams<{ updatedAgreements?: string }>(); // 파라미터 타입 정의
    const [checkedTerms, setCheckedTerms] = useState<boolean[]>(() => terms.map(() => false));
    const [showTossAuth, setShowTossAuth] = useState(false);
    const [showUnderageModal, setShowUnderageModal] = useState(false); // 미성년자 모달 상태
    const { updateSignupData } = useSignupProgressStore((state) => state.actions); // 새 스토어 액션 사용

    // DetailAgreement에서 돌아올 때 상태 업데이트
    useEffect(() => {
        if (params.updatedAgreements) {
            try {
                const statuses = JSON.parse(params.updatedAgreements) as Record<string | number, boolean>;
                const newCheckedTerms = terms.map(term => statuses[term.id] ?? false);
                setCheckedTerms(newCheckedTerms);
            } catch (e) {
                console.error("Failed to parse updatedAgreements params:", e);
            }
        }
    }, [params.updatedAgreements]);

    // 필수 약관만 필터링 후 모두 동의했는지 확인
    const allRequiredChecked = terms
        .filter(term => term.required)
        .every(term => {
            const originalIndex = terms.findIndex(t => t.id === term.id);
            return checkedTerms[originalIndex];
        });

    const allAgreed = checkedTerms.every(Boolean); // 모든 약관 (필수+선택) 동의 여부

    const toggleCheck = (index: number): void => {
        const updated = [...checkedTerms];
        updated[index] = !updated[index];
        setCheckedTerms(updated);
    };

    const toggleAll = (): void => {
        const newValue = !allAgreed;
        setCheckedTerms(terms.map(() => newValue));
    };

    const handleNext = (): void => {
        if (!allRequiredChecked) {
            Alert.alert('알림', '필수 약관에 모두 동의해주세요.');
            return;
        }
        setShowTossAuth(true);
    };

    interface TossUserInfoFromAuth {
        name: string;
        phone?: string; // Toss 응답에 phone이 없을 수 있음을 명시
        gender?: string;
        birth?: string; // YYYYMMDD 형식 (로그 기준)
        ageGroup?: string;
    }

    const handleAuthSuccess = (userInfo: TossUserInfoFromAuth) => { 
        console.log("✅ Toss 인증 성공:", userInfo); // userInfo 전체 로그 확인
        setShowTossAuth(false);

        if (userInfo.ageGroup !== 'ADULT') { // ageGroup도 함께 체크
            setShowUnderageModal(true);
            return;
        }
        
        let storeGender: 'MALE' | 'FEMALE' | null = null;
        if (userInfo.gender?.toUpperCase() === 'MALE' || userInfo.gender === '남성') {
            storeGender = 'MALE';
        } else if (userInfo.gender?.toUpperCase() === 'FEMALE' || userInfo.gender === '여성') {
            storeGender = 'FEMALE';
        }

        const signupUpdate: Partial<SignupData> = {
            name: userInfo.name,
            gender: storeGender,
            birth: userInfo.birth || null, // 로그에서 birth 필드 사용
            ageGroup: userInfo.ageGroup || null, // ageGroup 추가
        };
        updateSignupData(signupUpdate); // 새 스토어 액션 호출
        console.log("SignupProgress 스토어에 사용자 인증 정보 저장 완료:", signupUpdate);

        router.push('/(onBoard)/register/SignupInput');
    };
    
    const handleAuthFailure = () => {
        console.log("❌ Toss 인증 실패");
        setShowTossAuth(false);
        Alert.alert("인증 실패", "본인 인증에 실패했습니다. 다시 시도해주세요.");
    };

    // DetailAgreement로 이동하는 함수
    const navigateToDetailAgreement = () => {
        const currentAgreementsStatus: Record<string | number, boolean> = {};
        terms.forEach((term, index) => {
            currentAgreementsStatus[term.id] = checkedTerms[index];
        });

        router.replace({
            pathname: '/(onBoard)/register/DetailAgreement',
            params: { currentAgreements: JSON.stringify(currentAgreementsStatus) },
        });
    };

    return (
        <>
            {showTossAuth && <TossAuth onAuthSuccess={handleAuthSuccess} onAuthFailure={handleAuthFailure} />}
            <UnderageRestrictionModal 
                visible={showUnderageModal}
                onGoLogin={() => {
                    setShowUnderageModal(false);
                    router.replace('/(onBoard)'); // 로그인 페이지로 이동
                }}
            />
            <View style={styles.container}>
                <View style={styles.illustrationBox}>
                    <LogoIcon width={230} height={230}/>
                </View>
                <TouchableOpacity onPress={toggleAll} style={styles.checkAllBox}>
                    <Ionicons name={allAgreed ? 'checkbox' : 'square-outline'} size={24} color="#B28EF8" />
                    <Text style={styles.checkAllText}>아래 항목에 전부 동의합니다.</Text>
                </TouchableOpacity>
                <View style={styles.contentBox}>
                    {terms.map((term, i) => (
                        <View key={term.id} style={styles.termRow}>
                            <TouchableOpacity onPress={() => toggleCheck(i)} style={styles.checkbox}>
                                <Ionicons name={checkedTerms[i] ? 'checkbox' : 'square-outline'} size={20} color="#B28EF8" />
                            </TouchableOpacity>
                            <Text style={styles.termText}>{term.label}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.focusAgreement}>
                    <TouchableOpacity onPress={navigateToDetailAgreement}>
                        <Text style={styles.focusText}>이용약관 자세히 보기</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.buttonWrapper, { opacity: allRequiredChecked ? 1 : 0.4 }]}>
                    <MediumButton title="다음" onPress={handleNext} />
                </View>
            </View>
        </>
    );
}

// 스타일 정의는 이전 답변과 동일하게 사용 가능 (styles 객체)
const styles = StyleSheet.create({ /* ... 이전 스타일 복사 ... */
    container: {
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 32,
        backgroundColor: '#F9F9F9',
    },
    illustrationBox: {
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 50,
    },
    checkAllBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 4,
    },
    checkbox: {
        marginRight: 10,
    },
    checkAllText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    termRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 4,
    },
    termText: {
        fontSize: 14,
        color: '#444',
        marginLeft: 6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    contentBox: {
        marginTop: 10,
        paddingLeft: 8,
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20, // 원본 스타일에서 가져옴
    },
    focusAgreement: {
        paddingLeft: 20,
        marginBottom: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    focusText: {
        color: '#B19ADE',
        fontSize: 12,
        textAlign: 'center',
    },
});
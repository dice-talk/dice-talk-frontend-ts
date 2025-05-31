// DetailAgreementScreen 컴포넌트 (예: app/(onBoard)/register/detailAgreement.tsx)
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { termsData } from '@/dummyData/TermsData'; // 경로 및 타입 정의 필요
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TermDataItem {
    id: string | number;
    title: string;
    content: string;
    required: boolean;
}

export default function DetailAgreement() {
    const router = useRouter();
    const params = useLocalSearchParams<{ currentAgreements?: string }>();
    const { height } = Dimensions.get('window');

    const [checked, setChecked] = useState<boolean[]>(() => {
        if (params.currentAgreements) {
            try {
                const statuses = JSON.parse(params.currentAgreements) as Record<string | number, boolean>;
                return termsData.map(term => statuses[term.id] ?? false);
            } catch (e) {
                console.error("Failed to parse currentAgreements params:", e);
                return termsData.map(() => false);
            }
        }
        return termsData.map(() => false);
    });
    const [allChecked, setAllChecked] = useState(false);

    useEffect(() => {
        setAllChecked(checked.every(Boolean));
    }, [checked]);

    const toggleCheck = (index: number): void => {
        const newChecked = [...checked];
        newChecked[index] = !newChecked[index];
        setChecked(newChecked);
    };

    const toggleAllChecks = () => {
        const newValue = !allChecked;
        setChecked(termsData.map(() => newValue));
        setAllChecked(newValue);
    };

    const allRequiredAgreed = termsData
        .filter(term => term.required)
        .every((term) => {
            const originalIndex = termsData.findIndex(t => t.id === term.id);
            return checked[originalIndex];
        });

    const handleNext = (): void => {
        if (!allRequiredAgreed) {
            Alert.alert('알림', '필수 약관에 모두 동의해주세요.');
            return;
        }

        const updatedAgreementsStatus: Record<string | number, boolean> = {};
        termsData.forEach((term, index) => {
            updatedAgreementsStatus[term.id] = checked[index];
        });

        router.replace({
            pathname: '/(onBoard)/register/Agreement',
            params: { updatedAgreements: JSON.stringify(updatedAgreementsStatus) },
        });
    };

    const renderItem = ({ item, index }: { item: TermDataItem; index: number }) => (
        <View key={item.id.toString()} style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title} <Text style={item.required ? styles.requiredText : styles.optionalText}>({item.required ? '필수' : '선택'})</Text></Text>
            <View style={styles.scrollBox}>
                <ScrollView nestedScrollEnabled={true}>
                    <Text style={styles.textContent}>{item.content}</Text>
                </ScrollView>
            </View>
            <TouchableOpacity onPress={() => toggleCheck(index)} style={styles.checkboxRow}>
                <Ionicons name={checked[index] ? 'checkbox' : 'square-outline'} size={20} color='#B28EF8' />
                <Text style={styles.agreeText}>동의합니다.</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>이용약관</Text>
            </View>
            <View style={styles.allCheckContainer}>
                <TouchableOpacity onPress={toggleAllChecks} style={styles.allCheckButton}>
                    <Ionicons name={allChecked ? 'checkbox' : 'square-outline'} size={22} color='#B28EF8' />
                    <Text style={styles.allCheckText}>전체 동의</Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginBottom: height * 0.2 }}>
            <FlatList
                data={termsData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListFooterComponent={
                    <View
                        style={{ ...styles.buttonBox, opacity: allRequiredAgreed ? 1 : 0.5 }}
                        pointerEvents={allRequiredAgreed ? 'auto' : 'none'}
                    >
                        <MediumButton title="확인" onPress={handleNext} />
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 60,
    },
    allCheckContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    allCheckButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    allCheckText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 8,
    },
    requiredText: {
        color: '#FF6B6B',
        fontWeight: 'normal'
    },
    optionalText: {
        color: '#555',
        fontWeight: 'normal'
    },
    scrollBox: {
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#F9F9F9',
        marginBottom: 10,
    },
    textContent: {
        fontSize: 13,
        lineHeight: 20,
        color: '#444',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    agreeText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    buttonBox: {
        marginTop: 20,
        alignItems: 'center',
    },
});
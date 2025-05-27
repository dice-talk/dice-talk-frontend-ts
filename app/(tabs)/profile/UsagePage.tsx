import DiceLogo from "@/assets/images/profile/dice.svg";
import GradientHeader from "@/components/common/GradientHeader";
import Tab from "@/components/common/Tab";
import UseageItem, { UseageItemProps } from "@/components/useage/UseageItem";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

// memberInfoStore 또는 API 호출을 통해 가져올 사용자 정보 타입 (가정)
// type MemberInfo = {
//   nickname: string;
//   profileImage: string;
//   diceCount: number;
//   isInChat: boolean;
// };

// 더미 데이터 (충전 내역)
const dummyChargeData: UseageItemProps[] = [
  { id: 'charge1', type: 'charge', createdAt: '2025-03-13T13:04:45Z', quantity: 30 },
  { id: 'charge2', type: 'charge', createdAt: '2025-03-13T13:04:45Z', quantity: 30 }, // 이미지 중복 데이터
  { id: 'charge3', type: 'charge', createdAt: '2025-03-01T22:02:15Z', quantity: 10 },
  { id: 'charge4', type: 'charge', createdAt: '2025-02-14T19:13:02Z', quantity: 10 },
  { id: 'charge5', type: 'charge', createdAt: '2025-02-02T18:03:29Z', quantity: 10 },
];

// 더미 데이터 (사용 내역)
const dummyUsageData: UseageItemProps[] = [
  { id: 'use1', type: 'use', createdAt: '2025-03-19T10:00:00Z', title: 'DICE 4개', description: '큐피트의 짝대기 수정 1회권' },
  { id: 'use2', type: 'use', createdAt: '2025-03-16T11:00:00Z', title: 'DICE 4개', description: '큐피트의 짝대기 수정 1회권' },
  { id: 'use3', type: 'use', createdAt: '2025-03-16T12:00:00Z', title: 'DICE 4개', description: '큐피트의 짝대기 수정 1회권' }, // 이미지 중복 데이터
  { id: 'use4', type: 'use', createdAt: '2025-03-10T14:00:00Z', title: 'DICE 7개', description: '채팅방 나가기 초과 횟수권' },
  { id: 'use5', type: 'use', createdAt: '2025-02-28T15:00:00Z', title: 'DICE 4개', description: '큐피트의 짝대기 수정 1회권' },
];

export default function UsagePage() {
    // const router = useRouter(); // 현재 사용 안함
    const [activeTab, setActiveTab] = useState<'충전 내역' | '사용 내역'>('충전 내역');
    const [currentDiceAmount] = useState<number>(34); // 이미지 기준 보유 다이스
    const [displayData, setDisplayData] = useState<UseageItemProps[]>(dummyChargeData);

    useEffect(() => {
        if (activeTab === '충전 내역') {
            setDisplayData(dummyChargeData);
        } else {
            setDisplayData(dummyUsageData);
        }
    }, [activeTab]);

    const handleTabChange = (tab: string) => {
        if (tab === '충전 내역' || tab === '사용 내역') {
            setActiveTab(tab as '충전 내역' | '사용 내역');
        }
    };

    const renderEmptyListComponent = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
                {activeTab === '충전 내역' ? '충전 내역이 없습니다.' : '사용 내역이 없습니다.'}
            </Text>
        </View>
    );

  return (
    <View style={styles.container}>
        <GradientHeader title="충전/사용 내역" />
        
        <View style={styles.diceInfoContainerTop}>
            <DiceLogo width={width * 0.06} height={width * 0.06} />
            <Text style={styles.diceInfoTitleText}>나의 DICE</Text>
        </View>

        <LinearGradient
            colors={['#EAEAEA', '#EAEAEA']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}
        />
        <View style={styles.currentDiceAmountContainer}>
            <Text style={styles.currentDiceText}>현재 보유 중인 나의 Dice</Text>
            <Text style={styles.currentDiceCount}>{currentDiceAmount} 개</Text>
        </View>
        <LinearGradient
            colors={['#EAEAEA', '#EAEAEA']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}
        />

        <Tab 
            tabs={["충전 내역", "사용 내역"]}
            activeTab={activeTab}
            onTabChange={handleTabChange} 
        />
        
        <FlatList
            data={displayData}
            renderItem={({ item }) => <UseageItem {...item} />}
            keyExtractor={item => item.id.toString()}
            style={styles.flatListStyle}
            contentContainerStyle={styles.flatListContentContainer}
            ListEmptyComponent={renderEmptyListComponent}
            // ItemSeparatorComponent={() => <View style={styles.itemSeparator} />} // UseageItem 자체 구분선 사용
        />
    </View>
  );
}
const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    diceInfoContainerTop: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        paddingVertical: 20, // 상하 여백
        gap: 10, // 로고와 텍스트 간격
    },
    diceInfoTitleText: {
        fontSize: 16,
        fontFamily: "Pretendard-SemiBold",
        color: "#333333",
    },
    gradientBorder: {
      height: 1,
      width: '100%', // 전체 너비
    },
    currentDiceAmountContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: width * 0.05,
      paddingVertical: 20, // 상하 여백
    },
    currentDiceText: {
        fontSize: 15,
        fontFamily: "Pretendard-Regular",
        color: "#555555",
    },
    currentDiceCount: {
        fontSize: 15,
        fontFamily: "Pretendard-SemiBold",
        color: "#333333",
    },
    flatListStyle: {
        flex: 1, // 남은 공간 모두 차지
        // backgroundColor: '#F5F5F5', // 배경색 테스트
    },
    flatListContentContainer: {
        paddingBottom: width * 0.1, // 하단 여백 (요구사항)
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // 적절한 상단 여백
    },
    emptyListText: {
        fontSize: 16,
        color: '#8C8C8C',
        fontFamily: 'Pretendard-Regular',
    },
    // itemSeparator: { // UseageItem 자체 구분선 사용 시 불필요
    //   height: 1,
    //   width: "90%",
    //   backgroundColor: "#E0E0E0",
    //   alignSelf: 'center',
    // }
  });
import { DiceLog, getMemberDiceLogs } from "@/api/productApi"; // API 함수 및 타입 import
import DiceLogo from "@/assets/images/profile/dice.svg";
import GradientHeader from "@/components/common/GradientHeader";
import Tab from "@/components/common/Tab";
import UseageItem, { UseageItemProps } from "@/components/useage/UseageItem";
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore import
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore"; // SharedProfileStore import
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from "react"; // useCallback 추가
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native"; // ActivityIndicator 추가

// memberInfoStore 또는 API 호출을 통해 가져올 사용자 정보 타입 (가정)
// type MemberInfo = {
//   nickname: string;
//   profileImage: string;
//   diceCount: number;
//   isInChat: boolean;
// };

// 더미 데이터 삭제 (API 연동으로 대체)
// const dummyChargeData: UseageItemProps[] = [ ... ];
// const dummyUsageData: UseageItemProps[] = [ ... ];

export default function UsagePage() {
    // const router = useRouter(); // 현재 사용 안함
    const [activeTab, setActiveTab] = useState<'충전 내역' | '사용 내역'>('충전 내역');
    
    // Zustand 스토어에서 memberId와 totalDice 가져오기
    const memberId = useAuthStore(state => state.memberId);
    const totalDice = useSharedProfileStore(state => state.totalDice);
    const currentDiceAmount = totalDice !== null ? totalDice : 0; // null일 경우 0으로 기본값 설정
    
    const [allLogs, setAllLogs] = useState<DiceLog[]>([]);
    const [displayData, setDisplayData] = useState<UseageItemProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = useCallback(async (fetchPage: number) => {
        if (!memberId || (isLoading && fetchPage === page)) return;
        setIsLoading(true);
        try {
            const response = await getMemberDiceLogs(memberId, fetchPage, 10);
            if (response && response.data) {
                setAllLogs(prevLogs => fetchPage === 1 ? response.data : [...prevLogs, ...response.data]);
                if(response.pageInfo) {
                  setTotalPages(response.pageInfo.totalPages || 1);
                }
                setPage(fetchPage);
            }
        } catch (error) {
            console.error("Error fetching dice logs:", error);
            // TODO: 사용자에게 에러 메시지 표시 (예: 토스트 메시지)
        } finally {
            setIsLoading(false);
        }
    }, [memberId, isLoading, page]);

    useEffect(() => {
        if (memberId) { // memberId가 유효할 때만 로그를 가져옴
            fetchLogs(1);
        } else {
            // memberId가 없으면 (예: 로그아웃 상태) 로그 목록을 비우고 초기화
            setAllLogs([]);
            setDisplayData([]);
            setPage(1);
            setTotalPages(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]); // memberId 변경 시 (로그인/로그아웃) 로그 다시 가져오기

    useEffect(() => {
        const filteredLogs = allLogs.filter(log => 
            activeTab === '충전 내역' ? log.logType === 'DICE_CHARGE' : log.logType === 'DICE_USED'
        );
        const mappedData: UseageItemProps[] = filteredLogs.map(log => ({
            id: log.logId,
            createdAt: log.createdAt,
            logType: log.logType,
            info: log.info,
            quantity: log.quantity,
        }));
        setDisplayData(mappedData);
    }, [allLogs, activeTab]);

    const handleTabChange = (tab: string) => {
        if (tab === '충전 내역' || tab === '사용 내역') {
            setActiveTab(tab as '충전 내역' | '사용 내역');
        }
    };

    const loadMoreLogs = () => {
        if (page < totalPages && !isLoading && memberId) { // memberId 유효성 검사 추가
            fetchLogs(page + 1);
        }
    };

    const renderEmptyListComponent = () => (
        !isLoading && displayData.length === 0 && (
            <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                    {!memberId ? "로그인이 필요합니다." : (activeTab === '충전 내역' ? '충전 내역이 없습니다.' : '사용 내역이 없습니다.')}
                </Text>
            </View>
        )
    );

    const renderFooter = () => {
        if (!isLoading || page >= totalPages) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#8A2BE2" />;
    };

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
            <Text style={styles.currentDiceCount}>{memberId ? currentDiceAmount : '-'} 개</Text>
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
            renderItem={({ item }) => <UseageItem {...item} />} // UseageItemProps를 직접 전달
            keyExtractor={item => item.id.toString()}
            style={styles.flatListStyle}
            contentContainerStyle={styles.flatListContentContainer}
            ListEmptyComponent={renderEmptyListComponent}
            onEndReached={loadMoreLogs} // 무한 스크롤을 위한 onEndReached 추가
            onEndReachedThreshold={0.5} // 끝에서 얼마나 떨어졌을 때 loadMoreLogs를 호출할지 (0.1 = 10%)
            ListFooterComponent={renderFooter} // 로딩 인디케이터 표시
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
        paddingBottom: width * 0.2, // 하단 여백 (요구사항)
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
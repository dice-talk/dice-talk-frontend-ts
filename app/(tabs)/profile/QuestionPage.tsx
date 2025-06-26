// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/profile/GradientBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
//import { getAnonymousInfo } from "@/api/memberApi";
//import QuestionList, { QuestionListItemType } from "@/components/profile/question/QuestionList";
//import useAuthStore from "@/zustand/stores/authStore";
import { getQuestions, Question } from "@/api/questionApi";
import QuestionItem from "@/components/profile/question/QuestionItem";
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";

// 화면 크기 가져오기 (스타일에서 사용)
const { width, height } = Dimensions.get("window");

type MemberInfo = {
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
  };

const defaultProfileImageFromQuestionPage = require("@/assets/images/profile/profile_default.png");

// QuestionListItemType을 Question 인터페이스로 대체 (또는 Question 인터페이스를 QuestionListItemType으로 사용)
// 여기서는 Question을 직접 사용합니다. QuestionItem props도 Question과 호환되도록 가정합니다.
// 만약 QuestionItem이 QuestionListItemType에 의존한다면, Question을 해당 타입으로 변환하는 로직 필요.
// 우선 QuestionListItemType을 Question으로 간주하고 진행.
type QuestionListItemType = Question;

const PAGE_SIZE = 10; // 한 번에 불러올 질문 개수 (무한 스크롤용)

export default function QuestionPage() {
    const router = useRouter();
    // const memberId = useAuthStore((state) => state.memberId);

    const storeNickname = useSharedProfileStore((state) => state.nickname);
    const storeProfileImage = useSharedProfileStore((state) => state.profileImage);
    const storeTotalDice = useSharedProfileStore((state) => state.totalDice);
    const storeIsInChat = useSharedProfileStore((state) => state.isInChat);
    // const setSharedProfile = useSharedProfileStore((state) => state.actions.setSharedProfile);
    // const isProfileInitialized = useSharedProfileStore((state) => !!state.nickname);

    const [profileHeaderData, setProfileHeaderData] = useState<MemberInfo>(() => ({
        nickname: storeNickname || "",
        profileImage: storeProfileImage || defaultProfileImageFromQuestionPage,
        diceCount: Number(storeTotalDice || 0),
        isInChat: !!(storeIsInChat || false),
    }));

    // 질문 목록 및 무한 스크롤 상태 관리
    const [questions, setQuestions] = useState<QuestionListItemType[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1); // API는 0-based page
    const [isLoading, setIsLoading] = useState<boolean>(false); // 초기 로딩 및 정렬 변경 시 로딩
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // 추가 데이터 로딩
    const [hasMoreData, setHasMoreData] = useState<boolean>(true); // 더 불러올 데이터가 있는지 여부
    const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

    useEffect(() => {
        // sharedProfileStore의 값이 변경될 때마다 profileHeaderData를 업데이트
        setProfileHeaderData({
            nickname: storeNickname || "",
            profileImage: storeProfileImage || defaultProfileImageFromQuestionPage,
            diceCount: Number(storeTotalDice || 0),
            isInChat: !!(storeIsInChat || false),
        });
    }, [storeNickname, storeProfileImage, storeTotalDice, storeIsInChat]);

    const fetchQuestions = useCallback(async (isInitialLoad: boolean = false) => {
        if (isInitialLoad ? isLoading : (isLoadingMore || !hasMoreData) ) return;

        const pageToFetch = isInitialLoad ? 1 : currentPage;

        if (isInitialLoad) {
            setIsLoading(true);
            setQuestions([]); 
            setHasMoreData(true); 
            // setCurrentPage(1); // pageToFetch가 1로 설정되므로, 여기서 currentPage를 1로 설정할 필요 없음
        } else {
            setIsLoadingMore(true);
        }

        try {
            const sortParam = sortBy === "latest" ? "desc" : "asc";
            
            console.log(`Fetching questions: page=${pageToFetch}, size=${PAGE_SIZE}, sort=${sortBy}`);
            const response = await getQuestions(pageToFetch, PAGE_SIZE, sortParam);

            if (response && response.questions) {
                const newQuestions = response.questions;
                setQuestions(prevQuestions => 
                    isInitialLoad ? newQuestions : [...prevQuestions, ...newQuestions]
                );
                
                const stillHasMore = !(newQuestions.length < PAGE_SIZE || (response.totalPages && pageToFetch >= response.totalPages));
                setHasMoreData(stillHasMore);
                setCurrentPage(pageToFetch + 1); // 성공적으로 pageToFetch를 로드했으므로, 다음 페이지 번호로 업데이트

            } else {
                // 응답이 없거나 questions 배열이 없는 경우
                if (isInitialLoad) setQuestions([]); // 초기 로드 실패 시 목록 비우기
                setHasMoreData(false);
                setCurrentPage(pageToFetch + 1); // 실패했더라도 다음 페이지 번호로 업데이트 (무한 루프 방지)
            }
        } catch (error) {
            console.error("질문 목록 조회 실패:", error);
            if (isInitialLoad) setQuestions([]); // 초기 로드 실패 시 목록 비우기
            setHasMoreData(false);
            setCurrentPage(pageToFetch + 1); // 에러 발생 시에도 다음 페이지 번호로 업데이트
        } finally {
            if (isInitialLoad) {
                setIsLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    }, [sortBy, currentPage, isLoading, isLoadingMore, hasMoreData, PAGE_SIZE]); // PAGE_SIZE 추가

    useEffect(() => {
        // 컴포넌트 마운트 시 또는 정렬 기준 변경 시 데이터 로드
        // fetchQuestions(true) 호출 전에 currentPage를 1로 설정할 필요는 없음.
        // fetchQuestions 내부에서 isInitialLoad=true일 때 pageToFetch를 1로 사용.
        fetchQuestions(true);
    }, [sortBy]); // fetchQuestions는 useCallback으로 memoize되어 있으므로, sortBy만 의존성으로 둠

    // useFocusEffect를 사용하여 화면이 포커스될 때마다 데이터 목록을 새로고침합니다.
    useFocusEffect(
        useCallback(() => {
            console.log("QuestionPage focused. Reloading questions.");
            // isInitialLoad=true로 호출하여 목록을 초기화하고 첫 페이지부터 다시 불러옵니다.
            // 기존의 isLoading 플래그가 중복 API 호출을 막아줍니다.
            fetchQuestions(true);
        }, []) // 의존성 배열은 비워두어 포커스 시에만 실행되도록 합니다. fetchQuestions는 최신 상태를 참조합니다.
    );

    const handleBack = () => {
        router.back();
    };

    const handleSortChange = (newSortBy: "latest" | "oldest") => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            // sortBy가 변경되면 useEffect가 fetchQuestions(true)를 호출할 것임
            console.log("정렬 변경:", newSortBy);
        }
    };
    
    const handleLoadMore = () => {
        console.log("handleLoadMore 호출됨, hasMoreData:", hasMoreData, "isLoadingMore:", isLoadingMore);
        if (hasMoreData && !isLoadingMore) {
           fetchQuestions(false); 
        }
    };

    const renderSortDropdown = () => (
        <View style={styles.sortContainer}>
            <TouchableOpacity onPress={() => handleSortChange(sortBy === "latest" ? "oldest" : "latest")}>
                <Text style={styles.sortText}>
                    {sortBy === "latest" ? "최신순" : "오래된순"} ▼
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (isLoadingMore) {
            return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#B28EF8" />;
        }
        return null;
    };
    
    const renderItem = ({ item }: { item: QuestionListItemType }) => (
        <QuestionItem
            key={item.questionId} // FlatList의 keyExtractor가 있지만, 개별 아이템에도 key를 주는 것이 좋음
            title={item.title}
            createAt={item.createdAt} // API 스펙에 따라 필드명 확인 (createAt or createdAt)
            answered={item.questionStatus === "QUESTION_ANSWERED"}
            questionId={item.questionId}
        />
    );

    // 데이터 로딩 중 UI (초기 로딩)
    const renderLoadingView = () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B28EF8" />
        <Text style={styles.loadingText}>질문 목록을 불러오는 중...</Text>
      </View>
    );

    // 질문 없을 때 UI (초기 로딩 후)
    const renderEmptyListView = () => (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#B28EF899', '#F476E599']}
          style={styles.emptyIconBackground}
        >
          <Ionicons name="document-text-outline" size={64} color="white" />
        </LinearGradient>
        <Text style={styles.emptyText}>등록된 질문이 없습니다.</Text>
      </View>
    );

    return (
        <View style={styles.pageContainer}>
            <View style={styles.gradientBackgroundWrapper}>
                <GradientBackground>
                    <ProfileHeader {...profileHeaderData} mode="question" />
                </GradientBackground>
            </View>

            <View style={styles.fixedHeaderContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={28} color="rgba(0, 0, 0, 0.4)" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>나의 문의</Text>
                </View>
            </View>

            <View style={styles.bottomSectionContainer}>
                {renderSortDropdown()} 
                {isLoading && questions.length === 0 ? ( // 초기 로딩 중이면서 질문이 없을 때만 전체 로딩뷰
                    renderLoadingView()
                ) : !isLoading && questions.length === 0 ? ( // 로딩 끝났는데 질문 없으면 emptyView
                    renderEmptyListView()
                ) : (
                    <FlatList
                        data={questions}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.questionId.toString()}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5} // 리스트의 절반 정도 스크롤했을 때 다음 데이터 로드
                        ListFooterComponent={renderFooter}
                        style={styles.questionScrollContainer} 
                        contentContainerStyle={styles.questionScrollContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    gradientBackgroundWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    fixedHeaderContainer: { 
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      position: "absolute", 
      top: 15,              
      left: 0,             
      right: 0,            
      zIndex: 10,          
      backgroundColor: "transparent",
    },
    backButton: {
      position: "absolute",
      left: 16,
      top: 0, 
      bottom: 0, 
      justifyContent: "center",
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Pretendard-Bold",
      color: "#7d7d7d",
    },
    bottomSectionContainer: { 
        flex: 1, 
        paddingHorizontal: 16, 
        marginTop: height * 0.41,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        paddingVertical: 8,
        left: 8,
    },
    sortText: {
        fontSize: 14,
        fontFamily: 'Pretendard-Medium',
        color: 'rgba(0,0,0,0.6)',
    },
    questionScrollContainer: { 
        flex: 1,
        marginBottom: height * 0.1,
    },
    questionScrollContent: { 
        paddingBottom: 10,
        paddingTop: 10,
    },
    loadingContainer: {
      flex: 1, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#6B7280',
      fontFamily: "Pretendard-Medium",
    },
    emptyContainer: {
      flex: 1, 
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 70,
    },
    emptyIconBackground: {
        width: 120,
        height: 120,
        borderRadius: 20, 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      },
      emptyText: {
        fontSize: 16,
        color: '#6B7280',
        fontFamily: "Pretendard-Medium",
      },
    noMoreDataText: {
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: 14,
        color: '#6B7280',
        fontFamily: "Pretendard-Regular",
    }
});


import { ChatRoomItem, HeartHistoryItem, PageInfo, getChatHistory, getHeartHistory } from "@/api/historyApi";
import EventBannerComponent from "@/components/common/EventBannerComponent";
import Tab from "@/components/common/Tab";
import HistoryItem, { HistoryItemProps } from "@/components/history/HistoryItem";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Platform, StyleSheet, Text, View } from "react-native";

const DUMMY_MEMBER_ID = 1;
const TAB_BAR_HEIGHT_APPROX = Platform.OS === 'ios' ? 80 : 60; // 일반적인 탭바 높이 근사치

// 화면 높이에 따라 ITEMS_PER_PAGE 결정하는 함수
const getItemsPerPage = () => {
  const windowHeight = Dimensions.get('window').height;
  // 예시: 화면 높이가 800px 이상이면 8개, 미만이면 6개 (무한 스크롤이므로 한 번에 더 많이 가져오도록 조정 가능)
  return windowHeight >= 800 ? 8 : 6;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'heart'>('chat');
  
  // 화면 크기 변경에 따른 ITEMS_PER_PAGE 동적 계산 (useMemo로 최적화)
  const itemsPerPage = useMemo(() => getItemsPerPage(), []);

  // 채팅 내역 상태
  const [chatHistory, setChatHistory] = useState<ChatRoomItem[]>([]);
  const [chatPageInfo, setChatPageInfo] = useState<PageInfo | null>(null);
  const [currentChatPage, setCurrentChatPage] = useState(1);
  const [hasMoreChat, setHasMoreChat] = useState(true);

  // 하트 내역 상태
  const [fullHeartHistory, setFullHeartHistory] = useState<HeartHistoryItem[]>([]); // 전체 하트 내역
  const [displayedHeartHistory, setDisplayedHeartHistory] = useState<HeartHistoryItem[]>([]); // 화면에 표시될 하트 내역
  const [currentHeartOffset, setCurrentHeartOffset] = useState(0); // 하트 내역 현재 오프셋
  const [hasMoreHearts, setHasMoreHearts] = useState(true);

  const [loading, setLoading] = useState(false); // 초기 로딩 상태
  const [loadingMore, setLoadingMore] = useState(false); // 더 불러오기 로딩 상태

  // 채팅 내역 불러오기 (페이지 기반)
  const loadChatHistory = useCallback(async (page: number, isInitialLoad = false) => {
    if (loadingMore && !isInitialLoad) return; // 이미 더 불러오는 중이면 중복 실행 방지
    setLoading(isInitialLoad ? true : false);
    if (!isInitialLoad) setLoadingMore(true);

    try {
      const response = await getChatHistory(DUMMY_MEMBER_ID, page, itemsPerPage);
      setChatHistory(prev => isInitialLoad ? response.data : [...prev, ...response.data]);
      setChatPageInfo(response.pageInfo);
      setCurrentChatPage(response.pageInfo.page);
      setHasMoreChat(response.pageInfo.page < response.pageInfo.totalPages);
    } catch (error) {
      console.error("채팅 내역 로딩 실패:", error);
      setHasMoreChat(false); // 에러 발생 시 더 이상 로드 시도 안함
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [itemsPerPage]);

  // 전체 하트 내역 한 번에 불러오기
  const loadFullHeartHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getHeartHistory(DUMMY_MEMBER_ID);
      setFullHeartHistory(response.data);
      // 처음 itemsPerPage 만큼만 표시
      setDisplayedHeartHistory(response.data.slice(0, itemsPerPage));
      setCurrentHeartOffset(itemsPerPage);
      setHasMoreHearts(response.data.length > itemsPerPage);
    } catch (error) {
      console.error("하트 히스토리 로딩 실패:", error);
      setHasMoreHearts(false);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // 하트 내역 더 보여주기 (클라이언트 사이드)
  const loadMoreHearts = useCallback(() => {
    if (loadingMore || !hasMoreHearts) return;
    setLoadingMore(true);
    
    const nextOffset = currentHeartOffset + itemsPerPage;
    const newHearts = fullHeartHistory.slice(currentHeartOffset, nextOffset);
    
    // 약간의 딜레이를 주어 로딩 인디케이터가 보이도록 (실제 API 호출이 아니므로)
    setTimeout(() => {
      setDisplayedHeartHistory(prev => [...prev, ...newHearts]);
      setCurrentHeartOffset(nextOffset);
      setHasMoreHearts(fullHeartHistory.length > nextOffset);
      setLoadingMore(false);
    }, 500);

  }, [fullHeartHistory, currentHeartOffset, itemsPerPage, hasMoreHearts, loadingMore]);
  
  // 탭 변경 또는 초기 로드
  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatHistory(1, true); // 초기 로드 시 1페이지
    } else {
      loadFullHeartHistory(); // 전체 하트 내역 로드 후 일부 표시
    }
  }, [activeTab, loadChatHistory, loadFullHeartHistory]); // currentChatPage 제거

  const handleTabChange = (tabName: string) => {
    // 상태 초기화
    setChatHistory([]);
    setChatPageInfo(null);
    setCurrentChatPage(1);
    setHasMoreChat(true);
    setFullHeartHistory([]);
    setDisplayedHeartHistory([]);
    setCurrentHeartOffset(0);
    setHasMoreHearts(true);
    setLoading(false);
    setLoadingMore(false);

    if (tabName === '1 대 1 채팅 내역') {
      setActiveTab('chat');
      // useEffect가 activeTab 변경에 따라 loadChatHistory(1, true) 호출
    } else if (tabName === '하트 히스토리') {
      setActiveTab('heart');
      // useEffect가 activeTab 변경에 따라 loadFullHeartHistory 호출
    }
  };

  // 무한 스크롤 핸들러
  const handleEndReached = () => {
    if (activeTab === 'chat') {
      if (!loadingMore && hasMoreChat) {
        console.log("Requesting next chat page:", currentChatPage + 1);
        loadChatHistory(currentChatPage + 1);
      }
    } else { // heart 탭
      if (!loadingMore && hasMoreHearts) {
        console.log("Requesting more hearts");
        loadMoreHearts();
      }
    }
  };

  const handleChatItemPress = (chatRoomId: number | string) => {
    router.push({ pathname: '/(tabs)/chat', params: { chatRoomId: chatRoomId.toString() } });
  };

  let currentData: HistoryItemProps[] = [];
  let listTitle = "";

  if (activeTab === 'chat') {
    listTitle = "내 채팅";
    currentData = chatHistory.map(item => ({
      id: item.chatRoomId,
      type: 'chat',
      svgComponentName: item.opponentProfileSvg || 'HanaSvg',
      name: item.opponentName || '알 수 없는 상대',
      content: item.lastChat,
      createdAt: item.createdAt,
      onPress: handleChatItemPress,
      roomType: item.roomType,
    }));
  } else { // heart 탭
    listTitle = "내가 받은 하트";
    currentData = displayedHeartHistory.map(item => ({
      id: item.roomEventId,
      type: 'heart',
      svgComponentName: item.senderProfileSvg || 'HanaSvg',
      name: item.senderName || '알 수 없는 사용자',
      content: item.message,
      createdAt: item.createdAt,
    }));
  }

  const ListHeader = () => (
    <Text style={styles.listTitleStyle}>{listTitle}</Text>
  );

  const ListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#B28EF8" />
      </View>
    );
  };
 
  return (
    <View style={styles.container}>
      <View style={styles.topFixedContent}>
        <EventBannerComponent />
        <Tab
          tabs={['1 대 1 채팅 내역', '하트 히스토리']}
          activeTab={activeTab === 'chat' ? '1 대 1 채팅 내역' : '하트 히스토리'}
          onTabChange={handleTabChange}
        />
      </View>

      {loading && currentData.length === 0 ? ( // 초기 로딩 중이면서 데이터가 없을 때만 전체 로더 표시
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#B28EF8" />
        </View>
      ) : currentData.length === 0 && !loading ? ( // 로딩이 끝났는데 데이터가 없을 경우
        <View style={styles.emptyContainer}>
          <ListHeader />
          <Text style={styles.emptyText}>{activeTab === 'chat' ? '채팅 내역이 없습니다.' : '하트 내역이 없습니다.'}</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={ListHeader}
          data={currentData}
          renderItem={({ item }) => <HistoryItem {...item} />}
          keyExtractor={(item) => `${item.type}-${item.id.toString()}`} // 키를 더 고유하게
          style={styles.listStyle}
          contentContainerStyle={styles.listContentContainer}
          scrollEnabled={true} // 스크롤 활성화
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5} // 리스트 끝에서 얼마나 떨어졌을 때 onEndReached를 호출할지 (0.5는 절반)
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
};

const { height, width } = Dimensions.get("window");
const BANNER_HEIGHT_APPROX = height * 0.2;
// Tab 컴포넌트의 실제 높이를 고려해야 합니다. Tab.tsx의 padding, margin, fontSize 등을 기반으로 계산합니다.
// 예를 들어, Tab 내부 패딩 10+10, 텍스트, 상하 마진 20+20 이라면 대략 45(버튼) + 20(상하패딩) + 20(상하마진) = 85
// 정확한 값은 Tab.tsx의 스타일을 확인해야 합니다.
const TAB_COMPONENT_HEIGHT_APPROX = 80; // Tab 컴포넌트의 대략적인 높이 (스타일링에 따라 조절)
const HEADER_CONTENT_HEIGHT = BANNER_HEIGHT_APPROX + TAB_COMPONENT_HEIGHT_APPROX;
// const PAGINATION_COMPONENT_HEIGHT = 60; // Pagination 제거

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topFixedContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#ffffff', // 배경색 추가하여 FlatList 내용이 비치지 않도록
  },
  listTitleStyle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold', // Pretendard 폰트가 프로젝트에 포함되어 있어야 합니다.
    color: '#000000',
    marginLeft: 20, // 왼쪽 여백
    //marginTop: 10, // 탭 아래 여백
    marginBottom: 10, // 리스트 아이템 위 여백
  },
  listStyle: {
    // flexGrow: 0, // FlatList가 전체를 채우도록 flexGrow: 1 또는 제거
    marginTop: HEADER_CONTENT_HEIGHT, 
  },
  listContentContainer: {
    // TAB_BAR_HEIGHT_APPROX + 약간의 여유공간 (페이지네이션 공간 제거)
    paddingBottom: TAB_BAR_HEIGHT_APPROX + 20, 
  },
  loaderContainer: { // 초기 전체 로딩
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT, // 헤더 높이만큼 내려서 중앙에
  },
  loadingMoreContainer: { // 더 불러오기 로딩 (푸터)
    paddingVertical: 20,
  },
  emptyContainer: {
    // flex: 1, // ListHeader를 포함하므로 flex:1 제거 또는 조정
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT + 20, // 헤더 아래, 약간의 여백 추가
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
    marginTop: 20, // 제목 아래 여백
  },
  bottomSheetWrapper: { // 이 스타일은 현재 사용되지 않는 것 같아 주석 처리 또는 확인 후 제거 가능
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
    // zIndex: 100,
    // elevation: 10,
  },
  overlay: { // 이 스타일도 현재 사용되지 않는 것 같아 주석 처리 또는 확인 후 제거 가능
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // zIndex: 100,
    // elevation: 10,
    // justifyContent: 'flex-end', 
  },
});


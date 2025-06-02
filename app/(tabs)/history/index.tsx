import { ChatRoomItem, HeartHistoryItem, PageInfo, getChatHistory, getMyHeartHistory } from "@/api/historyApi";
import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent";
import Tab from "@/components/common/Tab";
import EmptyHistoryPlaceholder from "@/components/history/EmptyHistoryPlaceholder";
import HistoryItem, { HistoryItemProps } from "@/components/history/HistoryItem";
import useHomeStore from "@/zustand/stores/HomeStore";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Platform, StyleSheet, Text, View } from "react-native";

const DUMMY_MEMBER_ID = 1;
const TAB_BAR_HEIGHT_APPROX = Platform.OS === 'ios' ? 80 : 60; // 일반적인 탭바 높이 근사치

// 화면 높이에 따라 ITEMS_PER_PAGE 결정하는 함수
const getItemsPerPage = () => {
  const windowHeight = Dimensions.get('window').height;
  return windowHeight >= 800 ? 10 : 8; // 페이지당 아이템 수 조정
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

  // 하트 내역 상태 (서버 사이드 페이징으로 변경)
  const [heartHistory, setHeartHistory] = useState<HeartHistoryItem[]>([]);
  const [heartPageInfo, setHeartPageInfo] = useState<PageInfo | null>(null);
  const [currentHeartPage, setCurrentHeartPage] = useState(1); // API는 1-based page
  const [hasMoreHearts, setHasMoreHearts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const noticesFromStore = useHomeStore((state) => state.notices);

  const eventBannersForDisplay: EventBannerData[] = useMemo(() => {
    if (!noticesFromStore) return [];

    return noticesFromStore
      .filter(notice =>
        notice.noticeStatus === "ONGOING" &&
        notice.noticeType === "EVENT" &&
        notice.noticeImages.some(img => img.thumbnail === true)
      )
      .map(notice => {
        const thumbnailImage = notice.noticeImages.find(img => img.thumbnail === true);
        return {
          id: notice.noticeId,
          imageUrl: thumbnailImage!.imageUrl,
          title: notice.title,
          content: notice.content || '',
        };
      });
  }, [noticesFromStore]);
  // 채팅 내역 불러오기 (페이지 기반)
  const loadChatHistory = useCallback(async (page: number, isInitialLoad = false) => {
    if (loadingMore && !isInitialLoad) return;
    if(isInitialLoad) setLoading(true); else setLoadingMore(true);
    try {
      const response = await getChatHistory(page, itemsPerPage);
      setChatHistory(prev => isInitialLoad ? response.data : [...prev, ...response.data]);
      setChatPageInfo(response.pageInfo);
      setCurrentChatPage(response.pageInfo.page); 
      setHasMoreChat(response.pageInfo.page < response.pageInfo.totalPages);
    } catch (error) {
      console.error("채팅 내역 로딩 실패:", error);
      setHasMoreChat(false); 
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [itemsPerPage, loadingMore]);

  // 하트 내역 불러오기 (서버 사이드 페이징)
  const loadHeartHistory = useCallback(async (page: number, isInitialLoad = false) => {
    if (loadingMore && !isInitialLoad) return;
    if(isInitialLoad) setLoading(true); else setLoadingMore(true);
    try {
      const response = await getMyHeartHistory(page, itemsPerPage);
      setHeartHistory(prev => isInitialLoad ? response.data : [...prev, ...response.data]);
      // HeartHistoryListResponse의 pageInfo는 이제 non-optional이므로 직접 사용
      setHeartPageInfo(response.pageInfo);
      setCurrentHeartPage(response.pageInfo.page); 
      setHasMoreHearts(response.pageInfo.page < response.pageInfo.totalPages);
    } catch (error) {
      console.error("하트 히스토리 로딩 실패:", error);
      setHasMoreHearts(false);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [itemsPerPage, loadingMore]);
  
  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatHistory(1, true); // 1-based 페이지로 호출
    } else {
      loadHeartHistory(1, true); // 1-based 페이지로 호출
    }
  }, [activeTab, loadChatHistory, loadHeartHistory]);

  const handleTabChange = (tabName: string) => {
    setChatHistory([]); setChatPageInfo(null); setCurrentChatPage(1); setHasMoreChat(true);
    setHeartHistory([]); setHeartPageInfo(null); setCurrentHeartPage(1); setHasMoreHearts(true);
    setLoading(true); setLoadingMore(false);

    if (tabName === '1 대 1 채팅 내역') setActiveTab('chat');
    else if (tabName === '하트 히스토리') setActiveTab('heart');
  };

  const handleEndReached = () => {
    if (activeTab === 'chat') {
      if (!loadingMore && hasMoreChat && chatPageInfo && currentChatPage < chatPageInfo.totalPages) {
        loadChatHistory(currentChatPage + 1);
      }
    } else { 
      if (!loadingMore && hasMoreHearts && heartPageInfo && currentHeartPage < heartPageInfo.totalPages) {
        loadHeartHistory(currentHeartPage + 1);
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
      id: item.chatRoomId, type: 'chat', svgComponentName: item.opponentProfileSvg || 'HanaSvg',
      name: item.opponentName || '알 수 없는 상대', content: item.lastChat, createdAt: item.createdAt,
      onPress: handleChatItemPress, roomType: item.roomType,
    }));
  } else { 
    listTitle = "내가 받은 하트";
    currentData = heartHistory.map(item => ({
      id: item.roomEventId, type: 'heart', svgComponentName: item.senderProfileSvg || 'HanaSvg',
      name: item.senderName || '알 수 없는 사용자', content: item.message, createdAt: item.createdAt,
    }));
  }

  const renderListHeader = () => currentData.length > 0 ? <Text style={styles.listTitleStyle}>{listTitle}</Text> : null;
  const renderListFooter = () => !loadingMore ? null : <View style={styles.loadingMoreContainer}><ActivityIndicator size="small" color="#B28EF8" /></View>;
  const renderEmptyList = () => loading ? null : <EmptyHistoryPlaceholder type={activeTab} />;
 
  return (
    <View style={styles.container}>
      <View style={styles.topFixedContent}>
        {eventBannersForDisplay.length > 0 && (
          <EventBannerComponent banners={eventBannersForDisplay} />
        )}
        <Tab
          tabs={['1 대 1 채팅 내역', '하트 히스토리']}
          activeTab={activeTab === 'chat' ? '1 대 1 채팅 내역' : '하트 히스토리'}
          onTabChange={handleTabChange}
        />
      </View>
      <FlatList
        ListHeaderComponent={renderListHeader}
        data={currentData}
        renderItem={({ item }) => <HistoryItem {...item} />}
        keyExtractor={(item) => `${item.type}-${item.id.toString()}`}
        style={styles.listStyle}
        contentContainerStyle={styles.listContentContainer}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyList}
      />
      {loading && currentData.length === 0 && (
        <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#B28EF8" /></View>
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
    flexGrow: 1, // 추가: 내용이 적을 때도 ListEmptyComponent가 중앙에 오도록
  },
  loaderContainer: { 
    position: 'absolute', // 추가: 다른 내용 위에 오도록
    top: HEADER_CONTENT_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)', // 약간의 투명 배경
    zIndex: 2, // topFixedContent 위에 오도록
  },
  loadingMoreContainer: { // 더 불러오기 로딩 (푸터)
    paddingVertical: 20,
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

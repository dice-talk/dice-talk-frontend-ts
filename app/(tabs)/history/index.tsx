import { ChatRoomItem, HeartHistoryItem, PageInfo, defaultProfilePng, getChatHistory, getHeartHistory } from "@/api/historyApi";
import EventBannerComponent from "@/components/common/EventBannerComponent";
import Pagination from "@/components/common/Pagination";
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
  // 예시: 화면 높이가 800px 이상이면 4개, 미만이면 3개 (실제 테스트하며 조절 필요)
  return windowHeight >= 800 ? 4 : 3;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'heart'>('chat');
  
  // 화면 크기 변경에 따른 ITEMS_PER_PAGE 동적 계산 (useMemo로 최적화)
  const itemsPerPage = useMemo(() => getItemsPerPage(), []);

  const [chatHistory, setChatHistory] = useState<ChatRoomItem[]>([]);
  const [chatPageInfo, setChatPageInfo] = useState<PageInfo | null>(null);
  const [currentChatPage, setCurrentChatPage] = useState(1);

  const [heartHistory, setHeartHistory] = useState<HeartHistoryItem[]>([]);
  const [currentHeartPage, setCurrentHeartPage] = useState(1);
  const [totalHeartPages, setTotalHeartPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const loadChatHistory = useCallback(async (page: number) => {
    setLoading(true);
    try {
      // 동적으로 계산된 itemsPerPage 사용
      const dummyResponse = await getChatHistory(DUMMY_MEMBER_ID, page, itemsPerPage);
      setChatHistory(dummyResponse.data);
      setChatPageInfo(dummyResponse.pageInfo);
      setCurrentChatPage(dummyResponse.pageInfo.page);
    } catch (error) {
      console.error("채팅 내역 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const loadHeartHistory = useCallback(async () => {
    setLoading(true);
    try {
      const dummyResponse = await getHeartHistory(DUMMY_MEMBER_ID);
      setHeartHistory(dummyResponse.data);
      // 동적으로 계산된 itemsPerPage 사용
      setTotalHeartPages(Math.ceil(dummyResponse.data.length / itemsPerPage)); 
      setCurrentHeartPage(1);
    } catch (error) {
      console.error("하트 히스토리 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatHistory(currentChatPage);
    } else {
      loadHeartHistory();
    }
    // itemsPerPage가 변경될 때도 데이터를 새로고침 하려면 의존성 배열에 추가
    // 하지만 일반적으로 앱 실행 중 화면 크기가 동적으로 계속 변하는 경우는 드물므로
    // 초기 마운트 시 계산된 값으로 충분할 수 있습니다. 필요에 따라 조정하세요.
  }, [activeTab, currentChatPage, loadChatHistory, loadHeartHistory, itemsPerPage]);

  const handleTabChange = (tabName: string) => {
    if (tabName === '1 대 1 채팅 내역') {
      setActiveTab('chat');
      setCurrentChatPage(1);
    } else if (tabName === '하트 히스토리') {
      setActiveTab('heart');
      setCurrentHeartPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'chat') {
      loadChatHistory(page);
    } else {
      setCurrentHeartPage(page);
    }
  };

  const handleChatItemPress = (chatRoomId: number | string) => {
    router.push({ pathname: '/(tabs)/chat', params: { chatRoomId: chatRoomId.toString() } });
  };

  let currentData: HistoryItemProps[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let listTitle = "";

  if (activeTab === 'chat') {
    listTitle = "내 채팅";
    currentData = chatHistory.map(item => ({
      id: item.chatRoomId,
      type: 'chat',
      profileImage: item.opponentProfileSvg || defaultProfilePng,
      name: item.opponentName || '알 수 없는 상대',
      content: item.lastChat,
      createdAt: item.createdAt,
      onPress: handleChatItemPress,
    }));
    currentPage = currentChatPage;
    totalPages = chatPageInfo?.totalPages || 1;
  } else {
    listTitle = "내가 받은 하트";
    // 동적으로 계산된 itemsPerPage 사용
    const startIndex = (currentHeartPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHearts = heartHistory.slice(startIndex, endIndex);

    currentData = paginatedHearts.map(item => ({
      id: item.roomEventId,
      type: 'heart',
      profileImage: item.senderProfileSvg || defaultProfilePng,
      name: item.senderName || '알 수 없는 사용자',
      content: item.message,
      createdAt: item.createdAt,
    }));
    currentPage = currentHeartPage;
    totalPages = totalHeartPages;
  }

  const ListHeader = () => (
    <Text style={styles.listTitleStyle}>{listTitle}</Text>
  );
 
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

      {loading ? (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#B28EF8" />
        </View>
      ) : currentData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ListHeader />
          <Text style={styles.emptyText}>{activeTab === 'chat' ? '채팅 내역이 없습니다.' : '하트 내역이 없습니다.'}</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={ListHeader}
          data={currentData}
          renderItem={({ item }) => <HistoryItem {...item} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.listStyle}
          contentContainerStyle={styles.listContentContainer}
          scrollEnabled={false} 
        />
      )}

      {!loading && currentData.length > 0 && totalPages > 1 && (
        <View style={styles.paginationContainer}>
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </View>
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
const PAGINATION_COMPONENT_HEIGHT = 60; // 페이지네이션 컴포넌트의 대략적인 높이

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
    backgroundColor: '#ffffff',
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
    flexGrow: 0, // 전체 공간을 차지하지 않고 내용만큼만 차지
    marginTop: HEADER_CONTENT_HEIGHT, 
  },
  listContentContainer: {
    // 페이지네이션과 탭바를 위한 공간 확보. 
    // TAB_BAR_HEIGHT_APPROX + PAGINATION_COMPONENT_HEIGHT + 약간의 여유공간
    paddingBottom: TAB_BAR_HEIGHT_APPROX + PAGINATION_COMPONENT_HEIGHT + 20, 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT,
  },
  emptyContainer: {
    // flex: 1, // ListHeader를 포함하므로 flex:1 제거 또는 조정
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT, // topFixedContent 아래에 위치
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
    marginTop: 20, // 제목 아래 여백
  },
  paginationContainer: {
    position: 'absolute',
    //bottom: TAB_BAR_HEIGHT_APPROX + 10, // 탭바 바로 위에 위치 (10은 여유 공간)
    bottom: height * 0.13,
    left: 0, // 좌우 여백 추가
    right: 0, // 좌우 여백 추가
    height: PAGINATION_COMPONENT_HEIGHT, // 페이지네이션 높이 지정
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'transparent', // 이전 red 제거
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,     // 다른 요소보다 위에 배치
    elevation: 10,   // Android용 (zIndex 보완)
  },
  overlay: {
    position: 'absolute',
    top: 0,  // 전체 화면 덮기
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 10,
    justifyContent: 'flex-end', // 바텀시트를 아래로 정렬
  },
});


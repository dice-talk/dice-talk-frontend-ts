import { NoticeItemDto } from "@/api/noticeApi"; // getNotices, NoticeListResponse 주석 처리
import GradientHeader from "@/components/common/GradientHeader";
import EmptyNoticeList from "@/components/plus/notice/EmptyNoticeList";
import NoticeListItem from "@/components/plus/notice/NoticeListItem";
import NoticeSearchBar, { NoticeTypeFilter } from "@/components/plus/notice/NoticeSearchBar";
import { useFocusEffect, useRouter } from "expo-router"; // useRouter 추가
import { useCallback, useState } from "react"; // useEffect 추가
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native"; // TouchableOpacity 주석처리 (더보기 버튼 임시 제거)

const { width, height } = Dimensions.get('window');
// const ITEMS_PER_PAGE = 10; // 더미데이터 사용 시 불필요

// NoticeListItem과 동일한 값 사용
const HEADER_TAG_WIDTH_AREA = 60 + 10; // tagWrapper width
const HEADER_DATE_WIDTH_AREA = 80;   // dateWrapper width

// 더미 데이터 생성
const createDummyNotice = (id: number, type: "NOTICE" | "EVENT", importance: 0 | 1, daysAgo: number): NoticeItemDto => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    noticeId: id,
    title: `${type === "NOTICE" ? "[공지]" : "[이벤트]"} 제목 ${id}${importance === 1 ? " (중요!!)" : ""} - ${daysAgo}일 전`, 
    noticeStatus: "ONGOING",
    noticeType: type,
    createdAt: date.toISOString(),
    importance: importance,
    content: `이것은 ${id}번 ${type === "NOTICE" ? "공지" : "이벤트"}의 내용입니다. 중요도: ${importance}.`, 
    noticeImages: [],
    thumbnail: 'https://via.placeholder.com/100' // 임시 썸네일
  };
};

const dummyNoticesData: NoticeItemDto[] = [
  createDummyNotice(1, "EVENT", 1, 1),
  createDummyNotice(2, "NOTICE", 1, 2),
  createDummyNotice(3, "NOTICE", 0, 3),
  createDummyNotice(4, "EVENT", 0, 5),
  createDummyNotice(5, "NOTICE", 0, 7),
  createDummyNotice(6, "EVENT", 1, 0),
  createDummyNotice(7, "NOTICE", 0, 10),
  createDummyNotice(8, "EVENT", 0, 12),
  createDummyNotice(9, "NOTICE", 0, 15),
  createDummyNotice(10, "NOTICE", 1, 4),
  createDummyNotice(11, "EVENT", 0, 8),
  createDummyNotice(12, "NOTICE", 0, 1), 
];

export default function NoticePage() {
  const router = useRouter(); // 상세 페이지 이동용

  // const [notices, setNotices] = useState<NoticeItemDto[]>([]); // combinedNotices로 대체
  const [importantNotices, setImportantNotices] = useState<NoticeItemDto[]>([]);
  const [regularNotices, setRegularNotices] = useState<NoticeItemDto[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(false); // API 호출 안 하므로 false로 시작
  // const [loading, setLoading] = useState(false);
  // const [loadingMore, setLoadingMore] = useState(false);

  // const [currentPage, setCurrentPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // 검색 결과 메시지용

  const [currentFilter, setCurrentFilter] = useState<NoticeTypeFilter>('ALL');
  const [currentKeyword, setCurrentKeyword] = useState('');

  // API 호출 함수 주석 처리
  /*
  const fetchNotices = async (page: number, filter: NoticeTypeFilter, keyword: string, isLoadingMore = false) => {
    // ... 기존 API 호출 로직 ...
  };
  */

  const applyFiltersAndSort = (filter: NoticeTypeFilter, keyword: string) => {
    setInitialLoading(true); // 필터링 시작 시 로딩 표시 (UI 피드백)
    let filteredData = dummyNoticesData;

    if (filter !== 'ALL') {
      filteredData = filteredData.filter(item => item.noticeType === filter);
    }
    if (keyword.trim().length > 0) {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(keyword.trim().toLowerCase())
      );
    }

    const important = filteredData.filter(n => n.importance === 1).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 중요공지 최신순
    const regular = filteredData.filter(n => n.importance !== 1).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 일반공지 최신순
    
    setImportantNotices(important);
    setRegularNotices(regular);
    setTotalElements(filteredData.length);
    // setCurrentPage(0); // 더미 데이터에서는 페이지네이션 미사용
    // setTotalPages(1); // 더미 데이터에서는 페이지네이션 미사용
    setInitialLoading(false); // 필터링 완료
  };

  const handleSearch = (filter: NoticeTypeFilter, keyword: string) => {
    setCurrentFilter(filter);
    setCurrentKeyword(keyword);
    applyFiltersAndSort(filter, keyword);
  };

  // 더미 데이터 로드 (useFocusEffect 또는 useEffect 사용)
  useFocusEffect(
    useCallback(() => {
      applyFiltersAndSort('ALL', ''); // 초기 전체 목록 로드
      return () => {};
    }, [])
  );

  // 상세 페이지 이동 핸들러 (NoticeListItem에서 직접 호출 대신 여기서 props로 전달)
  const handleNavigateToDetail = (noticeId: number) => {
    router.push(`/(tabs)/plus/NoticeDetailPage?noticeId=${noticeId}`);
  };
  
  const combinedNotices = [...importantNotices, ...regularNotices];

  const renderListHeader = () => (
    <View style={styles.listHeaderOuterContainer}>
        <View style={styles.listHeaderInnerContainer}>
            <View style={{ width: HEADER_TAG_WIDTH_AREA }} />
            <View style={styles.listHeaderTitleWrapper}>
                <Text style={styles.listHeaderText}>제목</Text>
            </View>
            <View style={{ width: HEADER_DATE_WIDTH_AREA, alignItems: 'center' }}>
                <Text style={styles.listHeaderText}>작성일</Text>
            </View>
        </View>
    </View>
  );

  // 더보기 버튼 임시 제거 (더미데이터는 전체 목록 한번에 표시)
  // const renderFooter = () => { ... };

  return (
    <View style={styles.container}>
      <GradientHeader title="공지사항 / 이벤트" showBackButton={true} />
      <NoticeSearchBar onSearch={handleSearch} initialFilter="ALL" initialKeyword="" />
      
      {initialLoading ? (
        <View style={styles.fullScreenLoader}><ActivityIndicator size="large" color="#B28EF8" /></View>
      ) : (
        <FlatList
          data={combinedNotices}
          keyExtractor={(item) => item.noticeId.toString()}
          renderItem={({ item }) => <NoticeListItem item={item} onPressItem={handleNavigateToDetail} />} // onPressItem prop 추가
          ListHeaderComponent={combinedNotices.length > 0 ? renderListHeader : null}
          ListEmptyComponent={
            !initialLoading ? (
                <EmptyNoticeList 
                    message={totalElements === 0 && (currentFilter !== 'ALL' || !!currentKeyword) 
                        ? "검색 결과가 없습니다.\n다른 조건으로 검색해보세요." 
                        : "등록된 공지사항/이벤트가 없습니다."} 
                />
            ) : null
          }
          // onEndReached={handleLoadMore} // 더미데이터에는 불필요
          // onEndReachedThreshold={0.5}
          // ListFooterComponent={renderFooter} // 더미데이터에는 불필요
          contentContainerStyle={[
            combinedNotices.length === 0 && !initialLoading ? styles.emptyListContainer : {},
            { paddingBottom: height * 0.1 } // Footer 높이만큼 패딩 추가
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeaderOuterContainer: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingHorizontal: width * 0.05,
    paddingVertical: 12,
  },
  listHeaderInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderTitleWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#495057',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1, // 비어있을 때도 Footer 고려
  }
});
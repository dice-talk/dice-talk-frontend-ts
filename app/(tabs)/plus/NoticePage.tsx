import { getNotices, NoticeItemDto } from "@/api/noticeApi"; // getNotices, NoticeListResponse 추가
import GradientHeader from "@/components/common/GradientHeader";
import EmptyNoticeList from "@/components/plus/notice/EmptyNoticeList";
import NoticeListItem from "@/components/plus/notice/NoticeListItem";
import NoticeSearchBar, { NoticeTypeFilter } from "@/components/plus/notice/NoticeSearchBar";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react"; // useEffect 추가
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native"; // TouchableOpacity 추가

const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10; // 페이지 당 아이템 수 (API 기본값과 맞추거나 원하는 값으로)

// NoticeListItem과 동일한 값 사용
const HEADER_TAG_WIDTH_AREA = 60 + 10; // tagWrapper width
const HEADER_DATE_WIDTH_AREA = 80;   // dateWrapper width

// 더미 데이터 삭제

export default function NoticePage() {
  const router = useRouter(); // 상세 페이지 이동용

  const [importantNotices, setImportantNotices] = useState<NoticeItemDto[]>([]);
  const [regularNotices, setRegularNotices] = useState<NoticeItemDto[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(true); // 초기 로딩 상태
  const [loadingMore, setLoadingMore] = useState(false); // 더 보기 로딩 상태

  const [currentPage, setCurrentPage] = useState(0); // 0-indexed page for frontend state
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // 검색 결과 메시지용

  const [currentFilter, setCurrentFilter] = useState<NoticeTypeFilter>('ALL');
  const [currentKeyword, setCurrentKeyword] = useState('');

  const fetchNotices = useCallback(async (pageToFetch: number, filter: NoticeTypeFilter, keyword: string, isLoadMore = false) => {
    if (!isLoadMore) {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const apiParams: Parameters<typeof getNotices>[0] = {
        page: pageToFetch + 1, // API는 1-indexed page를 기대
        size: ITEMS_PER_PAGE,
        type: filter, // 'noticeType'을 'type'으로 변경
        keyword: keyword.trim() || undefined,
        // sortBy, sortOrder는 api/noticeApi.ts에서 처리 (현재는 API 명세에 없어 주석처리됨)
        type: filter, // NoticeTypeFilter ('ALL', 'NOTICE', 'EVENT') 값을 그대로 전달
                      // getNotices 함수 내부에서 type이 'ALL'인 경우 실제 쿼리 파라미터에서 제외함.
        keyword: keyword.trim() || undefined, // 빈 문자열이면 undefined로 전달하여 파라미터에서 제외되도록 유도
      };
      
      console.log(`🔄 Fetching notices with apiParams:`, apiParams);
      const response = await getNotices(apiParams);
      console.log("✅ Notices fetched successfully:", response);

      // 중요 공지는 noticeImportance 값으로 필터링 (백엔드 API 응답 필드명 기준)
      // API 명세에 noticeImportance가 0, 1, 2 등으로 온다고 가정하고 1을 중요로 처리
      // 만약 importance 필드가 온다면 n.importance === 1 로 변경
      const newImportant = response.noticeList.filter(n => n.noticeImportance === 1); 
      const newRegular = response.noticeList.filter(n => n.noticeImportance !== 1);

      if (isLoadMore) {
        setImportantNotices(prev => {
            const combined = [...prev, ...newImportant];
            return combined.filter((notice, index, self) => 
                index === self.findIndex((n) => n.noticeId === notice.noticeId)
            ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 백엔드가 정렬해줘도 중복제거 후 재정렬 필요할 수 있음
        });
        setRegularNotices(prev => [...prev, ...newRegular].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setImportantNotices(newImportant.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setRegularNotices(newRegular.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage); // API에서 0-indexed로 변환된 currentPage를 받음
      setTotalElements(response.totalElements);

    } catch (error) {
      // api/noticeApi.ts에서 이미 상세 로깅 처리
      console.error("Error fetching notices (NoticePage.tsx):", error);
      // 사용자에게 보여줄 에러 메시지 처리 (예: Toast)
    } finally {
      if (!isLoadMore) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  const handleSearch = (filter: NoticeTypeFilter, keyword: string) => {
    setCurrentFilter(filter);
    setCurrentKeyword(keyword);
    setCurrentPage(0); // 검색 시 첫 페이지(0-indexed)부터
    setImportantNotices([]); 
    setRegularNotices([]);   
    fetchNotices(0, filter, keyword); // page 0 (API 호출 시 1로 변환됨)
  };

  const handleLoadMore = () => {
    // currentPage는 0-indexed, totalPages는 총 페이지 수
    // 다음 페이지가 존재하면 (currentPage < totalPages - 1)
    if (!loadingMore && currentPage < totalPages - 1) { 
      fetchNotices(currentPage + 1, currentFilter, currentKeyword, true);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0); 
      setImportantNotices([]); 
      setRegularNotices([]);   
      setCurrentFilter('ALL'); // 필터 초기화
      setCurrentKeyword('');   // 키워드 초기화
      fetchNotices(0, 'ALL', ''); // 초기 전체 목록 로드 (page 0)
      return () => {
        // 화면 벗어날 때 정리할 내용 (예: 타이머 제거 등)
      }; 
    }, []) // fetchNotices를 의존성 배열에서 제거 (내부 상태만 사용하므로)
  );

  const handleNavigateToDetail = (noticeId: number) => {
    router.push(`/(tabs)/plus/NoticeDetailPage?noticeId=${noticeId}`);
  };
  
  // GradientHeader의 뒤로가기 버튼 클릭 시 "plus" 탭의 index로 이동하는 함수
  const handleHeaderBackPress = () => {
    router.push('/(tabs)/plus'); // "plus" 탭의 초기 화면(index)으로 이동
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#B28EF8" />
      </View>
    );
  };

  // 로딩 중이거나 데이터가 없을 때의 화면 처리 강화
  if (initialLoading && combinedNotices.length === 0) { 
    return (
      <View style={styles.container}>
        <GradientHeader title="공지사항 / 이벤트" showBackButton={true} onBackPress={handleHeaderBackPress} />
        <NoticeSearchBar onSearch={handleSearch} initialFilter="ALL" initialKeyword="" />
        <View style={styles.fullScreenLoader}><ActivityIndicator size="large" color="#B28EF8" /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="공지사항 / 이벤트" showBackButton={true} onBackPress={handleHeaderBackPress} />
      <NoticeSearchBar onSearch={handleSearch} initialFilter={currentFilter} initialKeyword={currentKeyword} />
      
      <FlatList
        data={combinedNotices}
        keyExtractor={(item) => item.noticeId.toString()}
        renderItem={({ item }) => <NoticeListItem item={item} onPressItem={handleNavigateToDetail} />}
        ListHeaderComponent={combinedNotices.length > 0 ? renderListHeader : null}
        ListEmptyComponent={
          !initialLoading && !loadingMore ? ( 
              <EmptyNoticeList 
                  message={totalElements === 0 && (currentFilter !== 'ALL' || !!currentKeyword) 
                      ? "검색 결과가 없습니다.\n다른 조건으로 검색해보세요." 
                      : "등록된 공지사항/이벤트가 없습니다."}
              />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Threshold 늘려서 더 일찍 로딩 시작 고려
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          combinedNotices.length === 0 && !initialLoading && !loadingMore ? styles.emptyListContainer : {},
          { paddingBottom: height * 0.1 } 
        ]}
      />
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
    flexGrow: 1, // 빈 목록일 때 화면 채우도록
    justifyContent: 'center',
    alignItems: 'center',
    // paddingBottom 제거 또는 조정 (이미 FlatList contentContainerStyle에 있음)
  },
  footerLoader: { 
    paddingVertical: 20,
  }
});
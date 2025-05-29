import { NoticeItemDto } from "@/api/noticeApi";
import GradientHeader from "@/components/common/GradientHeader";
import { LinearGradient } from 'expo-linear-gradient'; // 태그 그라데이션에 사용
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get('window');

// 임시 더미 데이터 생성 함수 (NoticePage.tsx의 것과 유사하게)
const createDummyNoticeDetail = (id: number): NoticeItemDto => {
  const noticeType = id % 3 === 0 ? "EVENT" : "NOTICE";
  const importance = id % 2 === 0 ? 1 : 0;
  const date = new Date();
  date.setDate(date.getDate() - (id % 5)); // 날짜 다양화
  return {
    noticeId: id,
    title: `${noticeType === "NOTICE" ? "[공지]" : "[이벤트]"} 상세 페이지 제목 ${id}${importance === 1 ? " (중요!!)" : ""}`,
    noticeStatus: "ONGOING",
    noticeType: noticeType,
    createdAt: date.toISOString(),
    importance: importance,
    content: `이것은 ${id}번 ${noticeType === "NOTICE" ? "공지" : "이벤트"}의 상세 내용입니다. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n이미지가 곧 여기에 표시될 예정입니다. (현재는 썸네일만 표시)`,
    noticeImages: [
      'https://via.placeholder.com/300x200.png?text=Image+1',
      'https://via.placeholder.com/300x200.png?text=Image+2',
      'https://via.placeholder.com/300x200.png?text=Image+3',
    ], // 임시 이미지 URL 배열
    thumbnail: 'https://via.placeholder.com/350x150.png?text=Thumbnail+Image' // 임시 썸네일
  };
};

// 날짜 포맷 함수 (NoticeListItem.tsx의 것과 동일)
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateString; 
  }
};

export default function NoticeDetailPage() {
    const { noticeId } = useLocalSearchParams<{ noticeId?: string }>();
    const [noticeDetail, setNoticeDetail] = useState<NoticeItemDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (noticeId) {
            setLoading(true);
            // API 호출 대신 더미 데이터 사용
            setTimeout(() => { // 실제 API 호출 시뮬레이션
                const id = parseInt(noticeId, 10);
                if (!isNaN(id)) {
                    setNoticeDetail(createDummyNoticeDetail(id));
                } else {
                    setNoticeDetail(null); // 잘못된 ID 처리
                }
                setLoading(false);
            }, 500);
        } else {
            setNoticeDetail(null);
            setLoading(false);
        }
    }, [noticeId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#B28EF8" />
            </View>
        );
    }

    if (!noticeDetail) {
        return (
            <View style={[styles.container, styles.centered]}>
                <GradientHeader title="오류" showBackButton={true} />
                <Text style={styles.errorText}>공지사항 정보를 불러올 수 없습니다.</Text>
            </View>
        );
    }

    const isImportant = noticeDetail.importance === 1;
    const tagText = noticeDetail.noticeType === 'NOTICE' ? '공지' : '이벤트';
    
    // 공통 스타일과 조건부 스타일을 미리 계산
    const tagStyle = [
        styles.tagBase,
        isImportant ? styles.tagImportantGradient : styles.tagNormalSolid,
    ];

    return (
        <View style={styles.container}>
            <GradientHeader title="공지사항 / 이벤트" showBackButton={true} />  
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* --- 헤더 영역 --- */}
                <View style={styles.headerSection}>
                    <View style={styles.titleRow}>
                        {isImportant ? (
                            <LinearGradient 
                                colors={['#B28EF8', '#F476E5'] as const} 
                                start={{x: 0, y: 0.5}} 
                                end={{x: 1, y: 0.5}} 
                                style={tagStyle} // 적용되는 스타일은 tagBase와 tagImportantGradient
                            >
                                <Text style={styles.tagText}>{tagText}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={tagStyle}> {/* 적용되는 스타일은 tagBase와 tagNormalSolid */} 
                                <Text style={styles.tagText}>{tagText}</Text>
                            </View>
                        )}
                        <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">
                            {noticeDetail.title}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>작성일: {formatDate(noticeDetail.createdAt)}</Text>
                </View>

                {/* --- 구분선 --- */}
                <View style={styles.divider} />

                {/* --- 본문 내용 --- */}
                <View style={styles.contentSection}>
                    <Text style={styles.contentText}>{noticeDetail.content}</Text>
                </View>

                {/* --- 이미지 썸네일 (임시) --- */}
                {noticeDetail.thumbnail && (
                    <View style={styles.thumbnailContainer}>
                         <Image source={{ uri: noticeDetail.thumbnail }} style={styles.thumbnailImage} resizeMode="cover"/>
                    </View>
                )}
                
                {/* TODO: noticeImages 배열을 사용하여 여러 이미지 표시 로직 추가 */}
                 {noticeDetail.noticeImages && noticeDetail.noticeImages.length > 0 && (
                    <View style={styles.imagesSection}>
                        <Text style={styles.sectionTitle}>첨부 이미지</Text>
                        {/* 이미지를 가로로 스크롤 가능하게 FlatList 사용 */}                        
                        <FlatList
                            data={noticeDetail.noticeImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `img_${index}`}
                            renderItem={({ item: imageUrl }) => (
                                <Image 
                                    source={{ uri: imageUrl }} 
                                    style={styles.attachedImageInScroll}
                                    resizeMode="cover" // contain 대신 cover로 변경하여 채우도록
                                />
                            )}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />} // 이미지 간 간격
                            contentContainerStyle={{ paddingRight: width * 0.05 }} // 마지막 이미지 오른쪽 여백
                        />
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#333333',
        marginTop: 20,
        fontFamily: 'Pretendard-Regular',
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: width * 0.05, // 좌우 패딩 (padding -> paddingHorizontal로 변경)
        paddingTop: width * 0.05, // 상단 패딩 추가
        paddingBottom: height * 0.15, // 하단 여백 (기존 width*0.1에서 height*0.15로 변경)
    },
    // Header Section
    headerSection: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // 태그와 제목이 길어질 경우 대비
        marginBottom: 8,
    },
    tagBase: { // 모든 태그 공통 기본 스타일
        minWidth: 60, // 최소 너비 설정 (텍스트 길이에 따라 유동적)
        height: 24,
        paddingHorizontal: 10, // 내부 텍스트 여유 공간
        borderRadius: 12, 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    tagImportantGradient: { // 그라데이션 태그에만 적용될 추가 스타일 (필요하다면)
        // 예: borderWidth: 0 (LinearGradient 기본 테두리 제거 등)
    },
    tagNormalSolid: { // 단색 태그 스타일
        backgroundColor: '#B28EF8',
        borderRadius: 4, // 요청사항 반영
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
    },
    titleText: {
        flex: 1, // 남은 공간 차지
        fontSize: 18,
        fontFamily: 'Pretendard-SemiBold',
        color: '#212529',
        lineHeight: 26, // 줄간격
    },
    dateText: {
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
        color: '#868E96',
        textAlign: 'right', // 작성일 우측 정렬
        marginTop: 4, // 제목과 약간의 간격 추가
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20, // 위아래 여백
    },
    // Content Section
    contentSection: {
        marginBottom: 25,
    },
    contentText: {
        fontSize: 15,
        fontFamily: 'Pretendard-Regular',
        color: '#495057',
        lineHeight: 24, // 줄간격 살짝 넓힘
    },
    // Thumbnail Section (임시)
    thumbnailContainer: {
        marginBottom: 20,
        alignItems: 'center', // 썸네일 중앙 정렬
    },
    thumbnailImage: {
        width: width * 0.9, // 화면 너비의 90%
        height: height * 0.25, // 화면 높이의 25% (비율 조정 가능)
        borderRadius: 8,
    },
    imagesSection: {
        marginTop: 10,
        marginBottom: 20, // 섹션 하단 마진 추가
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
        color: '#333333',
        marginBottom: 12, // 제목과 이미지 목록 사이 간격 증가
    },
    attachedImageInScroll: { // 가로 스크롤 내 이미지 스타일
        width: width * 0.7, // 너비를 줄여 여러개가 보이도록
        height: height * 0.22, // 높이도 비율에 맞게 조정
        borderRadius: 8,
        // marginBottom: 10, // FlatList의 ItemSeparatorComponent로 대체
    },
});
import { NoticeItemDto } from '@/api/noticeApi'; // API 타입 import
import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router'; // NoticePage에서 핸들러 받으므로 주석 처리
import React from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Alert 추가 (임시)

interface NoticeListItemProps {
  item: NoticeItemDto;
  onPressItem?: (noticeId: number) => void; // 상세 페이지 이동 핸들러 prop 추가
}

const { width, height } = Dimensions.get('window');
const TAG_WIDTH = 60; // 태그 너비 고정값

// 날짜 포맷 함수 (예: YYYY-MM-DD)
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateString; // 파싱 실패 시 원본 반환
  }
};

const NoticeListItem: React.FC<NoticeListItemProps> = ({ item, onPressItem }) => {
  // const router = useRouter(); // 주석 처리

  const handlePress = () => {
    if (onPressItem) {
      onPressItem(item.noticeId);
    } else {
      // 폴백 또는 에러 처리 (예: Alert)
      Alert.alert("오류", "상세 페이지 이동 핸들러가 지정되지 않았습니다.");
      console.log(`Fallback: Navigate to NoticeDetailPage, ID: ${item.noticeId}`);
    }
  };

  const isImportant = item.importance === 1;
  const tagText = item.noticeType === 'NOTICE' ? '공지' : '이벤트';

  const TagComponent = isImportant ? LinearGradient : View;
  const tagContainerStyle = [
    styles.tagContainerBase, // 공통 스타일 분리
    isImportant ? styles.tagImportant : styles.tagNormal, // 중요도에 따른 스타일
  ];
  const tagGradientProps = isImportant 
    ? { colors: ['#B28EF8', '#F476E5'] as const, start: {x: 0, y: 0.5}, end: {x: 1, y: 0.5} }
    : {}; // 단색일 경우 View의 backgroundColor는 tagNormal에서 처리

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      {/* 1. 태그 (목록 위치) */}
      <View style={styles.tagWrapper}>
        {/* @ts-ignore */}
        <TagComponent {...tagGradientProps} style={tagContainerStyle}>
          <Text style={styles.tagText}>{tagText}</Text>
        </TagComponent>
      </View>

      {/* 2. 제목 */}
      <View style={styles.titleWrapper}>
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
      </View>

      {/* 3. 작성일 */}
      <View style={styles.dateWrapper}>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center', // 수직 중앙 정렬
    paddingVertical: 18,
    paddingHorizontal: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  // 각 섹션의 너비를 비율 또는 고정값으로 할당하여 정렬
  tagWrapper: {
    width: TAG_WIDTH + 10, // 태그 너비 + 약간의 여유 공간 (태그 자체 패딩 고려)
    alignItems: 'center', // 내부 태그를 중앙 정렬
    // backgroundColor: 'lightblue', // 레이아웃 확인용
  },
  titleWrapper: {
    flex: 1, // 남은 공간 모두 차지
    marginHorizontal: 8, // 좌우 컴포넌트와의 간격
    // backgroundColor: 'lightgreen', // 레이아웃 확인용
  },
  dateWrapper: {
    width: 80, // 작성일 영역 너비 고정 (날짜 형식에 따라 조절)
    alignItems: 'center', // 내부 텍스트 중앙 정렬
    // backgroundColor: 'lightpink', // 레이아웃 확인용
  },
  tagContainerBase: { // 태그 공통 스타일
    width: TAG_WIDTH,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagImportant: { // 중요 태그 (그라데이션)
    borderRadius: 12, 
  },
  tagNormal: { // 일반 태그 (단색)
    backgroundColor: '#B28EF8',
    borderRadius: 4, // 요청사항 반영
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
  },
  titleText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
    textAlign: 'left', // 명시적 왼쪽 정렬
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#868E96',
    textAlign: 'center', // 명시적 중앙 정렬
  },
});

export default NoticeListItem; 
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

// UseageItemProps 타입 정의 개선
export interface BaseUseageItemProps {
  id: number | string;
  createdAt: string;
}

export interface ChargeItemProps extends BaseUseageItemProps {
  type: 'charge';
  quantity: number;
  title?: never; // charge 타입일 때는 title 사용 안 함
  description?: never; // charge 타입일 때는 description 사용 안 함
}

export interface UseItemProps extends BaseUseageItemProps {
  type: 'use';
  title: string; // 예: "DICE 4개"
  description: string; // 예: "큐피트의 짝대기 수정 1회권"
  quantity?: never; // use 타입일 때는 최상위 quantity 대신 title 내에 포함되거나 별도 관리
}

export type UseageItemProps = ChargeItemProps | UseItemProps;

const { width } = Dimensions.get('window');

// 날짜 포맷팅 함수 (예: YYYY-MM-DD)
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 유효하지 않으면 원본 반환
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateString; // 오류 시 원본 반환
  }
};

const UseageItem: React.FC<UseageItemProps> = (props) => {
  const { type, createdAt } = props;

  return (
    <View style={styles.outerContainer}>
      {/* 상단 구분선은 UsagePage의 FlatList ItemSeparatorComponent로 처리하거나, 필요시 여기에 추가 */}
      <View style={styles.container}>
        {/* 좌측 텍스트 영역 */}
        <View style={styles.leftContentContainer}>
          {type === 'charge' ? (
            <>
              <Text style={styles.mainText}>충전일</Text>
              <Text style={styles.subText}>DICE 충전 {props.quantity}개</Text>
            </>
          ) : (
            <>
              <Text style={styles.mainText}>{props.title}</Text>
              <Text style={styles.subText}>{props.description}</Text>
            </>
          )}
        </View>

        {/* 우측 날짜 영역 */}
        <View style={styles.rightDateContainer}>
          <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
        </View>
      </View>
      <LinearGradient
        colors={['#EAEAEA', '#EAEAEA']} // 이미지의 얇은 회색 선처럼 보이도록 단색 그라데이션
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBorderBottom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    width: width,
    // marginBottom: 10, // FlatList의 ItemSeparatorComponent로 간격 관리 가능
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 좌우 컨텐츠 분리
    alignItems: 'center', // 세로 중앙 정렬
    paddingVertical: 18, // 상하 패딩 증가 (이미지 참고)
    paddingHorizontal: width * 0.05, // 좌우 패딩 (화면 너비의 5%)
  },
  leftContentContainer: {
    flex: 1, // 가능한 많은 공간 차지하도록 (우측 날짜 공간 제외)
    marginRight: 10, // 우측 날짜와의 간격
  },
  mainText: { // "충전일" 또는 "DICE 4개"
    fontSize: 14, // 이미지 참고하여 약간 줄임
    fontFamily: 'Pretendard-Regular', // 일반 굵기
    color: '#8C8C8C', // 약간 연한 검정 또는 회색 계열
    marginBottom: 6, // 하단 텍스트와의 간격
  },
  subText: { // "DICE 충전 30개" 또는 "큐피트의 짝대기 수정 1회권"
    fontSize: 16, // 메인 설명 텍스트, 이미지 참고하여 약간 키움
    fontFamily: 'Pretendard-SemiBold',
    color: '#333333', // 진한 검정
  },
  rightDateContainer: {
    // 컨테이너 스타일은 특별히 필요 없을 수 있음
  },
  dateText: { // 우측 상단 날짜
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#B0B0B0', // 연한 회색
  },
  gradientBorderBottom: {
    height: 1, // 테두리 두께
    width: '90%', // 좌우 여백을 주기 위해 100%가 아님
    alignSelf: 'center', // 중앙 정렬
  },
  // 기존 스타일 중 불필요한 것들 (profileImage 등)은 제거됨
});

export default UseageItem; 
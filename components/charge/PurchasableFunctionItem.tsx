import DiceLogo from '@/assets/images/profile/dice.svg';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

// 아이콘 타입 - 실제 아이콘 SVG 컴포넌트를 직접 매핑하거나 prop으로 받을 수 있습니다.
// 예시 SVG 아이콘 import (실제 경로와 파일명에 맞게 수정해야 합니다)
// import ChatExitIcon from '@/assets/images/icons/ChatExitIcon.svg';
// import EditChoiceIcon from '@/assets/images/icons/EditChoiceIcon.svg';

interface PurchasableFunctionItemProps {
  iconImage?: string | null;
  title: string;
  diceCost: number;
  isFirstItem?: boolean;
  isLastItem?: boolean;
}

const { width } = Dimensions.get('window');
// 카드 너비를 화면 너비의 일정 비율로 설정하고, 최대/최소 너비도 고려할 수 있음
const CARD_WIDTH = width * 0.44; // 카드 너비 약간 증가 (아이콘 공간 고려)
const CARD_ASPECT_RATIO = 0.7; // 비율 조정으로 높이 약간 늘림

const IconDisplay: React.FC<{ iconImage?: string | null }> = ({ iconImage }) => {
  const imageSize = 28;

  if (iconImage && (iconImage.endsWith('.svg'))) {
    return (
        <View style={styles.iconWrapper}>
            <SvgUri width={imageSize} height={imageSize} uri={iconImage} />
        </View>
    );
  } else if (iconImage) {
    return (
        <View style={styles.iconWrapper}>
            <Image source={{ uri: iconImage }} style={{ width: imageSize, height: imageSize, borderRadius: 4 }} />
        </View>
    );
  } else {
    return (
        <View style={styles.iconWrapper}>
            <View style={styles.defaultIconPlaceholder}><Text>?</Text></View>
        </View>
    );
  }
};

const PurchasableFunctionItem: React.FC<PurchasableFunctionItemProps> = ({
  iconImage,
  title,
  diceCost,
  isFirstItem,
  isLastItem,
}) => {
  return (
    <View
      style={[
        styles.card,
        isFirstItem && styles.firstCardMargin,
        isLastItem && styles.lastCardMargin,
      ]}
    >
      <View style={styles.topSection}>
        <IconDisplay iconImage={iconImage} />
        <View style={styles.textContainer}>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>
      </View>
      
      <View style={styles.bottomSectionWrapper}> 
        <View style={styles.bottomSection}>
          <DiceLogo width={15} height={15} />
          <Text style={styles.diceCostText}>{diceCost} 다이스</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * CARD_ASPECT_RATIO,
    backgroundColor: '#F0EFFF', // 카드 배경 흰색
    borderRadius: 12,
    paddingVertical: 12, // 상하 패딩
    paddingHorizontal: 10, // 좌우 패딩 약간 줄임
    justifyContent: 'space-between', 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2, // 그림자 약간 아래로
    },
    shadowOpacity: 0.1, // 그림자 더 연하게
    shadowRadius: 3.00,
    elevation: 3, // Android 그림자 살짝
    marginVertical: 10,
  },
  firstCardMargin: {
    marginLeft: width * 0.05,
  },
  lastCardMargin: {
    marginRight: width * 0.05,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    flex: 1,
  },
  iconWrapper: { // 아이콘을 감싸는 View, 크기 고정 및 정렬에 사용
    width: 32, // 아이콘 영역 너비
    height: 32, // 아이콘 영역 높이
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    // backgroundColor: 'lightblue', // 영역 확인용
  },
  defaultIconPlaceholder: { // Ionicons 대신 사용될 플레이스홀더 스타일
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: '#666666',
    lineHeight: 15,
  },
  bottomSectionWrapper: { // bottomSection을 중앙 정렬하기 위한 래퍼
    alignItems: 'center', // 자식 View (bottomSection)를 중앙 정렬
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // 연한 회색 배경
    borderRadius: 12, // 이미지처럼 좀 더 둥글게
    paddingVertical: 6,
    paddingHorizontal: 32, // 내부 패딩
    // alignSelf: 'center', // 부모에서 중앙 정렬하므로 여기선 필요 없음
    // marginTop: 'auto', // topSection과의 간격을 자동으로 최대한 확보 (justifyContent: space-between과 유사 효과)
  },
  diceCostText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#777777', // 회색 배경과 어울리도록 약간 어둡게
    marginLeft: 6,
  },
});

export default PurchasableFunctionItem; 
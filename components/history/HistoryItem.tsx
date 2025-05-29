import CircleProfile from '@/components/common/CircleProfile';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// SVG 아이콘 import (원래대로 복원)
import DaoSvgIcon from "@/assets/images/dice/dao.svg";
import DoriSvgIcon from "@/assets/images/dice/dori.svg";
import HanaSvgIcon from "@/assets/images/dice/hana.svg";
import NemoSvgIcon from "@/assets/images/dice/nemo.svg";
import SezziSvgIcon from "@/assets/images/dice/sezzi.svg";
import YukdaengSvgIcon from "@/assets/images/dice/yukdaeng.svg";

const SvgComponents = {
  HanaSvg: HanaSvgIcon,
  DoriSvg: DoriSvgIcon,
  SezziSvg: SezziSvgIcon,
  NemoSvg: NemoSvgIcon,
  DaoSvg: DaoSvgIcon,
  YukdaengSvg: YukdaengSvgIcon,
};
type SvgComponentsType = typeof SvgComponents;

// HistoryItemProps 타입 정의 (기존 정의 유지)
export interface HistoryItemProps {
  id: number | string;
  type: 'chat' | 'heart';
  svgComponentName: keyof SvgComponentsType | React.FC<any>; // ImageSourcePropType 제거
  name: string;
  content: string | null;
  createdAt: string;
  onPress?: (id: number | string) => void;
  roomType?: 'COUPLE' | string;
}

const { width } = Dimensions.get('window'); // width 변수 사용을 위해 추가

// 날짜 포맷팅 함수 (원래대로 복원)
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '유효하지 않은 날짜';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '날짜 로딩 실패';
  }
};

// CircleProfile에 전달될 props의 타입을 명확히 정의
interface CircleProfileRenderProps {
  svgComponent?: React.FC<any>; // CircleProfile이 받을 수 있는 SVG 컴포넌트 타입
  // imageSource?: ImageSourcePropType; // 제거
  borderColor: string;
  svgColor: string;
  size: number;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ id, name, type, svgComponentName, content, createdAt, onPress, roomType }) => {
  console.log("Rendering HistoryItem (Stage 1) with id:", id, "type:", type, "svg:", svgComponentName);
  const isClickable = type === 'chat' && onPress;

  const handlePress = () => {
    if (isClickable && onPress) {
      onPress(id);
    }
  };

  const getCircleProfileProps = (): CircleProfileRenderProps => {
    let borderColor = '';
    let svgColor = '';
    const circleSize = styles.profileImageSize.width;
    let actualSvgComponent: React.FC<any> | undefined = undefined;
    // let imageSource: ImageSourcePropType | undefined = undefined; // 제거

    if (typeof svgComponentName === 'function') {
      actualSvgComponent = svgComponentName;
    } else if (typeof svgComponentName === 'string' && SvgComponents[svgComponentName as keyof SvgComponentsType]) {
      actualSvgComponent = SvgComponents[svgComponentName as keyof SvgComponentsType];
    }
    // else if (svgComponentName) { // 제거
    //   imageSource = svgComponentName as ImageSourcePropType; // 제거
    // } // 제거

    if (!actualSvgComponent) { // 조건 단순화
        actualSvgComponent = HanaSvgIcon; // 기본 SVG 아이콘
    }
    
    // if (imageSource && actualSvgComponent) { // 제거
    //     actualSvgComponent = undefined; // imageSource가 있으면 SVG는 사용 안 함 // 제거
    // } // 제거

    if (type === 'chat') {
      if (roomType === 'COUPLE') {
        borderColor = '#DEC2DB';
        if (actualSvgComponent === HanaSvgIcon || actualSvgComponent === SezziSvgIcon || actualSvgComponent === DaoSvgIcon) {
          svgColor = '#9FC9FF';
        } else if (actualSvgComponent === DoriSvgIcon || actualSvgComponent === NemoSvgIcon || actualSvgComponent === YukdaengSvgIcon) {
          svgColor = '#F9BCC1';
        } else {
          svgColor = '#9FC9FF'; // 기본 커플 SVG 색상 (HanaSvgIcon 등이 기본값일 경우)
        }
      } else { // type === 'chat' && roomType !== 'COUPLE'
        borderColor = '#6DA0E1';
        svgColor = '#9FC9FF';
      }
    } else { // type === 'heart'
      borderColor = '#B19ADE';
      svgColor = '#DEC2DB';
    }
    
    return {
        svgComponent: actualSvgComponent, 
        // imageSource, // 제거
        borderColor, 
        svgColor, 
        size: circleSize
    };
  };

  const circleProps = getCircleProfileProps();

  const finalCircleProps: any = {
    borderColor: circleProps.borderColor,
    svgColor: circleProps.svgColor,
    size: circleProps.size,
  };

  // if (circleProps.imageSource) { // 제거
  //   finalCircleProps.imageSource = circleProps.imageSource; // 제거
  // } else if (circleProps.svgComponent) { // imageSource가 없을 때만 svgComponent 고려 -> else if를 if로 변경
  if (circleProps.svgComponent) { 
    finalCircleProps.svgComponent = circleProps.svgComponent; // as React.FC<SvgProps>; // 타입 단언은 일단 보류
  }
  // 둘 다 없으면 borderColor, svgColor, size만 전달되어 CircleProfile의 기본 이미지/아이콘 로직에 따름
  // -> 이제 svgComponent가 항상 있으므로 (기본값 HanaSvgIcon), 이 주석은 약간 수정될 수 있음.
  // HanaSvgIcon이 기본값이므로 finalCircleProps.svgComponent는 항상 설정됩니다.

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#B28EF8', '#F476E5']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBorderTop}
      />
      <TouchableOpacity 
        style={styles.touchableContainer}
        onPress={handlePress} 
        disabled={!isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={styles.profileContainer}>
          <CircleProfile
            {...finalCircleProps} 
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
          <Text style={styles.contentText} numberOfLines={1} ellipsizeMode="tail">{content || (type === 'heart' ? '하트 메시지가 없습니다.' : '채팅 내용이 없습니다.')}</Text>
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          {type === 'chat' && (
            <Ionicons name="chevron-forward" size={20} color="#C5C5C5" style={styles.arrowIcon} />
          )}
        </View>
      </TouchableOpacity>
      <LinearGradient
        colors={['#B28EF8', '#F476E5']}
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
    marginBottom: 10,
  },
  gradientBorderTop: { height: 1, width: '100%' },
  gradientBorderBottom: { height: 1, width: '100%' },
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  profileContainer: { 
    marginRight: 15,
  },
  profileImageSize: {
    width: 50,
    height: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333333',
    marginBottom: 5,
  },
  contentText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#767676',
  },
  metaContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#A5A5A5',
    marginBottom: 5,
  },
  arrowIcon: {},
});

export default HistoryItem; 
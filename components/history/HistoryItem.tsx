import DiceFriendsIcon from '@/assets/images/home/diceFriendsIcon.svg';
import HeartSignalIcon from '@/assets/images/home/heartSignalIcon.svg';
import CircleProfile from '@/components/common/CircleProfile';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// // SVG 아이콘 import (원래대로 복원)
// import DaoSvgIcon from "@/assets/images/dice/dao.svg";
// import DoriSvgIcon from "@/assets/images/dice/dori.svg";
// import HanaSvgIcon from "@/assets/images/dice/hana.svg";
// import NemoSvgIcon from "@/assets/images/dice/nemo.svg";
// import SezziSvgIcon from "@/assets/images/dice/sezzi.svg";
// import YukdaengSvgIcon from "@/assets/images/dice/yukdaeng.svg";

// const SvgComponents = {
//   HanaSvg: HanaSvgIcon,
//   DoriSvg: DoriSvgIcon,
//   SezziSvg: SezziSvgIcon,
//   NemoSvg: NemoSvgIcon,
//   DaoSvg: DaoSvgIcon,
//   YukdaengSvg: YukdaengSvgIcon,
// };
// type SvgComponentsType = typeof SvgComponents;

// HistoryItemProps 타입 정의
export interface HistoryItemProps {
  id: number | string;
  type: 'chat' | 'heart';
  name: string; // '알 수 없는 사용자' 등 동적으로 변경될 이름
  content: string | null;
  createdAt: string;
  onPress?: (id: number | string) => void;
  roomType?: 'COUPLE' | string;
  themeId?: number; // themeId를 props로 받음
  onLongPress?: (id: number | string) => void; // 길게 누르기 콜백 함수
  // 기존의 svgComponentName는 더 이상 직접 사용하지 않음
}

const { width } = Dimensions.get('window');

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

const HistoryItem: React.FC<HistoryItemProps> = ({ id, name, type, content, createdAt, onPress, roomType, themeId, onLongPress }) => {
  const isClickable = type === 'chat' && onPress;

  const handlePress = () => {
    if (isClickable && onPress) {
      onPress(id);
    }
  };

  const handleLongPress = () => {
    if (onLongPress && type === 'heart') {
      onLongPress(id);
    }
  };

  // themeId와 type에 따라 프로필과 이름을 동적으로 결정
  let profileIcon: React.FC<any> | null = null;
  let profileBackgroundColor = 'transparent';
  let profileBorderColor = '#eee';
  let displayName = name;
  let displayNameColor = '#333333'; // 기본 이름 색상

  if (type === 'heart') {
    //profileBorderColor = '#B19ADE'; // 하트 타입 기본 테두리 색상
    if (themeId === 1) {
      profileIcon = HeartSignalIcon;
      profileBackgroundColor = '#DEC2DB';
      displayName = "당신을 향한 익명의 하트";
      displayNameColor = 'rgba(129, 49, 85, 0.81)'; // #813155의 81%
    } else if (themeId === 2) {
      profileIcon = DiceFriendsIcon;
      profileBackgroundColor = '#6DA0E1';
      displayName = "너의 비밀 친구가 보낸 쪽지";
      displayNameColor = '#5C5279';
    }
  } else { // type === 'chat'
    // 기존 채팅 아이템 로직 (현재는 수정 대상이 아니므로 단순화)
    // 필요하다면 이 부분도 확장 가능
    profileBorderColor = roomType === 'COUPLE' ? '#DEC2DB' : '#6DA0E1';
  }

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
        onLongPress={handleLongPress}
        delayLongPress={1000} // 1초 이상 누를 경우 onLongPress 호출
        disabled={type === 'chat' && !isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={styles.profileContainer}>
          {profileIcon && (
            <CircleProfile
              svgComponent={profileIcon}
              backgroundColor={profileBackgroundColor}
              borderColor={profileBorderColor}
              size={styles.profileImageSize.width}
            />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.nameText, { color: displayNameColor }]} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
          <Text style={styles.contentText} numberOfLines={1} ellipsizeMode="tail">{content || (type === 'heart' ? ' ' : '채팅 내용이 없습니다.')}</Text>
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
    width: 55,
    height: 55,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 5,
  },
  contentText: {
    fontSize: 15,
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
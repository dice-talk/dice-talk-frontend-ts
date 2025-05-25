import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

// HistoryItemProps 타입 정의
export interface HistoryItemProps {
  id: number | string;
  type: 'chat' | 'heart';
  profileImage: React.FC<SvgProps> | ImageSourcePropType; // SVG 컴포넌트 또는 ImageSourcePropType
  name: string;
  content: string | null;
  createdAt: string;
  onPress?: (id: number | string) => void;
}

const { width } = Dimensions.get('window');

// 날짜 포맷팅 함수 (예: YYYY-MM-DD)
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '유효하지 않은 날짜';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '날짜 로딩 실패';
  }
};

const HistoryItem: React.FC<HistoryItemProps> = ({ 
  id,
  type, 
  profileImage, 
  name, 
  content, 
  createdAt, 
  onPress 
}) => {
  const isClickable = type === 'chat' && onPress; // 채팅 타입이고 onPress 함수가 있을 때만 클릭 가능

  const handlePress = () => {
    if (isClickable) {
      onPress(id);
    }
  };

  // 프로필 이미지를 렌더링하는 함수
  const renderProfileImage = () => {
    if (typeof profileImage === 'function') {
      // SVG 컴포넌트인 경우 (React.FC<SvgProps>)
      const ProfileSvgComponent = profileImage; // 변수명 변경 (JSX 네이밍 규칙)
      return <ProfileSvgComponent width={styles.profileImage.width} height={styles.profileImage.height} style={styles.profileSvg} />;
    } else if (profileImage) {
      // 일반 이미지 (require 또는 {uri: ...})인 경우
      return <Image source={profileImage} style={styles.profileImage} />;
    } else {
      // 이미지가 없는 경우 (기본 플레이스홀더 렌더링 가능)
      return <View style={[styles.profileImage, styles.profilePlaceholder]} />;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#B28EF8', '#F476E5']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBorderTop}
      />
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress} 
        disabled={!isClickable} // 클릭 불가능할 경우 비활성화
        activeOpacity={isClickable ? 0.7 : 1} // 클릭 가능할 때만 activeOpacity 적용
      >
        {renderProfileImage()} {/* 프로필 이미지 렌더링 함수 호출 */}

        {/* 텍스트 컨텐츠 영역 */}
        <View style={styles.contentContainer}>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
          <Text style={styles.contentText} numberOfLines={1} ellipsizeMode="tail">{content || (type === 'heart' ? '하트 메시지가 없습니다.' : '채팅 내용이 없습니다.')}</Text>
        </View>

        {/* 날짜 및 아이콘 영역 */}
        <View style={styles.metaContainer}>
          <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          {/* 채팅 타입일 경우에만 오른쪽 화살표 아이콘 표시 */}
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
    backgroundColor: '#FFFFFF', // 내부 컨테이너와 동일한 배경색 또는 투명
    width: width, 
  },
  gradientBorderTop: {
    height: 1, // 테두리 두께
    width: '100%',
  },
  gradientBorderBottom: {
    height: 1, // 테두리 두께
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    // backgroundColor: '#FFFFFF', // outerContainer로 이동 또는 여기서 유지
    // borderBottomWidth: 1, // LinearGradient로 대체
    // borderBottomColor: '#F0F0F0', // LinearGradient로 대체
    // width: width, // outerContainer에서 관리
  },
  profileImage: {
    width: 50, // 프로필 이미지 크기
    height: 50,
    borderRadius: 25, // 원형 이미지
    marginRight: 15,
    backgroundColor: '#E9E9E9', // 이미지 없을 경우 배경색
  },
  profileSvg: { // SVG에만 적용될 수 있는 추가 스타일 (필요시)
    // backgroundColor: '#E9E9E9', // SVG 배경색은 여기서 설정하거나, SVG 자체에서 설정
  },
  profilePlaceholder: { // 이미지가 없을 경우 (profileImage가 null/undefined일때)
    backgroundColor: '#E9E9E9',
  },
  contentContainer: {
    flex: 1, // 가능한 많은 공간 차지
    justifyContent: 'center',
    // marginLeft: 16, // profileImage의 marginRight으로 간격 조절됨
  },
  nameText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold', // 폰트 적용
    color: '#333333',
    marginBottom: 5,
  },
  contentText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular', // 폰트 적용
    color: '#767676',
  },
  metaContainer: {
    alignItems: 'flex-end',
    marginLeft: 10, // 내용과의 간격
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#A5A5A5',
    marginBottom: 5, // 아이콘과의 간격 (채팅타입일때만 의미있음)
  },
  arrowIcon: {
    // 아이콘 스타일 (필요시 추가)
  },
});

export default HistoryItem; 
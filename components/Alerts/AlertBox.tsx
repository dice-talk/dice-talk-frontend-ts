import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// SVG 아이콘 컴포넌트들
const NoticeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#4A90E2" strokeWidth="2" fill="#E3F2FD"/>
    <Path d="M12 6v6l4 2" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const PaymentIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke="#4CAF50" strokeWidth="2" fill="#E8F5E8"/>
    <Path d="M2 10h20" stroke="#4CAF50" strokeWidth="2"/>
    <Circle cx="6" cy="14" r="1" fill="#4CAF50"/>
  </Svg>
);

const EventIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
          stroke="#FF9800" strokeWidth="2" fill="#FFF3E0"/>
  </Svg>
);

const ReportIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#F44336" strokeWidth="2" fill="#FFEBEE"/>
    <Path d="M12 8v4" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 16h.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M10 11v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export type AlertCategory = 'notice' | 'payment' | 'event' | 'report';

interface AlertBoxProps {
  category: AlertCategory;
  text: string;
  read?: boolean;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const AlertBox = ({ category, text, read = false, onDelete, showDeleteButton = true }: AlertBoxProps) => {
  const getSvgIcon = () => {
    const iconColor = read ? '#9E9E9E' : getCategoryColor();
    const fillColor = read ? '#F5F5F5' : getCategoryFillColor();
    
    switch (category) {
      case 'notice':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill={fillColor}/>
            <Path d="M12 6v6l4 2" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
      case 'payment':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="6" width="20" height="12" rx="2" stroke={iconColor} strokeWidth="2" fill={fillColor}/>
            <Path d="M2 10h20" stroke={iconColor} strokeWidth="2"/>
            <Circle cx="6" cy="14" r="1" fill={iconColor}/>
          </Svg>
        );
      case 'event':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                  stroke={iconColor} strokeWidth="2" fill={fillColor}/>
          </Svg>
        );
      case 'report':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill={fillColor}/>
            <Path d="M12 8v4" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
            <Path d="M12 16h.01" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
      default:
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill={fillColor}/>
            <Path d="M12 6v6l4 2" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'notice':
        return '#4A90E2';
      case 'payment':
        return '#4CAF50';
      case 'event':
        return '#FF9800';
      case 'report':
        return '#F44336';
      default:
        return '#4A90E2';
    }
  };

  const getCategoryFillColor = () => {
    switch (category) {
      case 'notice':
        return '#E3F2FD';
      case 'payment':
        return '#E8F5E8';
      case 'event':
        return '#FFF3E0';
      case 'report':
        return '#FFEBEE';
      default:
        return '#E3F2FD';
    }
  };

  const borderColor = read ? '#E0E0E0' : getCategoryColor();
  const textColor = read ? '#9E9E9E' : '#333333';
  const backgroundColor = read ? '#FAFAFA' : '#FFFFFF';

  return (
    <View style={[
      styles.container,
      {
        borderLeftColor: borderColor,
        backgroundColor: backgroundColor,
      },
    ]}>
      <View style={styles.iconContainer}>
        {getSvgIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.alertText, { color: textColor }]}>{text}</Text>
      </View>
      {showDeleteButton && onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <DeleteIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

// 더미 데이터 export
export const dummyAlerts = [
  {
    category: 'notice' as AlertCategory,
    text: '새로운 테마가 오픈되었습니다!! 지금 확인해보세요.',
    read: false
  },
  {
    category: 'payment' as AlertCategory,
    text: '결제가 성공적으로 완료되었습니다. 결제내역을 확인하세요.',
    read: true
  },
  {
    category: 'event' as AlertCategory,
    text: '사랑의 짝대기 이벤트가 시작되었습니다!!!',
    read: false
  },
  {
    category: 'report' as AlertCategory,
    text: '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
    read: false
  },
  {
    category: 'notice' as AlertCategory,
    text: '시스템 점검 완료 안내입니다.',
    read: true
  }
];

// 읽지 않은 알림이 있는지 체크하는 유틸리티 함수
export const hasUnreadAlerts = () => {
  return dummyAlerts.some(alert => !alert.read);
};

// 더미 데이터로 테스트용 컴포넌트
export const AlertBoxDemo = () => {
  return (
    <View style={styles.demoContainer}>
      <Text style={styles.demoTitle}>AlertBox 컴포넌트 테스트</Text>
      {dummyAlerts.map((alert, index) => (
        <AlertBox 
          key={index}
          category={alert.category}
          text={alert.text}
          read={alert.read}
          onDelete={() => console.log(`알림 ${index + 1} 삭제됨`)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#FF4757',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  // 데모용 스타일
  demoContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
});

export default AlertBox;

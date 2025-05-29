import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// SVG 아이콘 컴포넌트들
const NoticeIcon = ({ color = "#4A90E2", fillColor = "#E3F2FD" }: { color?: string; fillColor?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={fillColor}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const PaymentIcon = ({ color = "#4CAF50", fillColor = "#E8F5E8" }: { color?: string; fillColor?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" fill={fillColor}/>
    <Path d="M2 10h20" stroke={color} strokeWidth="2"/>
    <Circle cx="6" cy="14" r="1" fill={color}/>
  </Svg>
);

const ReportIcon = ({ color = "#F44336", fillColor = "#FFEBEE" }: { color?: string; fillColor?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={fillColor}/>
    <Path d="M12 8v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 16h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
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

// 채팅방 관련 아이콘들
export const ChatIcon = ({ color = "#9C27B0", fillColor = "#F3E5F5" }: { color?: string; fillColor?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" 
          stroke={color} strokeWidth="2" fill={fillColor}/>
    <Circle cx="8" cy="10" r="1" fill={color}/>
    <Circle cx="12" cy="10" r="1" fill={color}/>
    <Circle cx="16" cy="10" r="1" fill={color}/>
  </Svg>
);

export type AlertCategory = 'PAYMENT' | 'CHAT_ROOM' | 'NOTICE_EVENT' | 'REPORT';

interface AlertBoxProps {
  category: AlertCategory;
  text: string;
  read?: boolean;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const AlertBox = ({ category, text, read = false, onDelete, showDeleteButton = true }: AlertBoxProps) => {
  // 디버깅용 로그 추가
  console.log('🎯 AlertBox props:', { category, text, read, showDeleteButton });
  
  const getSvgIcon = () => {
    const iconColor = read ? '#9E9E9E' : getCategoryColor();
    const fillColor = read ? '#F5F5F5' : getCategoryFillColor();
    
    switch (category) {
      case 'NOTICE_EVENT':
        return <NoticeIcon color={iconColor} fillColor={fillColor} />;
      case 'PAYMENT':
        return <PaymentIcon color={iconColor} fillColor={fillColor} />;
      case 'CHAT_ROOM':
        return <ChatIcon color={iconColor} fillColor={fillColor} />;
      case 'REPORT':
        return <ReportIcon color={iconColor} fillColor={fillColor} />;
      default:
        return <NoticeIcon color={iconColor} fillColor={fillColor} />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'NOTICE_EVENT':
        return '#4A90E2';
      case 'PAYMENT':
        return '#4CAF50';
      case 'CHAT_ROOM':
        return '#FF9800';
      case 'REPORT':
        return '#F44336';
      default:
        return '#4A90E2';
    }
  };

  const getCategoryFillColor = () => {
    switch (category) {
      case 'NOTICE_EVENT':
        return '#E3F2FD';
      case 'PAYMENT':
        return '#E8F5E8';
      case 'CHAT_ROOM':
        return '#FFF3E0';
      case 'REPORT':
        return '#FFEBEE';
      default:
        return '#E3F2FD';
    }
  };

  const borderColor = read ? '#E0E0E0' : getCategoryColor();
  const textColor = read ? '#9E9E9E' : '#333333';

  return (
    <View style={[
      styles.container,
      {
        borderLeftColor: borderColor,
        backgroundColor: '#FFFFFF',
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

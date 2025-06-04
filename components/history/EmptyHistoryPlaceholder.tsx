import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type EmptyHistoryPlaceholderProps = {
  type: 'chat' | 'heart';
  message?: string;
};

const EmptyHistoryPlaceholder: React.FC<EmptyHistoryPlaceholderProps> = ({ type, message }) => {
  const iconName = type === 'chat' ? 'chatbubbles-outline' : 'heart-outline';
  const defaultMessage = type === 'chat' 
    ? "아직 대화 내역이 없어요.\n새로운 친구와 이야기를 시작해보세요!"
    : "받은 하트가 아직 없네요.";
  const displayMessage = message || defaultMessage;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={80} color="#D1D5DB" style={styles.icon} />
      <Text style={styles.messageText}>{displayMessage}</Text>
      {/* 필요하다면 여기에 버튼 등을 추가하여 다음 행동 유도 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // 부모 컴포넌트(FlatList의 ListEmptyComponent를 감싸는 View)가 공간을 차지하도록
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50, // 탭바 등 가려지는 부분 고려
  },
  icon: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EmptyHistoryPlaceholder; 
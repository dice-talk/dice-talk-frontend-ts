import { Ionicons } from '@expo/vector-icons'; // 아이콘 사용
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface EmptyNoticeListProps {
  message?: string;
}

const EmptyNoticeList: React.FC<EmptyNoticeListProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color="#CED4DA" />
      <Text style={styles.messageText}>{
        message || "검색된 공지사항이 없습니다.\n조건을 변경하여 다시 검색해보세요."
      }</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // 최소 높이를 지정하여 다른 콘텐츠가 없을 때도 보이도록
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#868E96',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EmptyNoticeList; 
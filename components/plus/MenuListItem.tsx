import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MenuListItemProps {
  title: string;
  onPress: () => void;
  isLastItem?: boolean; // 마지막 아이템 여부에 따라 하단 테두리 제거 (옵션)
}

const { width } = Dimensions.get('window');

const MenuListItem: React.FC<MenuListItemProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={[styles.container]} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.titleText}>{title}</Text>
      <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18, // 상하 패딩 증가
    paddingHorizontal: width * 0.08, // 화면 좌우 여백과 동일하게
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // 연한 회색 구분선
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
  },
});

export default MenuListItem; 
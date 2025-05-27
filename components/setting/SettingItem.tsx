import React from 'react';
import { Dimensions, Platform, StyleSheet, Switch, Text, View } from 'react-native';

interface SettingItemProps {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isFirstInSection?: boolean; // 섹션의 첫 아이템인지 여부 (상단 테두리 추가용)
  isLastItem?: boolean; // 마지막 아이템인지 여부 (하단 테두리 미표시용)
}

const { width } = Dimensions.get('window');

const SettingItem: React.FC<SettingItemProps> = ({ title, value, onValueChange, isFirstInSection, isLastItem }) => {
  return (
    <View 
      style={[
        styles.container,
        isFirstInSection && styles.firstItemMargin,
        isLastItem && styles.lastItemBorder,
      ]}
    >
      <Text style={styles.titleText}>{title}</Text>
      <Switch
        trackColor={{ false: '#E0E0E0', true: '#D5C2F9' }} // true일 때 연한 보라색 (그라데이션 불가로 단색 처리)
        thumbColor={value ? '#B28EF8' : (Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4')}
        ios_backgroundColor="#E0E0E0" // iOS 비활성 시 트랙 배경색
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, 
    paddingHorizontal: width * 0.05, // 화면 좌우 여백
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  firstItemMargin: { // 섹션 제목 바로 아래 오는 아이템에 대한 상단 마진 (또는 구분선)
    // marginTop: 8, // 또는 borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  lastItemBorder: {
    borderBottomWidth: 0, // 마지막 아이템은 하단 구분선 없음
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
  },
});

export default SettingItem; 
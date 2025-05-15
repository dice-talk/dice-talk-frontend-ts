import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import DiceFriends from '@/assets/images/home/diceFriends.svg'; // svg 경로 맞게 수정

interface IPage {
  item: { num: number; color: string };
  style: ViewStyle;
}

export default function Page({ item, style }: IPage) {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.pageItem, style]}>
        <DiceFriends width={width * 0.60}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageItem: {

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    flex: 1,
    // height: Dimensions.get('window').height * 0.1, // 화면의 60% 정도 높이 설정
  },
});
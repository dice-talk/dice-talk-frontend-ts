import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface IPage {
  item: { num: number; icon: ReactNode };
  style: ViewStyle;
}

export default function Page({ item, style }: IPage) {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.pageItem, style, { marginTop: height * 0.15, zIndex: -1 }]}>
        {item.icon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageItem: {
    // backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    flex: 1,
    // height: Dimensions.get('window').height * 0.1, // 화면의 60% 정도 높이 설정
  },
});
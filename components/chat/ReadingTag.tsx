import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from "react-native";
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트

const { width } = Dimensions.get("window");

interface ReadingTagProps {
}

const ReadingTag: React.FC<ReadingTagProps> = () => {
  const curThemeId = useHomeStore((state) => state.curThemeId);
  const textColor = curThemeId === 2 ? '#5C5279' : '#FF8FAB';
  return (
    <View style={styles.container}>
      <View style={[styles.tag, { borderColor: curThemeId === 2 ? '#6DA0E1' : '#FFC0CB' }]}>
        <Text style={[styles.text, { color: textColor }]}>여기까지 읽으셨습니다</Text>
      </View>
    </View>
  );
};

export default ReadingTag;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFC0CB',
    borderRadius: 25,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
  },
  text: {
    color: '#FF8FAB',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
});
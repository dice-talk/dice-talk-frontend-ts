import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from "react-native";

const { width } = Dimensions.get("window");

const ReadingTag: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.tag}>
        <Text style={styles.text}>여기까지 읽으셨습니다</Text>
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
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface TextBoxProps {
  width: number;
  height: number;
  text: string;
}

const TextBox: React.FC<TextBoxProps> = ({ width, height, text }) => {
  return (
    <View style={[styles.container, { width, height }]}>  
    <LinearGradient
        colors={['#D1B4F8', '#F6A7D6']} // 보라 → 핑크
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: width * 1.5, height: height * 0.4, borderRadius: 10, justifyContent: 'center', alignItems: 'center', left: width * 0.1 }}
      >
        <Text style={styles.text}>{text}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TextBox;

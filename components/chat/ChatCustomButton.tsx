// components/home/CustomButton.tsx

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


interface ChatCustomButtonProps {
  label: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}
const { width, height } = Dimensions.get("window");
const ChatCustomButton: React.FC<ChatCustomButtonProps> = ({ label, onPress, containerStyle, textStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#D1B4F8', '#F6A7D6']} // 보라 → 핑크
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, containerStyle, { width: width * 0.35 }]}
      >
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatCustomButton;
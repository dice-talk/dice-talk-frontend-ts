// components/home/CustomButton.tsx

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';


interface CustomButtonProps {
  label: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}
const { width, height } = Dimensions.get("window");
const CustomButton: React.FC<CustomButtonProps> = ({ label, onPress, containerStyle, textStyle, disabled = false }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={disabled ? 1 : 0.8} disabled={disabled}>
      <LinearGradient
        colors={disabled ? ['#BDBDBD', '#BDBDBD'] : ['#D1B4F8', '#F6A7D6']} // 비활성화 시 회색 그라데이션
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

export default CustomButton;
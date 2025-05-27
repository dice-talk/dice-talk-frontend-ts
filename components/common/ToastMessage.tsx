// components/common/ToastMessage.tsx

import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ToastMessageProps {
  message: string;
  visible: boolean;
  themeId?: number;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ message, visible, themeId = 1 }) => {
  if (!visible) return null;

  // 테마별 색상 설정
  const textColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";

  return (
    <View style={styles.toastContainer}>
      <Text style={[styles.toastText, { color: textColor }]}>{message}</Text>
    </View>
  );
};

export default ToastMessage;

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 10,
  },
  toastText: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
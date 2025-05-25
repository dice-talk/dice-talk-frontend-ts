// components/common/ToastMessage.tsx

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ToastMessageProps {
  message: string;
  visible: boolean;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
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
    color: '#F9BCC1',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
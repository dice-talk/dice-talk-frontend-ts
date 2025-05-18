import React, { useEffect } from "react";
import { Animated, StyleSheet, Text } from "react-native";

// ✅ Toast 컴포넌트의 타입 정의
type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

export default function Toast({ message, visible, onHide }: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1400),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    borderRadius: 8,
    zIndex: 999,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

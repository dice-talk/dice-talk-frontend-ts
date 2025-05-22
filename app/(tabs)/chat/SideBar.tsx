import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View, Pressable } from "react-native";

interface SideBarProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

const SideBar = ({ visible, onClose }: SideBarProps) => {
  const translateX = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true, // ✅ 더 자연스러운 애니메이션
    }).start();
  }, [visible]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {visible && (
        <Pressable style={styles.overlay} onPress={onClose} />
      )}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.text}>SideBar</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default SideBar;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.75,
    backgroundColor: "#fff",
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
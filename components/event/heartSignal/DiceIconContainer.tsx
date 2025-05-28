import React from "react";
import { StyleSheet, View } from "react-native";

interface DiceIconContainerProps {
  children: React.ReactNode;
  position?: "left" | "right";
}

const DiceIconContainer = ({ children, position = "left" }: DiceIconContainerProps) => {
  return (
    <View style={[styles.container, position === "left" ? styles.left : styles.right]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "35.5%",
    height: "20%",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 10,
  },
  left: {
    left: "15%",
  },
  right: {
    right: "15%",
  },
});

export default DiceIconContainer;
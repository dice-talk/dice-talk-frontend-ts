import SidebarClose from '@/assets/images/chat/sidebarClose.svg';
import ChatEventNotice from "@/components/chat/ChatEventNotice";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

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
      useNativeDriver: true,
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
        <View style={styles.sidebarHeader}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <SidebarClose width={28} height={28} />
          </Pressable>
        </View>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <ChatEventNotice />
          </View>
          <View style={styles.bottomSection}>
            <Text>Bottom Area</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default SideBar;

const { height } = Dimensions.get("window");
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  sidebar: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.8,
    backgroundColor: "#fff",
    zIndex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  topSection: {
    flex: 1,
    alignItems: "center",
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  eventText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: height * 0.08,
  },
  sidebarHeader: {
    height: height * 0.07,
    width: width * 0.8,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  closeButton: {
    padding: 8,
  },
});
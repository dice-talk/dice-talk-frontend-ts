import DownArrow from "@/assets/images/chat/downArrow.svg";
import Megaphone from "@/assets/images/chat/megaphone.svg";
import UpArrow from "@/assets/images/chat/upArrow.svg";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

interface GptNoticeProps {
  text?: string;
  onHide?: () => void;
  onParticipate?: () => void;
}

const GptNotice = ({ 
  text = "공지사항",
  onHide = () => {},
  onParticipate = () => {} 
}: GptNoticeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleHide = () => {
    onHide();
  };

  const handleParticipate = () => {
    onParticipate();
  };

  return (
    <View style={[
      styles.container, 
      isExpanded ? styles.containerExpanded : null
    ]}>
      <View style={styles.mainContent}>
        <View style={styles.leftIcon}>
          <Megaphone width={20} height={20} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {text}
          </Text>
        </View>
        <Pressable 
          style={styles.rightIcon} 
          onPress={toggleExpand}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isExpanded ? (
            <UpArrow width={20} height={20} />
          ) : (
            <DownArrow width={20} height={20} />
          )}
        </Pressable>
      </View>
      {isExpanded && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleHide}>
            <Text style={styles.buttonText}>다시 열지 않음</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleParticipate}>
            <Text style={styles.buttonText}>참여하기</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default GptNotice;
const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: "#B19ADE",
    padding: 7,
    overflow: 'hidden',
  },
  containerExpanded: {
    height: height * 0.11, // 확장 시 높이 증가
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.02,
  },
  leftIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  rightIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: width * 0.015,
    paddingTop: height * 0.04,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.48,
  },
  buttonText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  }
});
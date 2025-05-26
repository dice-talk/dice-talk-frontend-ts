import HanaSvg from '@/assets/images/chat/hana.svg';
import Nemo from '@/assets/images/chat/nemo.svg';
import SidebarClose from '@/assets/images/chat/sidebarClose.svg';
import ActiveUser from '@/components/chat/ActiveUser';
import ChatEventNotice from "@/components/chat/ChatEventNotice";
import ChatFooter from "@/components/chat/ChatFooter";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface SideBarProps {
  visible: boolean;
  onClose: () => void;
  onSirenPress?: () => void;
  onProfilePress?: (nickname: string, SvgComponent: React.FC<SvgProps>) => void;
  themeId?: number;
}

interface UserData {
  id: string;
  name: string;
  color: string;
  profileSvg: React.FC<SvgProps>;
}

const { width } = Dimensions.get("window");

const SideBar = ({ visible, onClose, onSirenPress, onProfilePress, themeId = 1 }: SideBarProps) => {
  const translateX = useRef(new Animated.Value(width)).current;
  const sidebarCloseColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const bottomLineColor = themeId === 2 ? "#6DA0E1" : "#F3D4EE";

  // 유저 데이터 정의
  const [users] = useState<UserData[]>([
    { id: '1', name: '두 얼굴의 매력 두리', color: '#F3D4EE', profileSvg: HanaSvg },
    { id: '2', name: '한가로운 하나', color: '#D4E6F3', profileSvg: HanaSvg },
    { id: '3', name: '세침한 세찌', color: '#D4E6F3', profileSvg: HanaSvg },
    { id: '4', name: '네모지만 부드러운 네몽', color: '#F3D4EE', profileSvg: Nemo },
    { id: '5', name: '단호하데 다정한 다오', color: '#D4E6F3', profileSvg: Nemo },
    { id: '6', name: '육감적인 직감파 육땡', color: '#F3D4EE', profileSvg: Nemo },
  ]);

  // 프로필 클릭 핸들러
  const handleProfilePress = (user: UserData) => {
    if (onProfilePress) {
      onProfilePress(user.name, user.profileSvg);
    }
  };

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
            <SidebarClose width={28} height={28} color={sidebarCloseColor} />
          </Pressable>
        </View>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <ChatEventNotice themeId={themeId} />
          </View>
          <View style={styles.bottomSection}>
            <View style={{ flex: 1, width: '100%' }}>
              <ActiveUser users={users} onProfilePress={handleProfilePress} themeId={themeId} />
            </View>
            <View style={{height: height * 0.05, justifyContent: 'center', width: '100%'}}>
            <View style={[styles.bottomLine, { backgroundColor: bottomLineColor }]} />
            </View>
            <View style={{height: height * 0.05, justifyContent: 'center', width: '100%'}}>
              <ChatFooter onClose={onClose} onSirenPress={onSirenPress} themeId={themeId} />
            </View>
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
    flex: 1.5,
    alignItems: "center",
  },
  bottomSection: {
    flex: 3,
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 0,
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
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    alignSelf: "center",
  },
});
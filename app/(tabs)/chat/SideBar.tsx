import SidebarClose from '@/assets/images/chat/sidebarClose.svg';
import Dao from '@/assets/images/dice/dao.svg';
import Dori from '@/assets/images/dice/dori.svg';
import Hana from '@/assets/images/dice/hana.svg';
import Nemo from '@/assets/images/dice/nemo.svg'; // 명확성을 위해 NemoSvg로 변경
import Sezzi from '@/assets/images/dice/sezzi.svg';
import Yukdaeng from '@/assets/images/dice/yukdaeng.svg';
import ActiveUser from '@/components/chat/ActiveUser';
import ChatEventNotice from "@/components/chat/ChatEventNotice";
import ChatFooter from "@/components/chat/ChatFooter";
import useChatRoomStore, { ChatParticipant } from '@/zustand/stores/ChatRoomStore'; // ChatRoomStore 임포트
import React, { useEffect, useMemo, useRef } from "react"; // useMemo와 React 임포트
import { Animated, Dimensions, Pressable, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface SideBarProps {
  visible: boolean;
  onClose: () => void;
  onProfilePress?: (nickname: string, SvgComponent: React.FC<SvgProps>) => void;
}

interface UserData {
  id: string;
  name: string;
  profileSvg: React.FC<SvgProps>;
}

// chatRoomDetails.chatParts 내부 아이템의 예상 구조
// 실제 구조와 다를 경우 수정해주세요.

const svgMap: Record<string, React.FC<SvgProps>> = {
  Hana,
  Nemo,
  Dori,
  Sezzi,
  Dao,
  Yukdaeng,
};

const { width } = Dimensions.get("window");

const SideBar = ({ visible, onClose, onProfilePress }: SideBarProps) => {
  const translateX = useRef(new Animated.Value(width)).current;

  // SideBar가 직접 themeId를 스토어에서 가져옴 (스타일링 목적)
  const themeId = useChatRoomStore((state) => state.themeId) || 1;
  const chatParts = useChatRoomStore((state) => state.chatParts);

  let sidebarCloseColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  let bottomLineColor = themeId === 2 ? "#6DA0E1" : "#F3D4EE";

  const usersToDisplay = useMemo((): UserData[] => {
    if (!chatParts || chatParts.length === 0) {
      return [];
    }

    // part의 타입을 ChatParticipant로 명시하고, id 필드를 사용합니다.
    return chatParts.map((part: ChatParticipant, index: number) => {
      const SvgComponent = svgMap[part.profile as string] || Hana;
      // 이제 part.memberId를 직접 사용할 수 있습니다.
      console.log(`SideBar - chatPart[${index}].memberId:`, part.memberId, `(Type: ${typeof part.memberId})`);
      console.log(`SideBar - chatPart[${index}].partId (used for UserData.id):`, part.partId, `(Type: ${typeof part.partId})`);
      return {
        id: String(part.partId), // UserData의 id는 문자열이어야 하므로 변환
        name: part.nickname,     // UserData의 이름으로 nickname 사용
        profileSvg: SvgComponent,
        // 필요하다면 UserData 인터페이스에 memberId: number; 를 추가하고 여기서 part.memberId를 할당할 수 있습니다.
      };
    });
  }, [chatParts]);

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
              <ActiveUser users={usersToDisplay} onProfilePress={handleProfilePress} themeId={themeId} />
            </View>
            <View style={{height: height * 0.05, justifyContent: 'center', width: '100%'}}>
            <View style={[styles.bottomLine, { backgroundColor: bottomLineColor }]} />
            </View>
            <View style={{height: height * 0.05, justifyContent: 'center', width: '100%'}}>
              <ChatFooter onClose={onClose} />
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
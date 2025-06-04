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
import useHomeStore from '@/zustand/stores/HomeStore'; // HomeStore

interface SideBarProps {
  visible: boolean;
  onClose: () => void;
  onProfilePress?: (nickname: string, SvgComponent: React.FC<SvgProps>) => void;
}

interface UserData {
  id: string;
  name: string;
  memberId: number; // 사용자 고유 memberId 추가
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
  const themeId = useHomeStore((state) => state.curThemeId) || 1;
  const chatParts = useChatRoomStore((state) => state.chatParts);

  const createdAtFromStore = useChatRoomStore((state) => state.createdAt); // createdAt 가져오기

  // 기본 색상 설정

  let sidebarCloseColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  let bottomLineColor = themeId === 2 ? "#6DA0E1" : "#F3D4EE";

  const usersToDisplay = useMemo((): UserData[] => {
    if (!chatParts || chatParts.length === 0) {
      return [];
    }

    return chatParts.map((part: ChatParticipant) => {
      let SvgComponent: React.FC<SvgProps>;

      switch (part.nickname) {
        case "한가로운 하나":
          SvgComponent = Hana;
          break;
        case "두 얼굴의 매력 두리":
          SvgComponent = Dori;
          break;
        case "세침한 세찌":
          SvgComponent = Sezzi;
          break;
        case "네모지만 부드러운 네몽":
          SvgComponent = Nemo;
          break;
        case "단호한데 다정한 다오":
          SvgComponent = Dao;
          break;
        case "육감적인 직감파 육땡": // "육땡"을 "육댕"으로 가정 (Yukdaeng SVG)
          SvgComponent = Yukdaeng;
          break;
        default:
          // 이전 로직: part.profile 필드를 사용하여 svgMap에서 찾거나 Hana를 기본값으로 사용
          // SvgComponent = svgMap[part.profile as string] || Hana;
          // 요청에 따라 nickname 기반 매칭이 우선이며, 해당 없을 시 Hana를 기본값으로 사용
          SvgComponent = Hana;
          break;
      }

      return {
        id: String(part.partId), // UserData의 id는 문자열이어야 하므로 변환
        name: part.nickname,     // UserData의 이름으로 nickname 사용
        memberId: part.memberId, // 실제 사용자 memberId
        profileSvg: SvgComponent,
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
            <ChatEventNotice createdAt={createdAtFromStore} />
          </View>
          <View style={styles.bottomSection}>
            <View style={{ flex: 1, width: '100%' }}>
              <ActiveUser users={usersToDisplay} onProfilePress={handleProfilePress} />
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
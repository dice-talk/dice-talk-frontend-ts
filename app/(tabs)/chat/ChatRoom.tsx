import SideBar from "@/app/(tabs)/chat/SideBar"; // ← 만든 사이드바 컴포넌트 import
import HanaSvg from '@/assets/images/chat/hana.svg';
import Nemo from '@/assets/images/chat/nemo.svg';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessageLeft from "@/components/chat/ChatMessageLeft";
import ChatMessageRight from "@/components/chat/ChatMessageRight";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 채팅 메시지 데이터 타입 정의
interface ChatMessage {
  id: number;
  profileImage: any;
  nickname: string;
  message: string;
  time: string;
  isMe?: boolean; // 내가 보낸 메시지인지 여부
}

const ChatRoom = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 샘플 메시지 데이터
  const messages: ChatMessage[] = [
    {
      id: 1,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "다들 어제 개봉한 펩시 vs 콜라 영화 보셨나요?",
      time: "오후 6:58",
      isMe: false
    },
    {
      id: 2,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "정말 재밌어서 추천드려요",
      time: "오후 6:58",
      isMe: false
    },
    {
      id: 3,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "와! 저도 어제 봤는데 사람이 많더라구요",
      time: "오후 6:59",
      isMe: true
    },
    {
      id: 4,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "저는 펩시파에요",
      time: "오후 6:59",
      isMe: true
    },
    {
      id: 5,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "다오님은요?",
      time: "오후 6:59",
      isMe: true
    },
  ];

  return (
    <View style={styles.container}>
        {/* ChatHeader 블러 효과 */}
        {sidebarOpen && (
          <BlurView 
            intensity={20} 
            tint="dark" 
            style={[
              StyleSheet.absoluteFill, 
              { zIndex: 3 }
            ]} 
          />
        )}

        <View style={[styles.headerContainer, { zIndex: sidebarOpen ? 2 : 3 }]}>
            <ChatHeader
                title="하트시그널"
                fontColor="#A45C73"
                backgroundColor="#ffffff"
                onToggleSidebar={() => setSidebarOpen(true)}
            />
        </View>

        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* 메시지 렌더링 */}
            {messages.map((message, index) => {
              // 이전 메시지가 같은 사람인지 확인
              const isConsecutive = index > 0 && 
                messages[index - 1].nickname === message.nickname &&
                messages[index - 1].isMe === message.isMe;
              
              // 이전 메시지와 시간 및 닉네임이 동일한지 확인 (시간 표시 여부 결정)
              let showTime = true;
              if (index < messages.length - 1) {
                const nextMessage = messages[index + 1];
                // 다음 메시지가 같은 사람이고 시간이 같으면 현재 메시지의 시간은 숨김
                if (message.nickname === nextMessage.nickname && 
                    message.time === nextMessage.time &&
                    message.isMe === nextMessage.isMe) {
                  showTime = false;
                }
              }
              
              // 내가 보낸 메시지면 오른쪽, 아니면 왼쪽에 표시
              if (message.isMe) {
                return (
                  <ChatMessageRight
                      key={message.id}
                      profileImage={message.profileImage}
                      nickname={message.nickname}
                      message={message.message}
                      time={message.time}
                      isConsecutive={isConsecutive}
                      showTime={showTime}
                  />
                );
              } else {
                return (
                  <ChatMessageLeft
                      key={message.id}
                      profileImage={message.profileImage}
                      nickname={message.nickname}
                      message={message.message}
                      time={message.time}
                      isConsecutive={isConsecutive}
                      showTime={showTime}
                  />
                );
              }
            })}
        </ScrollView>

        {/* 사이드바 표시 */}
        <SideBar
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.075, // ChatHeader의 높이만큼 여백 추가
    marginBottom: SCREEN_HEIGHT * 0.05, // Footer 높이만큼 여백 추가
  },
  scrollContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.025, // 양쪽 여백 약간 늘림
    paddingBottom: SCREEN_HEIGHT * 0.05, // 하단 패딩 추가하여 마지막 메시지가 잘 보이도록 함
  },
});
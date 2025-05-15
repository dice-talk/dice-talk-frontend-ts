// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/common/GradientBackground";
import GradientLine from "@/components/common/GradientLine";
import LogoutButton from "@/components/profile/LogoutButton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
import { getMemberInfo } from "@/api/memberApi";

type MemberInfo = {
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
  };

export default function ProfileScreen() {
  //const { memberId } = useMemberStore();

//   useEffect(() => {
//     getMemberInfo(memberId);
//   }, [memberId]);
  // ✅ 로컬 상태로 memberInfo 관리
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    nickname: "",
    profileImage: "",
    diceCount: 0,
    isInChat: false,
  });

useEffect(() => {
    const fetchMemberInfo = async () => {
      const memberId = 1; // 테스트용 memberId, 실제로는 로그인된 사용자 ID로 대체
      const info = await getMemberInfo(memberId);
      if (info) setMemberInfo(info);
    };

    fetchMemberInfo();
  }, []);


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gradientContainer}>
          <GradientBackground />
        </View>
        <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
                <ProfileHeader {...memberInfo} />
            </View>
                <ProfileInfoCard />
                <GradientLine />
                <LogoutButton />
            </View>
        </ScrollView>
    </View>
  );
}
const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        flex: 1,
      },
      scrollContent: {
        paddingBottom: height * 0.1, // Footer와의 간격 유지
      },
      gradientContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height * 1.5, // 스크롤 전체를 덮도록 설정
      },
      contentContainer: {
        paddingHorizontal: 8, // 좌우 여백 추가
        marginHorizontal: 8, // 여백이 더 명확하도록
        backgroundColor: "rgba(255, 255, 255, 0)", // 배경을 살짝 투명하게 추가
      },
      headerContainer: {
        alignItems: "center",
        paddingTop: height * 0.25, // 그라데이션이 프로필에 자연스럽게 겹치도록
      },
  });


// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/component/common/GradientBackground";
import GradientLine from "@/component/common/GradientLine";
import LogoutButton from "@/component/profile/LogoutButton";
import ProfileHeader from "@/component/profile/ProfileHeader";
import ProfileInfoCard from "@/component/profile/ProfileInfoCard";
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
      <GradientBackground />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <ProfileHeader {...memberInfo} />
        </View>
        <ProfileInfoCard />
        <GradientLine />
        <LogoutButton />
      </ScrollView>
    </View>
  );
}
const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
      paddingHorizontal: 16,
      paddingTop: height * 0.25, // 그라데이션이 프로필에 자연스럽게 겹치도록
    },
    headerContainer: {
      // backgroundColor: "rgba(255, 255, 255, 0.9)", // 제거
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingVertical: 20,
      alignItems: "center",
    },
  });


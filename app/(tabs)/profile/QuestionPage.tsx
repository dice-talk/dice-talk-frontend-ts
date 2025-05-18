// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/profile/GradientBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
import Pagination from "@/components/common/Pagination";
import QuestionList from "@/components/profile/question/QuestionList";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type MemberInfo = {
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
  };

export default function QuestionPage() {
    const router = useRouter();
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

  const handleBack = () => {
    router.back();
  };


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    {/* Header 영역 */}
    <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={28} color="rgba(0, 0, 0, 0.4)" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>나의 문의</Text>
        </View>
    </View>
      <GradientBackground>
        <ProfileHeader {...memberInfo} mode="question" />
      </GradientBackground>
        <View style={[styles.contentContainer, { marginTop: height * 0.3 }]}>
            <QuestionList />
            <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
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
      headerContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
        position: "relative",
        zIndex: 10,
      },
      backButton: {
        position: "absolute",
        left: 16,
        justifyContent: "center",
        alignItems: "center",
      },
      headerTitleContainer: {
        flex: 1,
        alignItems: "center",
      },
      headerTitle: {
        fontSize: 20,
        fontFamily: "Pretendard-Bold",
        color: "#7d7d7d", //"rgba(0, 0, 0, 0.4)",
      },
      contentContainer: {
        paddingHorizontal: 8, // 좌우 여백 추가
        marginHorizontal: 8, // 여백이 더 명확하도록
        backgroundColor: "rgba(255, 255, 255, 0)", // 배경을 살짝 투명하게 추가
      },
  });


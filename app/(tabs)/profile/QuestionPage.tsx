// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/profile/GradientBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
//import { getAnonymousInfo } from "@/api/memberApi";
import Pagination from "@/components/common/Pagination";
import QuestionList from "@/components/profile/question/QuestionList";
//import useAuthStore from "@/zustand/stores/authStore";
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type MemberInfo = {
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
  };

const defaultProfileImageFromQuestionPage = require("@/assets/images/profile/profile_default.png");

export default function QuestionPage() {
    const router = useRouter();
    // const memberId = useAuthStore((state) => state.memberId);

    const storeNickname = useSharedProfileStore((state) => state.nickname);
    const storeProfileImage = useSharedProfileStore((state) => state.profileImage);
    const storeTotalDice = useSharedProfileStore((state) => state.totalDice);
    const storeIsInChat = useSharedProfileStore((state) => state.isInChat);
    // const setSharedProfile = useSharedProfileStore((state) => state.actions.setSharedProfile);
    // const isProfileInitialized = useSharedProfileStore((state) => !!state.nickname);

    const [profileHeaderData, setProfileHeaderData] = useState<MemberInfo>(() => ({
        nickname: storeNickname || "",
        profileImage: storeProfileImage || defaultProfileImageFromQuestionPage,
        diceCount: storeTotalDice || 0,
        isInChat: storeIsInChat || false,
    }));

    // const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // sharedProfileStore의 값이 변경될 때마다 profileHeaderData를 업데이트
        setProfileHeaderData({
            nickname: storeNickname || "",
            profileImage: storeProfileImage || defaultProfileImageFromQuestionPage,
            diceCount: storeTotalDice || 0,
            isInChat: storeIsInChat || false,
        });
    }, [storeNickname, storeProfileImage, storeTotalDice, storeIsInChat]);

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
                    <ProfileHeader {...profileHeaderData} mode="question" />
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


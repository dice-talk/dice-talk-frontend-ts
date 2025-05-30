// src/screens/Profile/ProfileScreen.tsx
import { getAnonymousInfo } from "@/api/memberApi";
import GradientLine from "@/components/common/GradientLine";
import GradientBackground from "@/components/profile/GradientBackground";
import LogoutButton from "@/components/profile/LogoutButton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import useAuthStore from "@/zustand/stores/authStore";
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

// ProfileHeader가 기대하는 데이터 타입은 sharedProfileStore의 타입을 따름

type TabPage = "MyInfoPage" | "QuestionPage" | "UsagePage" | "ChargePage";

// 기본 프로필 이미지 경로 (sharedProfileStore의 기본값과 동기화 고려)
const defaultProfileImage = require("@/assets/images/profile/profile_default.png");

export default function ProfileScreen() {
    const router = useRouter();
    const memberId = useAuthStore((state) => state.memberId); // authStore에서 memberId 가져오기

    // sharedProfileStore에서 프로필 정보 직접 사용
    const nickname = useSharedProfileStore((state) => state.nickname);
    const profileImage = useSharedProfileStore((state) => state.profileImage);
    const totalDice = useSharedProfileStore((state) => state.totalDice);
    const isInChat = useSharedProfileStore((state) => state.isInChat);
    const setSharedProfile = useSharedProfileStore((state) => state.actions.setSharedProfile);
    const isProfileInitialized = useSharedProfileStore((state) => !!state.nickname); // 닉네임으로 초기화 여부 판단 (간단한 예시)

    // 로컬 로딩 상태 (sharedProfileStore가 초기화될 때까지)
    const [isLoading, setIsLoading] = useState(!isProfileInitialized);

    useEffect(() => {
        const fetchAndSetMemberInfo = async () => {
            if (memberId) { // memberId가 있을 때만 API 호출
                setIsLoading(true); // API 호출 시작 시 로딩 상태 true
                console.log(`ProfileScreen: 회원 정보 조회 시도 (memberId: ${memberId})`);
                try {
                    const apiData = await getAnonymousInfo(memberId); // memberId 전달
                    if (apiData) {
                        console.log("ProfileScreen: API 실제 데이터 받음:", apiData);
                        setSharedProfile({
                            nickname: apiData.nickname,
                            profileImage: apiData.profile,
                            totalDice: apiData.totalDice,
                            isInChat: apiData.roomStatus === 'IN_CHAT' || apiData.exitStatus !== "ROOM_EXIT",
                        });
                    } else {
                        console.log("ProfileScreen: API 응답이 없습니다 (getAnonymousInfo).");
                        // 스토어는 이미 기본값을 가지고 있으므로 별도 처리 안 함, 또는 에러 상태 관리
                    }
                } catch (error) {
                    console.error("ProfileScreen: 회원 정보 조회 실패 (getAnonymousInfo):", error);
                    // 에러 발생 시 스토어 값을 초기화하거나, 사용자에게 알림
                } finally {
                    setIsLoading(false); // API 호출 완료 시 로딩 상태 false
                }
            } else {
                console.log("ProfileScreen: memberId 없음. 회원 정보 조회 건너뜀.");
                setIsLoading(false); // memberId가 없으면 로딩할 필요 없음
                // 로그아웃 상태이므로 sharedProfileStore는 clearSharedProfile에 의해 정리되었을 것임
            }
        };

        // 마운트 시 또는 memberId 변경 시 데이터 가져오기
        // (옵션: sharedProfileStore가 이미 초기화되었다면 API 호출 건너뛰기 가능)
        if (!isProfileInitialized || memberId) { // 아직 초기화 안됐거나, memberId가 있어서 다시 가져와야 할 때
             fetchAndSetMemberInfo();
        }
       
    }, [memberId, setSharedProfile, isProfileInitialized]);

    const handleTabPress = (tabName: TabPage) => {
        router.push(`/profile/${tabName}`);
    };

    // 로딩 중 UI
    if (isLoading && memberId) { // memberId가 있는데 로딩 중일 때
        // 짧은 지연을 위해 로딩 중에는 빈 View를 반환합니다.
        return <View style={styles.container_loading} />;
    }
    // 로그아웃 상태 등 memberId가 없을 때 (선택적 UI)
    // 이 경우 sharedProfileStore는 비어있거나 기본값을 가짐
    // ProfileHeader는 기본값으로 렌더링될 것임

    const displayInfo = {
        nickname: nickname || (memberId ? "로딩 중..." : "로그인이 필요합니다"),
        profileImage: profileImage || defaultProfileImage,
        diceCount: totalDice || 0,
        isInChat: isInChat || false,
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <GradientBackground>
                    {/* memberId가 없을 때도 ProfileHeader는 기본값을 보여줄 수 있도록 함 */}
                    <ProfileHeader {...displayInfo} mode="profile" />
                </GradientBackground>
                <View style={[styles.contentContainer, { marginTop: height * 0.41 }]}>
                    <ProfileInfoCard onTabPress={handleTabPress}/>
                    <GradientLine />
                    <LogoutButton />
                </View>
            </ScrollView>
        </View>
    );
}
const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container_loading: { // 로딩 중일 때 사용할 스타일
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: height * 0.1, 
    },
    gradientContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height * 1.5, 
    },
    contentContainer: {
        paddingHorizontal: 8, 
        marginHorizontal: 8, 
        backgroundColor: "rgba(255, 255, 255, 0)", 
    },
    headerContainer: {
        alignItems: "center",
        paddingTop: height * 0.25, 
    },
});


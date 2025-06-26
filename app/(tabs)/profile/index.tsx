// src/screens/Profile/ProfileScreen.tsx
import { getAnonymousInfo, getMemberDetailsForMyInfoPage } from "@/api/memberApi";
import GradientLine from "@/components/common/GradientLine";
import GradientBackground from "@/components/profile/GradientBackground";
import LogoutButton from "@/components/profile/LogoutButton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import { getProfileSvg } from "@/utils/getProfileSvg";
import useAuthStore from "@/zustand/stores/authStore";
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
    const [isLoading, setIsLoading] = useState(true);

    // 화면이 포커스될 때마다 프로필 정보를 다시 불러옵니다.
    useFocusEffect(
        useCallback(() => {
            const fetchProfileInfo = async () => {
                if (!memberId) {
                    console.log('[ProfileScreen] memberId 없음, 정보 조회 중단');
                    setIsLoading(false);
                    return;
                }
                console.log(`--- [ProfileScreen] 👤 프로필 정보 통합 조회 시작 (memberId: ${memberId}) ---`);
                setIsLoading(true);
                try {
                    // [수정] 두 API를 동시에 호출하여 데이터를 조합
                    const [detailsData, anonymousData] = await Promise.all([
                        getMemberDetailsForMyInfoPage(memberId),
                        getAnonymousInfo(memberId)
                    ]);

                    console.log('--- [ProfileScreen] ✅ 상세 정보 응답 (totalDice용) ---', detailsData);
                    console.log('--- [ProfileScreen] ✅ 공개 프로필 응답 (닉네임용) ---', anonymousData);

                    if (detailsData && anonymousData) {
                        const profileSvg = getProfileSvg(anonymousData.nickname);
                        const profileDataToStore = {
                            // 공개 프로필에서 닉네임, 프로필 이미지, 채팅 상태 등 가져오기
                            nickname: anonymousData.nickname,
                            profileImage: profileSvg || anonymousData.profileImage,
                            isInChat: anonymousData.exitStatus ? anonymousData.exitStatus !== "ROOM_EXIT" : false,
                            themeId: anonymousData.themeId,
                            // 상세 정보에서 정확한 totalDice 가져오기
                            totalDice: detailsData.totalDice,
                        };
                        console.log('--- [ProfileScreen] 💾 스토어에 저장할 통합 데이터 ---', profileDataToStore);
                        setSharedProfile(profileDataToStore);
                    } else {
                        console.error("ProfileScreen: 상세 또는 공개 프로필 정보 조회에 실패했습니다.");
                    }
                } catch (error) {
                    console.error("ProfileScreen: 프로필 정보 통합 조회 실패", error);
                } finally {
                    setIsLoading(false);
                    console.log('--- [ProfileScreen] ⏹️ 프로필 정보 조회/처리 완료 ---');
                }
            };

            fetchProfileInfo();
        }, [memberId, setSharedProfile])
    );

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
        <View style={styles.pageContainer}>
            <ScrollView 
                style={styles.contentScrollContainer}
                contentContainerStyle={styles.contentScrollContent}
                showsVerticalScrollIndicator={false}
            >
            <View style={styles.profileAreaContainer}>
                <GradientBackground>
                    <ProfileHeader {...displayInfo} mode="profile" />
                </GradientBackground>
            </View>
                <ProfileInfoCard onTabPress={handleTabPress}/>
                <GradientLine />
                <LogoutButton />
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
    pageContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    profileAreaContainer: {
        // 이 컨테이너는 GradientBackground의 높이만큼을 차지하게 됨
        // 특별한 스타일이 필요 없을 수 있음. 필요시 배경색 등으로 디버깅
        // backgroundColor: 'rgba(255,0,0,0.1)', // 영역 확인용
    },
    contentScrollContainer: {
        flex: 1,
    },
    contentScrollContent: {
        paddingHorizontal: 16,
        paddingBottom: height * 0.12,
    },
});


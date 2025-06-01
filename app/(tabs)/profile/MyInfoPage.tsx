// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/profile/GradientBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
import { getAnonymousInfo, getMemberDetailsForMyInfoPage, updateRegion } from "@/api/memberApi";
import TossAuth from "@/components/common/TossAuth";
import RegionDropDown from "@/components/profile/RegionDropDown";
import MyInfoField from "@/components/profile/myInfoPage/MyInfoField";
// import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore"; // 기존 스토어 제거
import useAuthStore from "@/zustand/stores/authStore"; // authStore 임포트
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore"; // sharedProfileStore 임포트
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
// import { useShallow } from 'zustand/react/shallow'; // shallow 사용 여부 재검토

// ProfileHeader용 데이터 타입은 sharedProfileStore의 타입과 유사하게 사용 가능
// type ProfileHeaderData = {
//     nickname: string;
//     profileImage: any; 
//     diceCount: number;
//     isInChat: boolean;
// };

// MyInfoPage 필드용 상세 정보 타입
type MyDetailedInfo = {
    email: string | null;
    name: string | null;
    birth: string | null;
    gender: 'MALE' | 'FEMALE' | null;
    region: string | null;
    // totalDice, memberStatus, notification 등은 필요시 추가
};

const initialDetailedInfo: MyDetailedInfo = {
    email: null,
    name: null,
    birth: null,
    gender: null,
    region: null,
};

// 기본 프로필 이미지
const defaultProfileImageFromMyInfoPage = require("@/assets/images/profile/profile_default.png");

export default function MyInfoPage() {
    const router = useRouter();
    const memberId = useAuthStore((state) => state.memberId);

    // sharedProfileStore에서 프로필 헤더 정보 및 특정 액션 가져오기
    const nickname = useSharedProfileStore((state) => state.nickname);
    const profileImage = useSharedProfileStore((state) => state.profileImage);
    const totalDice = useSharedProfileStore((state) => state.totalDice);
    const isInChat = useSharedProfileStore((state) => state.isInChat);
    const setSharedProfile = useSharedProfileStore((state) => state.actions.setSharedProfile); // 특정 액션 직접 가져오기

    // MyInfoPage 상세 정보를 위한 로컬 상태
    const [myDetailedInfo, setMyDetailedInfo] = useState<MyDetailedInfo>(initialDetailedInfo);
    const [isLoadingDetailedInfo, setIsLoadingDetailedInfo] = useState(true); // 상세 정보 로딩 상태

    // 지역 드롭다운 관련 상태
    const [showRegionDropDown, setShowRegionDropDown] = useState(false);
    const currentRegion = myDetailedInfo.region || "";
    const selectedCity = currentRegion.split(" ")[0] || "";
    const selectedDistrict = currentRegion.split(" ")[1] || "";

    // ProfileHeader를 위한 데이터 (sharedProfileStore 값 사용)
    const profileHeaderData = {
        nickname: nickname || "로딩 중...",
        profileImage: profileImage || defaultProfileImageFromMyInfoPage,
        diceCount: Number(totalDice || 0),
        isInChat: !!(isInChat || false),
    };

    const [showTossAuth, setShowTossAuth] = useState(false);

    // useEffect for SharedProfile Data (선택적: 최신 정보 강제 동기화용)
    useEffect(() => {
        const fetchSharedProfile = async () => {
            if (memberId) { // memberId가 유효한지 (null이 아닌지) 확인
                console.log(`MyInfoPage: sharedProfileStore 정보 최신화 시도 (memberId: ${memberId})`);
                try {
                    const apiData = await getAnonymousInfo(memberId); // memberId 전달
                    if (apiData) {
                        setSharedProfile({
                            nickname: apiData.nickname,
                            profileImage: apiData.profile,
                            totalDice: apiData.totalDice,
                            isInChat: apiData.roomStatus === 'IN_CHAT' || apiData.exitStatus !== "ROOM_EXIT",
                        });
                        console.log("MyInfoPage: sharedProfileStore 업데이트 완료.");
                    }
                } catch (error) {
                    console.error("MyInfoPage: sharedProfileStore 업데이트 실패:", error);
                }
            } else {
                console.log("MyInfoPage: memberId 없음. sharedProfileStore 정보 최신화 건너뜀.");
            }
        };
        fetchSharedProfile(); 
    }, [memberId, setSharedProfile]);

    // useEffect for Detailed Member Info (/my-info/{member-id})
    useEffect(() => {
        const fetchDetailedInfo = async () => {
            if (memberId) { // memberId가 유효한지 (null이 아닌지) 확인
                console.log(`MyInfoPage: 상세 정보 조회 시도 (memberId: ${memberId})`);
                setIsLoadingDetailedInfo(true);
                try {
                    const detailedApiData = await getMemberDetailsForMyInfoPage(memberId); // memberId 전달
                    if (detailedApiData) {
                        console.log("MyInfoPage: 상세 정보 API 응답 받음:", detailedApiData);
                        setMyDetailedInfo({
                            email: detailedApiData.email,
                            name: detailedApiData.name,
                            birth: detailedApiData.birth,
                            gender: detailedApiData.gender,
                            region: detailedApiData.region,
                        });
                    } else {
                        console.log("MyInfoPage: 상세 정보 API 응답 없음 (memberId 있음).");
                        setMyDetailedInfo(initialDetailedInfo); 
                    }
                } catch (error) {
                    console.error("MyInfoPage: 상세 정보 조회 실패:", error);
                    setMyDetailedInfo(initialDetailedInfo); 
                } finally {
                    setIsLoadingDetailedInfo(false);
                }
            } else {
                 console.log("MyInfoPage: memberId 없음. 상세 정보 조회 불가.");
                 setIsLoadingDetailedInfo(false); 
                 setMyDetailedInfo(initialDetailedInfo); 
            }
        };
        fetchDetailedInfo();
    }, [memberId]);

    // 지역 상태는 myDetailedInfo.region이 변경될 때 자동으로 selectedCity/District가 업데이트됨
    // 별도 useEffect 불필요

    const handleBack = () => {
        router.back();
    };

    const handleAuthSuccess = (userInfo: { name: string; phone: string }) => {
        console.log("MyInfoPage: Toss 인증 성공:", userInfo);
        if (userInfo.name !== myDetailedInfo.name) {
            setMyDetailedInfo(prev => ({
                ...prev,
                name: userInfo.name, 
            }));
            // TODO: 백엔드에 이 변경사항을 업데이트하는 API 호출 필요 (예: updateMemberProfile(memberId, { name: userInfo.name, phone: userInfo.phone }))
            console.log("MyInfoPage: 이름/휴대폰 번호 UI상 업데이트됨. 백엔드 업데이트 필요.");
        }
        setShowTossAuth(false);
    };

    const handleAuthFailure = () => {
        console.log("MyInfoPage: Toss 인증 실패");
        setShowTossAuth(false);
    };

    const handlePasswordChange = () => {
        router.push("/profile/ChangePasswordPage"); // 경로는 실제 프로젝트에 맞게 확인
    };

    const handleRegionChange = async (selectedCityValue: string, selectedDistrictValue: string) => {
        const newRegion = `${selectedCityValue} ${selectedDistrictValue}`;
        console.log("MyInfoPage: 지역 변경 시도 - ", newRegion);
        if (!memberId) { // memberId null 체크
            console.error("MyInfoPage: 지역 변경 실패 - memberId 없음");
            return;
        }
        try {
            const success = await updateRegion(memberId, newRegion); // memberId 전달
            if (success) { 
                setMyDetailedInfo(prev => ({ ...prev, region: newRegion }));
                setShowRegionDropDown(false);
                console.log("MyInfoPage: 지역 변경 성공 및 UI 업데이트됨.");
            } else {
                 console.warn("MyInfoPage: 지역 변경 API는 성공했으나, 응답이 false이거나 예상과 다름.");
            }
        } catch (error) {
            console.error("MyInfoPage: 지역 변경 실패 -", error);
        }
    };
    
    // 로딩 UI 조건 수정: memberId가 있는데 로딩 중이거나, memberId는 있는데 아직 상세 정보가 안 채워졌을 때
    if (memberId && (isLoadingDetailedInfo || !myDetailedInfo.email)) { 
        // 짧은 지연을 위해 로딩 중에는 빈 View를 반환하거나,
        // 매우 짧은 시간 동안만 로딩 인디케이터를 보여줄 수 있습니다.
        // 여기서는 간단히 빈 View를 반환하여 컨텐츠가 준비될 때까지 화면을 비워둡니다.
        return <View style={styles.container_loading} />;
    }
    // memberId가 없는 경우 (로그아웃 상태 등) 로딩 대신 다른 UI를 보여주거나 로그인 페이지로 리디렉션 고려 가능
    if (!memberId && !isLoadingDetailedInfo) { // 로딩이 끝났는데 memberId가 없는 경우
         return (
            <View style={styles.container_loading}> 
                <Text>로그인이 필요합니다.</Text> 
                {/* 로그인 버튼 또는 안내 추가 가능 */}
            </View>
        );
    }

    return (
        <View style={styles.pageContainer}>
            {showTossAuth && (
                <TossAuth 
                    onAuthSuccess={handleAuthSuccess} 
                    onAuthFailure={handleAuthFailure} 
                />
            )}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
            {/* GradientBackground가 헤더보다 먼저 렌더링되도록 순서 변경 */}
            <GradientBackground>
                <ProfileHeader {...profileHeaderData} mode="myInfo" />
            </GradientBackground>

            {/* 고정 헤더: GradientBackground 위에 위치 */}
            <View style={styles.fixedHeaderContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={28} color="rgba(0, 0, 0, 0.4)" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>나의 정보</Text>
                </View>
            </View>
                {/* 
                    컨텐츠 컨테이너의 marginTop 조정 필요. 
                    기존에는 ProfileHeader 아래부터 컨텐츠가 시작되었으므로, 
                    GradientBackground의 높이 + fixedHeader의 높이를 고려해야 함.
                    정확한 값은 ProfileHeader와 fixedHeaderContainer의 실제 렌더링 높이에 따라 달라짐.
                    여기서는 우선 ProfileHeader의 대략적인 높이(예: height * 0.25 또는 0.3)와 
                    fixedHeader의 높이(예: 60-80px)를 감안하여 marginTop을 설정.
                    ProfileHeader가 약 25%~30% 정도 차지하고, fixedHeader는 그 위에 오버레이되므로,
                    ScrollView의 시작점은 GradientBackground (ProfileHeader)의 높이만큼 내려와야 함.
                    fixedHeaderContainer는 absolute이므로 레이아웃 흐름에 영향을 주지 않지만, 
                    내용이 가려지지 않도록 ScrollView의 contentContainerStyle에 paddingTop을 주는 것이 더 적절할 수 있음.
                    우선은 contentContainer의 marginTop으로 조정하고, 필요시 paddingTop로 변경.
                */}
                <View style={[styles.contentContainer]}>
                    <MyInfoField iconName="person-outline" label="이름" value={myDetailedInfo.name ?? ""} editable={false} />
                    <MyInfoField iconName="mail-outline" label="이메일" value={myDetailedInfo.email ?? ""} editable={false} />
                    <MyInfoField iconName="male-female-outline" label="성별" value={myDetailedInfo.gender === 'MALE' ? '남성' : myDetailedInfo.gender === 'FEMALE' ? '여성' : ""} editable={false} />
                    <MyInfoField iconName="calendar-outline" label="생년월일" value={myDetailedInfo.birth ?? ""} editable={false} />
                    <MyInfoField
                        iconName="lock-closed-outline"
                        label="비밀번호"
                        value="********" 
                        editable={true}
                        rightButtonLabel="변경"
                        onPressRight={handlePasswordChange}
                    />
                    { !showRegionDropDown ? (
                        <MyInfoField
                            iconName="map-outline"
                            label="지역"
                            value={myDetailedInfo.region ?? "미설정"} 
                            editable={true}
                            rightButtonLabel={myDetailedInfo.region ? "변경" : "설정"}
                            onPressRight={() => setShowRegionDropDown(true)}
                        />
                    ) : (
                        <RegionDropDown 
                            city={selectedCity} 
                            district={selectedDistrict} 
                            onChange={handleRegionChange} 
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
const { height, width } = Dimensions.get("window");

// StyleSheet에 로딩 컨테이너 스타일 추가
const styles = StyleSheet.create({
    container_loading: { // 로딩 중일 때 사용할 스타일
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
    },
    pageContainer: { // 기존 container -> pageContainer로 변경 (의미 명확화)
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        flex: 1,
        // fixedHeaderContainer가 absolute이므로, ScrollView가 그 아래로 들어가도록 해야 함.
        // ScrollView 자체가 GradientBackground 영역 아래에서 시작하도록 marginTop을 줄 수 있음.
        // 또는 ScrollView는 전체를 차지하고, contentContainerStyle에 paddingTop을 줄 수 있음.
        // 여기서는 ScrollView가 GradientBackground 높이 이후부터 시작하도록 marginTop 설정 시도.
        // GradientBackground의 예상 높이만큼 marginTop을 주거나, 혹은 ProfileHeader의 높이를 가져와야 함.
        // 대략적인 ProfileHeader 높이(화면 높이의 25~30%)를 임시로 설정.
        // 이 값은 GradientBackground 내부의 ProfileHeader 높이에 따라 달라져야 함.
        // ProfileHeader의 mode="myInfo" 일 때의 실제 높이를 확인하고 적용해야 함.
        // 지금은 임시로 0으로 두고, contentContainer의 marginTop/paddingTop으로 조절
    },
    scrollContent: {
        paddingBottom: height * 0.1, 
        // fixedHeaderContainer 높이만큼 paddingTop을 주어 내용이 가려지지 않도록 함.
        // 대략적인 헤더 높이 (예: 60-80px). 여기서는 70으로 가정.
        // 실제 fixedHeaderContainer 높이에 따라 조정 필요.
    },
    fixedHeaderContainer: { // 기존 headerContainer -> fixedHeaderContainer로 변경 및 스타일 수정
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15, // 기존 24에서 약간 줄임 (디자인에 따라 조절)
        position: "absolute", // 화면 상단에 고정
        top: 15,
        left: 0,
        right: 0,
        zIndex: 10, // 다른 요소들 위에 보이도록
        // backgroundColor: 'rgba(255, 255, 255, 0.3)', // 헤더 영역 확인용 (배경 투명도) - 필요시 사용
    },
    backButton: {
        position: "absolute", // fixedHeaderContainer 내부에서 절대 위치
        left: 16,
        // backButton의 높이는 paddingVertical과 아이콘 크기에 의해 결정됨
        // top, bottom, justifyContent, alignItems를 통해 수직 중앙 정렬
        top: 0, 
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: "Pretendard-Bold",
        color: "rgba(0, 0, 0, 0.4)",
    },
    contentContainer: {
        paddingHorizontal: 8, 
        paddingTop: 10,
    },
});
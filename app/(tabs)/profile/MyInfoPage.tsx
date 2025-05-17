// src/screens/Profile/ProfileScreen.tsx
import GradientBackground from "@/components/profile/GradientBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import { useMemberStore } from "@/zustand/stores/memberStore";
import { getAnonymousInfo, updateRegion } from "@/api/memberApi";
import RegionDropDown from "@/components/profile/RegionDropDown";
import MyInfoField from "@/components/profile/myInfoPage/MyInfoField";
import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

type AnonymousInfo = {
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
  };

export default function MyInfoPage() {
    const router = useRouter();
    // ✅ Zustand에서 회원 정보 가져오기
    const memberInfo = useMemberInfoStore((state) => state.memberInfo ?? {});
    const region = memberInfo?.region ?? "";

    // 지역 드롭다운 토글 상태
    const [showRegionDropDown, setShowRegionDropDown] = useState(false);
    // 시/구군 분리
    const [selectedCity, setSelectedCity] = useState(region.split(" ")[0] || "");
    const [selectedDistrict, setSelectedDistrict] = useState(region.split(" ")[1] || "");

//   useEffect(() => {
//     getMemberInfo(memberId);
//   }, [memberId]);
  // ✅ 로컬 상태로 memberInfo 관리
  const [anonymousInfo, setAnonymousInfo] = useState<AnonymousInfo>({
    nickname: "",
    profileImage: "",
    diceCount: 0,
    isInChat: false,
  });

useEffect(() => {
    const fetchMemberInfo = async () => {
      const memberId = 1; // 테스트용 memberId, 실제로는 로그인된 사용자 ID로 대체
      const info = await getAnonymousInfo(memberId);
      if (info) setAnonymousInfo(info);
    };

    fetchMemberInfo();
  }, []);


  const handleBack = () => {
    router.back();
  };

  const handlePhoneAuth = () => {
    console.log("인증하기");
  };

  const handlePasswordChange = () => {
    console.log("비밀번호 변경");
  };

  const handleRegionChange = (city: string, district: string) => {
    setSelectedCity(city);
    setSelectedDistrict(district);
    if (city && district) {
      updateRegion(`${city} ${district}`);
      setShowRegionDropDown(false);
    }
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
                <Text style={styles.headerTitle}>나의 정보</Text>
            </View>
        </View>
      <GradientBackground>
        <ProfileHeader {...anonymousInfo} mode="myInfo" />
      </GradientBackground>
        <View style={[styles.contentContainer, { marginTop: height * 0.31 }]}>
        <MyInfoField iconName="person-outline" label="이름" value={memberInfo.name ?? ""} editable={false} />
        <MyInfoField iconName="mail-outline" label="이메일" value={memberInfo.email ?? ""} editable={false} />
        <MyInfoField iconName="male-outline" label="성별" value={memberInfo.gender ?? ""} editable={false} />
        <MyInfoField iconName="calendar-outline" label="생년월일" value={memberInfo.birth ?? ""} editable={false} />
        <MyInfoField
        iconName="call-outline"
        label="휴대폰"
        value={memberInfo.phone ?? ""}
        editable={false}
        rightButtonLabel="인증하기"
        rightButtonGradient
        onPressRight={handlePhoneAuth}
        />
        <MyInfoField
        iconName="lock-closed-outline"
        label="비밀번호"
        value=""
        editable={true}
        rightButtonLabel="변경"
        onPressRight={handlePasswordChange}
        />
        { !showRegionDropDown ? (
        <MyInfoField
        iconName="map-outline"
        label="지역"
        value={region}
        editable={true}
        rightButtonLabel="변경"
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
        color: "rgba(0, 0, 0, 0.4)",
      },
      contentContainer: {
        paddingHorizontal: 8, // 좌우 여백 추가
        marginTop: height * 0.02
      },
  });

8
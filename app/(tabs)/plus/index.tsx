import GradientHeader from "@/components/common/GradientHeader";
import MenuListItem from "@/components/plus/MenuListItem";
import { router } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

// TODO: 실제 앱 버전 정보는 동적으로 가져오거나, 빌드 시 주입하는 것이 좋습니다.
const APP_VERSION = "0.0.1"; 

export default function PlusPage() {
  const handleNoticeEventPress = () => {
    // TODO: 실제 공지사항/이벤트 페이지 경로로 수정하고 router.push 사용
    router.push("/(tabs)/plus/NoticePage"); // 예시 경로
  };

  const handleSettingsPress = () => {
    // TODO: 실제 설정 페이지 경로로 수정하고 router.push 사용
    router.push("/(tabs)/plus/SettingPage"); // 예시 경로
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="더보기" showBackButton={false} />
      <View style={styles.menuListContainer}>
        <MenuListItem title="공지사항 / 이벤트" onPress={handleNoticeEventPress} />
        <MenuListItem title="설정" onPress={handleSettingsPress} isLastItem={true} />
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.versionText}>v {APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuListContainer: {
    marginTop: 8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#A0A0A0',
  },
});

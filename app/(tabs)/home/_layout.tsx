import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent";
import useHomeStore from "@/zustand/stores/HomeStore";
import { Slot, usePathname, useSegments } from "expo-router"; // usePathname 및 useSegments 임포트
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {
  const pathname = usePathname(); // 현재 경로 가져오기
  const segments = useSegments(); // 현재 경로 세그먼트 가져오기
  const noticesFromStore = useHomeStore((state) => state.notices);

  const eventBannersForDisplay: EventBannerData[] = useMemo(() => {
    if (!noticesFromStore) return [];

    return noticesFromStore
      .filter(notice =>
        notice.noticeStatus === "ONGOING" &&
        notice.noticeType === "EVENT" &&
        notice.noticeImages.some(img => img.thumbnail === true)
      )
      .map(notice => {
        const thumbnailImage = notice.noticeImages.find(img => img.thumbnail === true);
        return {
          id: notice.noticeId,
          imageUrl: thumbnailImage!.imageUrl, // 위에서 some으로 존재를 확인했으므로 ! 사용 가능
          title: notice.title, // EventBannerData 타입에 title이 있으므로 추가
          content: notice.content, // EventBannerData 타입에 content가 있으므로 추가
        };
      });
  }, [noticesFromStore]);

  // LoadingScreen 경로인지 확인합니다.
  // segments 배열은 현재 경로를 나타냅니다. 예: ['(tabs)', 'home', 'LoadingScreen']
  const isDisplayingLoadingScreen =
    segments.length === 3 &&
    segments[0] === '(tabs)' &&
    segments[1] === 'home' &&
    segments[2] === 'LoadingScreen';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* LoadingScreen을 표시하고 있지 않을 때만 EventBannerComponent를 렌더링합니다. */}
        {!isDisplayingLoadingScreen && eventBannersForDisplay.length > 0 && (
          <View style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0}}>
            <EventBannerComponent banners={eventBannersForDisplay} />
          </View>
        )}
        <View style={styles.mainContent}>
          <Slot />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // LoadingScreen의 배경색과 통일
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    // backgroundColor: 'yellow',
  },
  content: {
    flex: 1,
  },
});

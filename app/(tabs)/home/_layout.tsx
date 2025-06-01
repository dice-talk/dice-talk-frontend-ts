import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent";
import useHomeStore from "@/zustand/stores/HomeStore";
import { Slot } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {eventBannersForDisplay.length > 0 && (
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
    backgroundColor: "#fff",
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

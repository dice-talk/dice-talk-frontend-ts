import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventBannerComponent from "@/components/common/EventBannerComponent";

export default function HomeLayout() {

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <EventBannerComponent />
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

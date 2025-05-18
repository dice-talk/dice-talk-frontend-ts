import EventBannerComponent from "@/components/common/EventBannerComponent";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ zIndex: 1 }}>
          <EventBannerComponent />
        </View>
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

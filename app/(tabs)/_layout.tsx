import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../component/footer/Footer";

export default function TabLayout() {
  const [currentTab, setCurrentTab] = useState<string>("index");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname.split("/")[1] || "index";
    setCurrentTab(path);
  }, [pathname]);

  const handleTabPress = (tabName: string) => {
    setCurrentTab(tabName);
    switch (tabName) {
      case "index":
        router.push("/");
        break;
      case "history":
        router.push("/history");
        break;
      case "chat":
        router.push("/chat");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "plus":
        router.push("/plus");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          <View style={styles.content}>
            <Slot />
          </View>
          <Footer currentTab={currentTab} onTabPress={handleTabPress} />
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
  },
  content: {
    flex: 1,
  },
});


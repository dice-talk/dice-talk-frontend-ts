import Footer from "@/components/footer/Footer";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   // ✅ 첫 렌더링에서 /home으로 자동 이동
  //   if (pathname === "/(tabs)" || pathname === "/") {
  //     router.replace("/home");
  //   }

  //   const path = pathname.split("/")[1] || "home";
  //   setCurrentTab(path);
  // }, [pathname]);

  useEffect(() => {
    if (pathname === "/(tabs)" || pathname === "/") {
      setTimeout(() => {
        router.replace("/home");
      }, 0);
    }
  
    const path = pathname.split("/")[1] || "home";
    setCurrentTab(path);
  }, [pathname]);

  const handleTabPress = (tabName: string) => {
    setCurrentTab(tabName);
    switch (tabName) {
      case "home":
        router.push("/home");
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


import DiceFriends from '@/assets/images/home/diceFriends.svg';
import ThemeCarousel from "@/components/home/ThemeCarousel";
import { Dimensions, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const { width, height } = Dimensions.get("window");
  return (
    <View style={styles.container}>
      <ThemeCarousel
        pages={[
          { num: 1, icon: <DiceFriends width={width * 0.5} height={width * 0.5} /> },
          { num: 2, icon: <DiceFriends width={width * 0.5} height={width * 0.5} /> },
          { num: 3, icon: <DiceFriends width={width * 0.5} height={width * 0.5} /> },
        ]}
        pageWidth={width * 0.75}
        gap={16}
        offset={width * 0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
});

export default HomeScreen;

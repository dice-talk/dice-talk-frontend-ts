import diceFriends from '@/assets/images/home/diceFriends.png';
import exLove from '@/assets/images/home/exLoveTheme.png';
import heartSignal from '@/assets/images/home/heartSignalTheme.png';
import MainBackground from '@/assets/images/home/mainBackground.svg';
import ThemeCarousel from "@/components/home/ThemeCarousel";
import { Dimensions, Image, StyleSheet, View } from 'react-native';




const HomeScreen = () => {
  const { width, height } = Dimensions.get("window");
  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <MainBackground 
          width={width} 
          height={height} 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -width/2 }, { translateY: -height/2 }],
            zIndex: -1
          }}
        />
      </View>
      <ThemeCarousel
        pages={[
          { num: 1, icon: <Image source={diceFriends} style={{ width: width * 0.7, height: width * 0.7 }} /> },
          { num: 2, icon: <Image source={exLove} style={{ width: width * 0.7, height: width * 0.7 }} /> },
          { num: 3, icon: <Image source={heartSignal} style={{ width: width * 0.7, height: width * 0.7 }} /> },
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
    // backgroundColor: 'red',
  },
});

export default HomeScreen;

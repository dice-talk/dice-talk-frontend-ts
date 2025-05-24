import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import CountdownTimer from "../common/CountdownTimer";

const ChatMain = () => {
  const [fontsLoaded] = useFonts({
    digital: require('../../assets/fonts/digital-7.ttf'), // 상대 경로로 수정
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B28EF8" />
        <Text>Loading font...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅 종료까지</Text>
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        style={styles.separator}
      />
      <View style={styles.timerWrapper}>
        <CountdownTimer initialSeconds={48 * 60 * 60} fontFamily="digital" />
      </View>
    </View>
  );
};

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.4,
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    alignSelf: 'flex-start',
    marginLeft: width * 0.07,
    marginTop: height * -0.25,
  },
  separator: {
    height: 2,
    width: width * 0.3,
    marginVertical: 12,
    alignSelf: 'flex-start',
    borderRadius: 1,
    marginLeft: width * 0.07,
  },
  timerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
});

export default ChatMain;
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import CountdownTimer from "../common/CountdownTimer";

const ChatMain = () => {
  const handleEnterChat = (themeId: number) => {
    router.push({
      pathname: "/chat/ChatRoom",
      params: { themeId: themeId.toString() },
    });
  };

  const [fontsLoaded] = useFonts({
    digital: require('@/assets/fonts/digital-7.ttf'),
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
      <TouchableOpacity onPress={() => handleEnterChat(1)} style={styles.button}>
        <Text style={styles.buttonText}>입장 (테마 1)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEnterChat(2)} style={styles.button}>
        <Text style={styles.buttonText}>입장 (테마 2)</Text>
      </TouchableOpacity>
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
  button: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#B28EF8",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ChatMain;
import { StyleSheet, View, Text, Dimensions } from "react-native";
import GradientLine from "../common/GradientLine";
import MediumButton from "../profile/myInfoPage/MediumButton";

const ChatMain = () => {
  return (
    <View style={styles.container}>
        <Text>채팅 종료까지</Text>
        <GradientLine />
        <View style={styles.buttonContainer}>
        <MediumButton
                title="입장"
                height={height * 0.06}
                width={width * 0.35}
                fontSize={16}
                size="custom"
                onPress={() => {}}
            />
        </View>
    </View>
  );
};

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.4,
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default ChatMain;
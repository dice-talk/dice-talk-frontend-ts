import EventBannerComponent from "@/components/common/EventBannerComponent";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import ChatMain from "@/components/chat/ChatMain";
import ChatCustomButton from "@/components/chat/ChatCustomButton";
import { useRouter } from "expo-router";
export default function Chat() {
  const router = useRouter();


 
  return (
    <View style={styles.container}>
      <View style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0}}>
        <EventBannerComponent />
      </View>
      <View style={styles.chatMainContainer}>
        <ChatMain />
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: height * 0.35 }}>
      <ChatCustomButton
          label="입장"
          onPress={() => {
            router.push('/chat/ChatRoom');
          }}
          containerStyle={{
            marginBottom: 20,
            borderRadius: 30, // 여기서 굴곡 설정
          }}
          textStyle={{ fontSize: 18 }}
        />
      </View>
    </View>
  );
}


const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatMainContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: height * 0.7,
    bottom: width * -0.1,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    fontFamily: 'digital'
  },
});
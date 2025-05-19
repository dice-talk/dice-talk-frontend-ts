import EventBannerComponent from "@/components/common/EventBannerComponent";
import { StyleSheet, Text, View } from "react-native";
import ChatMain from "@/components/chat/ChatMain";
export default function Chat() {
  return (
    <View style={styles.container}>
      <View style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0}}>
        <EventBannerComponent />
      </View>
      <ChatMain />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
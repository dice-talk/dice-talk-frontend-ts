import { StyleSheet, Text, View } from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: "Pretendard" }}>Chat</Text>
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
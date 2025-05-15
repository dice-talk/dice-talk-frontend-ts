import { StyleSheet, Text, View } from "react-native";

export default function Plus() {
  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: "Pretendard" }}>Plus</Text>
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

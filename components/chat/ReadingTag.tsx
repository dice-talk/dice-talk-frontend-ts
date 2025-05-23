import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

const ReadingTag = () => {
  return (
    <View style={styles.container}>
      <Text>ReadingTag</Text>
    </View>
  );
};

export default ReadingTag;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
  },
});
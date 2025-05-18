import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

type QuestionPage = "QuestionRegisterPage"

export default function GradientButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const router = useRouter();

  const handlePress = (page: QuestionPage) => {
    router.push({ pathname: `/profile/question/${page}` });
  };

  return (
    <Pressable onPress={() => handlePress("QuestionRegisterPage")} style={styles.buttonWrapper}>
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: "center",
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#B19ADE",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Pretendard-Bold",
    fontSize: 15,
  },
});
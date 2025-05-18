// src/components/question/QuestionItem.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface QuestionItemProps {
  questionId: number;
  title: string;
  date: string;
  answered: boolean;
}

export default function QuestionItem({ title, date, answered, questionId }: QuestionItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/profile/question/QuestionDetailPage?questionId=${questionId}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
          {/* 위쪽 Gradient Line */}
          <View style={styles.gradientBorder}/>

        <View style={styles.row}>
          <View style={styles.titleContainer}>
            <Text
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              [Title] {title}
            </Text>
          </View>
          <View style={styles.rightContainer}>
          {answered ? (
          <LinearGradient
            colors={["rgba(178, 142, 248, 0.4)", "rgba(244, 118, 229, 0.4)"]}
            style={styles.answeredBadge}
          >
            <Text style={styles.answeredText}>답변완료</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.date} />
        )}
            <Text style={styles.date}> {date}</Text>
          </View>
        </View>
        {/* 아래쪽 Gradient Line */}
        <View style={styles.gradientBorder}>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    //paddingHorizontal: 8,
    //paddingVertical: 12,
  },
  gradientBorder: {
    width: "100%",
    borderWidth: 0.3, // ✅ 0.3px Border 적용
    borderColor: "#B28EF8",
    //borderRadius: 0.5,
  },
  gradientLine: {
    height: 3,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 55,
    marginVertical: 4,
  },
  titleContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    width: "65%",
  },
  title: {
    fontSize: 16,
    color: "rgba(0,0,0,0.6)",
    fontFamily: "Pretendard-Bold",
    textAlign: "left",
  },
  rightContainer: {
    width: 90,
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 48,
    marginLeft: 12,
  },
  answered: {
    fontSize: 13,
    color: "#B28EF8",
    fontFamily: "Pretendard",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    fontFamily: "Pretendard",
    marginTop: 4,
  },
  answeredBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-end",
    borderRadius: 16,
  },
  answeredText: {
    fontSize: 11,
    fontFamily: "Pretendard",
    color: "rgba(0,0,0,0.6)",
  },
});

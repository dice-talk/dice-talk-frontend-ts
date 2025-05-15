// src/components/Profile/ProfileInfoCard.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import Charge from "../../assets/images/profile/charge.svg";
import Inquiry from "../../assets/images/profile/inquiry.svg";
import MyInfo from "../../assets/images/profile/myInfo.svg";
import Usage from "../../assets/images/profile/usage.svg";

type TabPage = "MyInfoPage" | "QuestionPage" | "UsagePage" | "ChargePage";

export default function ProfileInfoCard({ onTabPress }: { onTabPress: (tabName: TabPage) => void }) {

  const handleTabPress = (tabName: TabPage) => {
    onTabPress(tabName);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={() => handleTabPress("MyInfoPage")}>
        <MyInfo />
        <Text style={styles.cardText}>나의 정보</Text>
      </Pressable>
      <Pressable style={styles.card} onPress={() => handleTabPress("QuestionPage")}>
        <Inquiry />
        <Text style={styles.cardText}>나의 문의 조회</Text>
      </Pressable>
      <Pressable style={styles.card} onPress={() => handleTabPress("UsagePage")}>
        <Usage />
        <Text style={styles.cardText}>DICE 사용 내역</Text>
      </Pressable>
      <Pressable style={styles.card} onPress={() => handleTabPress("ChargePage")}>
        <Charge />
        <Text style={styles.cardText}>DICE 충전하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  card: {
    width: "46%",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#F9F9FF",
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#B19ADE",
  },
  cardText: {
    fontFamily: "Pretendard",
    marginTop: 8,
    textAlign: "center",
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.7)",
  },
});

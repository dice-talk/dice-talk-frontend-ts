// src/components/Profile/ProfileInfoCard.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import Charge from "../../assets/profile/charge.svg";
import Inquiry from "../../assets/profile/inquiry.svg";
import MyInfo from "../../assets/profile/myInfo.svg";
import Usage from "../../assets/profile/usage.svg";

export default function ProfileInfoCard() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.card}>
        <MyInfo />
        <Text>나의 정보</Text>
      </Pressable>
      <Pressable style={styles.card}>
        <Inquiry />
        <Text>나의 문의 조회</Text>
      </Pressable>
      <Pressable style={styles.card}>
        <Usage />
        <Text>DICE 사용 내역</Text>
      </Pressable>
      <Pressable style={styles.card}>
        <Charge />
        <Text>DICE 충전하기</Text>
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
    width: "45%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9F9FF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#B19ADE",
  },
});

// src/components/question/QuestionItem.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface QuestionItemProps {
  questionId: number;
  title: string;
  createAt: string; // "YYYY-MM-DDTHH:mm:ss" 형식으로 예상
  answered: boolean;
}

export default function QuestionItem({ title, createAt, answered, questionId }: QuestionItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/profile/question/QuestionDetailPage?questionId=${questionId}`);
  };

  // 날짜 형식을 "등록일 : YYYY-MM-DD"로 변경
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `등록일 : ${year}-${month}-${day}`;
    } catch (e) {
      console.error("날짜 형식 변환 오류:", e);
      return `등록일 : ${dateString.split('T')[0] || ''}`; // 원본 날짜의 날짜 부분만 사용
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        {/* 위쪽 구분선 - 이미지는 단순한 선으로 보임, Gradient 대신 View 사용 */}
        <View style={styles.separatorLine} />

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
            {answered && ( // 답변 완료 시에만 배지 표시
              <LinearGradient
                colors={["rgba(178, 142, 248, 0.4)", "rgba(244, 118, 229, 0.4)"]}
                style={styles.answeredBadge}
              >
                <Text style={styles.answeredText}>답변완료</Text>
              </LinearGradient>
            )}
            {/* 등록일은 항상 표시 */}
            <Text style={styles.date}>{formatDate(createAt)}</Text>
          </View>
        </View>
        {/* 아래쪽 구분선 */}
        <View style={styles.separatorLine} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 4, // 이미지상 항목간 간격이 없어보임
    backgroundColor: "#fff",
    // borderRadius: 12, // 이미지에서는 borderRadius가 없어보임
    // overflow: "hidden", // borderRadius와 함께 사용
    paddingHorizontal: 16, // 좌우 패딩 추가 (이미지 참고)
    // paddingVertical: 12, // row minHeight로 조절되므로 일단 제거
  },
  // gradientBorder: { // 이 스타일은 separatorLine으로 대체
  //   width: "100%",
  //   borderWidth: 0.3, 
  //   borderColor: "#B28EF8",
  // },
  separatorLine: { 
    height: 0.7, // 두께 0.5로 변경
    width: "100%",
    backgroundColor: "#B28EF8", // 보라색으로 변경
  },
  // gradientLine: { // 사용 안 함
  //   height: 3,
  //   width: "100%",
  // },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // title과 rightContainer를 양끝으로
    width: "100%",
    minHeight: 70, // 이미지상 아이템 높이와 유사하게
    paddingVertical: 8, // 내부 상하 여백
  },
  titleContainer: {
    flex: 1, // 남은 공간을 모두 차지하도록
    justifyContent: "center",
    marginRight: 8, // 오른쪽 요소와의 간격
  },
  title: {
    fontSize: 15, // 이미지와 유사하게 조정
    color: "rgba(0,0,0,0.7)", // 약간 더 진하게
    fontFamily: "Pretendard-Medium", // Bold 대신 Medium 시도
    textAlign: "left",
  },
  rightContainer: {
    // width: 90, // 고정 너비 대신 내용에 맞게
    alignItems: "flex-end",
    justifyContent: "center", // 답변 배지와 날짜를 중앙 정렬 (수직)
    // height: 48, // row의 minHeight에 따름
    // marginLeft: 12, // titleContainer에서 marginRight로 조절
  },
  // answered: { // answeredBadge 내부의 answeredText로 대체
  //   fontSize: 13,
  //   color: "#B28EF8",
  //   fontFamily: "Pretendard",
  //   marginBottom: 4,
  // },
  date: {
    fontSize: 12,
    color: "rgba(0,0,0,0.5)", // 이미지와 유사하게
    fontFamily: "Pretendard-Regular", // 기본 폰트로
    marginTop: 4, // 답변 배지와의 간격 (답변 배지가 있을 경우)
    textAlign: 'right', // 우측 정렬
  },
  answeredBadge: {
    // marginTop: 4, // rightContainer에서 중앙 정렬하므로 불필요할 수 있음
    paddingHorizontal: 8, // 패딩 조정
    paddingVertical: 3,   // 패딩 조정
    alignSelf: "flex-end",
    borderRadius: 12, // 이미지와 유사하게 약간 둥글게
    marginBottom: 4, // 날짜와의 간격
  },
  answeredText: {
    fontSize: 10, // 이미지와 유사하게 조정
    fontFamily: "Pretendard-Medium",
    color: "rgba(0,0,0,0.6)", // 이미지와 유사하게
  },
});


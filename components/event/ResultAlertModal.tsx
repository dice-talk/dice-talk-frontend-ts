import HeartBoardCloseSvg from "@/assets/images/event/heartBoardClose.svg";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface ResultAlertModalProps {
  onConfirm?: () => void;
}

const ResultAlertModal = ({ onConfirm }: ResultAlertModalProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>선택의 결과를 확인해주세요</Text>
      <HeartBoardCloseSvg width={width * 0.95} height={width * 0.95} />
      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={onConfirm}
      >
        <Text style={styles.confirmButtonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultAlertModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    position: "absolute",
    top: height * 0.47,
    zIndex: 10,
    color: "#F9BCC1",
  },
  confirmButton: {
    backgroundColor: '#F9BCC1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    position: "absolute",
    bottom: height * 0.25,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
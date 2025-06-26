import { Modal, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import MediumButton from "../profile/myInfoPage/MediumButton"; // LongButton의 Props 타입이 정의되어 있다고 가정합니다.

interface EmailExistModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onFindEmail: () => void;
}

export default function EmailExistModal({
  visible,
  onClose, // onClose는 현재 UI에서 사용되지 않지만, 모달의 일반적인 prop이므로 유지합니다.
  onLogin,
  onFindEmail,
}: EmailExistModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose} // Android 뒤로가기 버튼 등으로 모달 닫기 시 호출
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.message}>이미 존재하는 이메일입니다.</Text>

          {/* LongButton에 style prop이 있다면 전달할 수 있도록 타입을 확장할 수 있습니다. */}
          <MediumButton title="로그인하러 가기" onPress={onLogin} />
        </View>
      </View>
    </Modal>
  );
}

interface Styles {
  overlay: StyleProp<ViewStyle>;
  modalBox: StyleProp<ViewStyle>;
  message: StyleProp<ViewStyle>; // Text 스타일은 ViewStyle과 다를 수 있으나, 여기서는 Text에 직접 적용되므로 ViewStyle의 하위 집합으로 간주
  button: StyleProp<ViewStyle>; // 현재 코드에서는 직접 사용되지 않음 (LongButton 내부 스타일로 가정)
  buttonText: StyleProp<ViewStyle>; // Text 스타일
  buttonMargin: StyleProp<ViewStyle>; // 버튼 간격용 스타일 추가
}

const styles = StyleSheet.create ({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 24, // 좌우 패딩
    paddingVertical: 30, // 상하 패딩 (버튼과의 간격 확보를 위해 조정)
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5, // Android 그림자
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 24, // 버튼과의 간격 확보
    textAlign: "center",
  },
  button: { // LongButton이 자체 스타일을 가지고 있다면 이 스타일은 필요 없을 수 있습니다.
    width: 200, // LongButton 내부에서 너비를 조절하는 것이 좋습니다.
    paddingVertical: 10,
    borderRadius: 24,
    // marginTop: 10, // buttonMargin으로 대체
    alignItems: "center",
  },
  buttonText: { // LongButton 내부의 Text 스타일과 일치시키거나, LongButton에서 Text를 children으로 받을 때 이 스타일을 적용합니다.
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 10, // 버튼 내부 텍스트 좌우 여백
  },
  buttonMargin: { // LongButton 컴포넌트 자체에 적용할 마진 스타일
    marginTop: 12,
    width: '100%', // 모달 박스 너비에 맞추도록 설정 (LongButton이 width를 받을 수 있어야 함)
  }
});
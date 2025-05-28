import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AlertBox, { dummyAlerts } from "./AlertBox";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AlertsModal = ({ visible, onClose }: AlertsModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.centeredView}>
        <LinearGradient
          colors={["#B28EF8", "#F476E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>알림</Text>
            <ScrollView 
              style={styles.alertScrollView}
              showsVerticalScrollIndicator={false}
            >
              {dummyAlerts.map((alert, index) => (
                <AlertBox
                  key={index}
                  category={alert.category}
                  text={alert.text}
                  read={alert.read}
                />
              ))}
            </ScrollView>
          </View>
        </LinearGradient>
        
        {/* 확인 버튼을 모달 외부 하단에 배치 */}
        <View style={styles.externalButtonContainer}>
          <Pressable onPress={onClose} style={styles.buttonWrapper}>
            <LinearGradient
              colors={["#c2a7f7", "#f29ee8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>확인</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default AlertsModal;

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  modalView: {
    width: width * 0.9,
    height: height * 0.6,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  alertScrollView: {
    flex: 1,
    width: "100%",
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  externalButtonContainer: {
    position: "absolute",
    bottom: height * 0.2,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonWrapper: {
    width: width * 0.35,
    padding: 5,
    borderRadius: 20,
  },
  button: {
    padding: 15,
    borderRadius: 30,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
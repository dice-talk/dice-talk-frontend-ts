import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import AlertBox, { AlertCategory, dummyAlerts } from "./AlertBox";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 편집 아이콘
const EditIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

// 전체 삭제 아이콘
const DeleteAllIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M10 11v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Alert {
  category: AlertCategory;
  text: string;
  read: boolean;
}

const AlertsModal = ({ visible, onClose }: AlertsModalProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(dummyAlerts);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDeleteAlert = (index: number) => {
    setAlerts(prevAlerts => prevAlerts.filter((_, i) => i !== index));
  };

  const handleDeleteAll = () => {
    setAlerts([]);
    setIsEditMode(false);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

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
            {/* 헤더 */}
            <View style={styles.headerContainer}>
              <Text style={styles.modalTitle}>알림</Text>
              {alerts.length > 0 && (
                <View style={styles.headerButtonsContainer}>
                  {isEditMode ? (
                    <>
                      <TouchableOpacity 
                        style={styles.deleteAllHeaderButton}
                        onPress={handleDeleteAll}
                        activeOpacity={0.7}
                      >
                        <DeleteAllIcon />
                        <Text style={styles.deleteAllHeaderText}>전체삭제</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={toggleEditMode}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={toggleEditMode}
                      activeOpacity={0.7}
                    >
                      <EditIcon />
                      <Text style={styles.editButtonText}>편집</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* 편집 모드 컨트롤 */}
            
            {/* 알림 목록 */}
            <ScrollView 
              style={styles.alertScrollView}
              showsVerticalScrollIndicator={false}
            >
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <View key={index} style={styles.alertItemContainer}>
                    <View style={styles.alertBoxWrapper}>
                      <AlertBox
                        category={alert.category}
                        text={alert.text}
                        read={alert.read}
                        onDelete={() => handleDeleteAlert(index)}
                        showDeleteButton={isEditMode}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>알림이 없습니다</Text>
                  <Text style={styles.emptySubText}>새로운 알림이 오면 여기에 표시됩니다</Text>
                </View>
              )}
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
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  editButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  alertScrollView: {
    flex: 1,
    width: "100%",
  },
  alertItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertBoxWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
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
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteAllHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteAllHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
});
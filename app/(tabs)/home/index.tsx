import { getNotifications } from '@/api/AlertApi';
import AlertIcon from '@/assets/images/chat/chatNoticeOnOff.svg';
import DiceFriends from '@/assets/images/home/diceFriends.png';
import DiceFriendsIcon from '@/assets/images/home/diceFriendsIcon.svg';
import ExLoveIcon from '@/assets/images/home/exLoveIcon.svg';
import ExLove from '@/assets/images/home/exLoveTheme.png';
import HeartSignalIcon from '@/assets/images/home/heartSignalIcon.svg';
import HartSignal from '@/assets/images/home/heartSignalTheme.png';
import MainBackground from '@/assets/images/home/mainBackground.svg';
import AlertModal from '@/components/Alerts/AlertsModal';
import CustomBottomSheet from '@/components/common/CustomBottomSheet';
import ThemeCarousel from "@/components/home/ThemeCarousel";
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

const HomeScreen = () => {
  const { width, height } = Dimensions.get("window");
  // 바텀시트 표시 여부
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  // AlertModal 표시 여부
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  // 알림 목록 상태 추가
  const [fetchedNotifications, setFetchedNotifications] = useState([]);

  // 바텀시트 파라미터 설정
  const [bottomSheetParams, setBottomSheetParams] = useState<{
    backgroundColor: string;
    status: string;
    icon: React.ReactNode;
    title: string;
    lineColor: string;
    description: string;
  }>({
    backgroundColor: '#f0f0f0',
    status: 'THEME_PLANNED',
    icon: null,
    title: '',
    lineColor: '#ccc',
    description: '',
  });

  const handleImageClick = (num: number) => {
    // 파라미터 숫자에 따라 바텀시트 설정
    const params = {
      1: {
        backgroundColor: '#6DA0E1',
        status: 'THEME_ON',
        icon: <DiceFriendsIcon width={width * 0.13} height={width * 0.13} />,
        title: '다이스프렌즈',
        lineColor: 'white',
        description: `다이스 프렌즈에 참여하는 플레이어는 6명 입니다.

다이즈 프렌즈는 2일간 진행됩니다.

24시간 후 단 한명의 플레이어에게 메세지를 보낼 수 있습니다.
(단, 발신자의 닉네임은 표시되지 않습니다.)`,
      },
      2: {
        backgroundColor: '#DEC2DB',
        status: 'THEME_ON',
        icon: <HeartSignalIcon width={width * 0.13} height={width * 0.13} />,
        title: '하트시그널',
        lineColor: '#a47bd6',
        description: `하트 시그널하우스에 입주하는 플레이어는 6명 입니다.

하트 시그널 하우스에 입주한 날부터 2일간 진행됩니다.

24시간 후 단 한명의 플레이어에게 메세지를 보낼 수 있습니다.
(단, 발신자의 닉네임은 표시되지 않습니다.)`,
      },
      3: {
        backgroundColor: '#EDE2E0',
        status: 'THEME_PLANNED',
        icon: <ExLoveIcon width={width * 0.13} height={width * 0.13} />,
        title: '환승연애',
        lineColor: '#ffffff',
        description: '2025. 04. 05일에 open 됩니다!',
      },
      // 만약 null이 들어 올 경우 기본 설정
    }[num] || {
      backgroundColor: '#ffffff',
      status: 'THEME_PLANNED',
      icon: null,
      title: 'Default',
      lineColor: '#000000',
      description: 'Default description',
    };
    // 바텀시트 파라미터 설정
    setBottomSheetParams(params);
    // 바텀시트 표시
    setBottomSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <MainBackground 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -width/2 }, { translateY: -height/2 }],
            zIndex: -1
          }}
        />
      </View>
      <View style={styles.alertIconContainer}>
        <TouchableOpacity
          onPress={async () => {
            try {
              const notifications = await getNotifications(1, 10);
              console.log("알림 목록:", notifications);
              setFetchedNotifications(notifications);
              setAlertModalVisible(true);
            } catch (error) {
              console.error("알림 조회 실패:", error);
              setFetchedNotifications([]);
              setAlertModalVisible(true);
            }
          }}
        >
          <AlertIcon color="#F9BCC1" />
        </TouchableOpacity>
        {fetchedNotifications.length > 0 && (
          <View style={styles.redDot} />
        )}
      </View>
      <View style={{ flex: 1, marginTop: height * 0.2 }}>
         {/* 케러셀 */}
      <ThemeCarousel
        pages={[
          { num: 1, icon: (
            // 캐러셀 이미지 클릭 시 바텀시트 표시
            <TouchableOpacity onPress={() => handleImageClick(1)}>
              <Image source={DiceFriends} style={{ width: width * 0.7, height: width * 0.7 }} />
            </TouchableOpacity>
          ) },
          { num: 2, icon: (
            <TouchableOpacity onPress={() => handleImageClick(2)}>
              <Image source={HartSignal} style={{ width: width * 0.7, height: width * 0.7 }} />
            </TouchableOpacity>
          ) },
          { num: 3, icon: (
            <TouchableOpacity onPress={() => handleImageClick(3)}>
              <Image source={ExLove} style={{ width: width * 0.7, height: width * 0.7 }} />
            </TouchableOpacity>
          ) },
        ]}
        pageWidth={width * 0.75}
        gap={16}
        offset={width * 0.1}
      />
      </View>
     
      <Modal
        visible={isBottomSheetVisible}
        transparent
        animationType="slide" // slide도 가능
        onRequestClose={() => setBottomSheetVisible(false)} // Android 뒤로가기용
      >
        {isBottomSheetVisible && (
        <View style={styles.overlay}>
          {/* 🔹 전체 화면에 blur 효과 */}
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
          {/* 🔹 바텀시트 */}
          <View style={styles.bottomSheetWrapper}>
            <CustomBottomSheet
              isPlanned={bottomSheetParams.status === 'THEME_PLANNED'}
              backgroundColor={bottomSheetParams.backgroundColor}
              icon={bottomSheetParams.icon}
              title={bottomSheetParams.title}
              lineColor={bottomSheetParams.lineColor}
              description={bottomSheetParams.description}
              onClose={() => setBottomSheetVisible(false)}
            />
          </View>
        </View>
        )}
      </Modal>
      
      <AlertModal 
        visible={isAlertModalVisible}
        onClose={() => setAlertModalVisible(false)}
        notifications={fetchedNotifications} // 추가
      />
    </View>
  );
};

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,     // 다른 요소보다 위에 배치
    elevation: 10,   // Android용 (zIndex 보완)
  },
  overlay: {
    position: 'absolute',
    top: 0,  // 전체 화면 덮기
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 10,
    justifyContent: 'flex-end', // 바텀시트를 아래로 정렬
  },
  alertIconContainer: {
    position: 'absolute',
    width: width * 0.1,
    height: width * 0.1,
    top: height * 0.2,
    right: width * 0.03,
    zIndex: 100,
    elevation: 10,
  },
  redDot: {
    position: 'absolute',
    top: -4,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#FF4757',
  },
});

export default HomeScreen;

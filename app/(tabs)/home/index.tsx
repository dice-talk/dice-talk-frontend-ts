import { getNotifications, getUnreadNotificationCount } from '@/api/AlertApi';
import { getHomeApi } from '@/api/HomeApi';
import useHomeStore, { Theme } from '@/zustand/stores/HomeStore'; // HomeStore 및 Theme 타입 임포트
import AlertIcon from '@/assets/images/chat/chatNoticeOnOff.svg';
import DiceFriendsIcon from '@/assets/images/home/diceFriendsIcon.svg';
import ExLoveIcon from '@/assets/images/home/exLoveIcon.svg';
import HeartSignalIcon from '@/assets/images/home/heartSignalIcon.svg';
import MainBackground from '@/assets/images/home/mainBackground.svg';
import AlertModal from '@/components/Alerts/AlertsModal';
import CustomBottomSheet from '@/components/common/CustomBottomSheet';
import AccountBannedModal from '@/components/home/AccountBannedModal';
import ThemeCarousel from "@/components/home/ThemeCarousel";
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useChatOptionActions } from '@/zustand/stores/ChatOptionStore'; // ChatOptionStore 액션 임포트
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// 실제 앱에서는 API 응답이나 전역 상태(Zustand 등)를 통해 받아올 값입니다.
//const MOCK_USER_STATUS = 'MEMBER_BANNED'; // 테스트를 위해 'MEMBER_BANNED' 또는 다른 값으로 변경
const MOCK_USER_STATUS = 'ACTIVE'; 

// const TAB_BAR_HEIGHT_APPROX = Platform.OS === 'ios' ? 80 : 0; // 이 상수는 MainBackground 전체 화면 설정에는 직접 사용되지 않음

const HomeScreen = () => {
  const { width, height } = Dimensions.get("window");
  // 바텀시트 표시 여부
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  // AlertModal 표시 여부
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  // 알림 목록 상태 추가
  const [fetchedNotifications, setFetchedNotifications] = useState([]);
  // 안읽은 알림 개수 상태 추가
  const [unreadCount, setUnreadCount] = useState(0);

  // HomeStore에서 테마 데이터 가져오기
  const themesFromStore = useHomeStore((state) => state.themes);

  // ChatOptionStore에서 액션 가져오기
  const { setThemeId: setChatThemeId } = useChatOptionActions();

  // 안읽은 알림 개수 조회 함수
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count.data.data);
    } catch (error) {
      console.error("🔴 안 읽은 알림 수 조회 실패:", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Home API는 앱 실행 후 최초 한 번만 호출
    const fetchHomeDataOnceOnAppLaunch = async () => {
      // useHomeStore에서 상태와 액션을 가져옵니다.
      // 컴포넌트 외부에서 getState를 사용하거나, 컴포넌트 내부에서 훅을 사용할 수 있습니다.
      // useEffect 내에서는 getState가 더 간결할 수 있습니다.
      const store = useHomeStore.getState();
      const { initialHomeApiCalled } = store;
      const { setInitialHomeApiCalled, setThemes, setNotices, setHasNewNotifications } = store.actions;

      if (!initialHomeApiCalled) {
        try {
          console.log("🚀 Home API 최초 호출 시도 (앱 실행 시 한 번, home/index.tsx)...");
          const homeDataResponse = await getHomeApi();
          // console.log("🏠 Home API 전체 응답 (home/index.tsx - 최초 실행):", homeDataResponse); // 전체 응답 로깅은 필요시 활성화
          console.log("📊 Home API 실제 데이터 (home/index.tsx - 최초 실행):", homeDataResponse.data);
          
          // HomeStore에 데이터 저장
          setThemes(homeDataResponse.data.themes || []);
          setNotices(homeDataResponse.data.notices || []);
          setHasNewNotifications(homeDataResponse.data.hasNewNotifications || false);

          setInitialHomeApiCalled(true); // API 호출 후 플래그를 true로 설정
        } catch (error) {
          console.error("🔴 Home API 최초 호출 실패 (home/index.tsx):", error);
          // 실패 시에도 플래그를 true로 설정하여, 앱의 현재 세션에서 재시도를 방지합니다.
          // 만약 실패 시 재시도 로직이 필요하다면 이 부분을 다르게 처리해야 합니다.
          setInitialHomeApiCalled(true);
        }
      } else {
        console.log("ℹ️ Home API는 이미 최초 호출되었습니다 (플래그 기반, home/index.tsx).");
      }
    };

    fetchHomeDataOnceOnAppLaunch();
  }, []);

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

  const [isBannedModalVisible, setIsBannedModalVisible] = useState(false);

  // 화면이 포커스될 때마다 memberStatus를 확인 (실제로는 로그인 시 또는 앱 시작 시 1회 확인)
  useFocusEffect(
    useCallback(() => {
      // TODO: 실제 memberStatus 확인 로직 (예: API 호출 또는 전역 상태 조회)
      // if (MOCK_USER_STATUS === 'MEMBER_BANNED') {
      //   setIsBannedModalVisible(true);
      // } else {
      //   setIsBannedModalVisible(false); // 다른 상태일 경우 모달 숨김 (선택적)
      // }
      
      // cleanup 함수 (선택적)
      return () => {
        // 예를 들어, 화면을 벗어날 때 특정 로직 수행이 필요하다면 여기에 작성
      };
    }, []) // 의존성 배열이 비어있으므로, 포커스될 때마다 실행
  );

  const handleImageClick = (themeId: number) => {
    if (!themesFromStore) return;

    const clickedTheme = themesFromStore.find(t => t.themeId === themeId);
    if (!clickedTheme) {
      console.warn(`Theme with id ${themeId} not found.`);
      setBottomSheetParams({
        backgroundColor: '#ffffff',
        status: 'THEME_PLANNED',
        icon: null,
        title: '테마 정보 없음',
        lineColor: '#000000',
        description: '선택하신 테마 정보를 불러올 수 없습니다.',
      });
      setBottomSheetVisible(true);
      return;
    }

    let iconComponent: React.ReactNode = null;
    let bgColor = '#f0f0f0';
    let lnColor = '#ccc';

    // themeId에 따라 아이콘, 배경색, 라인색, 설명 매핑
    // API 응답의 themeId: 1 (하트시그널), themeId: 2 (친구찾기/다이스프렌즈), themeId: 3 (환승연애)
    if (clickedTheme.themeId === 2) { // 다이스프렌즈 (API상 친구찾기)
      iconComponent = <DiceFriendsIcon width={width * 0.13} height={width * 0.13} />;
      bgColor = '#6DA0E1';
      lnColor = 'white';
    } else if (clickedTheme.themeId === 1) { // 하트시그널
      iconComponent = <HeartSignalIcon width={width * 0.13} height={width * 0.13} />;
      bgColor = '#DEC2DB';
      lnColor = '#a47bd6';
    } else if (clickedTheme.themeId === 3) { // 환승연애
      iconComponent = <ExLoveIcon width={width * 0.13} height={width * 0.13} />;
      bgColor = '#EDE2E0';
      lnColor = '#ffffff';
    }

    setBottomSheetParams({
      backgroundColor: bgColor,
      status: clickedTheme.themeStatus,
      icon: iconComponent,
      title: clickedTheme.name,
      lineColor: lnColor,
      description: clickedTheme.description, // HomeStore에서 직접 가져온 description 사용
    });
    setBottomSheetVisible(true);

    // ChatOptionStore에 themeId 저장
    setChatThemeId(clickedTheme.themeId);
  };

  // HomeStore에서 가져온 themes 데이터로 캐러셀 페이지 구성
  const carouselPages = themesFromStore
    ? themesFromStore.map((theme: Theme) => ({
        // themeId는 ThemeCarousel 컴포넌트 내부에서 직접 사용되지 않지만,
        // 명확성을 위해 또는 향후 확장을 위해 전달할 수 있습니다.
        // 현재 ThemeCarousel의 pages prop 타입은 { icon: React.ReactNode }[] 입니다.
        icon: (
          <TouchableOpacity onPress={() => handleImageClick(theme.themeId)}>
            <Image source={{ uri: theme.image }} style={styles.carouselImage} />
          </TouchableOpacity>
        ),
      }))
    : [];

  const handleConfirmBannedModal = () => {
    setIsBannedModalVisible(false);
    router.replace('/(onBoard)'); // 마지막 슬래시 제거
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainBackgroundContainer}>
        <MainBackground 
          width="100%"         // 부모 View의 너비에 맞춤
          height="100%"        // 부모 View의 높이에 맞춤
          preserveAspectRatio="xMidYMid slice" // 이미지가 비율을 유지하면서 영역을 덮도록 추가 (필요에 따라 조정)
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
        {unreadCount > 0 && (
          <View style={styles.redDot}>
            <Text style={styles.redDotText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      {carouselPages.length > 0 ? (
        <View style={styles.themeCarouselOuterContainer}>
          <ThemeCarousel
            pages={carouselPages} // 동적으로 생성된 페이지 사용
            pageWidth={width * 0.75}
            gap={16}
            offset={width * 0.1}
          />
        </View>
      ) : (
        <View style={[styles.themeCarouselOuterContainer, styles.loadingContainer]}>
          <Text>테마 정보를 불러오는 중입니다...</Text>
        </View>
      )}
     
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
        notifications={fetchedNotifications}
        onReadComplete={fetchUnreadCount}
      />

      <AccountBannedModal
        isVisible={isBannedModalVisible}
        onConfirm={handleConfirmBannedModal}
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
  mainBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  themeCarouselOuterContainer: {
    position: 'absolute',
    top: height * 0.2,
    left: 0,
    right: 0,
    bottom: height * 0.1,
    justifyContent: 'center',
  },
  loadingContainer: { // 로딩 텍스트를 위한 스타일 추가
    alignItems: 'center',
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
    top: -5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
  redDotText: {
    color: 'white',
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  carouselImage: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'cover', // 이미지가 영역에 맞게 잘리거나 채워지도록 설정
  },
});

export default HomeScreen;

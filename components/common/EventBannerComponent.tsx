import { EventBanner } from "@/types/EventBanner";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from "react-native";
import ThemeCarousel from "@/components/home/ThemeCarousel"
import ThemeCarouselPage from "@/components/home/ThemeCarouselPage"

// 현재 기기의 화면 너비를 가져와서 배너 이미지 너비로 사용
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
const EventBannerComponent = () => {
    // 이벤트 요청 데이터 관리 (배열로 관리함))
  const [eventBanner, setEventBanner] = useState<EventBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     // 이벤트 요청이 성공했을때 응답 데이터를 이벤트 상태관리에 셋팅
//     getEventBanner().then((data) => setEventBanner(data));
//     // 페이지가 열릴때마다 리렌더링
//   }, []);
  useEffect(() => {
    // 목 데이터로 테스트
    const imageMap: Record<string, any> = {
        banner1: require('@/assets/images/eventBanner/eventBanner_01.png'),
        banner2: require('@/assets/images/eventBanner/eventBanner_02.png'),
        banner3: require('@/assets/images/eventBanner/eventBanner_03.png'),
      };
      
      const dummyData = [
        { id: 1, imageUrl: imageMap.banner1, title: '배너 1' },
        { id: 2, imageUrl: imageMap.banner2, title: '배너 2' },
        { id: 3, imageUrl: imageMap.banner3, title: '배너 3' },
      ];
    setEventBanner(dummyData);
  }, []);

  const BANNER_HEIGHT = height * 0.2;
  

  // flatList 스크롤제어를 위한 참조 변수 (리랜더링 되어도 값이 유지된다))
  const flatListRef = useRef<FlatList<EventBanner>>(null);

  // flatList가 드레그 후 손을 뗏을 때 실행되는 함수
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // 현재 스크롤된 가로 위치값 (x좌표)을 가져옴
    const offsetX = event.nativeEvent.contentOffset.x;
    
    // 각 이미지의 너비를 사용하여 현재 인덱스를 계산
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
    
    // 총 길이
    const totalItems = eventBanner.length;

    // 만약 사용자가 마지막 이미지에서 오른쪽으로 스크롤했다면
    if (index === totalItems) {
      // 애니메이션을 사용하여 첫 번째 이미지로 이동
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };
  return (
    <View >
        <View style={[styles.container, { height: BANNER_HEIGHT }]}>
            <FlatList
                style={{ width: width}} // 배너 높이 조정
                ref={flatListRef}
                // 응답 데이버에서 배열 데이터 출력
                data={eventBanner}
                // 각 항목의 고유키 (리액트 최적화))
                keyExtractor={(item) => item.id.toString()}
                
                // 기본은 세로 스크롤인데 가로로 하게 해줌
                horizontal={true}
                // 한 이미지씩 페이지 스크롤 하게 해줌
                pagingEnabled={true}
                // 스크롤 바 보이지 않게 해줌
                showsHorizontalScrollIndicator={false}
                // 각 항목(배너)을 렌더링하는 함수
                renderItem={({ item }) => (
                    // 디바이스 화면에 맞춰 비율로 이미지 크기 조정
                <Image source={ item.imageUrl} style={{ width: width, height: BANNER_HEIGHT}} />
                )}
                // 스크롤 마지막에서 한번더 스크롤시 실행되는 함수 (0번 인덱스로 돌아감))
                onMomentumScrollEnd={onMomentumScrollEnd}
            />
            <View style={styles.pageIndicator}>
                <Text style={styles.pageText}>{currentIndex + 1} / {eventBanner.length}</Text>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,

  },
  imageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 자식 요소의 절대 위치를 위해 필요
  },
  pageIndicator: {
    position: 'absolute',
    top: height * 0.16, // 하단에 위치
    // bottom: height * 0.1, // 하단에 위치
    width: width * 0.18,
    height: height * 0.02,
    right: 10, // 우측에 위치
    backgroundColor: 'rgba(0, 0, 0, 0.129)',
    borderRadius: 10,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center', // 수평 중앙 정렬
    flexDirection: 'row',
    zIndex: 1, // zIndex를 사용하여 앞에 배치

  },
  pageText: {
    color: 'rgba(0, 0, 0, 0.423)',
    fontSize: 12,
  },
});
export default EventBannerComponent;

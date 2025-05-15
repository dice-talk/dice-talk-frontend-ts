import { EventBanner } from "@/types/EventBanner";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";


// 현재 기기의 화면 너비를 가져와서 배너 이미지 너비로 사용
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
const EventBannerComponent = () => {
    // 이벤트 요청 데이터 관리 (배열로 관리함))
  const [eventBanner, setEventBanner] = useState<EventBanner[]>([]);

//   useEffect(() => {
//     // 이벤트 요청이 성공했을때 응답 데이터를 이벤트 상태관리에 셋팅
//     getEventBanner().then((data) => setEventBanner(data));
//     // 페이지가 열릴때마다 리렌더링
//   }, []);
  useEffect(() => {
    // 목 데이터로 테스트
    const dummyData = [
      { id: 1, imageUrl: './assets/images/EventBanner/eventbanner_01.png', title: '배너 1' },
      { id: 2, imageUrl: './assets/images/EventBanner/eventbanner_02.png', title: '배너 2' },
      { id: 3, imageUrl: './assets/images/EventBanner/eventbanner_03.png', title: '배너 3' },
    ];
    setEventBanner(dummyData);
  }, []);
  
  
  // flatList 스크롤제어를 위한 참조 변수 (리랜더링 되어도 값이 유지된다))
  const flatListRef = useRef<FlatList<EventBanner>>(null);

  // flatList가 드레그 후 손을 뗏을 때 실행되는 함수
  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // 현재 스크롤된 가로 위치값 (x좌표)을 가져옴
    const offsetX = event.nativeEvent.contentOffset.x;
    // 마지막 인덱스의 위치를 계산 (총 너비 = (마지막 인덱스) * 화면 너비)
    const maxIndex = Math.round(eventBanner.length - 1) * width;

    // 만약 사용자가 마지막 이미지까지 스크롤한 뒤 한 번 더 오른쪽으로 넘겼다면
    if(offsetX === maxIndex) {
        // 첫번째 이미지(인덱스 0)로 즉시 이동
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    }
  }
  return (
      <View>
        <FlatList
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
              <Image source={{ uri: item.imageUrl }} style={{ width, height }} />
            )}
            // 스크롤 마지막에서 한번더 스크롤시 실행되는 함수 (0번 인덱스로 돌아감))
            onMomentumScrollEnd={onScrollEndDrag}
        />
      </View>
  );
};

export default EventBannerComponent;

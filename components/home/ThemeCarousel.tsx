import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Page from './ThemeCarouselPage';

interface ICarousel {
  gap: number; // 각 페이지 사이의 간격
  offset: number; // 첫 페이지 시작 위치에 대한 여백
  pages: any[]; // 렌더링할 페이지 리스트
  pageWidth: number; // 각 페이지의 너비
}

// 캐러셀 컴포넌트 정의
export default function Carousel({ pages, pageWidth, gap, offset }: ICarousel) {
  // 현재 페이지 index 상태 저장
  const [page, setPage] = useState(0);

  // FlatList의 각 아이템을 어떻게 렌더링할지 정의
  function renderItem({ item }: any) {
    return (
      // 각 페이지에 전달할 스타일
      <Page item={item} style={{ width: pageWidth, marginHorizontal: gap / 2 }} />
    );
  }
  // 스크롤 시 현재 페이지 index 계산
  const onScroll = (e: any) => {
    
    const newPage = Math.round(
      // 현재 스크롤 위치 / (페이지 + 간격) = 현재 페이지 번호)
      e.nativeEvent.contentOffset.x / (pageWidth + gap)
    );
    // 현재 페이지 상태 업데이트
    setPage(newPage);
  };

  return (
    <View style={styles.container}>
      <FlatList
        // 렌더링할 페이지 리스트
        data={pages}
        // 스크롤 속도 설정
        decelerationRate="fast"
        // 가로 스크롤
        horizontal
        // 고유키 생성
        keyExtractor={(item: any, index: number) => `page__${index}`}
        // 스크롤 이벤트 처리
        onScroll={onScroll}
        // 페이지 스크롤 활성화
        pagingEnabled
        // 스크롤 아이템 렌더링
        renderItem={renderItem}
        // 페이지 스크롤 간격 설정
        snapToInterval={pageWidth + gap}
        // 스크롤 정렬 방식
        snapToAlignment="start"
        // 수평 스크롤 인디케이터 숨김
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={{
          paddingHorizontal: offset + gap / 2,
        }}
      />
      <View style={styles.indicatorWrapper}>
        {Array.from({ length: pages.length }, (_, i) => i).map((i) => (
          <View
            key={`indicator_${i}`}
            style={[
              styles.indicator,
              i === page ? styles.focused : styles.unfocused,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  indicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    // backgroundColor: 'blue',
  },
  indicator: {
    marginHorizontal: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  focused: {
    backgroundColor: '#262626',
  },
  unfocused: {
    backgroundColor: '#dfdfdf',
  },
});
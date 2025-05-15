import React, { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import Page from './ThemeCarouselPage';

interface ICarousel {
  gap: number;
  offset: number;
  pages: any[];
  pageWidth: number;
}

export default function Carousel({ pages, pageWidth, gap, offset }: ICarousel) {
  const [page, setPage] = useState(0);

  function renderItem({ item }: any) {
    return (
      <Page item={item} style={{ width: pageWidth, marginHorizontal: gap / 2 }} />
    );
  }

  const onScroll = (e: any) => {
    const newPage = Math.round(
      e.nativeEvent.contentOffset.x / (pageWidth + gap)
    );
    setPage(newPage);
  };

  return (
    <View style={styles.container}>
      <FlatList
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={{
          paddingHorizontal: offset + gap / 2,
        }}
        data={pages}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item: any) => `page__${item.color}`}
        onScroll={onScroll}
        pagingEnabled
        renderItem={renderItem}
        snapToInterval={pageWidth + gap}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
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
  },
  indicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
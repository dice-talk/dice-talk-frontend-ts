import CurrentDiceInfo from '@/components/charge/CurrentDiceInfo';
import DiceProductItem from '@/components/charge/DiceProductItem';
import PurchasableFunctionItem from '@/components/charge/PurchasableFunctionItem';
import GradientHeader from '@/components/common/GradientHeader';
import { LinearGradient } from 'expo-linear-gradient'; // 구분선용
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// 데이터 타입 (PurchasableFunctionItemProps, DiceProductItemProps에서 가져오거나 여기서 간단히 정의)
interface FunctionItemData {
  id: string;
  iconName?: string; // 실제 아이콘 시스템에 따라 달라짐
  title: string;
  diceCost: number;
}

interface ProductItemData {
  id: string;
  diceAmount: string;
  price: number;
}

const { width } = Dimensions.get('window');

// 더미 데이터
const purchasableFunctionsData: FunctionItemData[] = [
  { id: 'func1', iconName: 'doorExit', title: '채팅방 나가기 횟수 추가', diceCost: 7 },
  { id: 'func2', iconName: 'pencilEdit', title: '최종 선택 수정하기', diceCost: 4 },
  // { id: 'func3', iconName: 'some-icon3', title: '다른 기능 아이템', diceCost: 10 }, // 확장성 테스트용
];

const diceProductsData: ProductItemData[] = [
  { id: 'prod1', diceAmount: '10', price: 1100 },
  { id: 'prod2', diceAmount: '30 + 1', price: 3300 },
  { id: 'prod3', diceAmount: '50 + 2', price: 5500 },
  { id: 'prod4', diceAmount: '100 + 5', price: 11000 },
];

export default function ChargePage() {
  const [currentDiceCount] = useState<number>(0); // 이미지 기준 초기값
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleProductSelect = (productId: string | number) => {
    setSelectedProductId(productId.toString());
    // TODO: 실제 충전 로직 연결 (예: 결제 모듈 호출)
    console.log("Selected Product:", productId);
  };

  return (
    <View style={styles.safeAreaContainer}> 
      <GradientHeader title="충전하기" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <CurrentDiceInfo currentDiceCount={currentDiceCount} />

        {/* 다이스로 사용할 수 있는 기능 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>다이스로 사용할 수 있는 기능</Text>
          <FlatList
            horizontal
            data={purchasableFunctionsData}
            renderItem={({ item, index }) => (
              <PurchasableFunctionItem
                iconName={item.iconName} // 실제 아이콘 컴포넌트 또는 로직 필요
                title={item.title}
                diceCost={item.diceCost}
                isFirstItem={index === 0}
                isLastItem={index === purchasableFunctionsData.length - 1}
              />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />} // 아이템 간 간격
            // FlatList 양 끝 contentInset 또는 padding으로 여백 처리 (PurchasableFunctionItem 자체 마진과 중복될 수 있으므로 조정)
            // contentContainerStyle={{ paddingHorizontal: width * 0.025 }} // 이렇게 하면 isFirst/LastItem 마진 불필요
          />
        </View>

        {/* 다이스 충전 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>다이스 충전</Text>
          {/* 여기는 항목이 고정적이므로 FlatList 대신 직접 렌더링도 가능하나, 일관성을 위해 FlatList 사용 */}
          <FlatList
            data={diceProductsData}
            renderItem={({ item }) => (
              <DiceProductItem
                id={item.id}
                diceAmount={item.diceAmount}
                price={item.price}
                onPress={handleProductSelect}
                isSelected={selectedProductId === item.id}
              />
            )}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => (
              <LinearGradient
                colors={['#F0F0F0', '#F0F0F0']}
                style={styles.productItemSeparator}
              />
            )}
            scrollEnabled={false} // 전체 ScrollView가 스크롤하므로 내부 FlatList 스크롤 비활성화
          />
        </View>
      </ScrollView>
    </View>
  );
}

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  safeAreaContainer: { // SafeAreaView 대신 일반 View와 GradientHeader 조합
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: height * 0.12, // 스크롤 영역 하단 여백
  },
  sectionContainer: {
    marginTop: 25,
    // paddingHorizontal: width * 0.05, // 섹션 전체 좌우 패딩 (아이템 내부 패딩과 조율)
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222222',
    marginBottom: 15,
    marginLeft: width * 0.05, // 섹션 제목 좌측 여백
  },
  productItemSeparator: {
    height: 1,
    width: '90%', // 구분선 너비
    alignSelf: 'center',
  },
});
import CurrentDiceInfo from '@/components/charge/CurrentDiceInfo';
import DiceProductItem from '@/components/charge/DiceProductItem';
import PurchasableFunctionItem from '@/components/charge/PurchasableFunctionItem';
import GradientHeader from '@/components/common/GradientHeader';
import useHomeStore, { Item as StoreItem } from '@/zustand/stores/HomeStore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
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
  id: string; // StoreItem의 itemId가 number이므로 string으로 변환 필요
  iconName?: string; // 실제 아이콘 시스템에 따라 달라짐
  title: string;
  diceCost: number;
}

// API 응답에 맞춰 ProductItemData 인터페이스 수정
interface ProductItemData {
  id: number; // productId (number)
  diceAmount: string; // productName
  price: number;
  quantity: number;
  productImage?: string | null; // 타입을 string | null | undefined 로 수정 (string | null 로도 충분할 수 있음)
}

const { width } = Dimensions.get('window');

// [복원] 로컬에서 관리하던 상품 데이터
const diceProducts = [
  { id: 1, diceAmount: '주사위 10개', price: 1200, quantity: 10 },
  { id: 2, diceAmount: '주사위 50개', price: 5900, quantity: 50 },
  { id: 3, diceAmount: '주사위 100개', price: 11000, quantity: 100 },
  { id: 4, diceAmount: '주사위 150개', price: 18000, quantity: 150 },
  { id: 5, diceAmount: '주사위 200개', price: 25000, quantity: 200 },
];

export default function ChargePage() {
  const navigation = useNavigation<any>();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // HomeStore에서 아이템 목록 가져오기
  const storeItems = useHomeStore((state) => state.items);

  // 스토어 아이템을 FunctionItemData 형식으로 변환 (useMemo 사용)
  const purchasableFunctionsData: FunctionItemData[] = useMemo(() => {
    if (!storeItems) return [];
    return storeItems.map((item: StoreItem) => ({
      id: item.itemId.toString(), // itemId를 문자열로 변환
      title: item.itemName,
      diceCost: item.dicePrice,
      iconName: item.itemImage, // itemImage를 iconName으로 사용 (실제 아이콘 표시 로직은 PurchasableFunctionItem에서 처리)
    }));
  }, [storeItems]);

  // [복원] 백엔드 연동 전의 핸들러
  const handleProductSelect = (productId: number) => {
    const selectedProduct = diceProducts.find(p => p.id === productId);
    if (!selectedProduct) {
      console.error("Selected product not found!");
      return;
    }

    // [복원] PaymentScreen으로 기본 상품 정보만 전달
    navigation.navigate('PaymentScreen', {
      productId: selectedProduct.id.toString(),
      productName: selectedProduct.diceAmount,
      price: selectedProduct.price.toString(),
      quantity: selectedProduct.quantity.toString(),
    });
  };

  return (
    <View style={styles.safeAreaContainer}> 
      <GradientHeader title="충전하기" />
      <ScrollView>
        <CurrentDiceInfo currentDiceCount={0} />

        {purchasableFunctionsData.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>다이스로 사용할 수 있는 기능</Text>
            <FlatList
              horizontal
              data={purchasableFunctionsData}
              renderItem={({ item, index }) => (
                <PurchasableFunctionItem
                  iconName={item.iconName} 
                  title={item.title}
                  diceCost={item.diceCost}
                  isFirstItem={index === 0}
                  isLastItem={index === purchasableFunctionsData.length - 1}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />} 
            />
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>다이스로 사용할 수 있는 기능</Text>
            <Text style={styles.emptyText}>사용 가능한 기능 아이템이 없습니다.</Text>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>다이스 충전</Text>
          <FlatList
            data={diceProducts} // [복원] 로컬 상품 데이터 사용
            renderItem={({ item }) => (
              <DiceProductItem
                id={item.id}
                diceAmount={item.diceAmount}
                price={item.price}
                quantity={item.quantity}
                onPress={() => handleProductSelect(item.id)} // [복원] 핸들러 연결
                isSelected={selectedProductId === item.id}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => (
              <LinearGradient
                colors={['#F0F0F0', '#F0F0F0']}
                style={styles.productItemSeparator}
              />
            )}
            scrollEnabled={false} 
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
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    marginLeft: width * 0.05, 
    marginRight: width * 0.05,
  },
});
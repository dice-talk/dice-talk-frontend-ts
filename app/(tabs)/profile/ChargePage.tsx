import { getAllProducts } from '@/api/productApi'; // getAllProducts import
import CurrentDiceInfo from '@/components/charge/CurrentDiceInfo';
import DiceProductItem from '@/components/charge/DiceProductItem';
import PurchasableFunctionItem from '@/components/charge/PurchasableFunctionItem';
import GradientHeader from '@/components/common/GradientHeader';
import { Product } from '@/types/Product'; // Product 타입을 가져옵니다. 실제 경로에 따라 수정이 필요할 수 있습니다.
import useHomeStore, { Item as StoreItem } from '@/zustand/stores/HomeStore'; // HomeStore와 Item 타입 import
import { LinearGradient } from 'expo-linear-gradient'; // 구분선용
import { useEffect, useMemo, useState } from 'react'; // useEffect import
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

export default function ChargePage() {
  const [currentDiceCount] = useState<number>(0); // 이미지 기준 초기값
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null); // ID 타입을 number로 변경
  const [diceProducts, setDiceProducts] = useState<ProductItemData[]>([]); // API로부터 받을 상품 목록 상태

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

  useEffect(() => {
    const fetchDiceProducts = async () => {
      try {
        const response = await getAllProducts(1, 10); // response는 ProductListResponse 타입
        // ProductListResponse가 { data: Product[] } 형태라고 가정하고, response.data가 Product 배열
        if (response && response.data && Array.isArray(response.data)) { 
          const mappedProducts: ProductItemData[] = response.data.map((product: Product) => ({
            id: product.productId,
            diceAmount: product.productName,
            price: product.price,
            quantity: product.quantity,
            productImage: product.productImage, // productImage가 null일 수 있음
          }));
          setDiceProducts(mappedProducts);
        } else {
          console.warn('Products data is not in expected format or is empty:', response);
          setDiceProducts([]);
        }
      } catch (error) {
        console.error('Error fetching dice products:', error);
        setDiceProducts([]);
      }
    };

    fetchDiceProducts();
  }, []); // 컴포넌트 마운트 시 1회 실행

  const handleProductSelect = (productId: string | number) => {
    // API 응답의 productId가 number이므로, selectedProductId도 number로 처리
    setSelectedProductId(typeof productId === 'string' ? parseInt(productId, 10) : productId);
    console.log("Selected Product ID:", productId);
  };

  return (
    <View style={styles.safeAreaContainer}> 
      <GradientHeader title="충전하기" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <CurrentDiceInfo currentDiceCount={currentDiceCount} />

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
          {diceProducts.length > 0 ? (
            <FlatList
              data={diceProducts} // API로부터 받은 상품 목록 사용
              renderItem={({ item }) => (
                <DiceProductItem
                  id={item.id} // productId
                  diceAmount={item.diceAmount} // productName
                  price={item.price}
                  quantity={item.quantity} // quantity 전달
                  onPress={handleProductSelect}
                  isSelected={selectedProductId === item.id}
                />
              )}
              keyExtractor={(item) => item.id.toString()} // id가 number이므로 string으로 변환
              ItemSeparatorComponent={() => (
                <LinearGradient
                  colors={['#F0F0F0', '#F0F0F0']}
                  style={styles.productItemSeparator}
                />
              )}
              scrollEnabled={false} 
            />
          ) : (
            <Text style={styles.emptyText}>충전 가능한 다이스 상품이 없습니다.</Text>
          )}
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
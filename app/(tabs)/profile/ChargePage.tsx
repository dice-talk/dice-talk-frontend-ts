import { getAllItems, Item } from '@/api/ItemApi';
import { requestTossPayment } from '@/api/paymentApi';
import { getAllProducts } from '@/api/productApi';
import CurrentDiceInfo from '@/components/charge/CurrentDiceInfo';
import DiceProductItem from '@/components/charge/DiceProductItem';
import PurchasableFunctionItem from '@/components/charge/PurchasableFunctionItem';
import GradientHeader from '@/components/common/GradientHeader';
import { Product } from '@/types/Product';
import useSharedProfileStore from '@/zustand/stores/sharedProfileStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  iconImage?: string | null; // 실제 아이콘 시스템에 따라 달라짐
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
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [diceProducts, setDiceProducts] = useState<ProductItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  
  // [추가] 기능 아이템 상태
  const [functionItems, setFunctionItems] = useState<FunctionItemData[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  // Zustand 스토어에서 totalDice 가져오기
  const totalDice = useSharedProfileStore((state) => state.totalDice);

  // [수정] 컴포넌트 마운트 시 백엔드에서 상품 및 아이템 목록을 모두 가져옵니다.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 병렬로 API 호출
        const [productsResponse, itemsResponse] = await Promise.all([
          getAllProducts(1, 10),
          getAllItems(1, 10)
        ]);
        
        // 상품 목록 처리
        if (productsResponse && productsResponse.data && Array.isArray(productsResponse.data)) { 
          const mappedProducts: ProductItemData[] = productsResponse.data.map((product: Product) => ({
            id: product.productId,
            diceAmount: product.productName,
            price: product.price,
            quantity: product.quantity,
            productImage: product.productImage,
          }));
          setDiceProducts(mappedProducts);
        } else {
          setDiceProducts([]);
        }

        // 기능 아이템 목록 처리
        if (itemsResponse && itemsResponse.data && Array.isArray(itemsResponse.data)) {
          const mappedItems: FunctionItemData[] = itemsResponse.data.map((item: Item) => ({
            id: item.itemId.toString(),
            title: item.itemName,
            description: item.description,
            diceCost: item.dicePrice,
            iconImage: item.itemImage,
          }));
          setFunctionItems(mappedItems);
        } else {
          setFunctionItems([]);
        }

      } catch (error) {
        Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
        setDiceProducts([]);
        setFunctionItems([]);
      } finally {
        setIsLoading(false);
        setIsItemsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleProductPress = async (item: ProductItemData) => {
    if (isRequestingPayment) return;

    setIsRequestingPayment(true);
    try {
      const requestData = {
        productId: item.id,
        amount: item.price,
        diceAmount: item.quantity, // Swagger에는 diceAmount로 되어있으므로 quantity를 사용
      };
      
      console.log('결제 요청 데이터:', requestData);
      const paymentResponse = await requestTossPayment(requestData);
      console.log('결제 요청 응답:', paymentResponse);

      // 백엔드에서 받은 정보로 PaymentScreen으로 이동
      router.push({
        pathname: '/profile/PaymentScreen',
        params: {
          amount: paymentResponse.amount.toString(), // amount는 숫자로 올 수 있으므로 문자열로 변환
          orderId: paymentResponse.orderId,
          orderName: paymentResponse.orderName,
          clientKey: paymentResponse.clientKey,
          // customerKey는 백엔드 응답에 없으므로, WebView에서 생성하도록 둡니다.
        },
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      Alert.alert('오류', '결제를 준비하는 중에 문제가 발생했습니다.');
    } finally {
      setIsRequestingPayment(false);
    }

  };

  return (
    <View style={styles.safeAreaContainer}> 
      <GradientHeader title="충전하기" />
      {isRequestingPayment && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8A50F6" />
        </View>
      )}
      <ScrollView>
        <CurrentDiceInfo currentDiceCount={totalDice} />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>다이스로 사용할 수 있는 기능</Text>
          {isItemsLoading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : functionItems.length > 0 ? (
            <FlatList
              horizontal
              data={functionItems}
              renderItem={({ item, index }) => (
                <PurchasableFunctionItem
                  iconImage={item.iconImage || undefined}
                  title={item.title}
                  diceCost={item.diceCost}
                  isFirstItem={index === 0}
                  isLastItem={index === functionItems.length - 1}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            />
          ) : (
            <Text style={styles.emptyText}>사용 가능한 기능 아이템이 없습니다.</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>다이스 충전</Text>
          {isLoading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : diceProducts.length > 0 ? (
            <FlatList
              data={diceProducts}
              renderItem={({ item }) => (
                <DiceProductItem
                  id={item.id}
                  diceAmount={item.diceAmount}
                  price={item.price}
                  quantity={item.quantity}
                  onPress={() => handleProductPress(item)}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
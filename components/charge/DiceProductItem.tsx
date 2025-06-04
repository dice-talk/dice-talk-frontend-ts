import DiceLogo from '@/assets/images/profile/dice.svg'; // SVG 경로 확인
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DiceProductItemProps {
  id: string | number; // FlatList key 용도
  diceAmount: string; // 예: "10", "30 + 1" 또는 "다이스 10개"
  price: number;
  quantity: number; // 주문 시 필요할 수량
  onPress?: (id: string | number) => void;
  isSelected?: boolean; // 선택된 상태 표시용 (UX 개선 제안)
}

const { width } = Dimensions.get('window');

const DiceProductItem: React.FC<DiceProductItemProps> = ({
  id,
  diceAmount,
  price,
  quantity, // prop 받기
  onPress,
  isSelected,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // formattedPrice는 더 이상 직접 사용하지 않음
  // const formattedPrice = `₩ ${price.toLocaleString()}`;

  // quantity는 현재 UI에 표시되지 않지만, prop으로 받아둠
  // console.log(`Product ID: ${id}, Quantity: ${quantity}`);

  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <DiceLogo width={width * 0.07} height={width * 0.07} style={styles.diceLogo} />
        <Text style={styles.diceAmountText}>{diceAmount} 다이스</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.currencySymbol}>₩</Text>
        <Text style={styles.priceValue}>{price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
    // 각 아이템 하단 구분선은 ChargePage에서 FlatList의 ItemSeparatorComponent로 추가하거나,
    // 여기서 각 아이템마다 추가할 수 있습니다. 여기서는 ChargePage에서 관리하도록 일단 제외합니다.
    // 또는 아래처럼 각 아이템에 포함시킬 수 있습니다.
    // <LinearGradient
    //   colors={['#EAEAEA', '#EAEAEA']}
    //   start={{ x: 0, y: 0.5 }}
    //   end={{ x: 1, y: 0.5 }}
    //   style={styles.bottomBorder}
    // />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    // borderBottomWidth: 1, // 구분선 옵션 1
    // borderBottomColor: '#F0F0F0', // 구분선 옵션 1
  },
  selectedContainer: { // 상품 선택 시 시각적 강조 (UX 개선 제안)
    backgroundColor: '#F0EFFF', // 연한 보라색 배경
    // borderWidth: 1,
    // borderColor: '#B28EF8',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diceLogo: {
    marginRight: 12,
  },
  diceAmountText: {
    fontSize: 17,
    fontFamily: 'Pretendard-Medium',
    color: '#333333',
  },
  rightSection: {
    flexDirection: 'row', // 원화 기호와 숫자를 가로로 배열
    alignItems: 'center', // 세로 정렬 (선택적)
    minWidth: width * 0.2, // rightSection 전체의 최소 너비를 설정할 수도 있음
  },
  currencySymbol: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#4A4A4A',
    marginRight: 8, // 원화 기호와 숫자 사이의 간격
  },
  priceValue: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#4A4A4A',
    minWidth: width * 0.16, // 숫자 부분의 최소 너비 (조정 가능, 예: width * 0.2에서 기호 너비 제외)
    marginLeft: 2,
  },
  // bottomBorder: { // 구분선 옵션 2 (각 아이템에 포함)
  //   height: 1,
  //   width: '90%', 
  //   alignSelf: 'center',
  // },
});

export default DiceProductItem; 
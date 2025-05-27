import DiceLogo from '@/assets/images/profile/dice.svg'; // SVG 경로 확인
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DiceProductItemProps {
  id: string | number; // FlatList key 용도
  diceAmount: string; // 예: "10", "30 + 1"
  price: number;
  onPress?: (id: string | number) => void;
  isSelected?: boolean; // 선택된 상태 표시용 (UX 개선 제안)
}

const { width } = Dimensions.get('window');

const DiceProductItem: React.FC<DiceProductItemProps> = ({
  id,
  diceAmount,
  price,
  onPress,
  isSelected,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // 가격 포맷팅 (예: 1100 -> "₩ 1,100")
  const formattedPrice = `₩ ${price.toLocaleString()}`;

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
        <Text style={styles.priceText}>{formattedPrice}</Text>
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
  rightSection: {},
  priceText: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#4A4A4A',
  },
  // bottomBorder: { // 구분선 옵션 2 (각 아이템에 포함)
  //   height: 1,
  //   width: '90%', 
  //   alignSelf: 'center',
  // },
});

export default DiceProductItem; 
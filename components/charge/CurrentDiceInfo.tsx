import DiceLogo from '@/assets/images/profile/dice.svg'; // SVG 경로 확인 필요
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface CurrentDiceInfoProps {
  currentDiceCount: number;
}

const { width } = Dimensions.get('window');

const CurrentDiceInfo: React.FC<CurrentDiceInfoProps> = ({ currentDiceCount }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>보유한 다이스</Text>
      <View style={styles.diceDisplay}>
        <DiceLogo width={width * 0.1} height={width * 0.1} style={styles.diceLogo} />
        <Text style={[styles.diceCount, currentDiceCount === 0 && styles.diceCountZero]}>
          {currentDiceCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF', // 페이지 배경과 동일하게 하거나, 카드 형태로 할 경우 다른 색상
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333333',
    marginBottom: 15,
  },
  diceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceLogo: {
    marginRight: 10,
  },
  diceCount: {
    fontSize: 36,
    fontFamily: 'Pretendard-Bold',
    color: '#333333',
  },
  diceCountZero: {
    color: '#AAAAAA', // 보유 다이스가 0일 때의 색상
  },
});

export default CurrentDiceInfo; 
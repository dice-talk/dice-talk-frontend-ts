import TextBox from '@/components/common/TextBox';
import SelectBox from '@/components/home/SelectBox';
import { useState } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import GradientLine from '@/components/common/GradientLine';
import CustomButton from '@/components/home/CustomButton';
const { width, height } = Dimensions.get('window');

const OptionPageAge = () => {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);

  const handleSelect = (box: string) => {
    setSelectedBox(prev => (prev === box ? null : box));
  };

  return (
    <View style={styles.container}>
      <View style={styles.textBoxContainer}>
        <TextBox
          width={width * 0.35}
          height={height * 0.15}
          text="지역"
        />
      </View>
      <View style={styles.textBoxContainer}>
        <TextBox
          width={width * 0.35}
          height={height * 0.15}
          text="나이를 선택해주세요"
        />
      </View>
      <GradientLine />
      <View style={styles.selectBoxContainer}>
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.15} 
          text="서울" 
          isSelected={selectedBox === '서울'}
          onSelect={() => handleSelect('서울')}
        />
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.15} 
          text="랜덤" 
          isSelected={selectedBox === '랜덤'}
          onSelect={() => handleSelect('랜덤')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          label="확인"
          onPress={() => {}}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
    fontWeight: '300', // 'light' 대신 '300' 사용
    marginTop: height * 0.05,
    color: '#b5b5b5',
  },
  selectBoxContainer: {
    marginTop: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: width * 0.15,
    marginLeft: width * 0.05,
  },
  textContainer: {
    marginLeft: width * 0.05,
  },
  textBoxContainer: {
    marginLeft: width * 0.1,
    alignItems: 'flex-start',
  },
  buttonContainer: {
    marginTop: height * 0.15, // 원하는 만큼 조정 (0.15도 가능)
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#b5b5b5',
    fontSize: 17,
    fontWeight: '300',
  }
});
export default OptionPageAge;
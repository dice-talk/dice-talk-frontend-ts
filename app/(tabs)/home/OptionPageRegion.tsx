import TextBox from '@/components/common/TextBox';
import SelectBox from '@/components/home/SelectBox';
import { useState } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import GradientLine from '@/components/common/GradientLine';
import CustomButton from '@/components/home/CustomButton';
import { router } from 'expo-router';
const { width, height } = Dimensions.get('window');

const OptionPageRegion = () => {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);

  const handleSelect = (box: string) => {
    setSelectedBox(prev => (prev === box ? null : box));
  };

  return (
    <View style={styles.container}>
      <View style={styles.textBoxContainer}>
        <TextBox
          width={width * 0.35}
          height={height * 0.11}
          text="지역을 선택해주세요"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>어떤 지역의 사람들과 이야기 하고 싶나요?</Text>
      </View>
      <GradientLine />
      <View style={styles.selectBoxContainer}>
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text="서울" 
          isSelected={selectedBox === '서울'}
          onSelect={() => handleSelect('서울')}
        />
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text="랜덤" 
          isSelected={selectedBox === '랜덤'}
          onSelect={() => handleSelect('랜덤')}
        />
      </View>
      <View style={styles.fixedButtonContainer}>
        <CustomButton
          label="확인"
          onPress={() => {
            router.push('/home/OptionPageAge');
          }}
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
  },
  fixedButtonContainer: {
    flex: 1,
    position: 'absolute',
    bottom: height * -0.14, // 혹은 height * 0.05 등으로 조정
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
export default OptionPageRegion;
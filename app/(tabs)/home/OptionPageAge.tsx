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
      <View style={{ marginLeft: width * 0.05, alignItems: 'flex-start' }}>
        <TextBox
          width={width * 0.1}
          height={height * 0.11}
          text="지역"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>서울시 강남구</Text>
      </View>
      <GradientLine />
      <View style={styles.textBoxContainer}>
        <TextBox
          width={width * 0.35}
          height={height * 0.11}
          text="나이를 선택해주세요"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>어떤 나이의 사람들과 이야기를 나누고 싶나요?</Text>
      </View>
      <GradientLine />
      <View style={styles.selectBoxContainer}>
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text="20대 초반" 
          isSelected={selectedBox === '20대 초반'}
          onSelect={() => handleSelect('20대 초반')}
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
          onPress={() => {}}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // height: height * 0.9,
  },
  text: {
    fontSize: 17,
    fontWeight: '300', // 'light' 대신 '300' 사용
    // marginTop: height * 0.01,
    color: '#b5b5b5',
  },
  selectBoxContainer: {
    // marginTop: height * 0.01,
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
    marginTop: height * 0.05, // 원하는 만큼 조정 (0.15도 가능)
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#b5b5b5',
    fontSize: 17,
    fontWeight: '300',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: height * -0.14, // 혹은 height * 0.05 등으로 조정
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
export default OptionPageAge;
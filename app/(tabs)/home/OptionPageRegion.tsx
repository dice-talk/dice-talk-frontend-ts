import TextBox from '@/components/common/TextBox';
import SelectBox from '@/components/home/SelectBox';
import { useState } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import GradientLine from '@/components/common/GradientLine';
import CustomButton from '@/components/home/CustomButton';
import { router } from 'expo-router';
import useUserStore from '@/zustand/stores/UserStore'; // UserStore 임포트

const { width, height } = Dimensions.get('window');
// dummyData에서 Region 데이터를 가져옵니다.
import { Region as regionsData } from '@/dummyData/Region';

const OptionPageRegion = () => {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const userRegion = useUserStore((state) => state.region); // UserStore에서 region 가져오기
  const { setUserInfo } = useUserStore((state) => state.actions); // UserStore의 setUserInfo 액션 가져오기

  const generateRandomRegionString = (): string => {
    const regionKeys = Object.keys(regionsData);
    if (regionKeys.length === 0) return "랜덤 지역 정보 없음"; // 데이터가 없을 경우

    const randomMainRegionKey = regionKeys[Math.floor(Math.random() * regionKeys.length)] as keyof typeof regionsData;
    const subRegions = regionsData[randomMainRegionKey];

    if (!subRegions || subRegions.length === 0) return `${randomMainRegionKey} 하위 지역 정보 없음`; // 하위 지역 없을 경우

    const randomSubRegion = subRegions[Math.floor(Math.random() * subRegions.length)];
    return `${randomMainRegionKey} ${randomSubRegion}`;
  };

  const handleSelect = (boxIdentifier: string) => {
    if (boxIdentifier === '랜덤') {
      const randomRegionValue = generateRandomRegionString();
      // 랜덤 선택 시, 이미 같은 랜덤 값이 선택된 상태라면 선택 해제, 아니면 새로운 랜덤 값으로 설정
      setSelectedBox(prev => (prev === randomRegionValue && prev !== userRegion ? null : randomRegionValue));
    } else {
      // '내 지역' 또는 다른 특정 지역 선택 시
      setSelectedBox(prev => (prev === boxIdentifier ? null : boxIdentifier));
    }
  };

  const handleConfirm = () => {
    if (selectedBox) {
      setUserInfo({ region: selectedBox });
      console.log('UserStore updated with region:', selectedBox);
    } else {
      // 선택된 값이 없을 경우 UserStore의 region을 업데이트하지 않거나,
      // undefined로 설정하여 기존 값을 유지하도록 할 수 있습니다.
      // UserStore의 setUserInfo는 undefined가 전달되면 기존 값을 유지합니다.
      setUserInfo({ region: undefined });
      console.log('No region selected, UserStore region might be unchanged or set to undefined.');
    }
    router.push('/home/OptionPageAge');
  };

  return (
    <View style={styles.container}>
      {/* 사용자 본인의 지역 정보 표시 섹션 */}
      <View style={{ marginLeft: width * 0.05, alignItems: 'flex-start', marginTop: height * 0.02 }}>
        <TextBox
          width={width * 0.15}
          height={height * 0.11}
          text="내 지역"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>{userRegion || '지역 정보 없음'}</Text>
      </View>
      <GradientLine />

      {/* 지역 선택 안내 섹션 */}
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

      {/* 선택 옵션 (내 지역, 랜덤) */}
      <View style={styles.selectBoxContainer}>
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text={userRegion || "내 지역 정보 없음"}
          isSelected={selectedBox === userRegion}
          onSelect={() => userRegion && handleSelect(userRegion)} // userRegion이 있을 때만 선택 가능
        />
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text="랜덤" 
          // "랜덤" 옵션이 선택되었는지 여부: selectedBox에 값이 있고, 그 값이 userRegion이 아닐 때
          isSelected={selectedBox !== null && selectedBox !== userRegion}
          onSelect={() => handleSelect('랜덤')}
        />
      </View>
      <View style={styles.fixedButtonContainer}>
        <CustomButton
          label="확인"
          onPress={handleConfirm}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // marginTop: height * 0.02, // 전체적인 상단 마진이 필요하면 추가
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
    // marginBottom: height * 0.01, // GradientLine과의 간격 조정이 필요하면 추가
  },
  textBoxContainer: {
    marginLeft: width * 0.1,
    alignItems: 'flex-start',
    // marginTop: height * 0.02, // GradientLine 아래의 TextBox와의 간격 조정
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
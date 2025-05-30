import GradientLine from '@/components/common/GradientLine';
import TextBox from '@/components/common/TextBox';
import CustomButton from '@/components/home/CustomButton';
import SelectBox from '@/components/home/SelectBox';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react'; // useMemo 추가
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import useUserStore from '@/zustand/stores/UserStore'; // UserStore 임포트

const { width, height } = Dimensions.get('window');

const OptionPageAge = () => {
  const router = useRouter();
  const userStoredRegion = useUserStore((state) => state.region); // UserStore에서 저장된 지역 정보 가져오기
  const userBirth = useUserStore((state) => state.birth); // UserStore에서 생년월일 가져오기
  const { setUserInfo } = useUserStore((state) => state.actions); // UserStore의 setUserInfo 액션 가져오기

  const [selectedBox, setSelectedBox] = useState<string | null>(null);

  // 랜덤 선택을 위한 나이대 옵션
  const randomAgeGroupOptions = [
    "20대",
    "30대",
    "40대",
    "50대",
    "50대 이상", // "50대 이상" 옵션 추가
  ];

  const calculateUserAgeGroupString = (birthDateString: string | null): string | null => {
    if (!birthDateString) return null;

    // 생년월일 문자열에서 연도 추출 (YYYY 형식 가정)
    const yearMatch = birthDateString.match(/^(\d{4})/);
    if (!yearMatch) return null; // YYYY로 시작하지 않으면 유효하지 않음

    const birthYear = parseInt(yearMatch[1], 10);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      return null; // 유효하지 않은 연도
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear + 1; // 한국식 나이 계산

    if (age < 10) {
      return null; // 10대 미만은 현재 로직에서 처리하지 않음 (또는 "10대 미만" 등으로 처리 가능)
    }

    const ageGroupStart = Math.floor(age / 10) * 10;
    return `${ageGroupStart}대 초반`;
  };

  // 사용자의 실제 나이대를 기반으로 표시할 문자열 계산 (메모이제이션 사용)
  const userDisplayAgeGroup = useMemo(() => {
    return calculateUserAgeGroupString(userBirth);
  }, [userBirth]);

  const handleSelect = (box: string) => {
    if (box === '랜덤') {
      // randomAgeGroupOptions에서 랜덤하게 하나 선택
      const randomIndex = Math.floor(Math.random() * randomAgeGroupOptions.length);
      const randomAgeGroup = randomAgeGroupOptions[randomIndex];
      setSelectedBox(prev => (prev === randomAgeGroup && prev !== userDisplayAgeGroup ? null : randomAgeGroup));
    } else {
      setSelectedBox(prev => (prev === box ? null : box));
    }
  };

  const handleConfirm = () => {
    // 선택된 나이 선호도를 UserStore에 저장합니다.
    // 참고: 이 로직은 UserStore의 'birth' 필드에 나이 선호도 문자열을 저장합니다.
    setUserInfo({ birth: selectedBox !== null ? selectedBox : undefined });
    console.log('UserStore updated with age preference (in birth field):', selectedBox);
    router.replace('/Loading');
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
        <Text style={styles.textStyle}>{userStoredRegion || '지역 정보 없음'}</Text>
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
          text={userDisplayAgeGroup || "내 나이대 (정보없음)"} // 계산된 나이대 또는 대체 텍스트
          isSelected={selectedBox === userDisplayAgeGroup && userDisplayAgeGroup !== null}
          onSelect={() => userDisplayAgeGroup && handleSelect(userDisplayAgeGroup)}
          disabled={!userDisplayAgeGroup} // userDisplayAgeGroup이 없으면 비활성화
        />
        <SelectBox 
          width={width * 0.35} 
          height={height * 0.11} 
          text="랜덤" 
          // selectedBox에 값이 있고, 그 값이 userDisplayAgeGroup과 다르며, randomAgeGroupOptions에 포함될 때
          isSelected={selectedBox !== null && selectedBox !== userDisplayAgeGroup && randomAgeGroupOptions.includes(selectedBox)}
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
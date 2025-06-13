import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import IsPlanned from '@/assets/images/home/isPlanned.svg';
import CustomButton from '../home/CustomButton';
import { useRouter } from 'expo-router';
import { getIsPossible } from '@/api/ChatApi'; // ChatApi.ts의 getIsPossible 함수 임포트
import { getMember } from '@/api/memberApi'; // memberApi.ts의 getMember 함수 임포트
import useUserStore from '@/zustand/stores/UserStore'; // UserStore 임포트

interface CustomBottomSheetProps {
  isPlanned: boolean;
  backgroundColor: string;
  icon: React.ReactNode;
  title: string;
  lineColor: string;
  description: string;
  onClose: () => void;
}

// 현재 기기의 화면 너비를 가져와서 배너 이미지 너비로 사용
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  backgroundColor,
  icon,
  title,
  lineColor,
  description,
  isPlanned,
  onClose,
}) => {
  const router = useRouter();
  const { setUserInfo } = useUserStore((state) => state.actions); // UserStore의 setUserInfo 액션 가져오기

  const handleParticipate = async () => {
    try {
      // 1. getIsPossible 호출
      const possibleResponse = await getIsPossible();
      if (!possibleResponse) {
        Alert.alert('알림', '이미 참여중인 채팅방이 있습니다.');
        return; // 함수 실행 중단
      }

      console.log('📞 참여하기 버튼 클릭: getMember 호출 시도');
      const memberData = await getMember(); // memberApi.ts의 getMember 호출
      console.log('👤 getMember 응답:', memberData);

      if (memberData) {
        // UserStore에 정의된 필드(region, birth)만 추출하여 전달합니다.
        // memberData 객체에 해당 키가 존재하면 그 값을 사용하고,
        // 존재하지 않으면 undefined가 전달되어 UserStore의 setUserInfo에서 기존 값을 유지합니다.
        const userInfoToStore = {
          region: memberData.region,
          birth: memberData.birth,
        };

        setUserInfo(userInfoToStore);
        console.log('✅ UserStore에 사용자 정보 저장 완료:', userInfoToStore);
        
        // 사용자 정보 저장 후 다음 페이지로 이동
        router.push('/home/OptionPageRegion');
      } else {
        // memberData가 null이거나 undefined인 경우 (API가 데이터를 반환하지 않은 경우)
        Alert.alert('오류', '회원 정보를 가져오는데 실패했습니다. 응답 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('🚨 참여하기 처리 중 오류 발생:', error);
      // Axios 에러인 경우 더 자세한 정보 로깅 (선택 사항)
      // if (axios.isAxiosError(error)) { console.error('Axios error details:', error.response?.data, error.response?.status); }
      Alert.alert('오류', '회원 정보를 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };
  // 테마 준비 중일 경우
  if (isPlanned) {
    return (
      <View style={[styles.container, { backgroundColor }]}>  
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <IsPlanned width={width * 0.4} height={width * 0.4} style={{ marginTop: 30 }}/>
      <Text style={styles.isPLannedDescription}>{description}</Text>
      {/* THEME_PLANNED 상태일 때는 참여하기 버튼을 숨기고 창 닫기 버튼만 중앙에 표시 */}
      <View style={[styles.fixedButtonContainer, styles.plannedButtonContainer]}>
        {/* <CustomButton label="참여하기" onPress={() => router.push('/home/OptionPageAge')} /> */}
        <CustomButton label="창 닫기" onPress={onClose} />
      </View>
    </View>
    )
  }
  return (
    <View style={[styles.container, { backgroundColor }]}>  
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <View style={{ marginBottom: height * 0.02 }}>
        <Text style={styles.descriptionTitle}>게임 규칙</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.fixedButtonContainer}>
        <CustomButton label="참여하기" onPress={handleParticipate} />
        <CustomButton label="창 닫기" onPress={onClose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    width: width,
    height: height * 0.7,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#fff',
  },
  iconContainer: {
    marginBottom: 3,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  line: {
    width: '40%',
    height: 2,
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  isPLannedDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    marginTop: 60,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: height * 0.05, // 또는 height * 0.05 등으로 조절
    left: width * 0.1,
    right: width * 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.01,
  },
  plannedButtonContainer: { // THEME_PLANNED 상태일 때 버튼을 중앙 정렬하기 위한 스타일
    justifyContent: 'center',
  },
});

export default CustomBottomSheet; 
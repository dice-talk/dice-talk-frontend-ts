import LogoText from '@/assets/images/login/logo_diceTalk.svg';
import LogoIcon from '@/assets/images/login/logo_icon.svg'; // SVG를 React 컴포넌트처럼 사용
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { router } from 'expo-router';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import AlerModal from '../component/AlertModal';

const LendingPage = ( ) => {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.logoContainer}>
              <LogoIcon width={width * 0.5} height={width * 0.5} /> 
          </View>
          <View style={styles.logoTextContainer}>
              <LogoText width={width * 0.6} height={width * 0.6} />
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.buttonGroup}>
            <MediumButton title="로그인" onPress={() => router.push('/Login')} />
            <MediumButton title="회원가입" onPress={() => router.push('/(onBoard)/register')} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(onBoard)/FindInfo')} style={styles.findInfoContainer}>
            <Text style={styles.findInfoText}>이메일/비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
  
          {/* 문의하기 및 정책 링크는 디자인 및 실제 기능 구현에 따라 조정 */}
          <View style={styles.extraLinksContainer}>
            <TouchableOpacity onPress={() => router.push('/(onBoard)/NonMemberQuestion')} /* 실제 문의하기 경로로 수정 */ >
              <Text style={styles.extraLinkText}>문의하기</Text>
            </TouchableOpacity> 
            <View style={styles.policyContainer}>
              <TouchableOpacity onPress={() => { /* 이용약관 페이지로 이동 */ }}>
                <Text style={styles.policyText}>이용약관</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* 개인정보 처리방침 페이지로 이동 */ }}>
                <Text style={styles.policyText}>개인정보 처리방침</Text>
              </TouchableOpacity>
              <Text style={styles.policyText}>쿠키 정책</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LendingPage;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // 배경색 지정
  },
  container: {
    flex: 1,
    justifyContent: 'center', // 전체 컨테이너에서 중앙 정렬
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // 좌우 패딩
  },
  topContainer: {
    // flex: 1, // 유연하게 공간 차지하도록 수정
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.1, // 상단 여백 조정
    // marginBottom: height * 0.05, // 하단 여백 조정
  },
  logoContainer: {
    // 로고 아이콘의 크기나 위치는 SVG 자체 크기에 따라 조절될 수 있음
    marginBottom: -height * 0.04, // 로고 텍스트와의 간격 조정 (음수 마진 사용)
  },
  logoTextContainer: {
    // 로고 텍스트의 크기나 위치는 SVG 자체 크기에 따라 조절될 수 있음
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.08, // 하단 여백 (SafeArea 고려)
    marginTop: -height * 0.08, // 상단 컨테이너와의 간격
  },
  buttonGroup: {
    width: '80%', // 버튼 그룹 너비
    marginBottom: height * 0.03,
    gap: 4, // 버튼 사이 간격
  },
  findInfoContainer: {
    width: width * 0.7, // 너비 조정
    marginTop: 5,
    padding: 5, // 터치 영역 확보
    marginBottom: height * 0.03,
  },
  findInfoText: {
    color: '#B28EF8', // 색상 변경
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  extraLinksContainer: {
    position: 'absolute', // 화면 하단에 고정될 수 있도록 (선택적)
    bottom: Platform.OS === 'ios' ? height * 0.03 : height * 0.05,
    alignItems: 'center',
    width: '100%',
  },
  extraLinkText: {
    color: '#B3B3B3',
    fontFamily: 'Pretendard-Bold',
    fontSize: 13,
    marginBottom: 10,
    marginTop: 24,
  },
  policyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // 간격 조정
    // marginTop: 15, // extraLinksContainer 내부에서 위치 조정
  },
  policyText: {
    color: '#C0C0C0', // 색상 약간 변경
    fontSize: 11,
  }
});

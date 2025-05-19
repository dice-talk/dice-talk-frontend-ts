import LogoText from '@/assets/images/login/logo_diceTalk.svg';
import LogoIcon from '@/assets/images/login/logo_icon.svg'; // SVG를 React 컴포넌트처럼 사용
import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
//import AlerModal from '../component/AlertModal';

interface LendingPageProps {
  navigation: any;
}

const LendingPage: React.FC<LendingPageProps> = ({ navigation }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoIcon width={200} height={200} />
        <LogoText width={300} height={300} />
      </View>

      <View style={styles.bottomContainer}>
        <MediumButton title="이메일로 로그인" onPress={() => router.push('/Login')}>
          {/* <FontAwesome name="envelope" size={20} color="white" style={styles.icon} /> */}
        </MediumButton>

        <MediumButton title="회원가입" onPress={() => router.push('/register')}>
          {/* <FontAwesome name="user" size={20} color="white" style={styles.icon} /> */}
        </MediumButton>

        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.forgotContainer}>
          <Text style={styles.forgotText}>이메일/비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>
{/* 
        <AlerModal
          visible={showModal}
          message={`본인 인증이 필요한 서비스입니다.\n계속하시겠습니까?`}
          onCancel={() => setShowModal(false)}
        /> */}

        <View style={styles.policyContainer}>
          <Text style={styles.polictyText}>이용약관</Text>
          <Text style={styles.polictyText}>개인정보 처리방침</Text>
          <Text style={styles.polictyText}>쿠키 정책</Text>
        </View>

        <View style={styles.policyContainer}>
          <Text style={styles.polictyText}>문의하기</Text>
        </View>
      </View>
    </View>
  );
};

export default LendingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 40,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotContainer: {
    width: '70%',
    marginBottom: 16,
  },
  forgotText: {
    color: '#B19ADE',
    fontSize: 12,
    textAlign: 'right',
  },
  policyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  polictyText: {
    color: '#B3B3B3',
    fontSize: 12,
  }
});

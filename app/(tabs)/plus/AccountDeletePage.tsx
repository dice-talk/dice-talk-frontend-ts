import GradientHeader from '@/components/common/GradientHeader';
import AccountExitModal from '@/components/plus/AccountDeleteModal';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, height } = Dimensions.get('window');

const AccountDeletePage = () => {
  const [showModal, setShowModal] = useState(false);
  const { deleteReason } = useLocalSearchParams<{ deleteReason: string }>();

  const handleConfirmExit = () => {
    setShowModal(false);
    // 여기에 실제 계정 탈퇴 로직 추가
    console.log('계정 탈퇴 처리');
    // home/index로 이동
    router.push('/home');
  };

  const handleCancelExit = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="회원탈퇴" showBackButton={true} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 제목 */}
          <Text style={styles.title}>정말 떠나시는 건가요?</Text>
          
          {/* 구분선 */}
          <LinearGradient
            colors={["#B28EF8", "#F476E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
          
          {/* 안내 사항 목록 */}
          <View style={styles.noticeContainer}>
            <View style={styles.noticeItem}>
              <View style={styles.bullet} />
              <Text style={styles.noticeText}>
                회원 탈퇴 후, 개인 정보 및 이용 내역은 복구할 수 없습니다.
              </Text>
            </View>
            
            <View style={styles.noticeItem}>
              <View style={styles.bullet} />
              <Text style={styles.noticeText}>
                구매 내역, 쿠폰, 포인트 등 모든 혜택이 소멸됩니다.
              </Text>
            </View>
            
            <View style={styles.noticeItem}>
              <View style={styles.bullet} />
              <Text style={styles.noticeText}>
                탈퇴 후 동일한 이메일(또는 휴대폰 번호)로 재가입이 제한될 수 있습니다.
              </Text>
            </View>
            
            <View style={styles.noticeItem}>
              <View style={styles.bullet} />
              <Text style={styles.noticeText}>
                탈퇴 후 일정 기간 동안 법적 의무에 따라 일부 정보가 보관될 수 있습니다.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* 하단 확인 버튼 */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={["#B28EF8", "#F476E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.confirmButton}
        >
          <Pressable 
            style={styles.confirmButtonInner}
            onPress={() => setShowModal(true)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </LinearGradient>
      </View>
      
      {/* 탈퇴 확인 모달 */}
      <AccountExitModal
        visible={showModal}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
        deleteReason={deleteReason || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100, // 하단 버튼 공간 확보
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D182F1',
    marginBottom: 20,
    textAlign: 'left',
  },
  divider: {
    height: 2,
    marginBottom: 40,
    width: '100%',
    borderRadius: 1,
  },
  noticeContainer: {
    gap: 20,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
    flexShrink: 0,
  },
  noticeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FF6B6B',
    flex: 1,
  },
  bottomContainer: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 120,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    height: height * 0.07,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 12,
    justifyContent: 'center',
  },
  confirmButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountDeletePage;

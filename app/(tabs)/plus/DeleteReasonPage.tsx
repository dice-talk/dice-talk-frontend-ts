import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CheckCircle from '../../../components/common/CheckCircle';
import GradientHeader from '../../../components/common/GradientHeader';

const { width, height } = Dimensions.get('window');

const DeleteReasonPage = () => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const reasons = [
    '원하는 서비스가 아니에요.',
    '자주 이용하지 않아요.',
    '앱 사용 과정이 불편해요.',
    '광고성 알림이 너무 많아요.',
    '이용 가격이 높아요.',
    '기타'
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleNext = () => {
    const finalReason = selectedReason === '기타' ? customReason : selectedReason;
    router.push({
      pathname: '/plus/AccountDeletePage',
      params: { deleteReason: finalReason }
    });
  };

  // 버튼 활성화 조건
  const isNextButtonEnabled = () => {
    if (!selectedReason) return false;
    if (selectedReason === '기타') {
      return customReason.trim().length > 0;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="회원탈퇴" showBackButton={true} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 제목 */}
          <Text style={styles.title}>탈퇴 하시는 이유를 알려주세요.</Text>
          
          {/* 구분선 */}
          <LinearGradient
            colors={["#B28EF8", "#F476E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
          
          {/* 이유 선택 목록 */}
          <View style={styles.reasonsContainer}>
            {reasons.map((reason, index) => (
              <CheckCircle
                key={index}
                text={reason}
                color="#666666"
                isSelected={selectedReason === reason}
                onPress={() => handleReasonSelect(reason)}
              />
            ))}
          </View>

          {selectedReason === '기타' && (
            <TextInput
              style={styles.textInput}
              placeholder="기타 이유를 입력해주세요."
              placeholderTextColor="#CCCCCC"
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              textAlignVertical="top"
            />
          )}
        </View>
      </ScrollView>
      
      {/* 하단 다음 버튼 */}
      <View style={styles.bottomContainer}>
        {isNextButtonEnabled() ? (
          <LinearGradient
            colors={["#B28EF8", "#F476E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Pressable 
              style={styles.nextButtonInner}
              onPress={handleNext}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Text style={styles.nextButtonText}>다음</Text>
            </Pressable>
          </LinearGradient>
        ) : (
          <View style={[styles.nextButton, styles.disabledButton]}>
            <Text style={[styles.nextButtonText, styles.disabledButtonText]}>다음</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default DeleteReasonPage;

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
  reasonsContainer: {
    gap: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    height: height * 0.15,
    fontSize: 16,
    color: '#333333',
    marginTop: 20,
  },
  bottomContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 120,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    height: height * 0.07,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 12,
    justifyContent: 'center',
  },
  nextButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
});
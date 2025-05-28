import GradientHeader from "@/components/common/GradientHeader";
import SettingItem from "@/components/setting/SettingItem";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionTitleContainer}>
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

export default function SettingPage() {
  const [soundAlert, setSoundAlert] = useState(true);
  const [vibrationAlert, setVibrationAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);
  const [pushAlert, setPushAlert] = useState(true);
  const [nightPushAlert, setNightPushAlert] = useState(false);

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(true);
  const [snsConsent, setSnsConsent] = useState(true);

  const handleWithdrawal = () => {
    router.push("/plus/AccountExitPage");
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="설정" showBackButton={true} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <SectionTitle title="알림" />
        <SettingItem title="소리 알림" value={soundAlert} onValueChange={setSoundAlert} />
        <SettingItem title="진동 알림" value={vibrationAlert} onValueChange={setVibrationAlert} />
        <SettingItem title="이메일 알림" value={emailAlert} onValueChange={setEmailAlert} />
        <SettingItem title="PUSH 알림" value={pushAlert} onValueChange={setPushAlert} />
        <SettingItem title="야간 PUSH 알림" value={nightPushAlert} onValueChange={setNightPushAlert} isLastItem={true} />

        <SectionTitle title="마케팅 수신 동의" />
        <SettingItem title="이메일 수신 동의" value={emailConsent} onValueChange={setEmailConsent} />
        <SettingItem title="SNS 수신 동의" value={snsConsent} onValueChange={setSnsConsent} isLastItem={true} />

        <View style={styles.withdrawalContainer}>
          <TouchableOpacity onPress={handleWithdrawal} activeOpacity={0.7}>
            <Text style={styles.withdrawalText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: height * 0.1,
  },
  sectionTitleContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  sectionTitleText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#868E96',
  },
  withdrawalContainer: {
    marginTop: 30,
    alignItems: 'flex-end',
    paddingHorizontal: width * 0.05,
  },
  withdrawalText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#A0A0A0',
    textDecorationLine: 'underline',
  },
});
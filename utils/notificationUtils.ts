import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * 푸시 알림 권한을 요청하고 Expo 푸시 토큰을 발급받습니다.
 * Android의 경우 알림 채널을 설정합니다.
 * @returns {Promise<string | undefined>} Expo 푸시 토큰 또는 undefined (실패 시)
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default', // 또는 앱의 기본 알림 채널 이름 (예: '채팅 알림')
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('Android notification channel set.');
    } catch (e) {
      console.error("Failed to set notification channel:", e);
      // 채널 설정 실패가 토큰 발급 자체를 막지는 않으므로, 여기서 바로 return하지 않을 수 있음
    }
  }

  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // 사용자에게 권한 거부됨을 알리는 것이 좋음 (UI 통해 또는 Alert)
        console.warn('Push notification permission denied.');
        // alert('푸시 알림 권한이 거부되었습니다.'); // UI/UX 정책에 따라 사용
        return undefined;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error("EAS projectId is not set in app.config.js or app.json. Cannot get push token.");
        // alert('EAS projectId 설정이 필요합니다. 푸시 토큰을 가져올 수 없습니다.'); // UI/UX 정책에 따라 사용
        return undefined;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token obtained:', token);
    } catch (e) {
      console.error("Failed to get push token:", e);
      // alert('푸시 토큰을 가져오는 데 실패했습니다.'); // UI/UX 정책에 따라 사용
      return undefined;
    }
  } else {
    console.log('Must use physical device for Push Notifications (or an emulator/simulator that supports them).');
    // 시뮬레이터에서는 토큰을 못 가져오므로, 개발 중에는 이를 인지하고 넘어갈 수 있도록 undefined 반환
    return undefined;
  }

  return token;
} 
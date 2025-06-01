// components/common/CountdownTimer.tsx

import { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

interface CountdownTimerProps {
  initialSeconds: number;         // 예: 48시간 → 48 * 60 * 60
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

const CountdownTimer = ({
  initialSeconds,
  fontSize = 40,
  fontFamily = "digital",
  color = "gray",
}: CountdownTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(initialSeconds);

  useEffect(() => {
    // initialSeconds가 변경되면 remainingTime을 업데이트합니다.
    setRemainingTime(initialSeconds);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        // initialSeconds가 0이거나 음수면 바로 0을 반환하고 인터벌을 멈춥니다.
        if (initialSeconds <= 0) { clearInterval(interval); return 0; }
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // initialSeconds가 변경될 때마다 이 useEffect를 다시 실행합니다.
  }, [initialSeconds]);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds % 60)).padStart(2, '0'); // 초를 정수로 변환 후 문자열로 변경
    return `${h}:${m}:${s}`;
  };

  return (
    <Text style={[styles.timerText, { fontSize, fontFamily, color }]}>
      {formatTime(remainingTime)}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontWeight: 'bold',
  },
});

export default CountdownTimer;
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
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
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
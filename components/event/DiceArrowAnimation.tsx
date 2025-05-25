import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// 모든 화살표 연결에 대한 하드코딩된 위치값
export const arrowPositions: Record<string, { 
  startX: number, 
  startY: number,
  endX: number,
  endY: number,
  color: string,
  strokeWidth?: number, // 선 두께 (기본값: 3)
  arrowSize?: number    // 화살표 머리 크기 (기본값: 10)
}> = {
  // 왼쪽 → 오른쪽 (홀수 → 짝수)
  "1-2": { // 1번(Hana)에서 2번(Dori)으로
    startX: width * 0.15 + 60,
    startY: height * 0.39,
    endX: width * 0.85 - 10,
    endY: height * 0.40,
    color: "#4DA1FF" // 파란색
  },
  "1-4": { // 1번(Hana)에서 4번(Nemo)으로
    startX: width * 0.15 + 60,
    startY: height * 0.39,
    endX: width * 0.85 - 10,
    endY: height * 0.48,
    color: "#4DA1FF"
  },
  "1-6": { // 1번(Hana)에서 6번(Yukdaeng)으로
    startX: width * 0.15 + 60,
    startY: height * 0.395,
    endX: width * 0.85 - 10,
    endY: height * 0.58,
    color: "#4DA1FF"
  },
  "3-2": { // 3번(Sezzi)에서 2번(Dori)으로
    startX: width * 0.15 + 60,
    startY: height * 0.45,
    endX: width * 0.85 - 10,
    endY: height * 0.38,
    color: "#4DA1FF"
  },
  "3-4": { // 3번(Sezzi)에서 4번(Nemo)으로
    startX: width * 0.15 + 60,
    startY: height * 0.45,
    endX: width * 0.85 - 10,
    endY: height * 0.45,
    color: "#4DA1FF"
  },
  "3-6": { // 3번(Sezzi)에서 6번(Yukdaeng)으로
    startX: width * 0.15 + 60,
    startY: height * 0.45,
    endX: width * 0.85 - 10,
    endY: height * 0.55,
    color: "#4DA1FF"
  },
  "5-2": { // 5번(Dao)에서 2번(Dori)으로
    startX: width * 0.15 + 60,
    startY: height * 0.52,
    endX: width * 0.85 - 10,
    endY: height * 0.35,
    color: "#4DA1FF"
  },
  "5-4": { // 5번(Dao)에서 4번(Nemo)으로
    startX: width * 0.15 + 60,
    startY: height * 0.52,
    endX: width * 0.85 - 10,
    endY: height * 0.44,
    color: "#4DA1FF"
  },
  "5-6": { // 5번(Dao)에서 6번(Yukdaeng)으로
    startX: width * 0.15 + 60,
    startY: height * 0.52,
    endX: width * 0.85 - 10,
    endY: height * 0.52,
    color: "#4DA1FF"
  },
  
  // 오른쪽 → 왼쪽 (짝수 → 홀수)
  "2-1": { // 2번(Dori)에서 1번(Hana)으로
    startX: width * 0.85 - 95,
    startY: height * 0.39,
    endX: width * 0.15 - 30,
    endY: height * 0.39,
    color: "#FF4D4D" // 빨간색
  },
  "2-3": { // 2번(Dori)에서 3번(Sezzi)으로
    startX: width * 0.85 - 90,
    startY: height * 0.39,
    endX: width * 0.15 - 30,
    endY: height * 0.49,
    color: "#FF4D4D"
  },
  "2-5": { // 2번(Dori)에서 5번(Dao)으로
    startX: width * 0.85 - 90,
    startY: height * 0.39,
    endX: width * 0.15 - 30,
    endY: height * 0.59,
    color: "#FF4D4D"
  },
  "4-1": { // 4번(Nemo)에서 1번(Hana)으로
    startX: width * 0.85 - 90,
    startY: height * 0.46,
    endX: width * 0.15 - 30,
    endY: height * 0.36,
    color: "#FF4D4D"
  },
  "4-3": { // 4번(Nemo)에서 3번(Sezzi)으로
    startX: width * 0.85 - 90,
    startY: height * 0.46,
    endX: width * 0.15 - 30,
    endY: height * 0.46,
    color: "#FF4D4D"
  },
  "4-5": { // 4번(Nemo)에서 5번(Dao)으로
    startX: width * 0.85 - 90,
    startY: height * 0.46,
    endX: width * 0.15 - 30,
    endY: height * 0.56,
    color: "#FF4D4D"
  },
  "6-1": { // 6번(Yukdaeng)에서 1번(Hana)으로
    startX: width * 0.85 - 90,
    startY: height * 0.52,
    endX: width * 0.15 - 30,
    endY: height * 0.33,
    color: "#FF4D4D"
  },
  "6-3": { // 6번(Yukdaeng)에서 3번(Sezzi)으로
    startX: width * 0.85 - 90,
    startY: height * 0.52,
    endX: width * 0.15 - 30,
    endY: height * 0.43,
    color: "#FF4D4D"
  },
  "6-5": { // 6번(Yukdaeng)에서 5번(Dao)으로
    startX: width * 0.85 - 90,
    startY: height * 0.52,
    endX: width * 0.15 - 30,
    endY: height * 0.52,
    color: "#FF4D4D"
  }
};

interface DiceArrowAnimationProps {
  fromId: number;  // 시작 위치의 주사위 ID (1~6)
  toId: number;    // 도착 위치의 주사위 ID (1~6)
  color?: string;  // 화살표 색상 (지정된 색상이 없으면 하드코딩된 색상 사용)
}

const DiceArrowAnimation: React.FC<DiceArrowAnimationProps> = ({
  fromId,
  toId,
  color,
}) => {
  // 애니메이션 상태 값 - 모든 훅은 조건문 이전에 선언
  const progress = useRef(new Animated.Value(0)).current;
  
  // 화살표 키 생성 (fromId-toId)
  const arrowKey = `${fromId}-${toId}`;
  
  // 하드코딩된 위치 정보 가져오기
  const arrowPosition = arrowPositions[arrowKey];
  
  // 모든 useEffect 훅은 컴포넌트 최상단에서 호출
  useEffect(() => {
    // 위치 정보가 없으면 애니메이션 실행 안함
    if (!arrowPosition) return;

    // 진행 값 초기화
    progress.setValue(0);
    
    // 애니메이션 시작
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fromId, toId, arrowPosition, progress]);
  
  // 위치 정보가 없으면 빈 컴포넌트 반환
  if (!arrowPosition) {
    console.warn(`화살표 위치 정보가 없음: ${arrowKey}`);
    return <View style={styles.container} />;
  }
  
  // 시작점과 끝점
  const start = {
    x: arrowPosition.startX,
    y: arrowPosition.startY
  };
  
  const end = {
    x: arrowPosition.endX,
    y: arrowPosition.endY
  };
  
  // 화살표 색상
  const arrowColor = color || arrowPosition.color;
  
  // 화살표 길이를 60%로 조정
  const adjustedEndX = start.x + (end.x - start.x) * 0.6;
  const adjustedEndY = start.y + (end.y - start.y) * 0.6;
  
  // 직선 경로
  const lineX1 = start.x;
  const lineY1 = start.y;
  const lineX2 = adjustedEndX;
  const lineY2 = adjustedEndY;
  
  // 화살표 머리를 위한 계산
  const dx = adjustedEndX - start.x;
  const dy = adjustedEndY - start.y;
  const angle = Math.atan2(dy, dx);
  
  // 화살표 머리 좌표 계산
  const arrowSize = arrowPosition.arrowSize || 10;
  const arrowX = adjustedEndX;
  const arrowY = adjustedEndY;
  
  // 화살표 머리 경로
  const arrowHeadPath = `
    M${arrowX},${arrowY}
    L${arrowX - arrowSize * Math.cos(angle - Math.PI/6)},${arrowY - arrowSize * Math.sin(angle - Math.PI/6)}
    L${arrowX - arrowSize * Math.cos(angle + Math.PI/6)},${arrowY - arrowSize * Math.sin(angle + Math.PI/6)}
    Z
  `;
  
  // 선 길이 애니메이션 값 계산 (0에서 실제 길이까지)
  const pathLength = Math.sqrt(
    Math.pow(lineX2 - lineX1, 2) + Math.pow(lineY2 - lineY1, 2)
  );
  
  // 선이 그려지는 애니메이션을 위한 값
  const lineStrokeDashoffset = progress.interpolate({
    inputRange: [0, 0.8],  // 전체 애니메이션의 80%까지 선이 그려짐
    outputRange: [pathLength, 0],
    extrapolate: 'clamp',
  });
  
  // 선의 opacity
  const lineOpacity = progress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 1, 1],  // 빠르게 나타남
    extrapolate: 'clamp',
  });
  
  // 화살표 머리 opacity 애니메이션 - 선이 그려진 후(80% 지점)에만 나타남
  const arrowHeadOpacity = progress.interpolate({
    inputRange: [0, 0.8, 0.9, 1],
    outputRange: [0, 0, 0.7, 1],  // 80% 지점부터 페이드인
    extrapolate: 'clamp',
  });
  
  // 선 두께
  const strokeWidth = arrowPosition.strokeWidth || 3;
  
  // 애니메이션된 라인 컴포넌트 생성
  const AnimatedLine = Animated.createAnimatedComponent(Line);
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} style={styles.svg}>
        {/* 직선 화살표 */}
        <AnimatedLine
          x1={lineX1}
          y1={lineY1}
          x2={lineX2}
          y2={lineY2}
          stroke={arrowColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${pathLength} ${pathLength}`}
          strokeDashoffset={lineStrokeDashoffset}
          strokeLinecap="round"
          opacity={lineOpacity}
        />
        
        {/* 화살표 머리 */}
        <AnimatedPath
          d={arrowHeadPath}
          fill={arrowColor}
          opacity={arrowHeadOpacity}
        />
      </Svg>
    </View>
  );
};

// AnimatedPath 컴포넌트 생성
const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default DiceArrowAnimation; 
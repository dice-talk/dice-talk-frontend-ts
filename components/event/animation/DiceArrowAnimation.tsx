import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import useHomeStore from '@/zustand/stores/HomeStore'; // HomeStore 임포트
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
    endY: height * 0.39,
    color: "#4DA1FF" // 파란색
  },
  "1-4": { // 1번(Hana)에서 4번(Nemo)으로
    startX: width * 0.15 + 60,
    startY: height * 0.39,
    endX: width * 0.85 - 10,
    endY: height * 0.49,
    color: "#4DA1FF"
  },
  "1-6": { // 1번(Hana)에서 6번(Yukdaeng)으로
    startX: width * 0.15 + 60,
    startY: height * 0.39,
    endX: width * 0.85 - 10,
    endY: height * 0.59,
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

// 6각형 레이아웃용 포지션 (ResultFriendArrow용)
export const hexagonArrowPositions: Record<string, { 
  startX: number, 
  startY: number,
  endX: number,
  endY: number,
  color: string,
  strokeWidth?: number,
  arrowSize?: number
}> = {
  // 상단 행 (1번 Hana, 2번 Dori)
  "1-2": { // Hana → Dori
    startX: width * 0.42 - width * 0.08 + 22,
    startY: height * 0.34 + height * 0.04,
    endX: width * 0.56 + width * 0.08 - 22,
    endY: height * 0.34 + height * 0.04,
    color: "#9FC9FF"
  },
  "1-3": { // Hana → Sezzi
    startX: width * 0.3 - width * 0.08 + 22,
    startY: height * 0.34 + height * 0.04 + 22,
    endX: width * 0.2 + width * 0.08 - 22,
    endY: height * 0.15 + height * 0.32 - 22,
    color: "#9FC9FF"
  },
  "1-4": { // Hana → Nemo
    startX: width * 0.45 - width * 0.08,
    startY: height * 0.33 + height * 0.04 + 22,
    endX: width * 0.8 - 22,
    endY: height * 0.35 + height * 0.16 - 22,
    color: "#9FC9FF"
  },
  "1-5": { // Hana → Dao
    startX: width * 0.4 - width * 0.08,
    startY: height * 0.35 + height * 0.04 + 22,
    endX: width * 0.4 - width * 0.08,
    endY: height * 0.27 + height * 0.32 - 22,
    color: "#9FC9FF"
  },
  "1-6": { // Hana → Yukdaeng
    
    startX: width * 0.44 - width * 0.08,
    startY: height * 0.35 + height * 0.04 + 22,
    endX: width * 0.6 + 22,
    endY: height * 0.44 + height * 0.16 - 22,
    color: "#9FC9FF"
  },
  "2-1": { // Dori → Hana
    startX: width * 0.48 + width * 0.08 - 22,
    startY: height * 0.34 + height * 0.04,
    endX: width * 0.35 - width * 0.08 + 22,
    endY: height * 0.34 + height * 0.04,
    color: "#87c37b",
  },
  "2-3": { // Dori → Sezzi
    startX: width * 0.5 + width * 0.08 - 22,
    startY: height * 0.34 + height * 0.04 + 22,
    endX: width * 0.18 - width * 0.08 + 22,
    endY: height * 0.18 + height * 0.32 - 22,
    color: "#87c37b",
  },
  "2-4": { // Dori → Nemo
    startX: width * 0.54 + width * 0.08,
    startY: height * 0.34 + height * 0.04 + 22,
    endX: width * 0.6 + width * 0.08,
    endY: height * 0.16 + height * 0.32 - 22,
    color: "#87c37b",
  },
  "2-5": { // Dori → Dao
    startX: width * 0.45 + width * 0.08,
    startY: height * 0.34 + height * 0.04 + 22,
    endX: width * 0.2 + 22,
    endY: height * 0.45 + height * 0.16 - 22,
    color: "#87c37b",
  },
  "2-6": { // Dori → Yukdaeng
    startX: width * 0.5 + width * 0.08,
    startY: height * 0.35 + height * 0.04 + 22,
    endX: width * 0.64 - 22,
    endY: height * 0.43 + height * 0.16 - 22,
    color: "#87c37b",
  },
  "3-1": { // Sezzi → Hana
    startX: width * 0.19 + 22,
    startY: height * 0.29 + height * 0.16 - 22,
    endX: width * 0.38 - width * 0.08,
    endY: height * 0.32 + height * 0.04 + 22,
    color: "#c5ec15"
  },
  "3-2": { // Sezzi → Dori
    startX: width * 0.25 + 22,
    startY: height * 0.31 + height * 0.16 - 22,
    endX: width * 0.6 + width * 0.08,
    endY: height * 0.3 + height * 0.04 + 22,
    color: "#ece815"
  },
  // 중간 행 연결 (3번 Sezzi, 4번 Nemo)
  "3-4": { // Sezzi → Nemo
    startX: width * 0.25 + 22,
    startY: height * 0.3 + height * 0.16,
    endX: width * 0.85 - 22,
    endY: height * 0.3 + height * 0.16,
    color: "#ece815"
  },
  "3-5": { // Sezzi → Dao
    startX: width * 0.25,
    startY: height * 0.3 + height * 0.16 + 22,
    endX: width * 0.44 - width * 0.08 - 22,
    endY: height * 0.23 + height * 0.32 - 22,
    color: "#ece815"
  },
  "3-6": { // Sezzi → Yukdaeng
    startX: width * 0.29,
    startY: height * 0.29 + height * 0.16 + 22,
    endX: width * 0.55 + width * 0.08 + 22,
    endY: height * 0.27 + height * 0.32 - 22,
    color: "#ece815"
  },
  "4-1": { // Nemo → Hana
    startX: width * 0.68 - 22,
    startY: height * 0.29 + height * 0.16,
    endX: width * 0.15 + 22,
    endY: height * 0.2 + height * 0.16,
    color: "#f36e3e"
  },
  "4-2": { // Nemo → Dori
    startX: width * 0.7 - 22,
    startY: height * 0.3 + height * 0.16 - 22,
    endX: width * 0.5 + width * 0.08,
    endY: height * 0.33 + height * 0.04 + 22,
    color: "#f36e3e"
  },
  "4-3": { // Nemo → Sezzi
    startX: width * 0.67 - 22,
    startY: height * 0.325 + height * 0.16 - 22,
    endX: width * 0.15 - width * 0.08,
    endY: height * 0.4 + height * 0.04 + 22,
    color: "#f36e3e"
  },
  
  "4-5": { // Nemo → Dao
    startX: width * 0.63,
    startY: height * 0.29 + height * 0.16 + 22,
    endX: width * 0.38 - width * 0.08 - 22,
    endY: height * 0.26 + height * 0.32 - 22,
    color: "#f36e3e"
  },
  "4-6": { // Nemo → Yukdaeng
    startX: width * 0.67,
    startY: height * 0.3 + height * 0.16 + 22,
    endX: width * 0.45 + width * 0.08 + 22,
    endY: height * 0.23 + height * 0.32 - 22,
    color: "#f36e3e"
  },
  "5-1": { // Dao → Hana
    startX: width * 0.45 - width * 0.08 - 22,
    startY: height * 0.21 + height * 0.32 - 22,
    endX: width * 0.31,
    endY: height * 0.17 + height * 0.16 + 22,
    color: "#ff59e1"
  },
  "5-2": { 
    startX: width * 0.45 - width * 0.08,
    startY: height * 0.22 + height * 0.32 - 22,
    endX: width * 0.72 - width * 0.08,
    endY: height * 0.27 + height * 0.04 + 22,
    color: "#ff59e1"
  },
  "5-3": { // Dao → Sezzi
    startX: width * 0.3 - width * 0.08 + 22,
    startY: height * 0.22 + height * 0.32 - 22,
    endX: width * 0.2 + width * 0.08 - 22,
    endY: height * 0.4 + height * 0.04 + 22,
    color: "#ff59e1"
  },
  "5-4": { // Dao → Nemo
    startX: width * 0.53 - width * 0.08 - 22,
    startY: height * 0.23 + height * 0.32 - 22,
    endX: width * 0.77,
    endY: height * 0.27 + height * 0.16 + 22,
    color: "#ff59e1"
  },
  // 하단 행 연결 (5번 Dao, 6번 Yukdaeng)
  "5-6": { // Dao → Yukdaeng
    startX: width * 0.43 - width * 0.08 + 22,
    startY: height * 0.22 + height * 0.32,
    endX: width * 0.55 + width * 0.08 - 22,
    endY: height * 0.22 + height * 0.32,
    color: "#ff59e1"
  },
  "6-1": { // Yukdaeng → Hana
    startX: width * 0.51 + width * 0.08 - 22,
    startY: height * 0.21 + height * 0.32 - 22,
    endX: width * 0.27 - width * 0.08 + 22,
    endY: height * 0.29 + height * 0.04 + 22,
    color: "#ce6bff"
  },
  "6-2": { // Yukdaeng → Dori
    startX: width * 0.5 + width * 0.08,
    startY: height * 0.2 + height * 0.32 - 22,
    endX: width * 0.5 + width * 0.08,
    endY: height * 0.3 + height * 0.04 + 22,
    color: "#ce6bff"
  },
  "6-3": { // Yukdaeng → Sezzi
    startX: width * 0.37 + width * 0.08 + 22,
    startY: height * 0.23 + height * 0.32 - 22,
    endX: width * 0.15,
    endY: height * 0.26 + height * 0.16 + 22,
    color: "#ce6bff"
  },
  "6-4": { // Yukdaeng → Nemo
    startX: width * 0.5 + width * 0.08 + 22,
    startY: height * 0.22 + height * 0.32 - 22,
    endX: width * 0.69,
    endY: height * 0.28 + height * 0.16 + 22,
    color: "#ce6bff"
  },
  "6-5": { // Yukdaeng → Dao
    startX: width * 0.48 + width * 0.08 - 22,
    startY: height * 0.22 + height * 0.32,
    endX: width * 0.35 - width * 0.08 + 22,
    endY: height * 0.22 + height * 0.32,
    color: "#ce6bff"
  },
};

// 캐릭터 닉네임과 ID 매핑
// LoveArrow.tsx와 ResultLoveArrow.tsx의 diceCharacterMap을 참고하여 일관성 유지
const nicknameToIdMap: Record<string, number> = {
  "한가로운 하나": 1,
  "두 얼굴의 매력 두리": 2,
  "세침한 세찌": 3,
  "네모지만 부드러운 네몽": 4,
  "단호한데 다정한 다오": 5,
  "육감적인 직감파 육땡": 6, // LoveArrow.tsx 기준
  // "육감적인 직감파 육댕": 6, // LoveLetterSelect.tsx 기준 - 일관성 필요 시 하나로 통일
};

interface DiceArrowAnimationProps {
  fromNickname: string; // 시작 위치 캐릭터의 닉네임
  toNickname: string;   // 도착 위치 캐릭터의 닉네임
  color?: string;  // 화살표 색상 (지정된 색상이 없으면 하드코딩된 색상 사용)
}

const DiceArrowAnimation: React.FC<DiceArrowAnimationProps> = ({
  fromNickname,
  toNickname,
  color,
}) => {
  // 애니메이션 상태 값 - 모든 훅은 조건문 이전에 선언
  const progress = useRef(new Animated.Value(0)).current;
  const curThemeId = useHomeStore((state) => state.curThemeId);

  // 닉네임을 ID로 변환하고, arrowKey 및 arrowPosition을 계산합니다.
  // 이 값들은 useEffect의 의존성 및 조건부 렌더링에 사용됩니다.
  const fromId = nicknameToIdMap[fromNickname];
  const toId = nicknameToIdMap[toNickname];
  const arrowKey = (fromId !== undefined && toId !== undefined) ? `${fromId}-${toId}` : null;
  
  const arrowPosition = arrowKey
    ? (curThemeId === 2 ? hexagonArrowPositions[arrowKey] : arrowPositions[arrowKey])
    : undefined; // arrowKey가 null이면 arrowPosition은 undefined가 됩니다.

  // useEffect 훅은 모든 조건부 반환문 이전에 호출되어야 합니다.
  useEffect(() => {
    // arrowPosition이 유효하지 않으면 애니메이션을 실행하지 않고 상태를 초기화합니다.
    if (!arrowPosition) {
      progress.stopAnimation();
      progress.setValue(0);
      return;
    }

    // 새 애니메이션 시작 전에 이전 애니메이션을 중지하고 진행 값을 초기화합니다.
    progress.stopAnimation();
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true, // SVG 속성 애니메이션과 useNativeDriver: true 호환성 문제 발생 시 false로 변경 고려
    });
    animation.start();

    // 컴포넌트 언마운트 또는 의존성 변경 시 애니메이션 정리
    return () => {
      animation.stop();
    };
  }, [fromNickname, toNickname, arrowPosition, progress]); // 의존성 배열에 arrowPosition 포함

  // ID가 유효하지 않으면 경고 출력 후 렌더링 안함
  // 이 조건부 반환은 useEffect 호출 이후에 위치합니다.
  if (fromId === undefined || toId === undefined) {
    console.warn(`[DiceArrowAnimation] 유효하지 않은 닉네임입니다: fromNickname='${fromNickname}', toNickname='${toNickname}'. ID를 찾을 수 없습니다.`);
    return null;
  }

  // 위치 정보가 없으면 빈 컴포넌트 반환
  // 이 조건부 반환 역시 useEffect 호출 이후에 위치합니다.
  if (!arrowPosition) {
    console.warn(`[DiceArrowAnimation] 화살표 위치 정보를 찾을 수 없습니다: key='${arrowKey}' (fromId=${fromId}, toId=${toId})`);
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
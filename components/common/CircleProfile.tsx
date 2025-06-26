import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import HanaSvg from "@/assets/images/dice/hana.svg";
import NemoSvg from "@/assets/images/dice/nemo.svg";
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface CircleProfileProps {
  svgComponent: React.FC<SvgProps>;
  svgColor?: string;
  borderColor?: string;
  backgroundColor?: string; // 배경색 prop 추가
  size?: number;
}

const CircleProfile: React.FC<CircleProfileProps> = ({
  svgComponent: SvgComponent,
  svgColor,
  borderColor = '#eee',
  backgroundColor = 'transparent', // 기본값 transparent 유지
  size = 45
}) => {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2, // 원형 유지
        backgroundColor: backgroundColor, // 배경색 적용
        borderColor: borderColor
      }
    ]}>
      <SvgComponent 
        width={size * 0.6} 
        height={size * 0.6} 
        color={svgColor}
      />
    </View>
  );
};

export default CircleProfile;

const styles = StyleSheet.create({
  container: {
    // backgroundColor는 prop으로 전달받아 스타일 배열에서 적용됩니다.
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});

export const HanaProfile = () => (
  <CircleProfile svgComponent={HanaSvg} />
);

export const DoriProfile = () => (
  <CircleProfile svgComponent={DoriSvg} />
);

export const SezziProfile = () => (
  <CircleProfile svgComponent={SezziSvg} />
);

export const NemoProfile = () => (
  <CircleProfile svgComponent={NemoSvg} />
);

export const DaoProfile = () => (
  <CircleProfile svgComponent={DaoSvg} />
);

export const YukdaengProfile = () => (
  <CircleProfile svgComponent={YukdaengSvg} />
);
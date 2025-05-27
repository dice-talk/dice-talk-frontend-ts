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
  size?: number;
}

const CircleProfile: React.FC<CircleProfileProps> = ({
  svgComponent: SvgComponent,
  svgColor,
  borderColor = '#eee',
  size = 45
}) => {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
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
    backgroundColor: 'white',
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
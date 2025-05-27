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
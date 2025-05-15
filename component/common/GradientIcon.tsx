import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type GradientIconProps = {
  size?: number;
  colorStart?: string;
  colorEnd?: string;
  name: string;
};

const GradientIcon: React.FC<GradientIconProps> = ({
  size = 40,
  colorStart = "#B28EF8",
  colorEnd = "#F476E5",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colorStart} />
          <Stop offset="100%" stopColor={colorEnd} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="url(#grad)"
      />
    </Svg>
  );
};

export default GradientIcon;

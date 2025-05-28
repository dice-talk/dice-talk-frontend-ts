import CircleProfile from "@/components/common/CircleProfile";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface DiceIconContainerProps {
  svgComponents: React.FC<SvgProps>[];
  svgColor?: string;
  borderColor?: string;
  size?: number;
}

const DiceIconContainer = ({ 
  svgComponents, 
  svgColor = "#9FC9FF", 
  borderColor = "#9FC9FF", 
  size = 45 
}: DiceIconContainerProps) => {
  // 6개의 SVG를 6각형 형태로 배치
  const renderHexagonLayout = () => {
    if (svgComponents.length !== 6) {
      console.warn("DiceIconContainer expects exactly 6 SVG components");
      return null;
    }

    return (
      <View style={styles.hexagonContainer}>
        {/* 상단 2개 */}
        <View style={styles.topRow}>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[0]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[1]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
        </View>
        
        {/* 중간 2개 */}
        <View style={styles.middleRow}>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[2]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[3]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
        </View>
        
        {/* 하단 2개 */}
        <View style={styles.bottomRow}>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[4]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[5]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size} 
            />
          </View>
        </View>
      </View>
    );
  };

  return renderHexagonLayout();
};

const styles = StyleSheet.create({
  hexagonContainer: {
    position: "absolute",
    top: height * 0.345,
    left: 0,
    right: 0,
    height: height * 0.7,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.15,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.08,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.15,

  },
  iconPosition: {
    marginHorizontal: width * 0.08,
  },
});

export default DiceIconContainer;
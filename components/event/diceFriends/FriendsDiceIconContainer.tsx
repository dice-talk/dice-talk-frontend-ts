import CircleProfile from "@/components/common/CircleProfile";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface FriendsDiceIconContainerProps {
  svgComponents: React.FC<SvgProps>[];
  svgColor?: string;
  borderColor?: string;
  size?: number;
}

const FriendsDiceIconContainer = ({ 
  svgComponents, 
  svgColor = "#9FC9FF", 
  borderColor = "#9FC9FF", 
  size = 45 
}: FriendsDiceIconContainerProps) => {
  // 6개의 SVG를 6각형 형태로 배치
  const renderHexagonLayout = () => {
    if (svgComponents.length !== 6) {
      return null;
    }

    return (
      <View style={styles.hexagonInnerLayout}>
        {/* 상단 2개 */}
        <View style={styles.topRow}>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[0]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size}
              backgroundColor="white"
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[1]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size}
              backgroundColor="white"
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
              backgroundColor="white"
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[3]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size}
              backgroundColor="white"
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
              backgroundColor="white"
            />
          </View>
          <View style={styles.iconPosition}>
            <CircleProfile 
              svgComponent={svgComponents[5]} 
              svgColor={svgColor} 
              borderColor={borderColor} 
              size={size}
              backgroundColor="white"
            />
          </View>
        </View>
      </View>
    );
  };

  // 아이콘 컨테이너 전체의 위치와 크기를 담당하는 외부 View
  return (
    <View style={styles.outerContainer}>
      {renderHexagonLayout()}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { // 이 스타일이 DiceIconContainer의 최상위 View에 적용되어 절대 위치를 잡습니다.
    position: "absolute",
    top: height * 0.11,
    left: 0,
    right: 0,
    height: height * 0.7,
    zIndex: 10,
    // backgroundColor: 'rgba(0, 255, 0, 0.1)', // 디버깅을 위한 임시 배경색
  },
  hexagonInnerLayout: { // renderHexagonLayout이 반환하는 View에 적용되어 내부 아이콘 행들을 정렬합니다.
    flex: 1, // outerContainer의 높이를 모두 사용
    justifyContent: 'center', // 자식 요소(topRow, middleRow, bottomRow)들을 수직 중앙에 배치
    // alignItems: 'center', // 각 row는 이미 내부적으로 justifyContent를 사용하므로 불필요할 수 있음
    // backgroundColor: 'rgba(0, 0, 255, 0.1)', // 디버깅을 위한 임시 배경색
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

export default FriendsDiceIconContainer;
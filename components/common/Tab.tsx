import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const { width } = Dimensions.get('window');
const TAB_CONTAINER_WIDTH = width * 0.9; // 화면 너비의 90%
const TAB_WIDTH = TAB_CONTAINER_WIDTH / 2; // 탭 개수에 따라 동적 할당 가능 (현재는 2개 고정)

// 그라데이션 색상 (투명도 적용을 위해 RGBA 사용)
const GRADIENT_COLORS_ACTIVE = ['rgba(178, 142, 248, 0.9)', 'rgba(244, 118, 229, 0.5)'] as const; // 투명도 50%
const GRADIENT_COLORS_INACTIVE = ['rgba(178, 142, 248, 0.3)', 'rgba(244, 118, 229, 0.2)'] as const; // 투명도 20%

const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBarContainer}>
        {tabs.map((tabName, index) => { // index 추가
          const isActive = activeTab === tabName;
          const gradientColors = isActive ? GRADIENT_COLORS_ACTIVE : GRADIENT_COLORS_INACTIVE;
          
          // 각 탭의 borderRadius를 위한 스타일
          const tabItemStyle: any = {};
          if (index === 0) { // 첫 번째 탭
            tabItemStyle.borderTopLeftRadius = 30;
            tabItemStyle.borderBottomLeftRadius = 30;
          }
          if (index === tabs.length - 1) { // 마지막 탭
            tabItemStyle.borderTopRightRadius = 30;
            tabItemStyle.borderBottomRightRadius = 30;
          }

          return (
            <TouchableOpacity
              key={tabName}
              style={[styles.tabItem, { width: TAB_WIDTH }]}
              onPress={() => onTabChange(tabName)}
              activeOpacity={0.8} // 활성 시 투명도 변경
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.tabBackground, tabItemStyle]} // borderRadius 스타일 적용
              >
                <Text style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}>
                  {tabName}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  tabBarContainer: {
    flexDirection: 'row',
    width: TAB_CONTAINER_WIDTH,
    borderRadius: 30,
    overflow: 'hidden', 
    // backgroundColor는 각 LinearGradient가 담당하므로 제거
    // borderWidth: 1, // 디자인상 테두리 제거 또는 색상 조정 필요
    // borderColor: '#E8D8FA',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    // backgroundColor: 'transparent', // 각 LinearGradient가 배경을 채움
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius는 각 탭 아이템에 개별적으로 적용 (위 tabItemStyle에서 처리)
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF', // 활성 탭 텍스트 색상 (흰색으로 변경하여 가독성 확보)
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.7)', // 비활성 탭 텍스트 색상 (흰색 계열에 투명도)
  },
});

export default Tab; 
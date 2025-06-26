import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
interface SelectBoxProps {
  width: number;
  height: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean; // disabled prop 추가
}

const SelectBox: React.FC<SelectBoxProps> = ({ width, height, text, isSelected, onSelect, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled} // TouchableOpacity에 disabled prop 전달
      style={[
        styles.touchableBase,
        { width, height },
        // 비활성화 상태 스타일을 최우선으로 적용
        disabled ? styles.disabledContainer : 
        // 활성화 상태이면서 선택된 경우 그라데이션 배경
        isSelected ? styles.selectedContainer : 
        // 활성화 상태이면서 선택되지 않은 경우 기본 배경
        styles.defaultContainer 
      ]}
    >
      {isSelected && !disabled ? ( // 선택되었고 비활성화되지 않았을 때만 그라데이션 표시
        <LinearGradient
          colors={['#B28EF8', '#F476E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          <Text style={styles.selectedText}>{text}</Text>
        </LinearGradient>
      ) : (
        // 비활성화 상태 또는 선택되지 않은 활성 상태
        // View는 스타일링 컨테이너 역할만 하고, 실제 배경색은 TouchableOpacity의 style에서 관리
        <View style={styles.textWrapper}>
          <Text style={disabled ? styles.disabledText : styles.defaultText}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // 이 스타일은 이제 직접 사용되지 않거나, textWrapper로 대체될 수 있습니다.
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  touchableBase: { // TouchableOpacity의 기본 스타일
    borderRadius: 20,
    overflow: 'hidden', // LinearGradient가 borderRadius를 따르도록
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedContainer: { // 선택된 활성 상태 (그라데이션 배경을 위해 투명)
    // 배경색은 LinearGradient가 채우므로 여기서는 설정하지 않음
  },
  defaultContainer: { // 선택되지 않은 활성 상태
    backgroundColor: '#F0F0F0', // 약간 더 밝은 회색으로 변경 (예시)
    borderColor: '#D1B4F8', // 테두리 색상 추가 (선택 사항)
    borderWidth: 1,         // 테두리 두께 (선택 사항)
  },
  disabledContainer: { // 비활성화 상태
    backgroundColor: '#E0E0E0', // 기존 비선택 배경색 유지 또는 더 어둡게
    borderColor: '#BDBDBD',
    borderWidth: 1,
  },
  gradientBackground: { // LinearGradient에 적용될 스타일
    ...StyleSheet.absoluteFillObject, // 부모 TouchableOpacity를 꽉 채움
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: { // 텍스트를 감싸는 View, 배경이 없는 경우 텍스트 정렬용
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: { // 선택되었을 때 텍스트
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultText: { // 선택되지 않은 활성 상태 텍스트
    color: '#333', // 어두운 색으로 변경하여 가독성 향상
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: { // 비활성화 상태 텍스트
    color: '#A0A0A0', // 더 연한 회색으로 변경
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SelectBox; 
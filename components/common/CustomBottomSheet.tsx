import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IsPlanned from '@/assets/images/home/isPlanned.svg';
import CustomButton from '../home/CustomButton';

interface CustomBottomSheetProps {
  isPlanned: boolean;
  backgroundColor: string;
  icon: React.ReactNode;
  title: string;
  lineColor: string;
  description: string;
  onClose: () => void;
}

// 현재 기기의 화면 너비를 가져와서 배너 이미지 너비로 사용
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  backgroundColor,
  icon,
  title,
  lineColor,
  description,
  isPlanned,
  onClose,
}) => {
  // 테마 준비 중일 경우
  if (isPlanned) {
    return (
      <View style={[styles.container, { backgroundColor }]}>  
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <IsPlanned width={width * 0.4} height={width * 0.4} style={{ marginTop: 30 }}/>
      <Text style={styles.isPLannedDescription}>{description}</Text>
      <View style={{ marginTop: height * 0.05, flexDirection: 'row', justifyContent: 'space-between', gap: width * 0.1 }}>
        <CustomButton label="창 닫기" onPress={onClose} />
      </View>
    </View>
    )
  }
  return (
    <View style={[styles.container, { backgroundColor }]}>  
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <View style={{ marginBottom: height * 0.02 }}>
        <Text style={styles.descriptionTitle}>게임 규칙</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={{ marginTop: height * 0.12, flexDirection: 'row', justifyContent: 'space-between', gap: width * 0.1 }}>
        <CustomButton label="참여하기" onPress={() => {}} />
        <CustomButton label="창 닫기" onPress={onClose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    width: width,
    height: height * 0.6,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#fff',
  },
  iconContainer: {
    marginBottom: 3,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  line: {
    width: '40%',
    height: 2,
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  isPLannedDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    marginTop: 60,
  },
});

export default CustomBottomSheet; 
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CheckCircleProps {
  text: string;
  color?: string;
  isSelected?: boolean;
  onPress?: () => void;
}

const CheckCircle = ({ text, color = '#000000', isSelected = false, onPress }: CheckCircleProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, { borderColor: color }, isSelected && { backgroundColor: color }]}>
        {isSelected && <View style={styles.innerCircle} />}
      </View>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default CheckCircle; 
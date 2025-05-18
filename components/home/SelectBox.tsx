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
}

const SelectBox: React.FC<SelectBoxProps> = ({ width, height, text, isSelected, onSelect }) => {
  return (
    <TouchableOpacity onPress={onSelect} style={{ width, height, borderRadius: 20, overflow: 'hidden' }}>
      {isSelected ? (
        <LinearGradient
          colors={['#B28EF8', '#F476E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, { width, height }]}
        >
          <Text style={styles.text}>{text}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.container, { width, height, backgroundColor: '#e0e0e0' }]}>
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SelectBox; 
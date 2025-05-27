import React from "react";
import { ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface Props {
  label: string;
  icon?: ImageSourcePropType;
  svgComponent?: React.FC<SvgProps>;
  selected: boolean;
  onPress: () => void;
  svgColor?: string;
  selectedSvgColor?: string;
  textColor?: string;
  radioColor?: string;
  checkmarkColor?: string;
}

const SelectableOption = ({ label, icon, svgComponent: SvgComponent, selected, onPress, svgColor, selectedSvgColor, textColor, radioColor, checkmarkColor }: Props) => {
  return (
    <Pressable style={styles.optionRow} onPress={onPress}>
      <View style={[
        styles.radioCircle, 
        { borderColor: radioColor || "#D6A0B1" },
        selected && { borderColor: checkmarkColor || "#E04C65" }
      ]}>
        {selected && <View style={[styles.checkmark, { backgroundColor: checkmarkColor || "#E04C65" }]} />}
      </View>
      {SvgComponent ? (
        <SvgComponent 
          width={28} 
          height={28} 
          style={styles.svgIcon} 
          color={selected ? (selectedSvgColor || "#F9BCC1") : (svgColor || "#FFFFFF")} 
        />
      ) : null}
      <Text style={[styles.optionLabel, { color: textColor || "#A45C73" }]}>{label}</Text>
    </Pressable>
  );
};

export default SelectableOption;

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  diceIcon: {
    width: 28,
    height: 28,
    marginHorizontal: 8,
    resizeMode: "contain",
  },
  svgIcon: {
    marginHorizontal: 8,
  },
  optionLabel: {
    fontSize: 14,
  },
});
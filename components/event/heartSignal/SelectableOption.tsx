import React from "react";
import { ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface Props {
  label: string;
  icon?: ImageSourcePropType;
  svgComponent?: React.FC<SvgProps>;
  selected: boolean;
  onPress: () => void;
}

const SelectableOption = ({ label, icon, svgComponent: SvgComponent, selected, onPress }: Props) => {
  return (
    <Pressable style={styles.optionRow} onPress={onPress}>
      <View style={[styles.radioCircle, selected && styles.radioSelected]}>
        {selected && <View style={styles.checkmark} />}
      </View>
      {SvgComponent ? (
        <SvgComponent width={28} height={28} style={styles.svgIcon} />
      ) : null}
      <Text style={styles.optionLabel}>{label}</Text>
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
    borderColor: "#D6A0B1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioSelected: {
    borderColor: "#E04C65",
    backgroundColor: "#FFFFFF",
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: "#E04C65",
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
    color: "#A45C73",
  },
});
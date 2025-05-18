import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


interface MyInfoFieldProps {
  iconName: string;
  label: string;
  value: string;
  editable?: boolean;
  onPressRight?: () => void;
  rightButtonLabel?: string;
  rightButtonGradient?: boolean;
}

export default function MyInfoField({
  iconName,
  label,
  value,
  editable = false,
  onPressRight,
  rightButtonLabel,
  rightButtonGradient = false,
}: MyInfoFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name={iconName as any} size={20} color="#B28EF8" style={{ marginRight: 8 }} />
        <Text style={styles.label}>{label}</Text>
        {rightButtonLabel && onPressRight && (
          rightButtonGradient ? (
            <TouchableOpacity onPress={onPressRight} style={styles.rightButtonWrapper}>
              <LinearGradient
                colors={["#B28EF8", "#F476E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rightButton}
              >
                <Text style={styles.rightButtonText}>{rightButtonLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onPressRight} style={styles.rightButtonPlain}>
              <Text style={styles.rightButtonTextPlain}>{rightButtonLabel}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, !editable && styles.valuePlaceholder]}>{value}</Text>
      </View>
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.underline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: "90%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    fontFamily: "Pretendard-Bold",
    fontSize: 15,
    color: "#B28EF8",
    marginRight: 8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
  },
  value: {
    fontFamily: "Pretendard",
    fontSize: 16,
    color: "#222",
  },
  valuePlaceholder: {
    color: "#bdbdbd",
  },
  underline: {
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  rightButtonWrapper: {
    marginLeft: "auto",
  },
  rightButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  rightButtonText: {
    color: "#fff",
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
  },
  rightButtonPlain: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rightButtonTextPlain: {
    color: "#B28EF8",
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
  },
}); 


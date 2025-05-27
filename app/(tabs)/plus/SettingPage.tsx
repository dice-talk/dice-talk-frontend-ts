import GradientHeader from "@/components/common/GradientHeader";
import { StyleSheet, View } from "react-native";

export default function SettingPage() {
    return (
        <View style={styles.container}>
            <GradientHeader title="설정" showBackButton={true} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
import GradientHeader from "@/components/common/GradientHeader";
import { StyleSheet, View } from "react-native";

export default function NoticePage() {
    return (
        <View style={styles.container}>
            <GradientHeader title="공지사항 / 이벤트" showBackButton={true} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
import { StyleSheet, Text, View } from 'react-native';

// ✅ 타입 지정
type AnswerProps = {
    answer?: {
      content: string;
      createAt: string;
      images: string[] | null;
    } | null;
  };

export default function Answer({ answer }: AnswerProps) {

    if (!answer) {
        return null; // ✅ 답변이 없는 경우 아무것도 렌더링하지 않음
      }

    const { content, createAt } = answer;

    return (
        <View style={styles.container}>
                <View style={styles.checkContainer}>
                    <Text style={styles.sectionLabel}>답변</Text>
                    <Text style={styles.createAt}>{createAt}</Text>
                </View>
            <View style={styles.contentContainer}>
                <Text>{content}</Text>
            </View>
          </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 16,
    },
    section: {
        marginBottom: 24,
      },
      checkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
      },
      contentContainer: {
        padding: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 110,
        textAlignVertical: 'top',
      },
      createAt: {
        fontSize: 12,
        color: "#666666",
        textAlign: "right",
        marginTop: 6,
        marginBottom: 8,
        marginRight: 8,
      },
})

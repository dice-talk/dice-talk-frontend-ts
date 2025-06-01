import { AnswerImage } from '@/api/questionApi';
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

// ✅ 타입 지정
type AnswerProps = {
    answer?: {
      content: string;
      createdAt: string;
      answerImages: AnswerImage[] | null;
    } | null;
  };

export default function Answer({ answer }: AnswerProps) {

    if (!answer) {
        return null; // ✅ 답변이 없는 경우 아무것도 렌더링하지 않음
      }

    const { content, createdAt, answerImages } = answer;

    return (
        <View style={styles.container}>
                <View style={styles.checkContainer}>
                    <Text style={styles.sectionLabel}>답변</Text>
                    <Text style={styles.createAt}>{createdAt}</Text>
                </View>
            <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{content}</Text>
            </View>
            {answerImages && answerImages.length > 0 && (
                <View style={styles.imagesSection}>
                    <Text style={styles.imageSectionTitle}>첨부 이미지</Text>
                    <FlatList
                        data={answerImages}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.answerImageId.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.imageWrapper}>
                                <Image 
                                    source={{ uri: item.imageUrl }} 
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.imageSeparator} />}
                        contentContainerStyle={styles.flatListContainer}
                    />
                </View>
            )}
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
        fontFamily: 'Pretendard-Medium',
        color: '#4B5563',
        marginBottom: 8,
      },
      contentContainer: {
        padding: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 80,
        textAlignVertical: 'top',
      },
      contentText: {
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
        color: '#4B5563',
        lineHeight: 20,
      },
      createAt: {
        fontSize: 12,
        fontFamily: 'Pretendard-Regular',
        color: "#666666",
        textAlign: "right",
        marginTop: 6,
        marginBottom: 8,
        marginRight: 8,
      },
      imagesSection: {
        marginTop: 16,
      },
      imageSectionTitle: {
        fontSize: 13,
        fontFamily: 'Pretendard-Medium',
        color: '#555555',
        marginBottom: 8,
      },
      flatListContainer: {
        paddingVertical: 8,
      },
      imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
      imagePreview: {
        width: "100%",
        height: "100%",
      },
      imageSeparator: {
        width: 10,
      },
})

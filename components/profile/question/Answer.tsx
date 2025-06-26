import { AnswerImage } from '@/api/questionApi';
import { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    // 이미지 뷰어 모달 상태
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    if (!answer) {
        return null; // ✅ 답변이 없는 경우 아무것도 렌더링하지 않음
      }

    const { content, createdAt, answerImages } = answer;

    // 이미지 클릭 핸들러 및 모달 닫기 함수
    const handleImagePress = (uri: string) => {
        setSelectedImageUri(uri);
        setIsImageViewVisible(true);
    };

    const handleCloseImageView = () => {
        setIsImageViewVisible(false);
        setSelectedImageUri(null);
    };

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
                            <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                                <View style={styles.imageWrapper}>
                                    <Image 
                                        source={{ uri: item.imageUrl }} 
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.imageSeparator} />}
                        contentContainerStyle={styles.flatListContainer}
                    />
                </View>
            )}

            {/* 이미지 뷰어 모달 */}
            {selectedImageUri && (
                <Modal
                    transparent={true}
                    visible={isImageViewVisible}
                    onRequestClose={handleCloseImageView}
                >
                    <View style={styles.imageViewerContainer}>
                        <Image
                            source={{ uri: selectedImageUri }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseImageView}
                        >
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
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
      // --- 이미지 뷰어 관련 스타일 (QuestionDetailPage.tsx에서 복사) ---
      imageViewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      fullScreenImage: {
        width: '90%',
        height: '80%',
      },
      closeButton: {
        position: 'absolute',
        // top: '11%', // 사용자가 QuestionDetailPage에서 top: '16%', right: '3%', backgroundColor: 'rgba(128, 128, 128, 1)' 로 수정한 것 반영
        // right: '6%',
        top: '16%', 
        right: '3%', 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: 'rgba(128, 128, 128, 1)', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, 
      },
      closeButtonText: {
        color: '#FFFFFF', 
        fontSize: 18, 
        fontFamily: "Pretendard-Bold", 
        lineHeight: 20, 
      },
      // --- 여기까지 이미지 뷰어 관련 스타일 ---
})

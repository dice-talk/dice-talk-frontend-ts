import { getNoticeById, NoticeDetailDto, NoticeImage } from "@/api/noticeApi";
import GradientHeader from "@/components/common/GradientHeader";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient'; // 태그 그라데이션에 사용
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.warn("Date formatting failed for:", dateString, e);
    return dateString; 
  }
};

export default function NoticeDetailPage() {
    const router = useRouter();
    const { noticeId: noticeIdParam } = useLocalSearchParams<{ noticeId?: string }>();
    const [noticeDetail, setNoticeDetail] = useState<NoticeDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 이미지 뷰어 모달 상태 추가
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    // 이미지 클릭 핸들러 및 모달 닫기 함수 추가
    const handleImagePress = (uri: string) => {
        setSelectedImageUri(uri);
        setIsImageViewVisible(true);
    };

    const handleCloseImageView = () => {
        setIsImageViewVisible(false);
        setSelectedImageUri(null);
    };

    useEffect(() => {
        if (noticeIdParam) {
            const id = parseInt(noticeIdParam, 10);
            if (isNaN(id)) {
                setError("잘못된 공지사항 ID입니다.");
                setNoticeDetail(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            getNoticeById(id)
                .then(data => {
                    setNoticeDetail(data);
                    console.log("✅ Notice detail fetched:", data);
                })
                .catch(err => {
                    console.error("🚨 Error fetching notice detail:", err);
                    if (axios.isAxiosError(err) && err.response?.status === 404) {
                        setError("공지사항을 찾을 수 없습니다.");
                    } else {
                        setError("공지사항을 불러오는 중 오류가 발생했습니다.");
                    }
                    setNoticeDetail(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setError("공지사항 ID가 제공되지 않았습니다.");
            setNoticeDetail(null);
            setLoading(false);
        }
    }, [noticeIdParam]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <GradientHeader title="로딩 중..." showBackButton={true} />
                <ActivityIndicator size="large" color="#B28EF8" style={{marginTop: 20}} />
            </View>
        );
    }

    if (error || !noticeDetail) {
        return (
            <View style={[styles.container, styles.centered]}>
                <GradientHeader title="오류" showBackButton={true} />
                <Text style={styles.errorText}>{error || "공지사항 정보를 불러올 수 없습니다."}</Text>
            </View>
        );
    }

    const isImportant = noticeDetail.noticeImportance === 1;
    const tagText = noticeDetail.noticeType === 'NOTICE' ? '공지' : noticeDetail.noticeType === 'EVENT' ? '이벤트' : '업데이트';
    
    const tagStyle = [
        styles.tagBase,
        isImportant ? styles.tagImportantGradient : styles.tagNormalSolid,
    ];

    return (
        <View style={styles.container}>
            <GradientHeader title="공지사항 / 이벤트" showBackButton={true} />  
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
            >
                <View style={styles.headerSection}>
                    <View style={styles.titleRow}>
                        {isImportant ? (
                            <LinearGradient 
                                colors={['#B28EF8', '#F476E5'] as const} 
                                start={{x: 0, y: 0.5}} 
                                end={{x: 1, y: 0.5}} 
                                style={tagStyle}
                            >
                                <Text style={styles.tagText}>{tagText}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={tagStyle}> 
                                <Text style={styles.tagText}>{tagText}</Text>
                            </View>
                        )}
                        <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">
                            {noticeDetail.title}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>작성일: {formatDate(noticeDetail.createdAt)}</Text>
                    {noticeDetail.modifiedAt && noticeDetail.modifiedAt !== noticeDetail.createdAt && (
                         <Text style={styles.dateText}>수정일: {formatDate(noticeDetail.modifiedAt)}</Text>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.contentSection}>
                    <Text style={styles.contentText}>{noticeDetail.content}</Text>
                </View>

                {noticeDetail.thumbnail && (
                    <TouchableOpacity onPress={() => handleImagePress(noticeDetail.thumbnail!)}>
                        <View style={styles.thumbnailContainer}>
                            <Image source={{ uri: noticeDetail.thumbnail }} style={styles.thumbnailImage} resizeMode="cover"/>
                        </View>
                    </TouchableOpacity>
                )}
                
                {noticeDetail.noticeImages && noticeDetail.noticeImages.length > 0 && (
                    <View style={styles.imagesSection}>
                        {/*<Text style={styles.sectionTitle}>첨부 이미지</Text>*/}
                        <FlatList
                            data={noticeDetail.noticeImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item: NoticeImage) => item.noticeImageId.toString()}
                            renderItem={({ item }: { item: NoticeImage }) => (
                                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                                    <Image 
                                        source={{ uri: item.imageUrl }}
                                        style={styles.attachedImageInScroll}
                                        resizeMode="cover" 
                                    />
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}                            
                            contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingRight: width * 0.05 }}
                        />
                    </View>
                )}

            </ScrollView>

            {/* 이미지 뷰어 모달 추가 */}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    },
    errorText: {
        fontSize: 16,
        color: '#333333',
        marginTop: 20,
        fontFamily: 'Pretendard-Regular',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: width * 0.05, 
        paddingTop: width * 0.05, 
        paddingBottom: height * 0.15, 
    },
    headerSection: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', 
        marginBottom: 8,
    },
    tagBase: { 
        minWidth: 60, 
        height: 24,
        paddingHorizontal: 10, 
        borderRadius: 12, 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    tagImportantGradient: { 
    },
    tagNormalSolid: { 
        backgroundColor: '#B28EF8',
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
    },
    titleText: {
        flex: 1, 
        fontSize: 18,
        fontFamily: 'Pretendard-SemiBold',
        color: '#212529',
        lineHeight: 26, 
    },
    dateText: {
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
        color: '#868E96',
        textAlign: 'right', 
        marginTop: 4, 
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20, 
    },
    contentSection: {
        marginBottom: 25,
    },
    contentText: {
        fontSize: 15,
        fontFamily: 'Pretendard-Regular',
        color: '#495057',
        lineHeight: 24, 
    },
    thumbnailContainer: {
        marginBottom: 20,
        alignItems: 'center', 
    },
    thumbnailImage: {
        width: width * 0.9, 
        height: height * 0.25, 
        borderRadius: 8,
    },
    imagesSection: {
        marginTop: 10,
        marginBottom: 20, 
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
        color: '#333333',
        marginBottom: 12, 
    },
    attachedImageInScroll: { 
        width: width * 0.7, 
        height: height * 0.22, 
        borderRadius: 8,
    },
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
});
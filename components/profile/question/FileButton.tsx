import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ExistingImage {
  id: number; // 기존 이미지의 고유 ID
  url: string; // 기존 이미지의 URL
}

export interface ImageChangePayload {
  currentDisplayUris: string[]; // 현재 UI에 표시된 모든 이미지 URI (기존 + 신규 로컬 URI)
  newlyAddedUris: string[];   // 새로 추가된 로컬 파일 URI 목록
  retainedImageIds: number[]; // 사용자가 유지하기로 선택한 기존 이미지 ID 목록
}

// ✅ 타입 지정
type FileButtonProps = {
  onImagesChange: (payload: ImageChangePayload) => void;
  initialExistingImages?: ExistingImage[]; // 초기 기존 이미지 목록 (ID와 URL)
  maxImages?: number; // 최대 선택 가능 이미지 수
}

interface DisplayImage {
  uri: string;
  isNew: boolean; // 새로 추가된 이미지인지 여부
  id?: number;    // 기존 이미지인 경우 ID
}

const FileButton: React.FC<FileButtonProps> = ({
  onImagesChange,
  initialExistingImages = [],
  maxImages = 5,
}) => {
  const [displayImages, setDisplayImages] = useState<DisplayImage[]>([]);

  useEffect(() => {
    // initialExistingImages가 변경되면 displayImages를 업데이트
    const initialDisplay: DisplayImage[] = initialExistingImages.map(img => ({
      uri: img.url,
      isNew: false,
      id: img.id,
    }));
    setDisplayImages(initialDisplay);
  }, [initialExistingImages]);

  useEffect(() => {
    // displayImages가 변경될 때마다 부모 컴포넌트로 정보 전달
    const newlyAddedUris = displayImages.filter(img => img.isNew).map(img => img.uri);
    const retainedImageIds = displayImages.filter(img => !img.isNew && img.id !== undefined).map(img => img.id!);
    const currentDisplayUris = displayImages.map(img => img.uri);

    onImagesChange({
      currentDisplayUris,
      newlyAddedUris,
      retainedImageIds,
    });
  }, [displayImages, onImagesChange]);

  const pickImage = async () => {
    if (displayImages.length >= maxImages) {
      Alert.alert(`알림`,`최대 ${maxImages}개의 이미지만 선택할 수 있습니다.`);
      return;
    }
    
    // ImagePicker 권한 확인 (선택 사항, 프로덕션에서는 권장)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("갤러리 접근 권한이 필요합니다.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 1,
      allowsMultipleSelection: true, 
      selectionLimit: maxImages - displayImages.length, 
    });

    if (!result.canceled && result.assets) {
      const newImages: DisplayImage[] = result.assets.map(asset => ({
        uri: asset.uri,
        isNew: true,
      }));
      setDisplayImages(prev => [...prev, ...newImages].slice(0, maxImages));
    }
  };

  const removeImage = (uriToRemove: string) => {
    setDisplayImages(prev => prev.filter(img => img.uri !== uriToRemove));
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={pickImage} style={styles.addButton}>
        <Ionicons name="add-circle" size={30} color="#B28EF8" />
        <Text style={styles.addButtonText}>이미지 추가 ({displayImages.length}/{maxImages})</Text>
      </Pressable>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageContainer}>
        {displayImages.map((image, index) => (
          <View key={image.uri || index.toString()} style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => removeImage(image.uri)} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color="rgba(0,0,0,0.7)" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // FileButton 전체 컨테이너 스타일 (필요시 추가)
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // 예시 배경색
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start', // 버튼 크기를 내용에 맞춤
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B5563',
    fontFamily: "Pretendard-Medium",
  },
  imageContainer: { 
    // flexDirection: 'row', // ScrollView horizontal일 경우 필요 없음
    // flexWrap: 'wrap', // ScrollView horizontal일 경우 필요 없음
    // marginTop: 10, // addButton과의 간격은 addButton의 marginBottom으로 처리
    paddingVertical: 5, // 이미지 위아래 약간의 패딩
  },
  imageWrapper: { 
    marginRight: 10, 
    // marginBottom: 10, // horizontal ScrollView에서는 marginRight로 간격 조절
    position: 'relative', 
    width: 100, // 이미지 크기 고정
    height: 100, // 이미지 크기 고정
  },
  imagePreview: { 
    width: "100%", 
    height: "100%", 
    borderRadius: 8, 
    backgroundColor: '#E5E7EB', // 이미지 로딩 중 배경색
  },
  removeButton: {
    position: 'absolute',
    top: -5, // 아이콘 위치 조정
    right: -5, // 아이콘 위치 조정
    // backgroundColor: 'rgba(0,0,0,0.5)', // 아이콘 배경 제거 또는 변경
    // borderRadius: 12, // 아이콘 모양에 맞게
    // width: 24, // 아이콘 크기에 맞게
    // height: 24, // 아이콘 크기에 맞게
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  // removeButtonText: { color: 'white', fontWeight: 'bold' }, // Ionicons 사용으로 텍스트 제거
});

export default FileButton;

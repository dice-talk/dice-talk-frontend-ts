import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

// ✅ 타입 지정
type FileButtonProps = {
  onImageSelect: (images: string[]) => void;
};

export default function FileButton({
  onImageSelect,
}: FileButtonProps) {
const [images, setImages] = useState<string[]>([]);

// ✅ 이미지 선택 핸들러
const handleSelectImage = async () => {
const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
});

if (!result.canceled) {
    if (images.length < 5) {
    setImages([...images, result.assets[0].uri]);
    } else {
    alert("최대 5개의 이미지만 추가할 수 있습니다.");
    }
}
};

// ✅ 이미지 삭제 핸들러
const handleRemoveImage = (index: number) => {
setImages(images.filter((_, i) => i !== index));
};

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Pressable onPress={handleSelectImage} style={styles.button}>
          <Ionicons name="document-attach" size={24} color="#E5E7EB" />
        </Pressable>
      </View>

      {/* ✅ 가로 스크롤 이미지 미리보기 */}
      <ScrollView horizontal style={styles.scrollContainer} showsHorizontalScrollIndicator={false}>
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={20} color="red" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        //marginTop: 16,
      },
      wrapper: {
        width: 80,
        height: 40,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
      },
      button: {
        alignItems: "center",
        justifyContent: "center",
      },
      scrollContainer: {
        marginTop: 16,
        flexDirection: "row",
        height: 100,
      },
      imageContainer: {
        position: "relative",
        marginRight: 8,
      },
      image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginTop: 10,
      },
      removeButton: {
        position: "absolute",
        top: 0,
        right: -7,
        backgroundColor: "white",
        borderRadius: 9999,
      },
    });

import { Region, RegionType } from "@/dummyData/Region";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

interface RegionDropDownProps {
  city: string | null;
  district: string | null;
  onChange: (city: string, district: string) => void;
}

export default function RegionDropDown({ city, district, onChange }: RegionDropDownProps) {
    const [selectedCity, setSelectedCity] = useState<keyof RegionType | "">("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    
    const handleCityChange = (city: string) => {
        setSelectedCity(city as keyof RegionType);
        setSelectedDistrict(""); // 구/군 초기화
      };

    const handleDistrictChange = (district: string) => {
        setSelectedDistrict(district);
        if (selectedCity) {
            Alert.alert(
                "지역 선택",
                `${selectedCity} ${selectedDistrict}로 등록하시겠습니까?`,
                [
                    {
                        text: "취소",
                        style: "cancel",
                    },
                    {
                        text: "확인",
                        onPress: () => {
                            onChange (selectedCity, selectedDistrict);
                        },
                    },
                ]
            )
        }
      };

  return (
    <View style={styles.row}>
        <View style={styles.container}>
        <Picker
            selectedValue={selectedCity}
            onValueChange={(value) => handleCityChange(value as keyof RegionType)}
            style={[styles.picker, styles.cityPicker]}
            dropdownIconColor="#B28EF8"
        >
            <Picker.Item label="시/도" value={city} />
                {Object.keys(Region).map((city) => (
                <Picker.Item label={city} value={city} key={city} />
                ))}
            </Picker>
        </View>

        <View style={styles.container}>
            <Picker selectedValue={selectedDistrict} 
            onValueChange={handleDistrictChange} 
            style={[styles.picker, styles.districtPicker]}
            enabled={!!selectedCity}
            dropdownIconColor="#B28EF8"
            >
            <Picker.Item label="구/군" value="" />
            {selectedCity &&
            Region[selectedCity]?.map((district) => (
                <Picker.Item label={district} value={district} key={district} />
            ))}
            </Picker>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 24,
    },
  container: {
    width: "43%",
    height: 54,
    borderWidth: 1,
    borderColor: "#B28EF8",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 2,
    marginBottom: 16,
  },
  picker: {
    fontFamily: "Pretendard",
    color: "#B28EF8",
    backgroundColor: "#F9F9FF",
    height: 40,
    width: "100%",
  },
  cityPicker: {
    flex: 1,
    marginRight: 8,
  },
  districtPicker: {
    flex: 1,
  },
}); 
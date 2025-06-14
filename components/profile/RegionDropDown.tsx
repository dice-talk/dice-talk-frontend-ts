import { Region, RegionType } from "@/dummyData/Region";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ConfirmModal from "./ConfirmModal";

interface RegionDropDownProps {
  city: string | null;
  district: string | null;
  onChange: (city: string, district: string) => void;
}

export default function RegionDropDown({ city: initialCity, district: initialDistrict, onChange }: RegionDropDownProps) {
    const [selectedCity, setSelectedCity] = useState<keyof RegionType | "">((initialCity as keyof RegionType | "") || "");
    const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict || "");
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const handleCityChange = (newCityValue: string) => {
        const newCity = newCityValue as keyof RegionType | "";
        setSelectedCity(newCity);
        setSelectedDistrict("");
      };

    const handleDistrictChange = (newDistrictValue: string) => {
        if (newDistrictValue === "") {
            setSelectedDistrict("");
            return;
        }
        
        setSelectedDistrict(newDistrictValue);
        if (selectedCity && newDistrictValue) { 
            setIsModalVisible(true);
        }
      };

  return (
    <View style={styles.row}>
        <View style={styles.container}>
        <Picker<keyof RegionType | "">
            selectedValue={selectedCity}
            onValueChange={(itemValue) => handleCityChange(itemValue as string)}
            style={[styles.picker, styles.cityPicker]}
            dropdownIconColor="#B28EF8"
        >
            <Picker.Item label="시/도 선택" value="" />
                {Object.keys(Region).map((cityName) => (
                <Picker.Item label={cityName} value={cityName as keyof RegionType} key={cityName} />
                ))}
            </Picker>
        </View>

        <View style={styles.container}>
            <Picker<string>
                selectedValue={selectedDistrict}
                onValueChange={(itemValue) => handleDistrictChange(itemValue as string)} 
                style={[styles.picker, styles.districtPicker]}
                enabled={!!selectedCity}
                dropdownIconColor="#B28EF8"
            >
            <Picker.Item label="구/군 선택" value="" />
            {selectedCity &&
            Region[selectedCity as keyof RegionType]?.map((districtName) => (
                <Picker.Item label={districtName} value={districtName} key={districtName} />
            ))}
            </Picker>
        </View>
        <ConfirmModal
            visible={isModalVisible}
            title="지역 선택 완료"
            message={`${selectedCity} ${selectedDistrict}로 지역을 설정합니다.`}
            onCancel={() => setIsModalVisible(false)}
            onConfirm={() => {
                setIsModalVisible(false);
                if (selectedCity && selectedDistrict) {
                    onChange(selectedCity, selectedDistrict);
                }
            }}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 10,
    },
  container: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: "#B28EF8",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: 'center',
  },
  picker: {
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  cityPicker: {
  },
  districtPicker: {
  },
}); 
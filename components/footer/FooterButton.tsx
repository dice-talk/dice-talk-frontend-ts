import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text } from "react-native";

// 안전한 아이콘 타입 정의
const validIcons = [
    "home-outline",
    "time-outline",
    "chatbubble-outline",
    "person-outline",
    "ellipsis-horizontal-outline",
  ] as const;
  type IoniconName = (typeof validIcons)[number];
  
  type FooterItemProps = {
    name: "home" | "history" | "chat" | "profile" | "plus";
    active: boolean;
    onPress: () => void;
  };  
  

export default function FooterButton({ name, active, onPress }: FooterItemProps) {
    const screenHeight = Dimensions.get("window").height;
    const footerHeight = screenHeight * 0.1;
    const iconName = {
        home: "home-outline",
        history: "time-outline",
        chat: "chatbubbles-outline",
        profile: "person-outline",
        plus: "ellipsis-horizontal-outline",
      }[name] as IoniconName;

    // 터치 피드백용 스케일 애니메이션
    const scale = React.useRef(new Animated.Value(1)).current;
    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    // 큰 원(테두리) 두께
    const outerBorderWidth = 1;
    // 작은 원(아이콘 배경) 테두리 두께는 큰 원의 1/2
    const innerBorderWidth = 0.9;
    // 원 크기
    const outerSize = footerHeight * 0.56;
    const innerSize = footerHeight * 0.55;
    const iconSize = footerHeight * 0.26;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [styles.buttonContainer, pressed && Platform.OS === 'ios' && { opacity: 0.7 }]}
            //android_ripple={{ color: '#F3E6FF', borderless: false }}
        >
            <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
                {/* 바깥 원: 그라데이션 테두리 */}
                <LinearGradient
                    colors={["#B28EF8", "#F476E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        width: outerSize,
                        height: outerSize,
                        borderRadius: outerSize / 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: outerBorderWidth,
                        marginTop: 20,
                    }}
                >
                    {/* 안쪽 원: 내부 그라데이션(선택 시), 테두리 그라데이션(비선택 시 흰 배경) */}
                    <LinearGradient
                        colors={active ? ["#B28EF8", "#F476E5"] : ["#fff", "#fff"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            width: innerSize,
                            height: innerSize,
                            borderRadius: innerSize / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: innerBorderWidth,
                            borderColor: 'transparent',
                        }}
                    >
                        {/* 아이콘 */}
                        <Ionicons name={iconName} size={iconSize} color={active ? '#fff' : '#B28EF8'} />
                    </LinearGradient>
                </LinearGradient>
                {/* 텍스트 */}
                <Text style={{
                    fontFamily: active ? "Pretendard-Bold" : "Pretendard",
                    color: active ? "#B28EF8" : "#7d7d7d", marginTop: 6,
                    fontSize: 10,
                    fontWeight: active ? '800' : '400',
                    letterSpacing: 0.2,
                }}> 
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
    },
});

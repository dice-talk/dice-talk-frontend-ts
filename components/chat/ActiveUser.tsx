import React from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

// 사용자 데이터 타입 정의
interface User {
  id: string;
  name: string;
  profileSvg: React.FC<SvgProps>;
}

// ActiveUser 컴포넌트 props 타입 정의
interface ActiveUserProps {
  users: User[];
  onProfilePress?: (user: User) => void;
  themeId?: number;
}

const ActiveUser = ({ users, onProfilePress, themeId = 1 }: ActiveUserProps) => {
  const profileIconColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const profileBorderColor = themeId === 2 ? "#9FC9FF" : "#DEC2DB";
  const userNameColor = themeId === 2 ? "#5C5279" : "#7c4762";
  
  // 개별 유저 렌더링 함수
  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <TouchableOpacity 
        style={[styles.profileCircle, { borderColor: profileBorderColor }]}
        onPress={() => onProfilePress && onProfilePress(item)}
      >
        <item.profileSvg width={24} height={24} color={profileIconColor} />
      </TouchableOpacity>
      <Text style={[styles.userName, { color: userNameColor }]}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>대화상대</Text>
    </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.userList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// 기본 props 설정
ActiveUser.defaultProps = {
  users: []
};

export default ActiveUser;

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    width: width * 0.8,
    alignSelf: "flex-start",
    paddingTop: 0,
    paddingBottom: height * 0.04,
    justifyContent: "space-between", // 내용물을 위아래로 분산
  },
  headerContainer: {
    width: width * 0.8,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginBottom: 10,
    marginTop: 0,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "light",
    color: "#333",
    marginTop: height * 0.01,
  },
  userList: {
    paddingHorizontal: 20,
    flex: 1, // FlatList가 가능한 공간을 모두 차지하도록 함
  },
  listContent: {
    paddingBottom: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    color: "#7c4762",
  },
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    backgroundColor: "#F3D4EE",
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  profileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // 매우 높은 z-index로 설정하여 맨 앞에 표시
    width: "100%",
    height: "100%",
    elevation: 5, // Android에서 z-index와 유사한 역할
  },
});
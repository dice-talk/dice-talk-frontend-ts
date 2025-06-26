import React, { useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore 임포트

// 사용자 데이터 타입 정의
interface User {
  id: string;
  memberId: number; // 사용자 고유 memberId 추가
  name: string;
  profileSvg: React.FC<SvgProps>;
}

// ActiveUser 컴포넌트 props 타입 정의
interface ActiveUserProps {
  users: User[];
  onProfilePress?: (user: User) => void;
}

const ActiveUser = ({ users, onProfilePress }: ActiveUserProps) => {
  // AuthStore에서 현재 사용자의 memberId 가져오기
  const currentUserMemberId = useAuthStore((state) => state.memberId);
  // console.log("ActiveUser - 현재 사용자 Member ID (from authStore):", currentUserMemberId, "(Type:", typeof currentUserMemberId, ")");
  // HomeStore에서 현재 테마 ID 가져오기
  const curThemeId = useHomeStore((state) => state.curThemeId);

  // 특정 닉네임 목록
  const specialNicknames = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];
  
  // 개별 유저 렌더링 함수
  const renderUser = ({ item }: { item: User }) => {
    // console.log("ActiveUser - Rendering User - item.id (partId):", item.id, "item.memberId:", item.memberId, "Name:", item.name);

    let currentProfileIconColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";
    let currentProfileBorderColor = curThemeId === 2 ? "#9FC9FF" : "#DEC2DB";
    let currentUserNameColor = curThemeId === 2 ? "#5C5279" : "#7c4762";

    // 요청된 조건: curThemeId가 1이고, 닉네임이 specialNicknames에 포함될 경우
    if (curThemeId === 1 && specialNicknames.includes(item.name)) {
      currentProfileIconColor = "#9FC9FF";
      currentProfileBorderColor = "#9FC9FF";
      currentUserNameColor = "#5C5279";
    }

    // 현재 사용자인지 확인 (item.memberId와 currentUserMemberId를 직접 비교)
    const isCurrentUser = item.memberId === currentUserMemberId;

    return (
      <View style={styles.userItem}>
        {/* 프로필 이미지 */}
        <TouchableOpacity
          style={[styles.profileCircle, { borderColor: currentProfileBorderColor }]}
          onPress={() => onProfilePress && onProfilePress(item)}
        >
          <item.profileSvg width={24} height={24} color={currentProfileIconColor} />
        </TouchableOpacity>

        {/* "나" 표시 (현재 사용자일 경우) */}
        {isCurrentUser && (
          <View style={[
            styles.meIndicatorCircle,
            { backgroundColor: curThemeId === 2 ? '#9FC9FF' : '#F9BCC1' } // 테마에 따른 배경색 적용
          ]}>
            <Text style={styles.meIndicatorText}>나</Text>
          </View>
        )}

        {/* 사용자 이름 */}
        <Text style={[styles.userName, { color: currentUserNameColor }]}>{item.name}</Text>
      </View>
    );
  };

  // 현재 사용자를 맨 위로 오도록 정렬된 사용자 목록 생성
  const sortedUsers = useMemo(() => {
    if (!currentUserMemberId || !users || users.length === 0) {
      return users;
    }
    // 현재 사용자를 찾을 때도 memberId를 사용합니다.
    const currentUserIndex = users.findIndex(user => user.memberId === currentUserMemberId);
    if (currentUserIndex > -1) {
      const currentUser = users[currentUserIndex];
      const otherUsers = users.filter((_, index) => index !== currentUserIndex);
      return [currentUser, ...otherUsers];
    }
    return users;
  }, [users, currentUserMemberId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>대화상대</Text>
    </View>
      <FlatList
        data={sortedUsers} // 정렬된 사용자 목록 사용
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.userList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
// themeId prop 제거로 defaultProps 불필요
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
  meIndicatorCircle: {
    width: 22, // 동그라미 크기
    height: 22, // 동그라미 크기
    borderRadius: 11, // 동그라미로 만들기 위해 너비/높이의 절반
    // backgroundColor 는 renderUser 함수 내에서 동적으로 설정됩니다.
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,   // 동그라미와 닉네임 사이의 간격
  },
  meIndicatorText: {
    fontSize: 12,
    fontWeight: 'light',
    color: '#ffffff', // "나" 텍스트 색상 (흰색)
  },
});
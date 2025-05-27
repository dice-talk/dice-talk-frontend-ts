import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ✅ Pagination 컴포넌트의 Props 타입 정의
interface PaginationProps {
  currentPage: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 함수
}

// 활성 페이지 그라데이션 색상 (투명도 0.8 적용)
const GRADIENT_COLORS_SELECTED = ['rgba(178, 142, 248, 0.8)', 'rgba(244, 118, 229, 0.8)'] as const;
const ITEMS_PER_GROUP = 5; // 한 번에 표시할 페이지 번호 개수

// ✅ Pagination 컴포넌트
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1); // 최소 1페이지 이상으로 보장

  // ✅ 현재 페이지가 속한 그룹 계산
  const currentGroup = Math.ceil(currentPage / ITEMS_PER_GROUP);
  const totalGroups = Math.ceil(safeTotalPages / ITEMS_PER_GROUP);

  // ✅ 표시할 페이지 번호 목록 계산 함수
  const getPageNumbers = (): number[] => {
    const startPageOfGroup = (currentGroup - 1) * ITEMS_PER_GROUP + 1;
    const endPageOfGroup = Math.min(startPageOfGroup + ITEMS_PER_GROUP - 1, safeTotalPages);

    const pages: number[] = [];
    for (let i = startPageOfGroup; i <= endPageOfGroup; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrevGroup = () => {
    const prevGroupFirstPage = (currentGroup - 2) * ITEMS_PER_GROUP + 1;
    onPageChange(prevGroupFirstPage);
  };

  const handleNextGroup = () => {
    const nextGroupFirstPage = currentGroup * ITEMS_PER_GROUP + 1;
    onPageChange(nextGroupFirstPage);
  };

  const isPrevDisabled = currentGroup === 1;
  const isNextDisabled = currentGroup === totalGroups;

  return (
    <View style={styles.paginationContainer}>
      {/* ✅ 이전 버튼 */}
      <TouchableOpacity
        onPress={handlePrevGroup}
        disabled={isPrevDisabled}
        style={[
          styles.pageButton,
          isPrevDisabled && styles.disabledButton,
        ]}
      >
        <Text style={[styles.pageText, isPrevDisabled && styles.disabledPageText]}>이전</Text>
      </TouchableOpacity>

      {/* ✅ 페이지 번호 목록 */}
      {getPageNumbers().map((pageNum, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => typeof pageNum === "number" && onPageChange(pageNum)}
          style={[
            styles.pageButton,
            pageNum === currentPage && styles.selectedPageButton,
          ]}
        >
          {pageNum === currentPage ? (
            // ✅ 선택된 페이지는 Gradient 적용
            <LinearGradient
              colors={GRADIENT_COLORS_SELECTED} // 수정된 그라데이션 색상 적용
              style={styles.gradientButton}
            >
              <Text style={styles.selectedPageText}>{pageNum}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.pageText}>{pageNum}</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* ✅ 다음 버튼 */}
      <TouchableOpacity
        onPress={handleNextGroup}
        disabled={isNextDisabled}
        style={[
          styles.pageButton,
          isNextDisabled && styles.disabledButton,
        ]}
      >
        <Text style={[styles.pageText, isNextDisabled && styles.disabledPageText]}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ 스타일 정의
const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 16,
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  gradientButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: 'center', // 텍스트 중앙 정렬
  },
  selectedPageButton: {
    borderWidth: 0,
    overflow: "hidden",
    paddingHorizontal: 0, // 내부 LinearGradient가 패딩을 가지므로 0으로 설정
    paddingVertical: 0,   // 내부 LinearGradient가 패딩을 가지므로 0으로 설정
  },
  pageText: {
    fontSize: 15, // 폰트 크기 살짝 줄임 (선택)
    color: "#7d7d7d",
    fontFamily: 'Pretendard-Regular',
  },
  selectedPageText: {
    fontSize: 15, // pageText와 동일하게 조정 (선택)
    color: "#FFFFFF",
    fontFamily: 'Pretendard-Bold',
  },
  disabledButton: {
    backgroundColor: "#F0F0F0",
  },
  disabledPageText: { // 비활성화된 버튼의 텍스트 색상
    color: "#BDBDBD", 
  },
  // dotsButton 스타일은 더 이상 필요 없으므로 주석 처리 또는 삭제 가능
  // dotsButton: { 
  //   backgroundColor: 'transparent',
  // }
});

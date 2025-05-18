import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ✅ Pagination 컴포넌트의 Props 타입 정의
interface PaginationProps {
  currentPage: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 함수
}

// ✅ Pagination 컴포넌트
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
//   // ✅ 페이지가 1 미만일 경우 표시하지 않음
//   if (!totalPages || totalPages < 1) return null;

  const safeTotalPages = Math.max(totalPages, 1); // 최소 1페이지 이상으로 보장

  // ✅ 표시할 페이지 번호 목록 계산 함수
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2; // 현재 페이지 앞뒤로 표시할 페이지 수
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    // ✅ 전체 페이지 범위에서 표시할 페이지 결정
    for (let i = 1; i <= safeTotalPages; i++) {
      if (
        i === 1 || // 첫 페이지
        i === safeTotalPages || // 마지막 페이지
        (i >= currentPage - delta && i <= currentPage + delta) // 현재 페이지 주변
      ) {
        range.push(i);
      }
    }

    // ✅ ...을 추가하여 페이지 목록 압축
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <View style={styles.paginationContainer}>
      {/* ✅ 이전 버튼 */}
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1} // 첫 페이지에서는 비활성화
        style={[
          styles.pageButton,
          currentPage === 1 && styles.disabledButton,
        ]}
      >
        <Text style={styles.pageText}>이전</Text>
      </TouchableOpacity>

      {/* ✅ 페이지 번호 목록 */}
      {getPageNumbers().map((pageNum, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => typeof pageNum === "number" && onPageChange(pageNum)}
          disabled={pageNum === "..."} // ...은 클릭 불가
          style={[
            styles.pageButton,
            pageNum === currentPage && styles.selectedPageButton,
          ]}
        >
          {pageNum === currentPage ? (
            // ✅ 선택된 페이지는 Gradient 적용
            <LinearGradient
              colors={["#B28EF8", "#F476E5"]}
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
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === safeTotalPages} // 마지막 페이지에서는 비활성화
        style={[
          styles.pageButton,
          currentPage === safeTotalPages && styles.disabledButton,
        ]}
      >
        <Text style={styles.pageText}>다음</Text>
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
  },
  selectedPageButton: {
    borderWidth: 0,
    overflow: "hidden",
  },
  pageText: {
    fontSize: 16,
    color: "#7d7d7d",
  },
  selectedPageText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#F0F0F0",
    color: "#BDBDBD",
  },
});

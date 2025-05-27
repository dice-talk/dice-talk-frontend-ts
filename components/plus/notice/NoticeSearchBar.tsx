import { Ionicons } from '@expo/vector-icons'; // 아이콘 사용
import React, { ElementRef, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList, // Modal, Pressable 대신 FlatList 사용
  LayoutAnimation, // 애니메이션 효과
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // 애니메이션 효과
  UIManager,
  View,
} from 'react-native';

export type NoticeTypeFilter = 'ALL' | 'NOTICE' | 'EVENT';

interface NoticeSearchBarProps {
  onSearch: (filter: NoticeTypeFilter, keyword: string) => void;
  initialFilter?: NoticeTypeFilter;
  initialKeyword?: string;
}

const { width } = Dimensions.get('window');
const SEARCH_BUTTON_WIDTH = 70; // 조회 버튼 너비

// Android에서 LayoutAnimation 사용을 위한 설정
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NoticeSearchBar: React.FC<NoticeSearchBarProps> = ({ 
  onSearch,
  initialFilter = 'ALL',
  initialKeyword = '' 
}) => {
  // 현재 선택된 필터 (전체, 공지, 이벤트)
  const [selectedFilter, setSelectedFilter] = useState<NoticeTypeFilter>(initialFilter);
  // 사용자가 입력한 검색 키워드
  const [keyword, setKeyword] = useState(initialKeyword);
  // 드롭다운 목록의 표시 여부
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // NoticeSearchBar 전체 컴포넌트(View)에 대한 ref. 드롭다운 위치 계산 시 기준점으로 사용.
  const containerRef = useRef<View>(null); 
  // '전체/공지/이벤트' 선택 버튼(TouchableOpacity)에 대한 ref. 위치 및 크기 측정에 사용.
  const dropdownButtonRef = useRef<ElementRef<typeof TouchableOpacity>>(null); 
  
  // 드롭다운 목록의 위치(top, left)와 너비(width)를 저장하는 상태
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // 드롭다운 목록에 표시될 필터 옵션들
  const filterOptions: { label: string; value: NoticeTypeFilter }[] = [
    { label: '전체', value: 'ALL' },
    { label: '공지', value: 'NOTICE' },
    { label: '이벤트', value: 'EVENT' },
  ];

  // '조회' 버튼 클릭 또는 TextInput에서 검색 실행 시 호출되는 함수
  const handleSearch = () => {
    const trimmedKeyword = keyword.trim(); // 입력된 키워드의 앞뒤 공백 제거
    // 키워드가 1글자인 경우 알림 표시 후 검색 중단
    if (trimmedKeyword.length === 1) {
      Alert.alert("알림", "검색어는 2글자 이상 입력해주세요.");
      return;
    }
    // 키워드가 없거나(0글자), 2글자 이상이거나, 또는 필터가 '전체'가 아닌 경우 검색 실행
    // (필터가 '전체'가 아니면 키워드가 없어도 해당 필터로 검색 가능)
    if (trimmedKeyword.length === 0 || trimmedKeyword.length >= 2 || selectedFilter !== 'ALL') {
        onSearch(selectedFilter, trimmedKeyword); // 부모 컴포넌트(NoticePage)로 검색 조건 전달
    } 
  };

  // 필터 선택 버튼(드롭다운 토글 버튼) 클릭 시 호출되는 함수
  const toggleDropdown = () => {
    // 드롭다운이 현재 닫혀있는 상태에서 열려고 할 때
    if (!dropdownVisible) { 
      // 버튼과 컨테이너 ref가 모두 유효한지 확인
      if (dropdownButtonRef.current && containerRef.current) {
        // 1. 컨테이너(NoticeSearchBar 전체)의 화면 절대 좌표(cpx, cpy)를 측정
        containerRef.current.measure((_cfx, _cfy, _cw, _ch, cpx, cpy) => {
          // 2. 드롭다운 버튼의 화면 절대 좌표(bpx, bpy)와 크기(bw, bh)를 측정
          //    containerRef.current.measure 콜백 내에서 호출해야 정확한 시점에 측정 가능
          dropdownButtonRef.current!.measure((_bfx, _bfy, bw, bh, bpx, bpy) => {
            // 3. 컨테이너에 대한 버튼의 상대적 top, left 위치 계산
            //    (버튼의 화면 y + 버튼 높이) - 컨테이너의 화면 y = 컨테이너 내부에서의 드롭다운 시작 y 위치
            const relativeTop = (bpy + bh) - cpy; 
            //    버튼의 화면 x - 컨테이너의 화면 x = 컨테이너 내부에서의 드롭다운 시작 x 위치
            const relativeLeft = bpx - cpx; 
            
            // 계산된 위치와 버튼 너비로 드롭다운 목록 위치 상태 업데이트
            setDropdownPosition({ top: relativeTop, left: relativeLeft, width: bw });
            // 애니메이션과 함께 드롭다운 목록 표시
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setDropdownVisible(true);
          });
        });
      } else {
        // ref가 유효하지 않으면 에러 로그 출력
        console.error("NoticeSearchBar: Refs not available to measure for dropdown.");
      }
    } else { // 드롭다운이 현재 열려있는 상태에서 닫으려고 할 때
      // 애니메이션과 함께 드롭다운 목록 숨김
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDropdownVisible(false);
    }
  };

  // 드롭다운 목록에서 특정 필터 옵션 선택 시 호출되는 함수
  const handleSelectFilter = (value: NoticeTypeFilter) => {
    setSelectedFilter(value); // 선택된 필터 상태 업데이트
    // 애니메이션과 함께 드롭다운 목록 숨김
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDropdownVisible(false);
    // 참고: 필터 변경 시 바로 검색을 실행하지 않고, '조회' 버튼을 눌렀을 때 검색 실행
  };

  return (
    <View style={styles.container} ref={containerRef}> {/* 전체 컨테이너에 ref 연결 */}
      <View style={styles.searchRow}>
        {/* 필터 선택 버튼 (드롭다운 토글) */}
        <TouchableOpacity 
            ref={dropdownButtonRef} // 버튼에 ref 연결
            style={styles.dropdownDisplay}
            onPress={toggleDropdown} // 클릭 시 toggleDropdown 호출
            activeOpacity={0.7}
        >
            <Text style={styles.dropdownText}>
                {/* 현재 선택된 필터의 라벨 표시, 없으면 '전체' 표시 */}
                {filterOptions.find(opt => opt.value === selectedFilter)?.label || '전체'}
            </Text>
            {/* 드롭다운 화살표 아이콘 (열림/닫힘 상태에 따라 아이콘 변경) */}
            <Ionicons name={dropdownVisible ? "caret-up" : "caret-down"} size={16} color="#868E96" />
        </TouchableOpacity>

        {/* 검색어 입력 필드 */}
        <TextInput
          style={styles.input}
          placeholder="제목"
          placeholderTextColor="#ADB5BD"
          value={keyword} // 현재 키워드 상태와 연결
          onChangeText={setKeyword} // 텍스트 변경 시 키워드 상태 업데이트
          onSubmitEditing={handleSearch} // 키보드에서 '검색' 누르면 handleSearch 호출
          returnKeyType="search" // 키보드의 'return' 키를 '검색'으로 표시
        />
        {/* 조회 버튼 */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>조회</Text>
        </TouchableOpacity>
      </View>

      {/* 드롭다운 목록 (dropdownVisible이 true일 때만 렌더링) */}
      {dropdownVisible && (
        <View 
          style={[
            styles.dropdownListContainer, // 기본 스타일
            { // 계산된 동적 위치 및 크기 적용
              position: 'absolute', // 부모(styles.container) 기준으로 절대 위치
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }
          ]}
        >
          <FlatList
            data={filterOptions} // 필터 옵션 데이터
            keyExtractor={(item) => item.value} // 각 아이템의 고유 키
            renderItem={({ item }) => ( // 각 필터 옵션 렌더링
              <TouchableOpacity
                style={[
                  styles.dropdownOption,
                  // 현재 선택된 필터와 같은 옵션이면 선택된 스타일 적용
                  item.value === selectedFilter && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleSelectFilter(item.value)} // 옵션 클릭 시 handleSelectFilter 호출
              >
                <Text 
                  style={[
                      styles.dropdownOptionText,
                      item.value === selectedFilter && styles.dropdownOptionTextSelected
                  ]}>
                    {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10, // 드롭다운 목록이 다른 요소들 위에 오도록 zIndex 설정
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dropdownDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 내부 텍스트와 아이콘을 양 끝으로
    alignItems: 'center',
    height: 42,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 100, // 최소 너비
    backgroundColor: '#FFFFFF', // 드롭다운 펼쳐졌을 때 아래 내용 가리기 위함
  },
  dropdownText: {
    fontSize: 15,
    color: '#333333',
    fontFamily: 'Pretendard-Regular',
    marginRight: 5, // 텍스트와 화살표 아이콘 사이 간격
  },
  input: {
    flex: 1, // 남은 공간 모두 차지
    height: 42,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
    marginHorizontal: 8, // 필터 버튼 및 조회 버튼과의 간격
  },
  searchButton: {
    width: SEARCH_BUTTON_WIDTH,
    height: 42,
    backgroundColor: '#B28EF8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
  },
  // Dropdown List Styles
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    borderTopWidth: 0, // 상단 테두리는 Display 버튼과 겹치므로 제거
    borderTopLeftRadius: 0, // 위쪽 모서리 각 없앰
    borderTopRightRadius: 0,
    // 버튼 하단 테두리와 드롭다운 목록 상단 테두리가 자연스럽게 겹치도록 살짝 올림
    marginTop: -StyleSheet.hairlineWidth, 
    maxHeight: 180, // 드롭다운 목록의 최대 높이 (스크롤 가능하도록)
    elevation: 5, // Android 그림자 효과
    shadowColor: '#000', // iOS 그림자 효과
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden', // 내부 FlatList 내용이 borderRadius를 벗어나지 않도록
  },
  dropdownOption: {
    paddingVertical: 12, 
    paddingHorizontal: 12,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0EFFF', // 선택된 옵션 배경색
  },
  dropdownOptionText: {
    fontSize: 15, 
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
  },
  dropdownOptionTextSelected: {
    fontFamily: 'Pretendard-SemiBold', // 선택된 옵션 텍스트 굵게
    color: '#B28EF8', // 선택된 옵션 텍스트 색상
  },
});

export default NoticeSearchBar; 
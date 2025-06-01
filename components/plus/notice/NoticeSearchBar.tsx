import { Ionicons } from '@expo/vector-icons';
import React, { ElementRef, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
const SEARCH_BUTTON_WIDTH = 70;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NoticeSearchBar: React.FC<NoticeSearchBarProps> = ({ 
  onSearch,
  initialFilter = 'ALL',
  initialKeyword = '' 
}) => {
  const [selectedFilter, setSelectedFilter] = useState<NoticeTypeFilter>(initialFilter);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const containerRef = useRef<View>(null);
  const dropdownButtonRef = useRef<ElementRef<typeof TouchableOpacity>>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const filterOptions: { label: string; value: NoticeTypeFilter }[] = [
    { label: '전체', value: 'ALL' },
    { label: '공지', value: 'NOTICE' },
    { label: '이벤트', value: 'EVENT' },
  ];

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length === 1) {
      Alert.alert("알림", "검색어는 2글자 이상 입력해주세요.");
      return;
    }
    if (trimmedKeyword.length === 0 || trimmedKeyword.length >= 2 || selectedFilter !== 'ALL') {
        onSearch(selectedFilter, trimmedKeyword);
    } 
  };

  const toggleDropdown = () => {
    if (!dropdownVisible) { 
      if (dropdownButtonRef.current && containerRef.current) {
        containerRef.current.measure((_cfx, _cfy, _cw, _ch, cpx, cpy) => {
          dropdownButtonRef.current!.measure((_bfx, _bfy, bw, bh, bpx, bpy) => {
            const relativeTop = (bpy + bh) - cpy;
            const relativeLeft = bpx - cpx;
            setDropdownPosition({ top: relativeTop, left: relativeLeft, width: bw });
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setDropdownVisible(true);
          });
        });
      } else {
        console.error("NoticeSearchBar: Refs not available to measure for dropdown.");
      }
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDropdownVisible(false);
    }
  };

  const handleSelectFilter = (value: NoticeTypeFilter) => {
    setSelectedFilter(value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDropdownVisible(false);
  };

  console.log("NoticeSearchBar rendering (fully restored)");

  return (
    <View style={styles.container} ref={containerRef}>
      <View style={styles.searchRow}>
        <TouchableOpacity 
            ref={dropdownButtonRef}
            style={styles.dropdownDisplay}
            onPress={toggleDropdown}
            activeOpacity={0.7}
        >
            <Text style={styles.dropdownText}>
                {filterOptions.find(opt => opt.value === selectedFilter)?.label || '전체'}
            </Text>
            <Ionicons name={dropdownVisible ? "caret-up" : "caret-down"} size={16} color="#868E96" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="제목"
          placeholderTextColor="#ADB5BD"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>조회</Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View 
          style={[
            styles.dropdownListContainer,
            {
              position: 'absolute',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }
          ]}
        >
          <FlatList
            data={filterOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownOption,
                  item.value === selectedFilter && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleSelectFilter(item.value)}
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
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dropdownDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 15,
    color: '#333333',
    fontFamily: 'Pretendard-Regular',
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 42,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
    marginHorizontal: 8,
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
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -StyleSheet.hairlineWidth,
    maxHeight: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0EFFF',
  },
  dropdownOptionText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#333333',
  },
  dropdownOptionTextSelected: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#B28EF8',
  },
});

export default NoticeSearchBar; 
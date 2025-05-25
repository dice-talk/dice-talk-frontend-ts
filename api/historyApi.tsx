// SVG 에셋 임포트 (SideBar.tsx와 유사하게, 실제 경로에 맞게 조정 필요)
// 기본 이미지도 그대로 사용 가능
export const defaultProfilePng = require('@/assets/images/profile/profile_default.png');

// SVG 프로필 이미지 임포트 (경로를 실제 프로젝트에 맞게 확인/수정 필요)
import DaoSvg from '@/assets/images/chat/dao.svg'; // dao.svg가
import DoriSvg from '@/assets/images/chat/dori.svg'; // dori.svg 추가
import HanaSvg from '@/assets/images/chat/hana.svg';
import NemoSvg from '@/assets/images/chat/nemo.svg';
import SezziSvg from '@/assets/images/chat/sezzi.svg'; // sezzi.svg 추가
import YukdaengSvg from '@/assets/images/chat/yukdaeng.svg'; // yukdaeng.svg 추가

// 토큰은 실제 환경에서는 Zustand, Context API, AsyncStorage 등에서 관리됩니다.
const DUMMY_TOKEN = 'YOUR_DUMMY_ACCESS_TOKEN';

// 채팅방 목록 아이템 타입 (API 응답 기반)
export interface ChatRoomItem {
  chatRoomId: number;
  roomType: 'COUPLE' | 'GROUP' | string; // GROUP도 있을 수 있으므로 string 추가
  roomStatus: 'ROOM_ACTIVE' | string;
  lastChat: string | null;
  createdAt: string; // "YYYY-MM-DDTHH:mm:ss.SSSSSS"
  modifiedAt: string; // "YYYY-MM-DDTHH:mm:ss.SSSSSS"
  // 추가적으로 상대방 정보 (memberId, name, profileImage 등)가 필요할 수 있으나, 현재 API 명세에는 없음
  // 필요하다면 백엔드에 요청하여 응답에 포함하거나, 별도 API로 가져와야 합니다.
  // 더미데이터 구성을 위해 임시 필드 추가
  opponentName?: string;
  opponentProfileSvg?: any; // SVG 컴포넌트 또는 이미지 경로 (React.FC<SvgProps> | ImageSourcePropType)
}

// 페이지 정보 타입 (API 응답 기반)
export interface PageInfo {
  page: number;      // 현재 페이지
  size: number;      // 페이지 당 항목 수
  totalElements: number; // 총 항목 수
  totalPages: number;    // 총 페이지 수
}

// 채팅방 목록 조회 API 응답 타입
export interface ChatRoomListResponse {
  data: ChatRoomItem[];
  pageInfo: PageInfo;
}

// 하트 히스토리 아이템 타입 (API 응답 기반)
export interface HeartHistoryItem {
  roomEventId: number;
  receiverId: number;
  senderId: number;
  chatRoomId: number;
  message: string | null;
  roomEventType: 'PICK_MESSAGE' | string; // 다양한 이벤트 타입이 있을 수 있음
  createdAt: string;
  modifiedAt: string;
  // sender 정보 (이름, 프로필 등)를 위해 임시 필드 추가
  senderName?: string;
  senderProfileSvg?: any; // SVG 컴포넌트 또는 이미지 경로 (React.FC<SvgProps> | ImageSourcePropType)
}

// 하트 히스토리 조회 API 응답 타입 (API 명세에는 pageInfo가 없으나, 필요시 추가될 수 있음)
export interface HeartHistoryListResponse {
  data: HeartHistoryItem[];
  // pageInfo?: PageInfo; // 필요시 추가
}

// 사용자 정보 맵 (ID 기반)
// SvgProps 타입을 사용하기 위해 SvgProps를 import 해야 할 수 있습니다.
// import { SvgProps } from 'react-native-svg';
// interface UserProfileData { name: string; color?: string; profileSvg: React.FC<SvgProps> | any; }

const userProfileMap: Record<string, { name: string; profileSvg: any }> = {
  '1': { name: '한가로운 하나', profileSvg: HanaSvg },
  '2': { name: '두 얼굴의 매력 두리', profileSvg: DoriSvg },
  '3': { name: '세침한 세찌', profileSvg: SezziSvg },
  '4': { name: '네모지만 부드러운 네몽', profileSvg: NemoSvg },
  '5': { name: '단호하데 다정한 다오', profileSvg: DaoSvg },
  '6': { name: '육감적인 직감파 육땡', profileSvg: YukdaengSvg },
  // 필요에 따라 더 많은 사용자 추가
};

/**
 * 1:1 채팅 내역 (채팅방 목록) 조회 API
 * @param memberId 회원 ID
 * @param page 페이지 번호 (1부터 시작)
 * @param size 페이지 당 항목 수
 */
export const getChatHistory = async (
  memberId: number,
  page: number,
  size: number,
): Promise<ChatRoomListResponse> => {
  console.log(`[API] getChatHistory 호출: memberId=${memberId}, page=${page}, size=${size}`);
  // 실제 API 호출 로직 (주석 처리)
  /*
  try {
    const response = await axiosInstance.get(`/chat-rooms/my-chat-rooms/${memberId}`, {
      params: {
        page: page - 1, // 백엔드가 0-indexed page를 사용한다면 조정
        size,
      },
      headers: {
        Authorization: `Bearer ${DUMMY_TOKEN}`,
      },
    });
    return response.data; // 실제 응답 구조에 맞춰야 함
  } catch (error) {
    console.error('Error fetching chat history:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data; 
    }
    throw error;
  }
  */

  // 더미 데이터 반환 (개발용)
  // 이 부분은 실제 API 연동 시 제거하거나, 목업 서버(msw 등)로 대체합니다.
  return new Promise((resolve) => {
    setTimeout(() => {
      // opponentProfiles 배열 대신 userProfileMap 사용을 위해 ID 목록 생성
      const opponentIds = ['1', '2', '3', '4', '5', '6']; // 예시 ID 목록
      const sampleChats = [
        '여러븐 다들 즐거웠고 다음에 기회 되면 ...', 
        '너무 즐거웠어요!! 오늘도 행복한 하루되세요^^', 
        '감기 조심하세요 모두', 
        'I wanna be your friend!',
        '같이 술먹고싶어요'
      ];

      const itemsPerPage = size;
      const totalItems = 23; 
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

      const data: ChatRoomItem[] = Array.from({ length: endIndex - startIndex }, (_, i) => {
        const itemIndex = startIndex + i;
        const opponentId = opponentIds[itemIndex % opponentIds.length];
        const opponentProfile = userProfileMap[opponentId] || { name: '알 수 없는 상대', profileSvg: defaultProfilePng };
        const date = new Date();
        date.setDate(date.getDate() - itemIndex * 2);
        return {
          chatRoomId: itemIndex + 100,
          roomType: 'COUPLE',
          roomStatus: 'ROOM_ACTIVE',
          lastChat: sampleChats[itemIndex % sampleChats.length],
          createdAt: date.toISOString(),
          modifiedAt: date.toISOString(),
          opponentName: opponentProfile.name,
          opponentProfileSvg: opponentProfile.profileSvg,
        };
      });

      resolve({
        data,
        pageInfo: {
          page,
          size,
          totalElements: totalItems,
          totalPages,
        },
      });
    }, 500);
  });
};

/**
 * 하트 히스토리 조회 API
 * @param memberId 회원 ID
 * @param token 인증 토큰 (실제로는 함수 파라미터나 인터셉터에서 처리)
 */
export const getHeartHistory = async (
  memberId: number,
  // page: number, // API 명세에는 페이지네이션 없음, 필요시 추가
  // size: number,
): Promise<HeartHistoryListResponse> => {
  console.log(`[API] getHeartHistory 호출: memberId=${memberId}`);
  // 실제 API 호출 로직 (주석 처리)
  /*
  try {
    const response = await axiosInstance.get(`/room-event-history/${memberId}`, {
      // params: { page: page -1, size }, // 필요하다면 페이지네이션 파라미터 추가
      headers: {
        Authorization: `Bearer ${DUMMY_TOKEN}`,
      },
    });
    return response.data; // 실제 응답 구조에 맞춰야 함
  } catch (error) {
    console.error('Error fetching heart history:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data; 
    }
    throw error;
  }
  */

  // 더미 데이터 반환 (개발용)
  // senderId를 기반으로 사용자 정보를 매핑해야 함 (SideBar.tsx의 users 데이터 활용)
  const sampleMessages = [
    '네모지만 부드러운 네몽 지켜보고있어요.',
    '육감적인 직감파 육땡 넘 좋아해.',
    '네모지만 부드러운 네몽 너한테 설렜어.',
    '세침한 세찌 I wanna be your friend!',
    '한가로운 하나 같이 술먹고싶어요'
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const data: HeartHistoryItem[] = Array.from({ length: 15 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i * 3);
        // senderId를 문자열로 가정하고 userProfileMap 사용 (API 명세의 senderId는 number이므로 주의)
        // 실제 API에서는 senderId (number)를 어떻게 문자열 ID로 매핑할지 또는
        // userProfileMap의 키를 숫자로 할지 결정 필요. 여기서는 (i % 6) + 1 로 생성된 숫자를 문자열로 변환.
        const senderIdKey = ((i % 6) + 1).toString(); 
        const senderProfile = userProfileMap[senderIdKey] || { name: '알 수 없는 사용자', profileSvg: defaultProfilePng };
        const receiverId = ((i + 2) % 6) + 1;
        return {
          roomEventId: i + 200,
          receiverId: receiverId,
          senderId: parseInt(senderIdKey), // API 명세에 따라 숫자로 다시 변환
          chatRoomId: i + 300,
          message: sampleMessages[i % sampleMessages.length],
          roomEventType: 'PICK_MESSAGE',
          createdAt: date.toISOString(),
          modifiedAt: date.toISOString(),
          senderName: senderProfile.name,
          senderProfileSvg: senderProfile.profileSvg,
        };
      });
      resolve({ data }); // API 명세상 pageInfo가 없으므로 data만 반환
    }, 500);
  });
}; 
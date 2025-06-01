import { axiosWithToken } from "./axios/axios";

// --- 인터페이스 정의 (API 응답 구조 기반) ---

// 채팅 메시지 상세 정보
export interface ReportChatMessageDto {
  chatId: number;
  message: string;
  memberId: number;
  nickName: string | null; // API 응답에서는 null일 수 있음
  chatRoomId: number;    // API 응답에서는 0으로 올 수 있음
  createdAt: string;     // 메시지 생성 시각 (ISO 8601 형식 문자열)
}

// 채팅방 참여자 정보
export interface ReportChatParticipantDto {
  partId: number;
  nickname: string;
  profile: string; // 프로필 이미지 URL 또는 식별자
  memberId: number;
  chatRoomId: number; // API 응답에서는 0으로 올 수 있음
  exitStatus: string; 
}

// 채팅방 이벤트 정보
export interface ReportRoomEventDto {
  roomEventId: number;
  receiverId: number;
  senderId: number;
  chatRoomId: number | null;
  message: string;
  roomEventType: string;
  createdAt: string;
  modifiedAt: string | null;
}

// 채팅방 상세 정보 (API 응답의 data 필드 내부)
export interface ChatRoomDetailDataDto {
  chatRoomId: number;
  roomType: string;
  notice: string;
  roomStatus: string;
  themeName: string;
  chats: ReportChatMessageDto[]; // 이 부분이 신고할 메시지 목록에 해당합니다.
  chatParts: ReportChatParticipantDto[];
  roomEvents: ReportRoomEventDto[];
  createdAt: string;
  modifiedAt: string | null;
}

// 전체 API 응답 DTO
export interface ChatRoomDetailResponseDto {
  data: ChatRoomDetailDataDto;
}

// --- API 호출 함수 ---

/**
 * API 호출 시 전달할 파라미터 인터페이스 (채팅방 상세 조회용)
 */
interface GetChatRoomDetailsParams {
  chatRoomId: number;
  page?: number; // 페이지 번호 (1부터 시작, API 명세에 따름)
  size?: number; // 페이지당 메시지 수
}

/**
 * 특정 채팅방의 상세 정보 및 메시지 목록을 조회합니다.
 * (주로 신고 대상 메시지 목록을 가져오는 데 사용될 것입니다)
 * 
 * @param params - GetChatRoomDetailsParams (chatRoomId, page, size)
 * @returns Promise<ChatRoomDetailDataDto> - 채팅방 상세 정보 및 메시지 목록
 */
export const getChatRoomDetailsForReport = async (
  params: GetChatRoomDetailsParams
): Promise<ChatRoomDetailDataDto> => {
  const { chatRoomId, page, size } = params;

  const queryParams: Record<string, string | number> = {}; // size와 page를 위해 string도 허용
  if (page !== undefined) {
    queryParams.page = page;
  }
  if (size !== undefined) {
    queryParams.size = size;
  }

  try {
    const queryString = Object.keys(queryParams).length > 0 
      ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}` 
      : "";
    console.log(`📡 GET /chat-room/${chatRoomId}${queryString}`);
    
    const response = await axiosWithToken.get<ChatRoomDetailResponseDto>(
      `/chat-room/${chatRoomId}`, 
      { params: queryParams }
    );
    
    console.log(`✅ Chat room details for report fetched successfully for room ${chatRoomId}`);
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Unknown error";
    console.error(`🚨 Error fetching chat room details for report (room ${chatRoomId}):`, errorMessage, error.response?.status);
    throw error; 
  }
};

// --- 신고 등록 관련 인터페이스 및 함수 ---

/**
 * 신고할 채팅 메시지 정보 DTO
 */
interface ChatReportDto {
  chatId: number;
}

/**
 * 신고 생성 요청 DTO
 */
export interface ReportCreationDto {
  reason: string; // 신고 사유 (단일 문자열)
  chatReports: ChatReportDto[]; // 신고할 채팅 ID 목록
  reportedMemberIds: number[]; // 신고 대상 사용자 ID 목록
}

/**
 * 신고를 등록합니다.
 * 
 * @param reportData - ReportCreationDto (신고 데이터)
 * @returns Promise<void> - 성공 시 별도의 반환 값 없음 (201 CREATED)
 */
export const createReport = async (reportData: ReportCreationDto): Promise<void> => {
  try {
    console.log("📡 POST /reports", JSON.stringify(reportData, null, 2));
    const response = await axiosWithToken.post("/reports", reportData);
    
    // API 명세상 201 CREATED는 별도 body가 없으므로, 상태 코드만 확인
    if (response.status === 201) {
      console.log("✅ Report created successfully");
    } else {
      // 201이 아닌 다른 성공 응답 코드가 올 경우를 대비한 로깅 (보통은 발생하지 않음)
      console.warn("⚠️ Report creation returned an unexpected status code:", response.status, response.data);
    }
    // 성공 시 별도 반환값 없음
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";
    const fieldErrors = error.response?.data?.fieldErrors;
    console.error("🚨 Error creating report:", errorMessage, fieldErrors, error.response?.status);
    // 에러를 다시 throw하여 호출하는 쪽에서 상세 처리(예: UI 피드백)를 할 수 있도록 함
    // fieldErrors와 같은 구체적인 오류 정보도 함께 전달하면 좋음
    if (fieldErrors) {
      throw { message: errorMessage, fieldErrors, status: error.response?.status };
    }
    throw error;
  }
}; 
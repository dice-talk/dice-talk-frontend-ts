// 시간 상수 (초 단위) - 채팅방 이벤트 진행 시간 정의

export const SECRET_MESSAGE_START_OFFSET = 6 * 60; // 채팅방 생성 후 6분 뒤 시크릿 메시지 시작
export const SECRET_MESSAGE_DURATION = 6 * 60;     // 시크릿 메시지 6분 진행
export const SECRET_MESSAGE_END_OFFSET = SECRET_MESSAGE_START_OFFSET + SECRET_MESSAGE_DURATION;

// 1단계: 시크릿 메시지 종료 후 ~ 큐피드 이벤트 시작 전 (시크릿 메시지 결과 확인 가능)
export const CUPID_INTERIM_START_OFFSET = SECRET_MESSAGE_END_OFFSET;
export const CUPID_INTERIM_DURATION = 6 * 60; // 6분 진행
export const CUPID_INTERIM_END_OFFSET = CUPID_INTERIM_START_OFFSET + CUPID_INTERIM_DURATION;

// 2단계: 큐피드 이벤트 진행
export const CUPID_MAIN_EVENT_START_OFFSET = CUPID_INTERIM_END_OFFSET;
export const CUPID_MAIN_EVENT_DURATION = 6 * 60; // 큐피드 메인 이벤트 6분 진행
export const CUPID_MAIN_EVENT_END_OFFSET = CUPID_MAIN_EVENT_START_OFFSET + CUPID_MAIN_EVENT_DURATION;

// 큐피드 메인 이벤트 종료 후 ~ 채팅방 종료까지 (큐피드 결과 확인 가능 및 채팅방 종료 카운트다운)
export const POST_CUPID_MAIN_DURATION = 6 * 60; // 6분
export const CHAT_ROOM_END_OFFSET = CUPID_MAIN_EVENT_END_OFFSET + POST_CUPID_MAIN_DURATION; // 채팅방 실제 종료 시점
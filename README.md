<!-- ### **DiceTalk 익명성 채팅 앱 개발 (Frontend)**

**설명:** Expo, React Native 기반의 익명성 채팅 애플리케이션 개발

**기술 스택:** TypeScript, React Native, Expo, Zustand, Axios, TanStack Query, Tailwind CSS, EAS

---

### **DiceTalk 프로젝트 상세 설명 및 기여**

DiceTalk는 익명성을 기반으로 사용자들이 자유롭게 소통할 수 있는 모바일 채팅 애플리케이션입니다. TypeScript와 React Native(Expo)를 중심으로 개발되었으며, Zustand와 TanStack Query를 활용하여 효율적인 상태 관리와 서버 데이터 통신을 구현했습니다.

*   **프로젝트 개요:**
    *   익명성 기반 채팅 및 소셜링 모바일 애플리케이션
    *   React Native/Expo 기반의 크로스플랫폼 앱
    *   개발 기간: 2024.06.01 ~ (진행 중)
    *   배포: EAS Build를 통한 APK/AAB 파일 빌드
    *   Repository: [https://github.com/DiceTalk/FE](https://github.com/DiceTalk/FE)

*   **주요 기술 스택:**
    *   **Frontend:** TypeScript, React Native, React, Expo, Zustand, TanStack Query, Axios, Tailwind CSS
    *   **Build/Deploy:** EAS (Expo Application Services), Expo Go
    *   **Tools:** GitHub, Discord, Notion, Figma, VSCode

*   **주요 기능 (담당 업무)**:

    1.  **Toss Payments 연동 (본인인증 및 결제)(FE)**
        *   **본인인증:** 아이디/비밀번호 찾기 프로세스에 Toss Payments의 본인인증 기능을 연동하여 사용자 계정의 보안을 강화했습니다.
        *   **결제 시스템 심화 구현:** React Native 환경에서 Toss Payments 결제 연동 시 발생하는 복잡한 문제들을 해결하고 안정적인 결제 시스템을 구축했습니다.
            *   **WebView 및 외부 앱 연동 문제 해결:** 결제 과정에서 `WebView`가 `intent://` URL 스킴을 처리하지 못해 발생하는 `net::ERR_UNKNOWN_URL_SCHEME` 오류를 해결했습니다. `WebView`의 `onShouldStartLoadWithRequest` prop을 활용하여 `intent://`로 시작하는 요청을 가로채고, React Native의 `Linking` 모듈로 전달하여 토스, 카카오페이 등 외부 결제 앱을 정상적으로 호출하도록 구현했습니다.
            *   **Android `queries` 설정 및 네이티브 빌드:** 외부 앱 호출 권한 부재로 인한 `No Activity found to handle Intent` 오류를 해결하기 위해, Toss Payments 공식 문서를 참고하여 `app.json` 파일에 `intent` 필터를 포함한 `queries` 설정을 추가했습니다. 이를 통해 특정 앱 패키지(예: `viva.republica.toss`, `com.kakaopay.app`)에 대한 상호작용 권한을 명시적으로 선언했습니다. 이 과정에서 네이티브 설정 변경을 적용하기 위해 `npx expo run:android`를 통한 개발 빌드 프로세스를 수행하고, 빌드 과정에서 발생한 Java 버전 불일치 문제(`org.gradle.java.home` 설정)와 앱 서명 충돌 문제(`INSTALL_FAILED_UPDATE_INCOMPATIBLE`)를 해결하며 Expo 개발 빌드에 대한 깊은 이해를 얻었습니다.
            *   **커스텀 URL 스킴을 이용한 딥링킹 구현:** 결제 완료 후, 외부 앱에서 `dicetalkts://`와 같은 커스텀 URL 스킴을 통해 다시 앱으로 돌아오는 흐름을 처리했습니다. `expo-router`를 활용하여 `payment-success`, `payment-fail` 경로에 해당하는 페이지를 만들고, 딥링크로 전달된 `orderId`, `paymentKey` 등의 파라미터를 파싱하여 백엔드에 최종 결제 승인 요청을 보내는 로직을 구현했습니다. 이를 통해 결제 상태의 정합성을 보장하고 사용자에게 명확한 피드백을 제공했습니다.

    2.  **푸시 알림 시스템 구현 (FE/BE)**
        *   **Expo Push Notification**을 활용하여 새로운 메시지, 공지사항 등 다양한 이벤트에 대한 실시간 푸시 알림 기능을 프론트엔드와 백엔드에 걸쳐 구현했습니다.
        *   **푸시 토큰 관리 로직 설계:** 사용자가 로그인할 때 기기의 고유 푸시 토큰을 발급받아 서버에 전송하고, 서버는 이를 사용자 ID와 매핑하여 데이터베이스에 저장하는 흐름을 설계했습니다. 이를 통해 특정 사용자에게 정확한 알림을 보낼 수 있는 기반을 마련했습니다.
        *   **관심사 분리(Separation of Concerns)를 통한 리팩토링:** 초기에는 로그인 컴포넌트(`Login.tsx`)에 있던 토큰 발급 및 권한 요청 로직을 별도의 유틸리티 파일(`utils/notificationUtils.ts`)로 분리했습니다. 이를 통해 코드의 재사용성을 높이고, 컴포넌트의 책임을 명확히 하여 유지보수성을 향상시켰습니다.
        *   **알림 기반 화면 이동 (딥링킹):** 백그라운드 상태의 앱에서 푸시 알림을 탭했을 때, 알림에 포함된 `chatRoomId` 데이터를 기반으로 `expo-router`를 사용하여 특정 채팅방으로 직접 이동시키는 딥링킹(Deep Linking) 로직을 구현했습니다. `app/_layout.tsx`에 전역 알림 리스너를 설정하여 앱의 모든 상태에서 일관되게 동작하도록 만들었습니다.
        *   **EAS 빌드 환경 구축:** 실제 기기 테스트 및 배포를 위해 **Expo Application Services (EAS)** 빌드 환경을 설정했습니다. `eas.json` 파일을 구성하고, `eas build:configure`를 통해 안드로이드 및 iOS 빌드 프로필을 관리하여 개발 빌드와 프로덕션 빌드를 체계적으로 준비했습니다.

    3.  **채팅 신고 기능 개발 (FE)**
        *   **신고 페이지 UI 구현:** 기존 채팅방과 유사한 UI를 구성하여 사용자가 신고 대상 대화 내용을 직관적으로 확인할 수 있도록 구현했습니다. `ChatMessageLeft`, `ChatMessageRight` 컴포넌트를 재사용하고, 사용자 ID를 비교하여 메시지를 좌/우로 정렬했습니다.
        *   **API 연동 및 데이터 관리:** 신고 대상 채팅 내역을 서버로부터 받아오는 기능을 구현했습니다. 백엔드의 페이지네이션(Pagination) 응답 구조(`data.chats.content`)에 맞춰 데이터를 파싱하고, `page`, `size` 파라미터를 동적으로 관리하여 400/404 에러를 해결했습니다.
        *   **동적 신고 사유 연동:** 하드코딩되었던 신고 사유를 API로 받아와 `ReportModal`에 동적으로 표시하도록 개선하여 유지보수성을 높였습니다.
        *   **신고 제출 로직 구현:** `reporterId`(신고자)와 `reportedMemberIds`(피신고자)를 포함한 `ReportCreationDto`를 구성하여 서버에 전송하는 로직을 완성하고, 신고 완료 시 `Alert` 대신 `Toast` 알림을 띄워 사용자 경험(UX)을 개선했습니다.

    4.  **교환 내역(History) 기능 개선 (FE)**
        *   **동적 UI 컴포넌트 구현:** `HistoryItem` 컴포넌트를 리팩토링하여 `themeId` 값에 따라 하트, 주사위 등 각기 다른 아이콘과 배경색, "익명의 유저"와 같은 커스텀 텍스트가 표시되도록 구현했습니다.
        *   **사용자 경험(UX) 개선:** 기존의 삭제 아이콘을 제거하고, 항목을 길게 누르면(Long Press) 삭제 확인 모달(`CancelModal`)이 나타나도록 구현했습니다. 이를 통해 UI를 간소화하고 사용자에게 더 직관적인 인터랙션을 제공했습니다.

    5.  **Git 버전 관리 및 충돌 해결**
        *   **Git LFS 문제 해결:** `git filter-branch` 명령어를 사용하여 원격 저장소의 커밋 히스토리에 포함된 대용량 `.apk` 파일을 완전히 제거하고, `force push`로 리포지토리를 정상화했습니다.
        *   **병합 충돌 해결:** 이미지 파일 중복으로 인해 발생한 병합 충돌(Merge Conflict) 상황에서 `--ours` 옵션을 사용하여 현재 브랜치의 변경사항을 선택하고, `git add`를 통해 충돌을 해결하여 안정적으로 브랜치를 병합했습니다.

    6.  **자동 로그인 및 사용자 세션 관리 (FE)**
        *   **토큰 기반 인증 구현:** `AccessToken`과 `RefreshToken`을 활용한 JWT(JSON Web Token) 기반의 인증 시스템을 구현했습니다. 로그인 시 서버로부터 발급받은 토큰을 `AsyncStorage`에 안전하게 저장하여 사용자 세션을 유지합니다.
        *   **자동 로그인 로직 설계:** 앱 시작 시 `AsyncStorage`에 저장된 `RefreshToken`을 사용해 새로운 `AccessToken`을 자동으로 재발급받는 로직을 구현했습니다. 이를 통해 사용자가 앱을 다시 실행했을 때 별도의 로그인 절차 없이 즉시 서비스를 이용할 수 있도록 하여 사용자 경험을 향상시켰습니다.
        *   **Zustand를 활용한 전역 상태 관리:** 사용자 정보(`memberId`)와 로그인 상태(`isLoggedIn`)를 Zustand 스토어에서 전역으로 관리하여, 앱의 모든 컴포넌트에서 일관된 인증 상태에 접근할 수 있도록 설계했습니다.
        *   **Expo Router와 연동한 초기 라우팅 처리:** 앱의 초기 로딩 과정에서 인증 상태를 비동기적으로 확인하고, 그 결과에 따라 사용자를 홈 화면 또는 로그인 화면으로 안내하는 라우팅 로직을 `app/_layout.tsx`에서 처리했습니다. 이 과정에서 발생하는 무한 렌더링 문제를 해결하며 Expo Router의 네비게이션 생명주기에 대한 깊은 이해를 얻었습니다.

### **프로젝트 회고**

이번 DiceTalk 프로젝트를 통해 TypeScript와 React Native 환경에서의 상태 관리와 서버 통신에 대한 깊이 있는 이해를 체득했습니다. 특히, **Zustand**를 이용한 전역 상태 관리와 **TanStack Query**를 활용한 서버 상태(캐싱, 동기화) 관리는 코드의 복잡성을 줄이고 데이터 흐름을 예측 가능하게 만드는 데 큰 도움이 되었습니다.

무엇보다 **React Native의 네이티브 연동성**에 대한 실무 역량을 키운 것이 가장 큰 성과입니다. Toss Payments와 같은 외부 SDK를 연동하는 과정에서, 단순한 JavaScript 코드 작성을 넘어 네이티브 레벨의 이해가 필수적임을 깨달았습니다. `WebView`에서의 특정 URL 스킴 처리, 외부 앱 호출을 위한 `app.json`의 `queries` 권한 설정, 그리고 네이티브 코드 수정을 적용하기 위한 `Expo`의 개발 빌드(`run:android`) 등 JavaScript와 네이티브 모듈 사이의 상호작용을 직접 다루었습니다. 이 과정에서 발생한 Java 버전 문제나 앱 서명 충돌과 같은 예기치 못한 빌드 오류들을 해결하며, 문제의 근본 원인을 파악하고 해결하는 디버깅 능력을 길렀습니다.

백엔드 API 명세가 변경되거나(예: 페이지네이션 도입), 예상치 못한 응답 구조를 마주했을 때, 네트워크 요청부터 데이터 파싱, 그리고 UI 렌더링까지 이어지는 과정을 체계적으로 디버깅하며 문제를 해결하는 능력을 길렀습니다. "길게 눌러서 삭제"와 같이 사용자 경험을 최우선으로 고려한 인터랙션을 구현하며, 좋은 UX가 앱의 완성도를 얼마나 높일 수 있는지 직접 체감할 수 있었습니다.

또한, **자동 로그인 기능을 구현**하며 애플리케이션의 생명주기와 비동기 상태 관리의 중요성을 깊이 체감했습니다. `AsyncStorage`에서 토큰을 비동기적으로 불러와 유효성을 검증하고, 그 결과에 따라 `expo-router`로 화면을 전환하는 과정은 복잡한 레이스 컨디션과 무한 렌더링 문제를 야기했습니다. 이 문제를 해결하기 위해 `useEffect`, `useState`, `useRef` 등 React 훅을 적절히 조합하고, Zustand 스토어의 상태와 Expo Router의 네비게이션 상태를 동기화하는 과정을 수없이 디버깅했습니다. 이 경험을 통해 단순한 기능 구현을 넘어, 앱의 초기 실행 흐름을 안정적으로 설계하고 예측 불가능한 상태 변화에 대응하는 능력을 기를 수 있었습니다.

특히 프로젝트를 진행하며 Expo와 React Native 생태계의 복잡한 의존성 문제와 빌드 프로세스에 대한 깊이 있는 트러블슈팅 경험을 쌓았습니다. `react@18` 버전과 Expo SDK 53의 호환성 문제로 발생한 `TypeError: Cannot read property 'S' of undefined`와 같은 원인을 찾기 힘든 런타임 에러를 해결하기 위해, 의존성 트리를 분석하고 라이브러리 간 버전 호환성을 맞추는 체계적인 과정을 수행했습니다. 이 과정에서 deprecated된 `expo-cli` 대신 `npx expo`를 사용하는 최신 개발 동향을 따르고, `ERESOLVE`와 같은 npm 의존성 충돌을 해결하며 패키지 매니저에 대한 이해도를 높였습니다.

또한, 코드의 확장성과 유지보수성을 높이기 위한 아키텍처 개선에 대해 고민하는 계기가 되었습니다. Axios 인터셉터에서 API 모듈을 순환 참조(Circular Dependency)하여 발생한 문제를 분석하고, 관련 로직을 분리하여 의존성 사이클을 끊어내는 리팩토링을 진행했습니다. 이는 단순히 기능을 구현하는 것을 넘어, 모듈 간의 결합도를 낮추고 코드 구조를 견고하게 설계하는 것의 중요성을 깨닫게 해주었습니다. 전역 상태 초기화 로직을 커스텀 훅으로 분리했던 경험과 더불어, 클린 아키텍처에 대한 실질적인 고민과 실천으로 이어졌습니다.

또한 Git LFS, 병합 충돌 등 협업 과정에서 발생할 수 있는 문제들을 직접 해결하며 버전 관리 시스템에 대한 실무적인 이해도를 높이는 계기가 되었습니다. 이번 프로젝트 경험을 바탕으로, 앞으로도 안정적이고 확장 가능하며 사용자 중심적인 애플리케이션을 개발하는 데 기여하고 싶습니다. -->

---
<br/>

# 포트폴리오용 README

### **[프로젝트 포트폴리오] DiceTalk: 익명 기반 소셜 채팅 애플리케이션**

---

### **1. 프로젝트 개요**

*   **프로젝트명:** DiceTalk (다이스톡)
*   **핵심 설명:** 익명성을 기반으로 사용자들이 관심사를 통해 자유롭게 소통하고 새로운 관계를 형성할 수 있는 모바일 채팅 애플리케이션입니다.
*   **개발 기간:** 2024.06.01 ~ 진행 중
*   **Repository:** [https://github.com/DiceTalk/FE](https://github.com/DiceTalk/FE)
*   **주요 역할:** 프론트엔드 개발 (React Native, Expo)
    *   핵심 기능 설계 및 구현 (결제, 푸시 알림, 자동 로그인 등)
    *   네이티브 연동 및 빌드 오류 트러블슈팅
    *   컴포넌트 아키텍처 리팩토링 및 사용자 경험(UX) 개선

---

### **2. 기술 스택**

*   **Frontend:** TypeScript, React Native, Expo, Zustand, TanStack Query, Axios, Tailwind CSS
*   **Build/Deploy:** EAS (Expo Application Services), Expo Go
*   **Tools:** Git, GitHub, Discord, Notion, Figma

---

### **3. 주요 기능 및 기여**

#### **가. Toss Payments 연동 (본인인증 및 결제 시스템 구축)**

*   Toss Payments SDK를 연동하여 **본인인증**과 **인앱 결제(재화 충전)** 기능을 구현했습니다.
*   React Native 환경의 `WebView`와 외부 결제 앱(토스, 카카오페이 등) 간의 **복잡한 통신 흐름을 안정적으로 처리**하여 결제 프로세스를 완주했습니다.
*   `intent://` URL 스킴 처리, 커스텀 URL 스킴(`dicetalkts://`)을 이용한 **딥링킹**을 구현하여 결제 완료 후 앱으로 정확히 복귀하고 후속 처리를 수행하는 로직을 완성했습니다.

#### **나. 실시간 푸시 알림 시스템 구현**

*   **Expo Push Notification**을 활용하여 새로운 메시지, 공지사항 등 다양한 이벤트에 대한 실시간 푸시 알림 시스템의 프론트엔드 로직을 구축했습니다.
*   사용자 로그인 시 기기별 **푸시 토큰을 발급받아 서버에 전송**하고, 알림 수신 시 특정 채팅방으로 바로 이동시키는 **딥링킹 로직**을 구현하여 사용성을 높였습니다.
*   관심사 분리 원칙에 따라, 컴포넌트에 혼재되어 있던 알림 관련 로직(권한 요청, 토큰 발급 등)을 별도의 유틸리티 모듈로 분리하여 **코드의 재사용성과 유지보수성을 향상**시켰습니다.

#### **다. 자동 로그인 및 사용자 세션 관리**

*   `AccessToken`과 `RefreshToken`을 `AsyncStorage`에 저장하여 **JWT 기반의 자동 로그인 시스템**을 구현했습니다.
*   앱 실행 시 `RefreshToken`의 유효성을 비동기적으로 검증하고, 결과에 따라 홈 또는 로그인 화면으로 안내하는 **초기 라우팅 로직**을 설계했습니다.
*   Zustand를 활용하여 인증 상태(`isLoggedIn`)와 사용자 정보(`memberId`)를 **전역으로 관리**함으로써, 앱의 모든 컴포넌트에서 일관된 상태에 안전하게 접근할 수 있도록 했습니다.

#### **라. 채팅 신고 및 교환 내역(History) 기능 개선**

*   **신고 기능:** 기존 UI 컴포넌트를 재사용하여 신고 대상 채팅 내역을 직관적으로 확인하고, API에서 받아온 신고 사유를 동적으로 표시하도록 구현했습니다. 신고 완료 후 `Toast` 메시지를 통해 **사용자 경험을 개선**했습니다.
*   **내역 기능:** `HistoryItem` 컴포넌트를 리팩토링하여 `themeId` 값에 따라 동적으로 다른 UI(아이콘, 배경색, 텍스트)가 표시되도록 구현하고, '길게 눌러서 삭제' 인터랙션을 도입하여 **UI를 간소화하고 사용성을 개선**했습니다.

---

### **4. 트러블 슈팅 경험**

#### **[1] 문제: WebView와 외부 앱 연동 시 `net::ERR_UNKNOWN_URL_SCHEME` 오류 발생**

결제 진행을 위해 `WebView`에서 토스페이먼츠 페이지를 로드했을 때, 토스나 카카오페이 앱을 호출하는 `intent://` URL을 처리하지 못해 결제가 중단되는 문제가 발생했습니다.

*   **접근 방식 및 해결 과정:**
    1.  **원인 분석:** React Native의 `WebView`는 기본적으로 `http/https` 외의 커스텀 URL 스킴(Custom URL Scheme)을 웹 요청으로 오해하여 오류를 발생시킵니다.
    2.  **해결 전략:** `WebView`의 요청을 가로채서(`Intercept`), `intent://`로 시작하는 요청일 경우 React Native의 `Linking` 모듈로 직접 외부 앱을 호출하도록 로직을 변경하는 전략을 세웠습니다.
    3.  **최종 코드:** `WebView`의 `onShouldStartLoadWithRequest` prop을 활용하여 `intent://` 스킴을 감지하고, `Linking.openURL`로 OS에 처리를 위임하여 문제를 해결했습니다.

    ```tsx
    // components/common/TossAuth.tsx
    import { WebView, WebViewMessageEvent } from 'react-native-webview';
    import { Linking } from 'react-native';

    const TossAuth = () => {
      const paymentUrl = 'https://...'; // 토스페이먼츠 결제 URL

      const handleShouldStartLoad = (event) => {
        const { url } = event;

        // intent:// 로 시작하는 안드로이드 앱 스킴을 감지
        if (url.startsWith('intent://')) {
          // Linking API를 통해 외부 앱 실행 시도
          Linking.openURL(url).catch(err => {
            console.error('앱 실행에 실패했습니다.', err);
            // 여기에 사용자가 앱을 설치할 수 있도록 마켓 링크로 보내는 등의
            // 예외 처리 로직을 추가할 수 있습니다.
          });
          // WebView의 기본 동작(페이지 로드)을 막습니다.
          return false;
        }
        
        // 그 외 http, https 등의 URL은 정상적으로 로드하도록 허용합니다.
        return true;
      };

      return (
        <WebView
          source={{ uri: paymentUrl }}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
        />
      );
    };
    ```

*   **배운 점 및 확장 방향:**
    *   `WebView`가 React Native의 네이티브 기능과 어떻게 상호작용하는지에 대한 깊은 이해를 얻었습니다.
    *   이 경험을 바탕으로, 향후 **지도 앱 연동, 외부 SNS 로그인 등 다양한 외부 앱과의 연동 기능을 더 빠르고 체계적으로 해결**할 수 있는 역량을 갖추게 되었습니다.

#### **[2] 문제: 라이브러리 버전 충돌로 인한 런타임 에러 (`TypeError: Cannot read property 'S' of undefined`)**

`react@18`과 특정 Expo SDK 버전 간의 호환성 문제로 인해, 앱 실행 직후 원인을 알 수 없는 런타임 에러가 발생하며 앱이 강제 종료되었습니다.

*   **접근 방식 및 해결 과정:**
    1.  **원인 분석:** 에러 메시지가 모호하여, Expo 및 React Native 공식 GitHub 이슈 트래커와 릴리즈 노트를 통해 라이브러리 간 버전 불일치 문제일 가능성이 높다고 판단했습니다.
    2.  **해결:** `npx expo install --fix` 명령어를 활용하여, 현재 Expo SDK 버전에 호환되는 정확한 버전으로 모든 의존성을 일괄 수정하여 문제를 해결했습니다.

    ```diff
    // package.json
    {
      "dependencies": {
        "expo": "~51.0.8",
        "react": "18.2.0",
        "react-native": "0.74.1",
    -   // Expo SDK 51과 호환성이 보장되지 않는 버전을 사용
    -   "expo-router": "^3.5.10", 
    -   "react-native-gesture-handler": "^2.16.0" 
    +   // Expo SDK 51과 호환되는 버전으로 수정됨
    +   "expo-router": "~3.5.16",
    +   "react-native-gesture-handler": "~2.16.1"
      }
    }
    ```

*   **배운 점 및 확장 방향:**
    *   React Native/Expo 개발에서 **의존성 관리의 중요성**과 **버전 호환성 확인**이 필수적임을 깨달았습니다.
    *   향후 프로젝트에서는 **라이브러리 업데이트 시 더욱 신중한 접근**을 할 것입니다. 주요 업데이트 전에는 반드시 Breaking Changes를 확인하고, 별도 브랜치에서 충분한 테스트를 거친 후 병합하는 프로세스를 팀에 제안하고 정착시킬 수 있습니다.

#### **[3] 문제: 자동 로그인 구현 시 경쟁 상태(Race Condition) 및 화면 깜빡임**

앱 최상위(`_layout.tsx`)에서 `AsyncStorage`의 토큰을 비동기적으로 확인하는 동안 `expo-router`가 먼저 렌더링되어, 로그인 화면이 잠시 보였다가 홈 화면으로 전환되는 '깜빡임' 현상이 발생했습니다.

*   **접근 방식 및 해결 과정:**
    1.  **원인 분석:** `useEffect` 내부의 비동기 로직(`checkAuth`)이 완료되기 전에 컴포넌트의 첫 렌더링이 발생하며 생기는 전형적인 경쟁 상태임을 파악했습니다.
    2.  **해결 전략:** 인증 상태 확인이 진행 중임을 나타내는 `isCheckingAuth` 로딩 상태를 추가했습니다. 로딩 중일 때는 스플래시 스크린을 보여주고, 인증 확인이 끝난 후에야 비로소 적절한 화면으로 이동시키도록 로직을 변경했습니다.

    ```tsx
    // app/_layout.tsx (해결 후 코드)
    import { useEffect, useState } from 'react';
    import { useRouter, Stack } from 'expo-router';
    import { useAuthStore } from '@/zustand/stores/authStore';
    import LoadingScreen from '@/app/Loading'; // 별도의 로딩 스크린 컴포넌트

    const RootLayout = () => {
      const { isLoggedIn, checkAuth } = useAuthStore();
      const router = useRouter();
      // 인증 상태를 확인 중인지 여부를 관리하는 상태 추가
      const [isCheckingAuth, setIsCheckingAuth] = useState(true);

      useEffect(() => {
        const init = async () => {
          try {
            await checkAuth(); // 스토리지에서 토큰을 가져와 인증 상태 확인
          } finally {
            // 인증 체크가 성공하든 실패하든 로딩 상태를 종료
            setIsCheckingAuth(false);
          }
        };
        init();
      }, []); // 앱 마운트 시 최초 1회만 실행

      useEffect(() => {
        // 로딩이 끝났고, 라우터가 준비된 후에만 화면 전환 실행
        if (!isCheckingAuth) {
          const destination = isLoggedIn ? '/(tabs)/home' : '/(onBoard)/';
          router.replace(destination);
        }
      }, [isCheckingAuth, isLoggedIn]); // 로딩 상태나 로그인 상태가 변할 때만 반응

      // 인증 확인 중일 때는 로딩 스크린을 보여줌으로써 화면 깜빡임 방지
      if (isCheckingAuth) {
        return <LoadingScreen />;
      }

      // 로딩이 끝나면 실제 내비게이션 스택을 렌더링
      return <Stack screenOptions={{ headerShown: false }} />;
    };
    ```

*   **배운 점 및 확장 방향:**
    *   React의 **렌더링 생명주기와 비동기 상태 관리**에 대한 깊은 이해를 얻었습니다. 앱의 초기화 과정에서 **명시적인 로딩 상태**를 통해 경쟁 상태를 제어하는 것이 얼마나 중요한지 깨달았습니다.
    *   이 경험은 향후 **원격 설정(Remote Config) 로딩, 필수 데이터 프리페칭(Pre-fetching) 등 여러 비동기 작업이 완료된 후에 앱을 시작해야 하는 복잡한 초기화 로직을 안정적으로 설계**하는 데 큰 도움이 될 것입니다.

---

### **5. 프로젝트 회고 및 성장**

DiceTalk 프로젝트는 단순한 기능 구현을 넘어, **React Native 애플리케이션의 네이티브 연동성과 생명주기**에 대한 깊이 있는 이해를 체득하는 계기가 되었습니다. 특히 Toss Payments 연동 과정에서 `WebView`와 네이티브 모듈 간의 상호작용을 직접 다루고, 안드로이드 `queries` 설정과 같은 네이티브 빌드 구성을 수정하며 **JavaScript와 네이티브의 경계를 넘나드는 문제 해결 능력**을 길렀습니다.

**코드의 확장성과 유지보수성**에 대해 끊임없이 고민했습니다. Axios 인터셉터의 순환 참조 문제를 해결하기 위해 모듈 구조를 리팩토링하고, 알림 관련 로직을 커스텀 훅으로 분리하는 등 **클린 아키텍처 원칙**을 실천하려 노력했습니다. 이러한 경험은 단순히 동작하는 코드가 아닌, **견고하고 유연한 코드**를 작성하는 개발자로 성장하는 밑거름이 되었습니다.

---

### **6. 협업 및 향후 발전 방향**

#### **가. 협업 경험**

*   **Git을 통한 체계적인 버전 관리:** `feat`, `fix`, `refactor` 등의 커밋 컨벤션을 사용하고, 기능 단위로 브랜치를 관리하며 작업했습니다. 특히 **Git LFS(Large File Storage)** 설정 오류로 원격 저장소에 대용량 파일이 포함되었던 문제를 `git filter-branch` 명령어로 히스토리를 정리하여 해결하고, **병합 충돌(Merge Conflict)** 발생 시 동료와 적극적으로 소통하며 `--ours`와 같은 전략을 사용하여 해결하는 등, 협업 과정에서 발생하는 다양한 버전 관리 이슈에 대한 실무적인 대응 능력을 길렀습니다.

#### **나. DiceTalk 향후 발전 방향 (실무적 관점)**

1.  **고도화된 매칭 시스템:** 현재의 테마 기반 매칭을 넘어, 사용자의 프로필, 관심사, 활동 로그를 기반으로 한 **추천 알고리즘**을 도입하여 매칭 성공률을 높일 수 있습니다.
2.  **커뮤니티 기능 강화:** 1:1 채팅을 넘어 여러 사용자가 참여할 수 있는 **주제별 그룹 채팅(오픈채팅)** 기능을 도입하여 사용자의 체류 시간을 늘리고 커뮤니티를 활성화할 수 있습니다.
3.  **CI/CD 파이프라인 구축:** **GitHub Actions와 EAS를 연동**하여, 특정 브랜치에 코드가 병합될 때마다 자동으로 개발 빌드를 생성하고 테스트 채널에 배포하는 **CI/CD 파이프라인을 구축**하여 개발 및 테스트 효율을 극대화할 수 있습니다.
4.  **안전 기능 강화:** 익명성 서비스의 핵심인 사용자 안전을 위해, 욕설 및 비속어를 필터링하는 **클라이언트/서버 단 필터링 로직**을 도입하고, **AI를 활용한 부적절한 이미지 감지 시스템**을 연동하여 더욱 안전한 소통 환경을 조성할 수 있습니다.

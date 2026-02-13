# PRD: 마이페이지 & 설정

> **문서 버전**: v1.0
> **최종 수정일**: 2026-02-13
> **상태**: Draft
> **관련 디자인**: `runninglog-mobile.pen` - Mypage, 데이터 소스 연동, 알림 및 동의 설정, 테마 설정, 결제 및 구독 관리, 탈퇴하기 팝업

---

## 1. 개요

### 1.1 목적

마이페이지 및 설정 퍼널은 사용자가 프로필을 관리하고, 외부 기기/서비스 연동, 알림 설정, 테마 변경, 구독 관리 등 앱의 개인화 옵션을 제어하는 핵심 화면이다. 바텀 네비게이션의 "마이" 탭을 통해 진입하며, 앱 사용 전반에 걸친 환경 설정을 담당한다.

### 1.2 사용자 가치

| 가치 | 설명 |
|------|------|
| **프로필 관리** | 닉네임과 아바타를 설정하여 개인화된 러닝 경험을 제공한다 |
| **기기/서비스 연동** | 가민, 애플워치, 스트라바, 삼성헬스 등 외부 데이터 소스를 연동하여 러닝 데이터를 자동 수집한다 |
| **알림 제어** | 푸시 알림, 마케팅 수신, 야간 푸시 등을 세밀하게 제어하여 사용자 편의를 높인다 |
| **테마 커스터마이징** | 시스템/라이트/다크 모드를 선택하여 선호하는 시각 환경에서 앱을 사용한다 |
| **구독 관리** | 현재 플랜 확인 및 구독 관리로 프리미엄 기능을 원활하게 이용한다 |

### 1.3 타겟 사용자

- 30대 남성 러너 (주 3~5회 달리기)
- 외부 러닝 기기(가민, 애플워치)를 사용하는 데이터 중심 러너
- 앱 환경을 세밀하게 조정하고 싶은 사용자

---

## 2. 사용자 흐름

### 2.1 메인 흐름

```
[바텀 네비게이션 "마이" 탭 진입]
    |
    v
[마이페이지 메인]
    |
    ├── "프로필 설정" 버튼 → [프로필 편집 화면]
    |
    ├── "데이터 소스 연동" → [데이터 소스 연동 화면]
    │   ├── 기기 연동 (가민, 애플워치)
    │   └── 서비스 연동 (스트라바, 삼성헬스)
    |
    ├── "결제 및 구독 관리" → [결제 및 구독 관리 화면]
    |
    ├── "알림 및 동의 설정" → [알림 및 동의 설정 화면]
    │   ├── 전체 푸시 알림 토글
    │   ├── 마케팅 정보 수신 동의 토글
    │   ├── 야간 푸시 동의 토글
    │   └── GPS 제공 동의 확인
    |
    ├── "테마 설정" → [테마 설정 화면]
    │   └── 시스템 설정 / 라이트 / 다크 라디오 선택
    |
    ├── "약관 및 정책" → [약관 및 정책 화면]
    |
    ├── "고객센터" → [고객센터 화면]
    |
    ├── "로그아웃" → 로그아웃 확인 → 로그인 화면
    |
    └── "탈퇴하기" → [탈퇴 확인 팝업]
        ├── "취소" → 팝업 닫기
        └── "탈퇴하기" → 계정 비활성화 → 로그인 화면
```

### 2.2 알림 아이콘 흐름

```
[마이페이지 헤더 벨 아이콘 탭]
    |
    v
[푸시 알림 목록 화면] (07-push-notifications 참조)
```

---

## 3. 화면별 상세 스펙

### 3.1 마이페이지 메인

> **경로**: `app/(tabs)/mypage/index.tsx`
> **라이트/다크 모드 지원**

#### 3.1.1 레이아웃 구조

```
[SafeArea Top]
├── [헤더]               ── "마이페이지" + 벨 아이콘 (알림 dot)
├── [프로필 섹션]         ── 아바타 + 닉네임 + "프로필 설정" 버튼
├── [구분선 1]           ── 8px 높이, $lightGray
├── [메뉴 섹션]          ── 6개 메뉴 아이템
├── [구분선 2]           ── 8px 높이, $lightGray
├── [하단 섹션]          ── 로그아웃 + 탈퇴하기
└── [버전 정보]          ── "v1.0.0"
```

#### 3.1.2 헤더

| 속성 | 값 |
|------|------|
| 타이틀 텍스트 | "마이페이지" |
| 타이틀 폰트 | Inter, 28px, Bold (700) |
| 타이틀 색상 | `$text` (#0D0D0D) |
| 패딩 | 상하 16px, 좌우 20px |
| 우측 아이콘 | bell (lucide), 22x22px, `$textSecondary` (#6B7280) |
| 알림 dot | 빨간 원형 8x8px, `#FF3B30`, bell 아이콘 우상단 (x: 15, y: -1) |
| 알림 dot 표시 조건 | 읽지 않은 알림이 1개 이상 존재할 때 |
| 벨 아이콘 탭 | 푸시 알림 목록 화면으로 이동 |

#### 3.1.3 프로필 섹션

| 속성 | 값 |
|------|------|
| 패딩 | 상하 24px, 좌우 20px |
| 아이템 간격 (gap) | 16px |
| 정렬 | 수직 중앙 정렬 (alignItems: center) |

##### 아바타

| 속성 | 값 |
|------|------|
| 크기 | 64x64px |
| 모서리 | 원형 (cornerRadius: 32) |
| 배경 | `#E5E7EB` |
| 기본 아이콘 | lucide user, 28x28px, `$textSecondary` |
| 아이콘 위치 | 중앙 (x: 18, y: 18) |

##### 닉네임

| 속성 | 값 |
|------|------|
| 텍스트 | 사용자 닉네임 (예: "러너닉네임") |
| 폰트 | Inter, 18px, Bold (700) |
| 색상 | `$text` (#0D0D0D) |

##### 프로필 설정 버튼

| 속성 | 값 |
|------|------|
| 텍스트 | "프로필 설정" |
| 폰트 | Inter, 13px, Medium (500) |
| 텍스트 색상 | `$textSecondary` (#6B7280) |
| 배경 | `$lightGray` (#F3F4F6) |
| 모서리 | borderRadius: 8 |
| 패딩 | 상하 8px, 좌우 12px |
| 우측 아이콘 | chevron-right, 16x16px, `$textSecondary` |
| 간격 | 텍스트와 아이콘 gap: 4px |
| 탭 동작 | 프로필 편집 화면으로 이동 |

#### 3.1.4 메뉴 섹션

| 속성 | 값 |
|------|------|
| 패딩 | 상하 8px, 좌우 0px |
| 레이아웃 | vertical |

##### 메뉴 아이템 공통 스타일

| 속성 | 값 |
|------|------|
| 패딩 | 상하 16px, 좌우 20px |
| 정렬 | space_between (아이콘+라벨 좌측, 화살표 우측) |
| 아이콘 크기 | 22x22px |
| 아이콘 색상 | `$textSecondary` (#6B7280) |
| 라벨 폰트 | Inter, 16px, Medium (500) |
| 라벨 색상 | `$text` (#0D0D0D) |
| 아이콘-라벨 간격 | 12px |
| 우측 화살표 | chevron-right, 20x20px, `$textTertiary` (#9CA3AF) |

##### 메뉴 항목 목록

| 순서 | 아이콘 (lucide) | 라벨 | 이동 화면 | 부가 정보 |
|------|-----------------|------|-----------|-----------|
| 1 | plug | 데이터 소스 연동 | 데이터 소스 연동 화면 | - |
| 2 | gem | 결제 및 구독 관리 | 결제 및 구독 관리 화면 | - |
| 3 | bell | 알림 및 동의 설정 | 알림 및 동의 설정 화면 | - |
| 4 | sun-moon | 테마 설정 | 테마 설정 화면 | 우측에 현재 설정값 표시 (예: "시스템 설정"), `$textTertiary`, 13px |
| 5 | file-text | 약관 및 정책 | 약관 및 정책 화면 | - |
| 6 | headphones | 고객센터 | 고객센터 화면 | - |

> **참고**: 테마 설정 메뉴의 우측에는 화살표 대신 현재 설정값 텍스트 + chevron-right가 함께 표시된다. 텍스트와 아이콘 gap: 4px.

#### 3.1.5 하단 섹션 (로그아웃 / 탈퇴하기)

| 속성 | 값 |
|------|------|
| 패딩 | 상하 8px, 좌우 0px |
| 레이아웃 | vertical |

##### 로그아웃 행

| 속성 | 값 |
|------|------|
| 아이콘 | lucide log-out, 22x22px, `$textSecondary` |
| 텍스트 | "로그아웃", Inter, 16px, Medium (500), `$text` |
| 간격 | 12px |
| 패딩 | 상하 16px, 좌우 20px |
| 탭 동작 | 로그아웃 확인 Alert → 확인 시 로그아웃 처리 |

##### 탈퇴하기 행

| 속성 | 값 |
|------|------|
| 아이콘 | lucide user-x, 22x22px, `$textTertiary` (#9CA3AF) |
| 텍스트 | "탈퇴하기", Inter, 16px, Medium (500), `$textTertiary` |
| 간격 | 12px |
| 패딩 | 상하 16px, 좌우 20px |
| 탭 동작 | 탈퇴 확인 팝업 표시 |

#### 3.1.6 버전 정보

| 속성 | 값 |
|------|------|
| 텍스트 | "v1.0.0" (앱 버전 동적 표시) |
| 폰트 | Inter, 13px, Regular |
| 색상 | `$textTertiary` (#9CA3AF) |
| 정렬 | 중앙 정렬 |
| 패딩 | 상하 24px, 좌우 20px |

---

### 3.2 데이터 소스 연동 화면

> **경로**: `app/(tabs)/mypage/data-source.tsx`

#### 3.2.1 헤더

| 속성 | 값 |
|------|------|
| 뒤로가기 아이콘 | lucide chevron-left, 24x24px, `$text` |
| 타이틀 | "데이터 소스 연동", Inter, 18px, Bold (700), `$text` |
| 간격 | 8px |
| 패딩 | 상하 16px, 좌우 20px |

#### 3.2.2 기기 연동 섹션

| 속성 | 값 |
|------|------|
| 섹션 제목 | "기기 연동", Inter, 15px, Bold (700), `$text` |
| 카드 모서리 | borderRadius: 12 |
| 카드 테두리 | `$border` (#E5E5E5), 1px |
| 섹션-카드 간격 | 12px |

##### 기기 목록

| 기기명 | 기본 상태 | 연결 버튼 스타일 |
|--------|-----------|-----------------|
| 가민 (Garmin) | 미연결 | "연결하기" 버튼 — 배경: `$BrandOrange`, 텍스트: #FFFFFF, 13px, Bold (600), cornerRadius: 20, 패딩: 상하 6px, 좌우 14px |
| 애플워치 | 연결됨 | "연결됨" 뱃지 — 테두리: `$accentGreen` (#5CB88F), 1px, 텍스트: `$accentGreen`, 13px, Bold (600), 녹색 dot 6x6px, gap: 4px, cornerRadius: 20, 패딩: 상하 6px, 좌우 14px |

##### 기기 행 공통 스타일

| 속성 | 값 |
|------|------|
| 기기명 폰트 | Inter, 15px, Medium (500), `$text` |
| 패딩 | 16px (전방향) |
| 정렬 | space_between |
| 행 구분선 | `$border`, 높이 1px |

#### 3.2.3 서비스 연동 섹션

| 속성 | 값 |
|------|------|
| 섹션 제목 | "서비스 연동", Inter, 15px, Bold (700), `$text` |
| 카드 스타일 | 기기 연동 섹션과 동일 |

##### 서비스 목록

| 서비스명 | 기본 상태 |
|----------|-----------|
| 스트라바 (Strava) | 미연결 ("연결하기" 버튼) |
| 삼성헬스 | 연결됨 ("연결됨" 뱃지) |

#### 3.2.4 하단 안내 문구

| 속성 | 값 |
|------|------|
| 텍스트 | "기기와 서비스 연동 시 러닝로그가 활동 데이터를 자동으로 수집합니다." |
| 폰트 | Inter, 13px, Regular, `$textTertiary` |
| 너비 | fill_container (고정 너비 텍스트) |

#### 3.2.5 콘텐츠 영역

| 속성 | 값 |
|------|------|
| 패딩 | 상하 16px, 좌우 20px |
| 섹션 간격 (gap) | 24px |

---

### 3.3 알림 및 동의 설정 화면

> **경로**: `app/(tabs)/mypage/notification-settings.tsx`

#### 3.3.1 헤더

| 속성 | 값 |
|------|------|
| 뒤로가기 아이콘 | lucide chevron-left, 24x24px, `$text` |
| 타이틀 | "알림 및 동의 설정", Inter, 18px, Bold (700), `$text` |
| 간격 | 8px |
| 패딩 | 상하 16px, 좌우 20px |

#### 3.3.2 토글 항목

##### 토글 공통 스타일

| 속성 | 값 |
|------|------|
| 행 정렬 | space_between |
| 행 패딩 | 상하 16px, 좌우 0px |
| 라벨 폰트 | Inter, 16px, Medium (500), `$text` |
| 토글 크기 | 48x28px |
| 토글 모서리 | cornerRadius: 14 |
| 토글 knob | 원형 22x22px, #FFFFFF |
| 토글 ON 배경 | `$BrandOrange` (#FF6F00) |
| 토글 OFF 배경 | #D1D5DB |
| knob ON 위치 | x: 23, y: 3 |
| knob OFF 위치 | x: 3, y: 3 |

##### 토글 목록

| 항목 | 라벨 | 기본 상태 |
|------|------|-----------|
| 전체 푸시 알림 | "전체 푸시 알림" | ON (활성) |
| 마케팅 정보 수신 동의 | "마케팅 정보 수신 동의" | OFF (비활성) |
| 야간 푸시 동의 | "야간 푸시 동의 (21시~08시)" | OFF (비활성) |

#### 3.3.3 GPS 제공 동의 행

| 속성 | 값 |
|------|------|
| 라벨 | "GPS 제공 동의", Inter, 16px, Medium (500), `$text` |
| 우측 버튼 텍스트 | "확인하기", Inter, 14px, Medium (500), `$BrandOrange` |
| 우측 버튼 아이콘 | chevron-right, 16x16px, `$BrandOrange` |
| 간격 | 텍스트-아이콘 gap: 4px |
| 탭 동작 | GPS 제공 동의 상세 화면 또는 시스템 설정으로 이동 |

#### 3.3.4 콘텐츠 영역

| 속성 | 값 |
|------|------|
| 패딩 | 상하 16px, 좌우 20px |
| 레이아웃 | vertical |

---

### 3.4 테마 설정 화면

> **경로**: `app/(tabs)/mypage/theme-settings.tsx`

#### 3.4.1 헤더

| 속성 | 값 |
|------|------|
| 뒤로가기 아이콘 | lucide chevron-left, 24x24px, `$text` |
| 타이틀 | "테마 설정", Inter, 18px, Bold (700), `$text` |
| 간격 | 8px |
| 패딩 | 상하 16px, 좌우 20px |

#### 3.4.2 라디오 버튼 목록

##### 라디오 버튼 공통 스타일

| 속성 | 값 |
|------|------|
| 행 패딩 | 상하 16px, 좌우 0px |
| 행 간격 | 아이콘-라벨 gap: 12px |
| 라벨 폰트 | Inter, 16px, Medium (500), `$text` |
| 라디오 크기 | 22x22px 원형 |
| 선택 상태 | 테두리: `$BrandOrange`, 2px + 내부 원: `$BrandOrange`, 12x12px (x: 5, y: 5) |
| 미선택 상태 | 테두리: #D1D5DB, 2px, 내부 비어있음 |
| 라디오 모서리 | cornerRadius: 11 (원형) |

##### 옵션 목록

| 순서 | 라벨 | 기본 상태 |
|------|------|-----------|
| 1 | 시스템 설정에 맞춤 | 선택됨 (기본값) |
| 2 | 라이트 모드 | 미선택 |
| 3 | 다크 모드 | 미선택 |

#### 3.4.3 콘텐츠 영역

| 속성 | 값 |
|------|------|
| 패딩 | 상하 16px, 좌우 20px |
| 레이아웃 | vertical |

---

### 3.5 결제 및 구독 관리 화면

> **경로**: `app/(tabs)/mypage/subscription.tsx`

#### 3.5.1 헤더

| 속성 | 값 |
|------|------|
| 뒤로가기 아이콘 | lucide chevron-left, 24x24px, `$text` |
| 타이틀 | "결제 및 구독 관리", Inter, 18px, Bold (700), `$text` |
| 간격 | 8px |
| 패딩 | 상하 16px, 좌우 20px |

#### 3.5.2 플랜 카드

| 속성 | 값 |
|------|------|
| 배경 | `$lightGray` (#F3F4F6) |
| 모서리 | borderRadius: 16 |
| 패딩 | 24px (전방향) |
| 내부 간격 | 16px |

##### 플랜 헤더 행

| 속성 | 값 |
|------|------|
| 좌측 라벨 | "현재 이용 중인 플랜", Inter, 14px, Medium (500), `$textSecondary` |
| 우측 뱃지 | "프리미엄" — 배경: `$BrandOrange`, 텍스트: #FFFFFF, Inter, 12px, Bold (700), cornerRadius: 12, 패딩: 상하 4px 좌우 10px |

##### 구분선

| 속성 | 값 |
|------|------|
| 색상 | `$border` (#E5E5E5) |
| 높이 | 1px |

##### 플랜 상세 행

| 속성 | 값 |
|------|------|
| 좌측 라벨 | "다음 결제 예정일", Inter, 14px, Medium (500), `$textSecondary` |
| 우측 값 | "2026.03.11", Inter, 15px, SemiBold (600), `$text` |

#### 3.5.3 구독 관리 버튼

| 속성 | 값 |
|------|------|
| 텍스트 | "구독 관리하기", Inter, 16px, SemiBold (600), #FFFFFF |
| 아이콘 | lucide external-link, 18x18px, #FFFFFF |
| 간격 | 텍스트-아이콘 gap: 8px |
| 배경 | `$BrandOrange` (#FF6F00) |
| 높이 | 52px |
| 모서리 | borderRadius: 12 |
| 정렬 | 중앙 정렬 (justifyContent: center) |
| 탭 동작 | 앱스토어/플레이스토어 구독 관리 페이지로 이동 |

#### 3.5.4 콘텐츠 영역

| 속성 | 값 |
|------|------|
| 패딩 | 상하 24px, 좌우 20px |
| 섹션 간격 (gap) | 24px |

---

### 3.6 탈퇴하기 팝업

> **타입**: 모달 오버레이

#### 3.6.1 오버레이

| 속성 | 값 |
|------|------|
| 배경 | #00000066 (40% 불투명 검정) |
| 크기 | 전체 화면 (390x844) |

#### 3.6.2 모달 카드

| 속성 | 값 |
|------|------|
| 배경 | `$background` (#FFFFFF) |
| 모서리 | borderRadius: 20 |
| 그림자 | blur: 24, color: #00000020, offset: (0, 4), outer shadow |
| 너비 | 320px |
| 위치 | x: 35, y: 280 (화면 중앙) |

#### 3.6.3 모달 콘텐츠

| 속성 | 값 |
|------|------|
| 패딩 | 상: 28px, 좌우: 24px, 하: 20px |
| 내부 간격 | 16px |

##### 제목

| 속성 | 값 |
|------|------|
| 텍스트 | "정말 탈퇴하시겠어요?" |
| 폰트 | Inter, 18px, Bold (700), `$text` |
| 정렬 | 중앙 (textAlign: center) |

##### 설명

| 속성 | 값 |
|------|------|
| 텍스트 | "탈퇴 시 계정은 즉시 '비활성화'되며,\n90일 후 모든 데이터가 영구 삭제됩니다." |
| 폰트 | Inter, 14px, Regular, `$textSecondary` |
| 줄간격 | lineHeight: 1.5 |
| 정렬 | 중앙 (textAlign: center) |
| 너비 | fill_container |

##### 경고 배너

| 속성 | 값 |
|------|------|
| 배경 | #FFF3E0 |
| 모서리 | borderRadius: 8 |
| 패딩 | 상하 10px, 좌우 12px |
| 테두리 | inside, 1px |
| 아이콘 | lucide triangle-alert, 16x16px, `$BrandOrange` |
| 텍스트 | "90일간 동일 이메일 가입 불가", Inter, 13px, Medium (500), `$BrandOrange` |
| 간격 | gap: 6px |

#### 3.6.4 모달 구분선

| 속성 | 값 |
|------|------|
| 색상 | `$border` (#E5E5E5) |
| 높이 | 1px |

#### 3.6.5 버튼 행

| 속성 | 값 |
|------|------|
| 높이 | 52px |
| 레이아웃 | 2칸 균등 분할 |

##### 취소 버튼

| 속성 | 값 |
|------|------|
| 텍스트 | "취소", Inter, 16px, SemiBold (600), `$BrandOrange` |
| 정렬 | 중앙 |
| 우측 구분선 | `$border`, 1px |
| 탭 동작 | 팝업 닫기 |

##### 탈퇴하기 버튼

| 속성 | 값 |
|------|------|
| 텍스트 | "탈퇴하기", Inter, 16px, Medium (500), `$textTertiary` |
| 정렬 | 중앙 |
| 탭 동작 | 탈퇴 API 호출 → 성공 시 로그인 화면으로 이동 |

---

## 4. 데이터 모델

### 4.1 사용자 프로필 (UserProfile)

```typescript
interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: string;          // ISO 8601
  subscriptionPlan: 'free' | 'premium';
  subscriptionExpiry: string | null;  // ISO 8601
}
```

### 4.2 데이터 소스 연동 (DataSource)

```typescript
interface DataSource {
  id: string;
  type: DataSourceType;
  category: 'device' | 'service';
  name: string;                     // "가민 (Garmin)", "애플워치" 등
  isConnected: boolean;
  connectedAt: string | null;       // ISO 8601
  lastSyncAt: string | null;        // ISO 8601
}

type DataSourceType =
  | 'garmin'
  | 'apple_watch'
  | 'strava'
  | 'samsung_health';
```

### 4.3 알림 설정 (NotificationSettings)

```typescript
interface NotificationSettings {
  pushEnabled: boolean;              // 전체 푸시 알림
  marketingEnabled: boolean;         // 마케팅 정보 수신 동의
  nightPushEnabled: boolean;         // 야간 푸시 동의 (21~08시)
  gpsConsentGranted: boolean;        // GPS 제공 동의
}
```

### 4.4 테마 설정 (ThemeSettings)

```typescript
type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeSettings {
  mode: ThemeMode;  // 기본값: 'system'
}
```

### 4.5 구독 정보 (Subscription)

```typescript
interface Subscription {
  plan: 'free' | 'premium';
  planDisplayName: string;           // "프리미엄"
  nextBillingDate: string | null;    // "2026.03.11"
  isActive: boolean;
  startedAt: string | null;          // ISO 8601
}
```

---

## 5. API 요구사항

### 5.1 프로필 조회

```
GET /api/v1/users/me/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `UserProfile` 객체 |
| 용도 | 마이페이지 프로필 섹션 데이터 |

### 5.2 데이터 소스 목록 조회

```
GET /api/v1/data-sources/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `{ sources: DataSource[] }` |
| 용도 | 데이터 소스 연동 화면 렌더링 |

### 5.3 데이터 소스 연결/해제

```
POST /api/v1/data-sources/{type}/connect/
DELETE /api/v1/data-sources/{type}/disconnect/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| type | garmin, apple_watch, strava, samsung_health |
| 응답 200 | `{ success: true, source: DataSource }` |
| 비고 | 연결 시 OAuth 또는 SDK 인증 플로우 필요 |

### 5.4 알림 설정 조회/수정

```
GET /api/v1/settings/notifications/
PATCH /api/v1/settings/notifications/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 요청 Body (PATCH) | `NotificationSettings` 부분 객체 |
| 응답 200 | `NotificationSettings` 전체 객체 |

### 5.5 구독 정보 조회

```
GET /api/v1/subscriptions/current/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `Subscription` 객체 |
| 응답 404 | 구독 없음 (무료 플랜) |

### 5.6 회원 탈퇴

```
POST /api/v1/users/withdraw/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `{ success: true, deactivatedAt: string }` |
| 동작 | 계정 즉시 비활성화, 90일 후 데이터 영구 삭제 스케줄링 |
| 비고 | 90일 이내 동일 이메일 재가입 불가 |

### 5.7 로그아웃

```
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `{ success: true }` |
| 동작 | refresh token 무효화, 클라이언트 토큰 삭제 |

---

## 6. 상태 관리

### 6.1 마이페이지 상태

```typescript
interface MypageState {
  // 프로필
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // 구독
  subscription: Subscription | null;

  // 알림 읽지 않음 카운트
  unreadNotificationCount: number;
}
```

### 6.2 데이터 소스 연동 상태

```typescript
interface DataSourceState {
  sources: DataSource[];
  loading: boolean;
  error: string | null;
  connectingType: DataSourceType | null;  // 현재 연결 진행 중인 소스
}
```

### 6.3 알림 설정 상태

```typescript
interface NotificationSettingsState {
  settings: NotificationSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}
```

### 6.4 테마 설정 상태

```typescript
interface ThemeState {
  mode: ThemeMode;                // 현재 선택된 테마
  saving: boolean;
}
```

### 6.5 상태 전이 규칙

| 액션 | 상태 변경 |
|------|-----------|
| 마이페이지 탭 진입 | 프로필 + 구독 + 읽지 않은 알림 수 조회 |
| 데이터 소스 연동 화면 진입 | 데이터 소스 목록 조회 |
| 기기/서비스 연결 버튼 탭 | `connectingType` 설정 → OAuth/SDK 플로우 → 완료 시 목록 갱신 |
| 알림 토글 변경 | Optimistic UI 즉시 반영 → 서버 PATCH 호출 → 실패 시 롤백 |
| 테마 라디오 선택 | `mode` 즉시 변경 → 로컬 저장소 (MMKV) 저장 → 앱 전체 테마 적용 |
| 로그아웃 확인 | 서버 로그아웃 → 로컬 토큰 삭제 → 로그인 화면 이동 |
| 탈퇴 확인 | 서버 탈퇴 → 로컬 데이터 전체 삭제 → 로그인 화면 이동 |

### 6.6 캐싱 전략

| 항목 | 저장소 | TTL |
|------|--------|-----|
| 프로필 데이터 | MMKV | 5분 |
| 구독 정보 | MMKV | 1시간 |
| 알림 설정 | MMKV | 실시간 (변경 즉시 갱신) |
| 테마 설정 | MMKV | 영구 (로컬 전용) |
| 데이터 소스 목록 | MMKV | 5분 |

---

## 7. 엣지 케이스

### 7.1 프로필 관련

| 케이스 | 처리 |
|--------|------|
| **닉네임 미설정** | 기본값 "러너" 표시, 프로필 설정 유도 배너 표시 |
| **아바타 미설정** | 기본 user 아이콘 (#E5E7EB 배경) 표시 |
| **프로필 로딩 실패** | 캐시된 데이터 표시 + "정보를 불러올 수 없습니다" 토스트 |

### 7.2 데이터 소스 연동

| 케이스 | 처리 |
|--------|------|
| **OAuth 인증 실패** | "연결에 실패했습니다. 다시 시도해주세요." 토스트 |
| **이미 연결된 소스 재연결** | 기존 연결 해제 후 재연결 확인 다이얼로그 |
| **연결 해제 시 데이터 보존** | "연결을 해제해도 기존 동기화된 데이터는 유지됩니다." 안내 |
| **기기 미지원 (삼성 워치 on iOS)** | 해당 기기 행 비활성 상태 + "이 기기에서는 사용할 수 없습니다" 서브텍스트 |

### 7.3 알림 설정

| 케이스 | 처리 |
|--------|------|
| **시스템 알림 권한 OFF** | 전체 푸시 알림 토글 ON 시 시스템 설정 이동 안내 Alert |
| **전체 푸시 OFF 시** | 하위 토글 (마케팅, 야간) 비활성화 처리 (disabled, opacity: 0.5) |
| **토글 변경 API 실패** | 토글 원래 상태로 롤백 + "설정을 저장하지 못했습니다" 토스트 |

### 7.4 테마 설정

| 케이스 | 처리 |
|--------|------|
| **시스템 설정 변경 시** | "시스템 설정에 맞춤" 선택 시 OS 다크모드 변경 즉시 반영 |
| **테마 변경 시 전환 애니메이션** | fade 전환 300ms |

### 7.5 구독 관리

| 케이스 | 처리 |
|--------|------|
| **무료 플랜 사용자** | 플랜 뱃지 "무료", 구독 관리 버튼 → "프리미엄 업그레이드" 텍스트 변경 |
| **구독 만료** | "구독이 만료되었습니다" 안내 + 갱신 유도 |
| **앱스토어 연결 실패** | "스토어에 연결할 수 없습니다" 에러 토스트 |

### 7.6 탈퇴 관련

| 케이스 | 처리 |
|--------|------|
| **탈퇴 API 실패** | 팝업 유지 + "탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요." 에러 메시지 |
| **탈퇴 후 90일 내 재가입 시도** | 로그인/회원가입 시 "탈퇴 후 90일이 경과하지 않아 가입할 수 없습니다. (N일 후 가입 가능)" 안내 |
| **네트워크 오프라인 상태** | 탈퇴 버튼 비활성 + "인터넷 연결을 확인해주세요" 안내 |
| **프리미엄 구독 활성 중 탈퇴** | 추가 경고: "활성 중인 구독이 있습니다. 탈퇴해도 구독이 자동 해지되지 않습니다." |

### 7.7 로그아웃

| 케이스 | 처리 |
|--------|------|
| **로그아웃 API 실패** | 서버 실패와 관계없이 클라이언트 토큰 삭제 후 로그인 화면 이동 |
| **백그라운드 러닝 중 로그아웃** | "러닝이 진행 중입니다. 로그아웃하면 기록이 저장되지 않을 수 있습니다." 경고 |

---

## 부록: 디자인 토큰 요약

| 토큰 | 값 | 용도 |
|------|------|------|
| `$text` | #0D0D0D | 기본 텍스트, 타이틀, 메뉴 라벨 |
| `$textSecondary` | #6B7280 | 보조 텍스트, 아이콘, 프로필 설정 버튼 |
| `$textTertiary` | #9CA3AF | 3차 텍스트, 버전 정보, 탈퇴하기 텍스트 |
| `$BrandOrange` | #FF6F00 | 연결 버튼, 토글 ON, 라디오 선택, 경고 텍스트 |
| `$background` | #FFFFFF | 화면 배경, 모달 배경 |
| `$lightGray` | #F3F4F6 | 구분선, 프로필 설정 버튼 배경, 플랜 카드 배경 |
| `$border` | #E5E5E5 | 카드 테두리, 구분선, 모달 구분선 |
| `$accentGreen` | #5CB88F | 연결됨 상태 dot 및 텍스트 |
| `$heartRed` | #EF4444 | 알림 dot (#FF3B30 사용) |
| `$surface` | #F5F5F5 | 카드 배경 (다크: $surfaceDark) |

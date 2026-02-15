# PRD: 홈 & 액티브 런 퍼널

> **문서 버전**: 1.0
> **최종 수정일**: 2025-01-17
> **관련 스크린샷**: `docs/prd/home.png`, `docs/prd/active-run.png`

---

## 1. 개요

### 1.1 목적

"홈 & 액티브 런" 퍼널은 러닝로그 앱의 핵심 진입점이자, 사용자가 달리기를 시작하고 실시간으로 기록하며 완료하는 전체 과정을 다루는 퍼널이다. 앱을 열었을 때 가장 먼저 마주하는 홈 화면에서 이번 주 달리기 현황을 한눈에 파악하고, RUN 버튼 한 번으로 즉시 러닝을 시작할 수 있다.

### 1.2 사용자 가치

| 가치 | 설명 |
|------|------|
| **즉각적인 현황 파악** | 홈 화면 진입 즉시 주간 캘린더, 누적 거리, 타이머, 페이스, 심박수를 한눈에 확인 |
| **원탭 러닝 시작** | RUN 버튼 한 번으로 GPS 트래킹이 시작되어 러닝 진입 마찰 최소화 |
| **실시간 피드백** | 달리는 동안 거리, 페이스, 심박수, 경로를 실시간으로 확인하여 동기부여 유지 |
| **AI 페이스메이커** | 개인화된 AI 코칭 메시지로 달리기 습관 형성과 회복 관리 지원 |
| **스플릿 알림** | 1km 단위 자동 구간 알림으로 페이스 관리 지원 |

### 1.3 타겟 사용자

- 30대 남성 러너 (주 3~5회 달리기)
- 달리기 기록과 페이스 관리에 관심이 높은 사용자
- 심플하고 직관적인 UI를 선호하는 사용자

---

## 2. 사용자 흐름

### 2.1 메인 플로우

```
앱 실행
  |
  v
[홈 화면] ── 주간 캘린더 / 누적 거리 / 타이머 / 페이스 / 심박수 / AI 메시지 확인
  |
  | RUN 버튼 탭
  v
[GPS 권한 확인] ── 미허용 시: 권한 요청 다이얼로그 → 설정 이동 유도
  |
  | 권한 허용됨
  v
[액티브 런 화면] ── 지도 + 실시간 트래킹 시작
  |
  |── [일시정지 버튼] → 일시정지 상태 → [재개 버튼] → 러닝 재개
  |
  |── [스플릿 알림 팝업] → 1km 구간 완료 시 자동 표시 (3초 후 자동 닫힘 또는 X 버튼)
  |
  | 종료 버튼 탭
  v
[종료 확인 다이얼로그] ── "러닝을 종료하시겠습니까?"
  |
  | 확인
  v
[러닝 요약 화면] ── 총 거리, 시간, 평균 페이스, 경로 지도, 스플릿 정보
  |
  | 저장 / 서버 동기화
  v
[홈 화면으로 복귀] ── 주간 캘린더 및 누적 데이터 갱신
```

### 2.2 보조 플로우

- **바텀 네비게이션 이동**: 홈 / 캘린더 / 트레이닝 / 마이 탭 전환
- **AI 페이스메이커 카드 탭**: AI 상세 메시지 또는 코칭 화면으로 이동
- **러닝 중 백그라운드 전환**: GPS 트래킹 유지, 상태바 인디케이터 표시

---

## 3. 화면별 상세 스펙

### 3.1 홈 화면

> **경로**: `app/(tabs)/index.tsx`
> **다크/라이트 모드 모두 지원**

#### 3.1.1 레이아웃 구조

```
[SafeArea Top]
├── [날짜 헤더]           ── "2025년 1월 17일"
├── [주간 캘린더]         ── 월~일, 7개 원형 셀
├── [누적 거리]           ── 대형 오렌지 숫자 + "km"
├── [타이머]              ── "00:28:45" (이번 주 누적 러닝 시간)
├── [페이스 / 심박수 행]  ── 좌: 현재 페이스 "5'29"" / 우: 심박수 "156 bpm"
├── [AI 페이스메이커 카드] ── 코칭 메시지 + "당신의 페이스메이커" 라벨
├── [RUN 버튼]            ── 원형 오렌지 버튼 (러닝 아이콘 + "RUN" 텍스트)
└── [바텀 네비게이션]     ── 홈 | 캘린더 | 트레이닝 | 마이
```

#### 3.1.2 컴포넌트 상세

##### 날짜 헤더
| 속성 | 값 |
|------|------|
| 형식 | `YYYY년 M월 D일` |
| 폰트 크기 | 24px, Bold |
| 색상 | 다크: `#FAFAFA` / 라이트: `#0D0D0D` |
| 위치 | 좌측 상단, SafeArea 아래 |

##### 주간 캘린더
| 속성 | 값 |
|------|------|
| 레이블 | 월, 화, 수, 목, 금, 토, 일 |
| 날짜 표시 | 해당 주의 실제 날짜 (예: 12, 13, 14, 15, 16, 17, 18) |
| 셀 크기 | 원형 40x40px |
| 기본 배경 | 다크: `#262626` / 라이트: `#E5E5E5` |
| 달린 날 배경 | `BrandOrange (#FF6F00)` |
| 달린 날 텍스트 | `#FFFFFF` |
| 오늘 날짜 | 굵은 테두리 또는 볼드 처리로 구분 |
| 동작 | 날짜 셀 탭 시 해당 날 러닝 기록 요약 표시 (선택적) |

##### 누적 거리
| 속성 | 값 |
|------|------|
| 숫자 | 이번 주 누적 거리 (예: `5.23`) |
| 숫자 폰트 | 72px, Bold, `BrandOrange (#FF6F00)` |
| 단위 | `km`, 24px, 기본 텍스트 색상 |
| 정렬 | 중앙 |
| 초기 상태 | 기록 없음 시 `0 km` 표시 |

##### 타이머
| 속성 | 값 |
|------|------|
| 형식 | `HH:MM:SS` (예: `00:28:45`) |
| 폰트 | 48px, Bold, 기본 텍스트 색상 |
| 정렬 | 중앙 |
| 데이터 | 이번 주 누적 러닝 시간 |
| 초기 상태 | `00:00:00` |

##### 현재 페이스
| 속성 | 값 |
|------|------|
| 형식 | `M'SS"` (예: `5'29"`) |
| 폰트 | 28px, Bold |
| 라벨 | "현재 페이스", 14px, opacity 0.8 |
| 위치 | 좌측 반 영역 |
| 데이터 | 가장 최근 러닝의 평균 페이스 또는 이번 주 평균 페이스 |
| 초기 상태 | `-` |

##### 심박수
| 속성 | 값 |
|------|------|
| 형식 | 하트 아이콘 + 숫자 (예: `156`) |
| 폰트 | 28px, Bold |
| 하트 아이콘 | 빨간색 하트 (`#FF0000` 또는 시스템 하트 컬러) |
| 라벨 | "심박수 bpm", 14px, opacity 0.8 |
| 위치 | 우측 반 영역 |
| 데이터 | 가장 최근 러닝의 평균 심박수 또는 연동 워치 실시간 심박수 |
| 초기 상태 | `-` |

##### AI 페이스메이커 메시지 카드
| 속성 | 값 |
|------|------|
| 배경 | 다크: `#1A1A1A` (반투명) / 라이트: `#F5F5F5` |
| 모서리 | borderRadius 16px |
| 패딩 | 16px |
| 메시지 텍스트 | 14~15px, 기본 텍스트 색상, 최대 3줄 |
| 하단 라벨 | "당신의 페이스메이커" + AI 아이콘, 우측 하단 정렬 |
| 예시 메시지 (활동 있음) | "와, 이번주에는 주 5일이나 달리기를 진행했네! 너무 고생 많았어. 달린 후 회복을 위한 스트레칭도 잊지 말고 꼭 해줘. 내일도 행복한 러닝하자" |
| 예시 메시지 (활동 없음) | "오늘 달리기 딱 좋은 날씨인데, 잠깐만 나가서 달리고 오는 건 어때?" |
| 탭 동작 | AI 코칭 상세 화면으로 이동 |

##### RUN 버튼
| 속성 | 값 |
|------|------|
| 크기 | 80x80px 원형 |
| 배경 | `BrandOrange (#FF6F00)` |
| 아이콘 | 달리는 사람 아이콘 (흰색) |
| 텍스트 | "RUN", 14px, Bold, 흰색 |
| 정렬 | 수평 중앙 |
| 탭 동작 | GPS 권한 확인 후 액티브 런 화면으로 전환 |
| 햅틱 피드백 | medium impact |
| 비활성 상태 | 없음 (항상 탭 가능) |

##### 바텀 네비게이션
| 탭 | 아이콘 | 라벨 |
|------|------|------|
| 홈 | house.fill | 홈 |
| 캘린더 | calendar | 캘린더 |
| 트레이닝 | 달리기 신발 아이콘 | 트레이닝 |
| 마이 | person | 마이 |

| 속성 | 값 |
|------|------|
| 활성 색상 | `BrandOrange (#FF6F00)` |
| 비활성 색상 | 다크: `#737373` / 라이트: `#737373` |
| 배경 | 다크: `#0D0D0D` / 라이트: `#FFFFFF` |

---

### 3.2 액티브 런 화면

> **경로**: `app/(tabs)/run/active.tsx`
> **다크 모드 고정** (러닝 중 눈부심 방지)

#### 3.2.1 레이아웃 구조

```
[SafeArea Top]
├── [지도 영역]                ── 상단 절반, 실시간 경로 + 현재 위치 마커
│   └── [스플릿 알림 팝업]     ── 지도 위 오버레이 (조건부 표시)
├── [대시보드 영역]            ── 하단 절반
│   ├── [누적 거리]            ── 대형 오렌지 숫자 + "km"
│   ├── [타이머]               ── "00:28:45"
│   ├── [페이스 / 심박수 행]   ── 현재 페이스 / 심박수
│   └── [컨트롤 버튼 행]       ── 일시정지 + 종료
└── [SafeArea Bottom]
```

#### 3.2.2 컴포넌트 상세

##### 지도 영역
| 속성 | 값 |
|------|------|
| 높이 | 화면 상단 약 40~45% |
| 지도 스타일 | 다크 모드 지도 테마 |
| 경로 선 | `BrandOrange (#FF6F00)`, 두께 4px |
| 현재 위치 마커 | 오렌지 원형 도트 (맥동 애니메이션) |
| 자동 추적 | 현재 위치 중심으로 지도 자동 이동 |
| 줌 레벨 | 기본 15~16 (도로 수준), 핀치 줌 지원 |
| 지도 라이브러리 | `react-native-maps` (MapView) |

##### 스플릿 알림 팝업
| 속성 | 값 |
|------|------|
| 트리거 | 누적 거리가 N km(1km 단위) 도달 시 |
| 위치 | 지도 영역 하단 오버레이 |
| 배경 | 다크 반투명 (`rgba(26,26,26,0.95)`), borderRadius 12px |
| 구성 | 뱃지 (`N km`, 오렌지 배경) + "스플릿 완료!" 텍스트 + X 닫기 버튼 |
| 이번 구간 페이스 | 28px Bold (예: `5'18"`) + "이번 구간 페이스" 라벨 |
| 평균 페이스 | 28px Bold (예: `5'24"`) + "평균 페이스" 라벨 |
| 자동 닫힘 | 3초 후 자동 fade out |
| 수동 닫힘 | 우측 상단 X 버튼 탭 |
| 애니메이션 | 하단에서 슬라이드 업 + fade in |

##### 누적 거리 (액티브)
| 속성 | 값 |
|------|------|
| 숫자 | 실시간 누적 거리 (예: `5.23`) |
| 숫자 폰트 | 80px, Bold, `BrandOrange (#FF6F00)` |
| 단위 | `km`, 24px, `#FAFAFA` |
| 정렬 | 중앙 |
| 업데이트 주기 | GPS 좌표 수신 시마다 (약 1초 간격) |

##### 타이머 (액티브)
| 속성 | 값 |
|------|------|
| 형식 | `HH:MM:SS` |
| 폰트 | 40px, Bold, `#FAFAFA` |
| 정렬 | 중앙 |
| 동작 | 1초 간격 갱신, 일시정지 시 멈춤 |
| 일시정지 시각 표현 | 텍스트 깜빡임 (opacity 토글, 0.5초 주기) |

##### 현재 페이스 (액티브)
| 속성 | 값 |
|------|------|
| 형식 | `M'SS"` |
| 폰트 | 28px, Bold, `#FAFAFA` |
| 라벨 | "현재 페이스", 14px, opacity 0.8 |
| 계산 | 최근 500m 구간 기준 이동 페이스 (롤링 평균) |
| 업데이트 | GPS 좌표 수신 시마다 |

##### 심박수 (액티브)
| 속성 | 값 |
|------|------|
| 형식 | 하트 아이콘 + 숫자 |
| 폰트 | 28px, Bold, `#FAFAFA` |
| 라벨 | "심박수 bpm", 14px, opacity 0.8 |
| 데이터 소스 | Apple Watch / Samsung Watch HealthKit 연동 |
| 미연동 시 | `-` 표시 |

##### 일시정지 버튼
| 속성 | 값 |
|------|------|
| 크기 | flex 1, 높이 56px |
| 배경 | `#333333` |
| 모서리 | borderRadius 16px |
| 아이콘 | 일시정지 아이콘 (II), 흰색 |
| 텍스트 | "일시정지", 16px, Bold, 흰색 |
| 탭 동작 | GPS 트래킹 일시정지, 타이머 멈춤 |
| 일시정지 중 | "재개" 텍스트로 변경, 재개 아이콘 (재생) |
| 햅틱 피드백 | medium impact |

##### 종료 버튼
| 속성 | 값 |
|------|------|
| 크기 | flex 1, 높이 56px |
| 배경 | `BrandOrange (#FF6F00)` |
| 모서리 | borderRadius 16px |
| 아이콘 | 정지 아이콘 (네모), 흰색 |
| 텍스트 | "종료", 16px, Bold, 흰색 |
| 탭 동작 | 종료 확인 다이얼로그 표시 |
| 최소 거리 미달 시 | 100m 미만이면 "기록이 너무 짧습니다. 삭제하시겠습니까?" 안내 |
| 햅틱 피드백 | heavy impact |

---

## 4. 데이터 모델

### 4.1 러닝 세션 (클라이언트 로컬)

> **타입 파일**: `types/run.ts`

```typescript
type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;      // Unix ms
  altitude?: number;       // 고도 (m)
  accuracy?: number;       // GPS 정확도 (m)
}

interface RunSession {
  id: string;                     // UUID
  startedAt: number;              // Unix ms
  updatedAt: number;              // 마지막 업데이트 시각
  coordinates: Coordinate[];      // GPS 경로 좌표 배열
  totalDistanceMeters: number;    // 총 이동 거리 (m)
  totalDurationMs: number;        // 순수 이동 시간 (ms), 일시정지 제외
  status: RunStatus;
  pausedDurationMs?: number;      // 일시정지 누적 시간 (ms)
  splits: SplitData[];            // 1km 단위 스플릿 데이터
  currentPaceMinPerKm: number | null;  // 현재 페이스
  heartRateBpm: number | null;         // 현재 심박수
}

interface SplitData {
  splitNumber: number;         // 구간 번호 (1, 2, 3...)
  distanceMeters: number;      // 구간 거리 (보통 1000m)
  durationMs: number;          // 구간 소요 시간
  paceMinPerKm: number;        // 구간 페이스
  averageHeartRate?: number;   // 구간 평균 심박수
  timestamp: number;           // 구간 완료 시각
}
```

### 4.2 주간 요약 데이터 (홈 화면)

```typescript
interface WeeklySummary {
  weekStartDate: string;           // ISO 날짜 (월요일)
  weekEndDate: string;             // ISO 날짜 (일요일)
  dailyRunFlags: boolean[];        // [월, 화, 수, 목, 금, 토, 일] 달린 여부
  dailyDates: number[];            // [12, 13, 14, 15, 16, 17, 18] 날짜 숫자
  totalDistanceKm: number;         // 주간 누적 거리 (km)
  totalDurationDisplay: string;    // 주간 누적 시간 "HH:MM:SS"
  averagePaceDisplay: string;      // 주간 평균 페이스 "M'SS\""
  averageHeartRate: number | null; // 주간 평균 심박수
  latestPaceDisplay: string;       // 가장 최근 러닝 페이스
  latestHeartRate: number | null;  // 가장 최근 러닝 심박수
}
```

### 4.3 AI 페이스메이커 메시지

```typescript
interface PacemakerMessage {
  id: string;
  message: string;              // AI 생성 코칭 메시지
  messageType: 'encourage' | 'recovery' | 'tip' | 'milestone';
  createdAt: string;            // ISO datetime
  relatedActivityId?: number;   // 관련 활동 ID (선택적)
}
```

### 4.4 서버 동기화용 활동 데이터

> **타입 파일**: `types/activity.ts` (기존 `CreateActivityPayload` 활용)

```typescript
interface CreateActivityPayload {
  title?: string;
  started_at: string;              // ISO datetime
  ended_at: string;                // ISO datetime
  duration: string;                // "HH:MM:SS"
  distance: number;                // 총 거리 (m)
  average_pace: string;            // "MM:SS"
  best_pace?: string;              // "MM:SS"
  calories?: number;
  average_heart_rate?: number;
  max_heart_rate?: number;
  average_cadence?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  notes?: string;
  route_coordinates?: ApiCoordinate[];
  start_coordinates?: ApiCoordinate;
  end_coordinates?: ApiCoordinate;
  splits?: CreateActivitySplit[];
}
```

---

## 5. API 요구사항

### 5.1 기존 API (활용)

| API | 메서드 | 경로 | 용도 |
|------|------|------|------|
| 활동 목록 조회 | GET | `/api/v1/activities/` | 홈 화면 주간 데이터 조회 |
| 활동 생성 | POST | `/api/v1/activities/` | 러닝 종료 후 기록 저장 |
| 통계 요약 | GET | `/api/v1/activities/statistics/summary/` | 주간/월간 요약 통계 |
| 주간 통계 | GET | `/api/v1/activities/statistics/weekly/` | 주간 캘린더 데이터 |
| 활동 동기화 | POST | `/api/v1/activities/sync/` | 오프라인 기록 일괄 동기화 |

### 5.2 신규 API (필요)

#### 5.2.1 주간 캘린더 데이터
```
GET /api/v1/activities/weekly-calendar/
Query: ?week_start=2025-01-12
Response:
{
  "week_start": "2025-01-12",
  "week_end": "2025-01-18",
  "daily_stats": [
    {
      "date": "2025-01-12",
      "has_activity": true,
      "total_distance_km": 5.23,
      "total_duration": "00:28:45"
    },
    ...
  ],
  "weekly_total_distance_km": 5.23,
  "weekly_total_duration": "00:28:45",
  "weekly_average_pace": "5:29",
  "weekly_average_heart_rate": 156
}
```

#### 5.2.2 AI 페이스메이커 메시지
```
GET /api/v1/pacemaker/message/
Query: ?context=home (home | post_run | milestone)
Response:
{
  "id": "msg-uuid",
  "message": "와, 이번주에는 주 5일이나 달리기를 진행했네! ...",
  "message_type": "encourage",
  "created_at": "2025-01-17T18:00:00Z"
}
```

#### 5.2.3 실시간 심박수 (선택적 - 워치 연동)
```
심박수 데이터는 Apple HealthKit / Samsung Health SDK를 통해
클라이언트 측에서 직접 조회하며, 별도 서버 API가 필요하지 않음.
러닝 종료 후 평균/최대 심박수를 활동 생성 API에 포함하여 전송.
```

---

## 6. 상태 관리

### 6.1 전체 상태 흐름도

```
[HomeState] ─── RUN 탭 ───> [RunState: idle]
                                    |
                              RUN 버튼 탭
                                    |
                                    v
                            [RunState: running]
                               /          \
                    일시정지 버튼          종료 버튼
                         /                    \
                        v                      v
              [RunState: paused]       [RunState: finished]
                        |                      |
                  재개 버튼              서버 저장 + 로컬 초기화
                        |                      |
                        v                      v
              [RunState: running]       [HomeState] (갱신됨)
```

### 6.2 홈 화면 상태

```typescript
interface HomeScreenState {
  // 주간 캘린더
  weeklySummary: WeeklySummary | null;
  isLoadingWeekly: boolean;

  // AI 페이스메이커
  pacemakerMessage: PacemakerMessage | null;
  isLoadingPacemaker: boolean;

  // 날짜
  currentDate: Date;
}
```

### 6.3 액티브 런 상태

```typescript
interface ActiveRunState {
  // 세션 핵심 데이터
  session: RunSession | null;
  status: RunStatus;              // 'idle' | 'running' | 'paused' | 'finished'

  // GPS
  currentLocation: Coordinate | null;
  routeCoordinates: Coordinate[];
  gpsAccuracy: number;            // 현재 GPS 정확도 (m)

  // 실시간 메트릭
  distanceMeters: number;
  durationMs: number;
  currentPaceMinPerKm: number | null;
  heartRateBpm: number | null;

  // 스플릿
  splits: SplitData[];
  currentSplitAlert: SplitData | null;  // 현재 표시 중인 스플릿 알림
  isSplitAlertVisible: boolean;

  // 지도
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isFollowingUser: boolean;       // 사용자 위치 자동 추적 여부

  // 저장/동기화
  isSaving: boolean;
  saveError: string | null;
}
```

### 6.4 상태 저장 전략

| 항목 | 저장소 | 타이밍 |
|------|------|------|
| 러닝 세션 드래프트 | MMKV (로컬) | 1분 간격 또는 500m 이동 시 |
| 러닝 완료 기록 | 서버 API + MMKV | 종료 시 즉시 |
| 주간 요약 캐시 | MMKV | API 응답 시, 5분 TTL |
| AI 메시지 캐시 | MMKV | API 응답 시, 1시간 TTL |
| GPS 좌표 버퍼 | 메모리 (useRef) | 실시간, 종료 시 일괄 저장 |

### 6.5 화면 전환 시 상태 처리

| 전환 | 처리 |
|------|------|
| 홈 → 액티브 런 | RunState를 `running`으로 초기화, GPS 트래킹 시작 |
| 액티브 런 → 백그라운드 | GPS TaskManager로 백그라운드 트래킹 유지, 드래프트 저장 |
| 백그라운드 → 액티브 런 | 드래프트에서 세션 복원, 경과 시간 재계산 |
| 액티브 런 → 종료 | 세션 완료 처리, 서버 저장, 홈 화면 데이터 갱신 |
| 앱 강제 종료 | 다음 앱 실행 시 드래프트 감지, 복원 또는 삭제 제안 |

---

## 7. 엣지 케이스

### 7.1 GPS 관련

| 케이스 | 처리 |
|------|------|
| **GPS 권한 미허용** | RUN 버튼 탭 시 권한 요청 다이얼로그 → 거부 시 설정 이동 안내 토스트 |
| **GPS 신호 끊김** | 3초 이상 신호 없으면 상태바에 "GPS 신호 약함" 경고 아이콘 표시. 거리 계산 일시 중단, 신호 복구 시 보간 처리하지 않음 (정확도 우선) |
| **GPS 정확도 저하** | accuracy > 50m 인 좌표는 경로에 포함하되 거리 계산에서 가중치 낮춤 |
| **터널/실내 진입** | GPS 끊김 처리와 동일. 걸음 수 기반 보정은 v2에서 검토 |
| **GPS 드리프트** | 정지 상태에서 10m 이상 점프하는 좌표는 필터링 (속도 기반 이상치 제거) |

### 7.2 백그라운드/멀티태스킹

| 케이스 | 처리 |
|------|------|
| **앱 백그라운드 전환** | `expo-location`의 `startLocationUpdatesAsync`로 백그라운드 GPS 유지. iOS: 위치 사용 중 상태바 표시 |
| **앱 강제 종료** | MMKV에 저장된 드래프트 세션을 다음 앱 실행 시 감지. "이전 러닝 기록이 있습니다. 복원하시겠습니까?" 다이얼로그 표시 |
| **메모리 경고** | GPS 좌표 버퍼를 MMKV로 즉시 flush, 지도 타일 캐시 해제 |
| **전화 수신** | 일시정지 처리 없음 (러닝 지속). 전화 종료 후 정상 트래킹 계속 |
| **화면 잠금** | 백그라운드 GPS 트래킹 유지, 화면 해제 시 UI 동기화 |

### 7.3 네트워크

| 케이스 | 처리 |
|------|------|
| **오프라인 상태에서 러닝** | 로컬에 완전한 세션 데이터 저장. 지도는 캐시된 타일 사용 (없으면 빈 화면에 경로만 표시) |
| **러닝 종료 시 오프라인** | 로컬에 저장 후 "네트워크 연결 시 자동 동기화됩니다" 토스트. 앱 재실행 또는 네트워크 복구 시 `sync` API로 일괄 업로드 |
| **API 호출 실패** | 3회 재시도 (exponential backoff: 1초, 3초, 9초). 실패 지속 시 로컬 저장 + 재시도 큐에 추가 |
| **홈 화면 데이터 로딩 실패** | 캐시된 데이터 표시 + "데이터를 불러오지 못했습니다" 배너. pull-to-refresh로 재시도 |

### 7.4 데이터 무결성

| 케이스 | 처리 |
|------|------|
| **극단적으로 짧은 러닝** | 100m 미만 또는 30초 미만: "기록이 너무 짧습니다. 저장하시겠습니까?" 확인 |
| **비정상적으로 빠른 페이스** | 1km당 2분 미만 (시속 30km+): 자동차 이동 의심, "달리기 기록이 맞나요?" 확인 |
| **비정상적으로 느린 페이스** | 1km당 15분 초과: 걷기로 분류 제안 (선택적) |
| **중복 기록** | 동일 시간대에 이미 기록이 있으면 경고 표시 |
| **시간대 변경** | 러닝 중 시간대가 변경되어도 Unix timestamp 기준으로 정확한 duration 계산 |

### 7.5 심박수 연동

| 케이스 | 처리 |
|------|------|
| **워치 미연결** | 심박수 영역에 `-` 표시, 기능 안내 없이 자연스럽게 비표시 |
| **연결 끊김** | 마지막 수신 값 유지 + "심박수 연결 끊김" 작은 텍스트 |
| **비정상 심박수** | 30bpm 미만 또는 250bpm 초과 데이터 필터링 |

### 7.6 UI/UX 엣지 케이스

| 케이스 | 처리 |
|------|------|
| **홈 화면 이번 주 첫 진입** | 모든 메트릭 초기값 표시 (`0 km`, `00:00:00`, `-`, `-`) |
| **RUN 버튼 연속 탭** | 디바운스 처리 (500ms), 중복 세션 생성 방지 |
| **종료 버튼 실수 탭** | 확인 다이얼로그 필수. "러닝을 종료하시겠습니까?" + 취소/종료 버튼 |
| **일시정지 후 장시간 방치** | 30분 이상 일시정지 시 "러닝이 일시정지 상태입니다. 종료하시겠습니까?" 로컬 알림 |
| **스플릿 알림 중 다른 알림** | 스플릿 알림이 큐잉되지 않고 최신 것만 표시. 이전 알림은 자동 닫힘 |
| **화면 회전** | 세로 모드 고정 (가로 회전 무시) |
| **다이나믹 타입 (접근성)** | 주요 메트릭 텍스트는 시스템 폰트 크기 설정에 비례하되, 최소/최대 크기 제한 |

---

## 부록: 디자인 토큰 요약

| 토큰 | 값 | 용도 |
|------|------|------|
| `BrandOrange` | `#FF6F00` | 주요 액센트, 달린 날 표시, 거리 숫자, RUN 버튼, 경로 선 |
| `Dark Background` | `#0D0D0D` | 다크 모드 배경 |
| `Light Background` | `#FFFFFF` | 라이트 모드 배경 |
| `Dark Surface` | `#171717` | 다크 모드 카드/섹션 배경 |
| `Light Surface` | `#F5F5F5` | 라이트 모드 카드/섹션 배경 |
| `Dark Text` | `#FAFAFA` | 다크 모드 기본 텍스트 |
| `Light Text` | `#0D0D0D` | 라이트 모드 기본 텍스트 |
| `Heart Red` | `#FF0000` | 심박수 아이콘 |
| `Inactive Gray` | `#737373` | 비활성 탭, 보조 텍스트 |
| `Border Radius (Card)` | `16px` | 카드, 팝업, 버튼 모서리 |
| `Border Radius (Badge)` | `20px` | 캘린더 날짜 셀 |

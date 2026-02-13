# PRD: 트레이닝 탭 (목표 설정 + 업적 시스템)

## 1. 개요

### 1.1 목적

트레이닝 탭은 러닝로그 앱의 핵심 동기부여 기능으로, 사용자가 **월별 러닝 목표를 설정**하고 **달성 현황을 시각적으로 추적**하며, **거리별 업적(메달) 시스템**을 통해 지속적인 러닝 습관 형성을 유도하는 화면이다.

### 1.2 사용자 가치

| 가치 | 설명 |
|------|------|
| **목표 기반 동기부여** | 매월 거리/시간/횟수 중 하나를 선택하여 구체적인 목표를 설정하고, 진행률 바를 통해 실시간으로 달성도를 확인할 수 있다 |
| **업적 수집 재미** | 5KM, 10KM, HALF(21.0975KM), FULL(42.195KM) 거리별 메달을 수집하는 게이미피케이션 요소로 성취감을 제공한다 |
| **신기록 인지** | 해당 월의 최고 기록을 자동 갱신하고 "신기록" 뱃지를 부여하여 자기 경쟁 심리를 자극한다 |
| **히스토리 회고** | "지난 업적" 기능으로 과거 월별 성과를 돌아보며 성장 과정을 확인할 수 있다 |

### 1.3 타겟 사용자

- 30대 남성 러너 (앱 전체 타겟과 동일)
- 정기적으로 러닝하며 기록 관리에 관심이 있는 사용자
- 목표 달성과 자기 기록 갱신에 동기를 얻는 사용자

### 1.4 바텀 네비게이션 위치

현재 탭 구조: `홈` | `기록` | `마이페이지` (+ 숨김: `consult`)

트레이닝 탭 추가 후: `홈` | `캘린더` | `트레이닝` | `마이페이지`

> 스크린샷 기준 바텀 네비게이션에 4개 탭이 표시되며, 트레이닝 탭은 3번째 위치에 아이콘(러닝 아이콘)과 함께 배치된다.

---

## 2. 사용자 흐름

### 2.1 메인 흐름

```
바텀 네비게이션 "트레이닝" 탭 진입
    │
    ├── [목표가 있는 경우]
    │   └── "N월의 목표" 섹션 표시
    │       ├── 목표명 (예: "500KM 달리기")
    │       ├── 진행 바 + 수치 (324km / 500km)
    │       └── 달성률 뱃지 (45%)
    │
    ├── [목표가 없는 경우]
    │   └── "아직 이달의 목표가 없어요" 표시
    │       ├── "목표를 설정해 보세요" 안내 문구
    │       └── "목표 설정하기" 버튼 → 목표 설정 모달 열림
    │
    └── "N월의 업적" 섹션 표시
        ├── "지난 업적" 버튼 → 과거 월별 업적 화면
        ├── 안내 문구
        └── 메달 그리드 (5KM / 10KM / HALF / FULL)
```

### 2.2 목표 설정 흐름

```
"목표 설정하기" 버튼 탭
    │
    └── 목표 설정 모달 (바텀 시트) 열림
        │
        ├── 목표 타입 선택 (세그먼트 컨트롤)
        │   ├── 거리 (기본 선택)
        │   ├── 시간
        │   └── 횟수
        │
        ├── 목표값 입력
        │   ├── [거리] "목표 거리를 입력해주세요 km"
        │   ├── [시간] "목표 시간을 입력해주세요 시간"
        │   └── [횟수] "목표 횟수를 입력해주세요 회"
        │
        └── 액션 버튼
            ├── "취소" → 모달 닫기
            └── "설정하기" → 목표 저장 → 모달 닫기 → 메인 화면 갱신
```

### 2.3 업적 확인 흐름

```
메달 그리드 확인
    │
    ├── [달성 메달] 금메달 표시 + 기록 시간 + 달성 날짜
    │   └── [신기록인 경우] "신기록" 뱃지 추가 표시
    │
    ├── [미달성 메달 (과거 기록 있음)] 은메달 + 잠금 아이콘
    │   └── 해당 월에는 아직 달성하지 못한 상태
    │
    └── [미달성 메달 (기록 없음)] 회색 메달 + "기록 없음" 텍스트
```

---

## 3. 화면별 상세 스펙

### 3.1 트레이닝 메인 화면

#### 3.1.1 헤더

| 속성 | 값 |
|------|-----|
| 타이틀 | "트레이닝" |
| 타이포그래피 | Bold, 28pt (ThemedText type="title") |
| 위치 | 좌측 정렬, SafeArea 하단 기준 |
| 다크모드 | 텍스트 `Colors.dark.text` (#FAFAFA) |
| 라이트모드 | 텍스트 `Colors.light.text` (#0D0D0D) |

#### 3.1.2 N월의 목표 섹션

**섹션 제목**
- 텍스트: "{현재 월}월의 목표" (예: "1월의 목표")
- 타이포그래피: SemiBold, 18pt

**상태 A: 목표가 설정된 경우**

| 요소 | 스펙 |
|------|------|
| 컨테이너 | 라운드 카드 (borderRadius: 12, padding: 16), 배경: `Colors.{scheme}.surface` |
| 목표명 | "500KM 달리기" — SemiBold, 16pt |
| 진행 수치 | 현재값 `BrandOrange`(#FF6F00) 강조 + "km / 목표km" 일반 텍스트 |
| 진행 바 | 높이 6px, 트랙: `Colors.{scheme}.border`, 채움: `BrandOrange`, borderRadius: 3 |
| 달성률 뱃지 | 우측 상단, 배경: `BrandOrange`, 텍스트: 흰색, Bold, borderRadius: 12, 패딩: 4px 10px |
| 뱃지 텍스트 | "{퍼센트}%" (소수점 버림) |

**상태 B: 목표가 없는 경우**

| 요소 | 스펙 |
|------|------|
| 컨테이너 | 라운드 카드 (borderRadius: 12, padding: 16), 배경: `Colors.{scheme}.surface` |
| 메인 텍스트 | "아직 이달의 목표가 없어요" — SemiBold, 16pt |
| 서브 텍스트 | "목표를 설정해 보세요" — Regular, 14pt, opacity: 0.6 |
| CTA 버튼 | "목표 설정하기", 배경: `BrandOrange`, 텍스트: 흰색, borderRadius: 20, 우측 배치 |
| 버튼 탭 | 목표 설정 모달 열기 |

#### 3.1.3 N월의 업적 섹션

**섹션 헤더**

| 요소 | 스펙 |
|------|------|
| 제목 | "{현재 월}월의 업적" — SemiBold, 18pt, 좌측 |
| 지난 업적 버튼 | "지난 업적" + 트로피 아이콘, 우측 배치, 보더 스타일 (borderWidth: 1, borderRadius: 20) |
| 버튼 탭 | 지난 업적 화면으로 이동 |

**안내 문구**

- 텍스트: "거리를 달성하면 메달이 활성화되며, 해당 월의 최고 기록이 표시돼요."
- 타이포그래피: Regular, 14pt, opacity: 0.6
- 위치: 섹션 헤더 아래, 메달 그리드 위

**메달 그리드**

| 속성 | 값 |
|------|-----|
| 레이아웃 | 2열 그리드 (flexWrap: wrap), gap: 16 |
| 메달 카드 크기 | 가로 (화면폭 - 48) / 2 |
| 메달 종류 | 5KM, 10KM, HALF (21.0975km), FULL (42.195km) |

**개별 메달 카드 상태**

| 상태 | 메달 이미지 | 라벨 | 부가 정보 |
|------|------------|------|----------|
| **금메달 (달성)** | 컬러 금메달 이미지 | "5km", "10km" 등 | 기록 시간 (예: "15분 32초") + 달성 날짜 (예: "2026년 1월 31일 13:52") |
| **금메달 + 신기록** | 컬러 금메달 이미지 | 라벨 + "신기록" 뱃지 (BrandOrange 배경, 흰색 텍스트) | 기록 시간 + 달성 날짜 |
| **은메달 (잠금)** | 회색톤 은메달 + 잠금 아이콘 | "HALF", "FULL" 등 | "기록 없음" 텍스트 |
| **비활성 (기록 없음)** | 회색 비활성 메달 | "HALF", "FULL" 등 | "기록 없음" 텍스트 |

> 메달 이미지는 로컬 에셋으로 관리하며, 금/은/비활성 3종을 각 거리별로 준비한다.

#### 3.1.4 바텀 네비게이션

기존 `_layout.tsx`에 트레이닝 탭 추가:

```
홈 (house.fill) | 캘린더 (calendar) | 트레이닝 (running icon) | 마이페이지 (person)
```

- 활성 탭 색상: `BrandOrange` (#FF6F00)
- 비활성 탭 색상: `Colors.{scheme}.tabIconDefault` (#737373)

---

### 3.2 목표 설정 모달

#### 3.2.1 모달 기본 스펙

| 속성 | 값 |
|------|-----|
| 타입 | 바텀 시트 모달 또는 센터 모달 |
| 배경 | 흰색 (라이트) / surface (다크) |
| 모서리 | borderRadius: 16 (상단) |
| 오버레이 | 반투명 블랙 (#00000066) |
| 닫기 | X 버튼 (우측 상단) 또는 오버레이 탭 |

#### 3.2.2 타이틀

| 속성 | 값 |
|------|-----|
| 텍스트 | "이달의 목표 설정" |
| 타이포그래피 | Bold, 20pt |
| X 버튼 | 우측 상단, 24x24, `Colors.{scheme}.icon` 색상 |

#### 3.2.3 목표 타입 세그먼트 컨트롤

| 속성 | 값 |
|------|-----|
| 타입 | 3개 세그먼트: "거리" / "시간" / "횟수" |
| 아이콘 | 거리: 러닝 아이콘, 시간: 시계 아이콘, 횟수: # 기호 |
| 기본 선택 | "거리" |
| 활성 스타일 | 배경: 다크(#333) / 라이트(#222), 텍스트: 흰색, borderRadius: 20 |
| 비활성 스타일 | 배경: 투명, 보더: `Colors.{scheme}.border`, 텍스트: 기본 색상 |
| 컨테이너 | 가로 배치, gap: 8 |

#### 3.2.4 입력 필드

| 목표 타입 | 라벨 | Placeholder | 단위 | 키보드 |
|-----------|------|-------------|------|--------|
| 거리 | "목표 거리" | "목표 거리를 입력해주세요" | km | numeric |
| 시간 | "목표 시간" | "목표 시간을 입력해주세요" | 시간 | numeric |
| 횟수 | "목표 횟수" | "목표 횟수를 입력해주세요" | 회 | numeric |

**입력 필드 스타일**

| 속성 | 값 |
|------|-----|
| 높이 | 52px |
| 보더 | 1px, `Colors.{scheme}.border`, borderRadius: 12 |
| 텍스트 정렬 | 우측 정렬 |
| 폰트 크기 | 입력값: 24pt (Bold), 단위: 16pt (Regular) |
| 포커스 보더 | `BrandOrange` |

#### 3.2.5 액션 버튼

| 버튼 | 스타일 | 동작 |
|------|--------|------|
| 취소 | 보더 스타일 (borderWidth: 1, `Colors.{scheme}.border`), 텍스트: 기본, flex: 1 | 모달 닫기 |
| 설정하기 | 배경: `BrandOrange`, 텍스트: 흰색, Bold, flex: 1 | 유효성 검사 → API 호출 → 모달 닫기 |

**유효성 검사**
- 값이 0 이하이거나 비어있으면 "설정하기" 버튼 비활성 (opacity: 0.5, disabled)
- 거리: 최소 1km, 최대 9999km
- 시간: 최소 1시간, 최대 999시간
- 횟수: 최소 1회, 최대 999회

---

## 4. 데이터 모델

### 4.1 월별 목표 (MonthlyGoal)

```typescript
interface MonthlyGoal {
  id: number;
  user_id: number;
  year: number;              // 연도 (예: 2026)
  month: number;             // 월 (1~12)
  goal_type: GoalType;       // 'DISTANCE' | 'TIME' | 'COUNT'
  target_value: number;      // 목표값 (km, 시간, 횟수)
  current_value: number;     // 현재 달성값 (서버 계산)
  progress_percent: number;  // 달성률 (0~100, 소수점 버림)
  is_achieved: boolean;      // 목표 달성 여부
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
}

type GoalType = 'DISTANCE' | 'TIME' | 'COUNT';
```

### 4.2 목표 타입별 단위 매핑

| GoalType | target_value 단위 | current_value 단위 | 표시 형식 |
|----------|-------------------|-------------------|----------|
| DISTANCE | km | km | "{current}km / {target}km" |
| TIME | 시간 | 시간 | "{current}시간 / {target}시간" |
| COUNT | 회 | 회 | "{current}회 / {target}회" |

### 4.3 업적/메달 (Achievement)

```typescript
interface Achievement {
  id: number;
  user_id: number;
  year: number;
  month: number;
  distance_type: DistanceType;   // '5K' | '10K' | 'HALF' | 'FULL'
  medal_status: MedalStatus;     // 'GOLD' | 'SILVER' | 'NONE'
  best_time: string | null;      // "HH:MM:SS" 또는 null
  best_time_display: string | null; // "15분 32초" 형식
  achieved_at: string | null;    // ISO 8601, 달성 일시
  is_personal_record: boolean;   // 해당 월 신기록 여부
  activity_id: number | null;    // 달성한 활동 ID (연결)
}

type DistanceType = '5K' | '10K' | 'HALF' | 'FULL';
type MedalStatus = 'GOLD' | 'SILVER' | 'NONE';
```

### 4.4 거리 타입 기준값

| DistanceType | 기준 거리 | 표시 라벨 |
|-------------|----------|----------|
| 5K | 5.0 km | "5km" |
| 10K | 10.0 km | "10km" |
| HALF | 21.0975 km | "HALF" |
| FULL | 42.195 km | "FULL" |

### 4.5 메달 상태 결정 로직

```
해당 월에 기준 거리 이상의 러닝 기록이 있는가?
    ├── YES → GOLD (금메달)
    │   └── 이전 월 대비 시간이 더 빠른가?
    │       ├── YES → is_personal_record = true ("신기록" 뱃지)
    │       └── NO → is_personal_record = false
    │
    └── NO → 이전 월에 해당 거리 달성 기록이 있었는가?
        ├── YES → SILVER (은메달 + 잠금, 이번 달 아직 미달성)
        └── NO → NONE (비활성, "기록 없음")
```

---

## 5. API 요구사항

### 5.1 월별 목표 API

**Base URL**: `{API_BASE_URL}/v1/goals/`

#### 현재 월 목표 조회

```
GET /api/v1/goals/current/
Authorization: Bearer {access_token}
```

**Response 200**:
```json
{
  "id": 1,
  "year": 2026,
  "month": 1,
  "goal_type": "DISTANCE",
  "target_value": 500,
  "current_value": 324,
  "progress_percent": 45,
  "is_achieved": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-15T12:00:00Z"
}
```

**Response 404** (목표 미설정):
```json
{
  "error": "No goal set for current month"
}
```

#### 목표 생성

```
POST /api/v1/goals/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "goal_type": "DISTANCE",
  "target_value": 500
}
```

**Response 201**:
```json
{
  "id": 1,
  "year": 2026,
  "month": 1,
  "goal_type": "DISTANCE",
  "target_value": 500,
  "current_value": 324,
  "progress_percent": 45,
  "is_achieved": false,
  "created_at": "2026-01-15T12:00:00Z",
  "updated_at": "2026-01-15T12:00:00Z"
}
```

> `year`, `month`는 서버에서 현재 시각 기준으로 자동 설정한다.
> `current_value`는 해당 월의 기존 활동 데이터를 기반으로 서버에서 계산하여 반환한다.

**에러 케이스**:
- 400: 이미 해당 월에 목표가 존재 (`"Goal already exists for this month"`)
- 400: target_value가 유효 범위 밖

#### 목표 수정

```
PATCH /api/v1/goals/{goal_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "goal_type": "DISTANCE",
  "target_value": 600
}
```

**Response 200**: 수정된 목표 객체

#### 목표 삭제

```
DELETE /api/v1/goals/{goal_id}/
Authorization: Bearer {access_token}
```

**Response 204**: No Content

---

### 5.2 업적/메달 API

**Base URL**: `{API_BASE_URL}/v1/achievements/`

#### 현재 월 업적 조회

```
GET /api/v1/achievements/current/
Authorization: Bearer {access_token}
```

**Response 200**:
```json
{
  "year": 2026,
  "month": 1,
  "achievements": [
    {
      "id": 1,
      "distance_type": "5K",
      "medal_status": "GOLD",
      "best_time": "00:15:32",
      "best_time_display": "15분 32초",
      "achieved_at": "2026-01-31T13:52:00Z",
      "is_personal_record": true,
      "activity_id": 42
    },
    {
      "id": 2,
      "distance_type": "10K",
      "medal_status": "GOLD",
      "best_time": "00:35:12",
      "best_time_display": "35분 12초",
      "achieved_at": "2026-01-31T13:52:00Z",
      "is_personal_record": false,
      "activity_id": 42
    },
    {
      "id": 3,
      "distance_type": "HALF",
      "medal_status": "SILVER",
      "best_time": null,
      "best_time_display": null,
      "achieved_at": null,
      "is_personal_record": false,
      "activity_id": null
    },
    {
      "id": 4,
      "distance_type": "FULL",
      "medal_status": "NONE",
      "best_time": null,
      "best_time_display": null,
      "achieved_at": null,
      "is_personal_record": false,
      "activity_id": null
    }
  ]
}
```

#### 특정 월 업적 조회 (지난 업적)

```
GET /api/v1/achievements/?year=2025&month=12
Authorization: Bearer {access_token}
```

**Response 200**: 동일 구조

#### 업적 히스토리 목록 (월별 요약)

```
GET /api/v1/achievements/history/
Authorization: Bearer {access_token}
```

**Response 200**:
```json
{
  "history": [
    {
      "year": 2026,
      "month": 1,
      "gold_count": 2,
      "silver_count": 1,
      "total_records": 1
    },
    {
      "year": 2025,
      "month": 12,
      "gold_count": 3,
      "silver_count": 0,
      "total_records": 0
    }
  ]
}
```

---

## 6. 상태 관리

### 6.1 트레이닝 탭 전역 상태

```typescript
interface TrainingState {
  // 목표 관련
  goal: MonthlyGoal | null;
  goalLoading: boolean;
  goalError: string | null;

  // 업적 관련
  achievements: Achievement[];
  achievementsLoading: boolean;
  achievementsError: string | null;

  // 모달 상태
  isGoalModalVisible: boolean;

  // 현재 표시 중인 년/월
  displayYear: number;
  displayMonth: number;
}
```

### 6.2 목표 설정 모달 로컬 상태

```typescript
interface GoalModalState {
  selectedType: GoalType;     // 기본값: 'DISTANCE'
  inputValue: string;         // 텍스트 입력 (숫자 문자열)
  isSubmitting: boolean;      // API 호출 중 여부
  validationError: string | null;
}
```

### 6.3 상태 관리 훅

#### `useMonthlyGoal()`

```typescript
function useMonthlyGoal() {
  // 현재 월 목표 조회
  // 목표 생성/수정/삭제 뮤테이션
  // 자동 리페치: 탭 포커스 시
  return {
    goal: MonthlyGoal | null,
    loading: boolean,
    error: string | null,
    createGoal: (type: GoalType, value: number) => Promise<void>,
    updateGoal: (goalId: number, type: GoalType, value: number) => Promise<void>,
    deleteGoal: (goalId: number) => Promise<void>,
    refetch: () => void,
  };
}
```

#### `useAchievements(year?: number, month?: number)`

```typescript
function useAchievements(year?: number, month?: number) {
  // 지정 월 또는 현재 월 업적 조회
  // 자동 리페치: 탭 포커스 시
  return {
    achievements: Achievement[],
    loading: boolean,
    error: string | null,
    refetch: () => void,
  };
}
```

### 6.4 데이터 갱신 트리거

| 트리거 | 동작 |
|--------|------|
| 트레이닝 탭 포커스 | 목표 + 업적 동시 리페치 |
| 목표 생성/수정/삭제 성공 | 목표 상태 즉시 갱신 |
| 러닝 활동 완료 (다른 탭에서) | 트레이닝 탭 진입 시 업적 + 목표 현재값 리페치 |
| Pull-to-Refresh | 목표 + 업적 동시 리페치 |
| 월 변경 감지 | 새 월 데이터로 전체 갱신 |

### 6.5 모달 동작 흐름

```
모달 열기 (isGoalModalVisible = true)
    │
    ├── 기존 목표 있음 → selectedType, inputValue를 기존 값으로 프리필
    └── 기존 목표 없음 → selectedType: 'DISTANCE', inputValue: ''

    │
    ├── 세그먼트 변경 → selectedType 업데이트, inputValue 초기화
    ├── 값 입력 → inputValue 업데이트, 실시간 유효성 검사
    │
    ├── "취소" → 모달 닫기, 로컬 상태 초기화
    └── "설정하기"
        ├── isSubmitting = true
        ├── API 호출 (create 또는 update)
        ├── 성공 → 모달 닫기, goal 상태 갱신
        └── 실패 → 에러 토스트 표시, isSubmitting = false
```

---

## 7. 엣지 케이스

### 7.1 월 변경 시 목표 리셋

| 상황 | 처리 |
|------|------|
| 앱 사용 중 자정을 넘겨 월이 바뀜 | `displayMonth` 변경 감지 → 새 월 데이터 조회. 이전 월 목표는 서버에 보존되되 현재 월에는 목표 미설정 상태로 표시 |
| 1월 31일에 목표 설정 후 2월 1일 진입 | 2월에는 별도의 목표가 필요. 1월 목표는 "지난 업적"에서 확인 가능 |
| 목표 달성 100% 이후 추가 러닝 | current_value는 계속 증가 (100% 초과 가능). progress_percent는 100으로 캡핑 |

### 7.2 신기록 갱신 로직

| 상황 | 처리 |
|------|------|
| 같은 월에 동일 거리 더 빠른 기록 | best_time 업데이트, is_personal_record = true, 기존 신기록 뱃지 제거 후 새 기록에 부여 |
| 같은 월에 동일 거리 더 느린 기록 | 기존 best_time 유지, 신기록 뱃지 변동 없음 |
| 첫 달성 (이전 기록 자체가 없음) | 자동으로 신기록 처리 (비교 대상 없으므로 is_personal_record = true) |
| 이전 월 기록 대비 비교 | "신기록"은 해당 월 내 최고 기록 기준이 아닌, 전체 기간 대비 최고 기록일 때 부여 (전체 최고 기록 = Personal Best) |

### 7.3 메달 잠금/해제

| 상황 | 처리 |
|------|------|
| 이전 월에 5K 금메달 → 이번 달 5K 아직 미달성 | 이번 달 5K: SILVER (은메달 + 잠금 아이콘). 과거 달성 이력이 있으므로 NONE이 아닌 SILVER |
| 한 번도 FULL 달성한 적 없음 | FULL: NONE (회색 비활성 메달, "기록 없음") |
| 하나의 러닝으로 여러 거리 동시 달성 | 42.195km 이상 러닝 시 5K, 10K, HALF, FULL 모두 갱신 대상. 각 거리별 기록은 해당 구간 split 데이터 기반 또는 전체 기록 기반으로 산출 |

### 7.4 네트워크/에러 케이스

| 상황 | 처리 |
|------|------|
| 목표 조회 API 실패 | 에러 상태 표시, "다시 시도" 버튼 제공 |
| 목표 설정 API 실패 | 모달 내 토스트/인라인 에러, "설정하기" 버튼 재활성화 |
| 업적 조회 API 실패 | 메달 그리드 영역에 에러 상태 표시, Pull-to-Refresh로 재시도 유도 |
| 오프라인 상태 | 캐시된 마지막 데이터 표시, 상단에 오프라인 배너 |
| 목표 중복 생성 시도 | 서버 400 에러 → "이미 이번 달 목표가 설정되어 있습니다" 안내 |

### 7.5 기타 엣지 케이스

| 상황 | 처리 |
|------|------|
| 활동 삭제 시 업적 영향 | 삭제된 활동이 유일한 달성 기록이었다면 해당 메달 상태 재계산 (서버 사이드) |
| 활동 수정 시 거리 변경 | 거리 변경으로 기존 달성 조건이 깨지면 메달 상태 재계산 |
| 윤년 2월 / 월별 일수 차이 | 서버에서 `year`, `month` 기준으로 처리, 클라이언트는 해당 월의 1일~말일까지 데이터 표시 |
| 목표 설정 후 바로 삭제 | 정상 동작, 목표 없음 상태로 복귀 |
| 동시에 여러 기기에서 목표 설정 | 서버에서 월별 유니크 제약 → 먼저 저장된 목표 우선, 후속 요청은 400 에러 |

---

## 부록: 파일 구조 (예상)

```
app/
├── (tabs)/
│   ├── training/
│   │   ├── _layout.tsx           # 트레이닝 탭 레이아웃
│   │   └── index.tsx             # 트레이닝 메인 화면
│   └── _layout.tsx               # 탭 레이아웃 (트레이닝 탭 추가)
│
components/
├── training/
│   ├── goal-section.tsx          # 목표 섹션 컴포넌트
│   ├── goal-progress-bar.tsx     # 진행률 바
│   ├── goal-empty-state.tsx      # 목표 미설정 상태
│   ├── goal-setting-modal.tsx    # 목표 설정 모달
│   ├── achievement-section.tsx   # 업적 섹션 컴포넌트
│   ├── medal-card.tsx            # 개별 메달 카드
│   └── medal-grid.tsx            # 메달 그리드 레이아웃
│
hooks/
├── use-monthly-goal.ts           # 월별 목표 관리 훅
└── use-achievements.ts           # 업적 조회 훅
│
types/
└── training.ts                   # MonthlyGoal, Achievement 등 타입 정의
│
assets/
└── images/
    └── medals/
        ├── gold-5k.png
        ├── gold-10k.png
        ├── gold-half.png
        ├── gold-full.png
        ├── silver-5k.png
        ├── silver-10k.png
        ├── silver-half.png
        ├── silver-full.png
        ├── disabled-5k.png
        ├── disabled-10k.png
        ├── disabled-half.png
        └── disabled-full.png
```

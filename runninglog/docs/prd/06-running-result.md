# PRD: 러닝 결과 (Running Result)

> **문서 버전**: v1.0
> **최종 수정일**: 2026-02-13
> **상태**: Draft
> **관련 디자인**: `runninglog-mobile.pen` - Running Result (r3IUh)

---

## 1. 개요

### 1.1 목적

러닝 결과 화면은 달리기 완료 후 사용자에게 **종합적인 러닝 기록**을 시각적으로 제공하는 화면이다. 경로 지도, 핵심 통계 지표, 구간별 페이스 분석, 고도/케이던스/심박수 그래프 등 다양한 데이터를 하나의 긴 스크롤 페이지에 정리하여, 러너가 자신의 퍼포먼스를 상세하게 회고할 수 있도록 한다.

### 1.2 사용자 가치

| 가치 | 설명 |
|------|------|
| **시각적 경로 회고** | 지도 위에 러닝 경로, 출발/도착 마커, km 마커를 표시하여 "어디를 달렸는지" 직관적으로 확인 |
| **핵심 지표 한눈에** | 거리, 시간, 평균 페이스, 칼로리, 심박수, 케이던스, 걸음수를 2x3 그리드로 정리 |
| **구간별 분석** | 1km 단위 스플릿 페이스 테이블과 바 시각화로 구간별 퍼포먼스 편차를 파악 |
| **고급 그래프** | 페이스, 고도, 케이던스, 심박수 시계열 그래프로 러닝 중 신체 상태 변화를 분석 |
| **심박 존 분석** | Zone 1~5 분포를 통해 훈련 강도와 유산소/무산소 비중을 확인 |
| **공유 기능** | 공유 버튼으로 러닝 기록을 SNS나 메신저에 공유하여 동기부여 |

### 1.3 타겟 사용자

- 30대 남성 러너 (주 3~5회 달리기)
- 구간별 페이스, 심박수 존 등 데이터 기반 훈련에 관심 있는 러너
- 러닝 기록을 SNS에 공유하는 것을 즐기는 사용자

---

## 2. 사용자 흐름

### 2.1 진입 경로

```
[액티브 런 종료]
    |
    v
[러닝 요약 화면] ── 저장 완료
    |
    v
[러닝 결과 화면] (본 PRD)
    |
    ├── 스크롤 탐색: 지도 → 통계 → 페이스 그래프 → 스플릿 → 고도 → 케이던스 → 심박수
    ├── 공유 버튼 탭 → 시스템 공유 시트
    └── 뒤로가기 → 홈 화면 또는 캘린더 탭
```

```
[캘린더 탭 → 상세 기록 아이템 탭]
    |
    v
[러닝 결과 화면] (본 PRD)
```

### 2.2 주요 인터랙션

1. **지도 섹션**: 경로 확인, 핀치 줌/팬 가능, 공유 및 뒤로가기 버튼
2. **통계 그리드**: 6개 핵심 지표 확인
3. **페이스 라인 그래프**: 시간 축 기반 페이스 변화 추이 확인
4. **구간별 페이스 테이블**: km 단위 스플릿 데이터 확인
5. **고도/케이던스/심박수 그래프**: 세부 지표 시계열 분석
6. **심박 존 분포**: Zone별 비율 바 차트 확인

---

## 3. 화면별 상세 스펙

> **배경 테마**: 다크 모드 고정 (`$backgroundDark` #0D0D0D)
> 러닝 결과 화면은 **하나의 긴 세로 스크롤 페이지**로 구성된다.

### 3.1 지도 섹션 (Map Section)

| 속성 | 값 |
|------|------|
| 높이 | 420px |
| 배경 | `$mapDark` (#1F2937) |
| 클리핑 | clip: true |
| 레이아웃 | none (자유 배치) |

#### 3.1.1 지도 배경 이미지

| 속성 | 값 |
|------|------|
| 유형 | 정적 지도 이미지 (캡처 또는 API) |
| 크기 | 488x520px (오버사이즈로 여백 없이 커버) |
| 위치 | x: -47, y: -50 |

#### 3.1.2 러닝 경로

| 속성 | 값 |
|------|------|
| 유형 | path (SVG 경로) |
| 선 색상 | `$BrandOrange` (#FF6F00) |
| 선 두께 | 5px |
| 선 끝 | round (cap: round, join: round) |

#### 3.1.3 출발/도착 마커

##### 출발 마커

| 속성 | 값 |
|------|------|
| 마커 | 원형 14x14px, #FFFFFF 채움, `$BrandOrange` 테두리 3px |
| 뱃지 | "출발" — 배경: `$BrandOrange`, 텍스트: #FFFFFF, Inter, 11px, Bold (700), cornerRadius: 12, 패딩: 상하 4px 좌우 10px |

##### 도착 마커

| 속성 | 값 |
|------|------|
| 마커 | 원형 16x16px, `$BrandOrange` 채움, #FFFFFF 테두리 4px |
| 뱃지 | "도착" — 스타일 출발 뱃지와 동일 |

#### 3.1.4 km 마커

| 속성 | 값 |
|------|------|
| 텍스트 | "3km", "5km" 등 |
| 폰트 | Inter, 10px, SemiBold (600), #FFFFFFCC |
| 배경 | #FFFFFF20 |
| 모서리 | cornerRadius: 10 |
| 패딩 | 상하 3px, 좌우 8px |

#### 3.1.5 상단 그래디언트 오버레이

| 속성 | 값 |
|------|------|
| 높이 | 120px |
| 그래디언트 | linear, 180deg (위→아래): #0D0D0DFF → #0D0D0D00 |

#### 3.1.6 상태 바

| 속성 | 값 |
|------|------|
| 위치 | x: 20, y: 16 |
| 너비 | 350px |
| 좌측 | 시간 "9:41", Inter, 14px, SemiBold (600), #FFFFFF |
| 우측 | signal + wifi + battery-full 아이콘, 16x16px, #FFFFFF, gap: 6px |

#### 3.1.7 뒤로가기 버튼

| 속성 | 값 |
|------|------|
| 크기 | 36x36px |
| 모서리 | cornerRadius: 18 (원형) |
| 배경 | #00000060 |
| 아이콘 | lucide chevron-left, 20x20px, #FFFFFF |
| 위치 | x: 20, y: 50 |
| 탭 동작 | 이전 화면으로 돌아가기 |

#### 3.1.8 공유 버튼

| 속성 | 값 |
|------|------|
| 크기 | 36x36px |
| 모서리 | cornerRadius: 18 (원형) |
| 배경 | #00000060 |
| 아이콘 | lucide share-2, 18x18px, #FFFFFF |
| 위치 | x: 334, y: 50 |
| 탭 동작 | 시스템 공유 시트 표시 (이미지 + 텍스트 요약) |

---

### 3.2 거리 섹션 (Distance Section)

| 속성 | 값 |
|------|------|
| 패딩 | 상: 32px, 좌우: 24px, 하: 24px |
| 정렬 | 중앙 (alignItems: center) |
| 내부 간격 | 8px |

#### 3.2.1 거리 표시

| 속성 | 값 |
|------|------|
| 숫자 | "5.23" (소수점 2자리) |
| 폰트 | Inter, 72px, ExtraBold (800), #FFFFFF |
| lineHeight | 1 |
| 단위 | "km" |
| 단위 폰트 | Inter, 24px, Medium (500), `$textTertiary` (#9CA3AF) |
| 단위 lineHeight | 1.2 |
| 숫자-단위 간격 | gap: 6px |
| 정렬 | baseline (alignItems: end) |

#### 3.2.2 날짜/시간

| 속성 | 값 |
|------|------|
| 형식 | "YYYY년 M월 D일 요일 HH:MM - HH:MM" |
| 예시 | "2025년 1월 15일 수요일 06:30 - 06:58" |
| 폰트 | Inter, 13px, Regular, `$textTertiary` |

---

### 3.3 구분선 1

| 속성 | 값 |
|------|------|
| 색상 | `$surfaceDark` (#262626) |
| 높이 | 1px |

---

### 3.4 통계 그리드 (Stats Grid)

| 속성 | 값 |
|------|------|
| 패딩 | 상하 20px, 좌우 24px |
| 레이아웃 | 2행 3열 그리드 |

#### 3.4.1 통계 카드 공통 스타일

| 속성 | 값 |
|------|------|
| 정렬 | 중앙 (alignItems: center) |
| 내부 간격 | gap: 4px |
| 레이아웃 | vertical |
| 패딩 | 상하 16px |
| 너비 | fill_container (3등분) |

#### 3.4.2 통계 항목

| 위치 | 라벨 | 값 예시 | 단위 | 라벨 색상 | 값 색상 | 비고 |
|------|------|---------|------|-----------|---------|------|
| 1행 1열 | 시간 | 28:45 | - | `$textTertiary` | #FFFFFF | 22px Bold |
| 1행 2열 | 평균 페이스 | 5'30" | - | `$textTertiary` | #FFFFFF | 22px Bold |
| 1행 3열 | 칼로리 | 387 | kcal | `$textTertiary` | #FFFFFF | 22px Bold, 단위 별도 11px |
| 2행 1열 | 평균 심박수 | 156 | bpm | `$textTertiary` | #FFFFFF | 22px Bold, 하트 아이콘 18px `$heartRed`, 단위 별도 11px |
| 2행 2열 | 케이던스 | 174 | spm | `$textTertiary` | #FFFFFF | 22px Bold, 단위 별도 11px |
| 2행 3열 | 걸음 | 5,247 | steps | `$textTertiary` | #FFFFFF | 22px Bold, 단위 별도 11px |

##### 라벨 폰트

| 속성 | 값 |
|------|------|
| 폰트 | Inter, 12px, Regular |
| 색상 | `$textTertiary` (#9CA3AF) |

##### 값 폰트

| 속성 | 값 |
|------|------|
| 폰트 | Inter, 22px, Bold (700) |
| 색상 | #FFFFFF |

##### 단위 폰트

| 속성 | 값 |
|------|------|
| 폰트 | Inter, 11px, Regular |
| 색상 | `$textTertiary` (#9CA3AF) |

---

### 3.5 페이스 라인 그래프 섹션 (Pace Line Graph)

| 속성 | 값 |
|------|------|
| 배경 | `$backgroundDark` (#0D0D0D) |
| 패딩 | 상: 24px, 좌우: 24px, 하: 16px |
| 내부 간격 | 16px |

#### 3.5.1 섹션 헤더

| 속성 | 값 |
|------|------|
| 좌측 제목 | "페이스", Inter, 16px, Bold (700), #FFFFFF + chevron-down 아이콘 16px, #FFFFFF, gap: 6px |
| 우측 도움말 | "도움말", Inter, 14px, Medium (500), #4A9EFF |
| 구분선 | #333333, 1px |

#### 3.5.2 평균/최고 페이스 행

| 속성 | 값 |
|------|------|
| 레이아웃 | 2칸 균등 분할, 세로 구분선 (#333333, 높이 45px) |

##### 평균 페이스

| 속성 | 값 |
|------|------|
| 값 | "5:59", Inter, 32px, Bold (700), #FFFFFF |
| 단위 | "/km", Inter, 16px, Medium (500), #FFFFFF99 |
| 간격 | gap: 4px |
| 라벨 | "평균", Inter, 13px, Regular, #9CA3AF |

##### 최고 페이스

| 속성 | 값 |
|------|------|
| 값 | "4:47", Inter, 32px, Bold (700), #FFFFFF |
| 단위 | "/km", Inter, 16px, Medium (500), #FFFFFF99 |
| 라벨 | "최고", Inter, 13px, Regular, #9CA3AF |

#### 3.5.3 차트 영역

| 속성 | 값 |
|------|------|
| 높이 | 220px |
| Y축 라벨 | "5:00", "5:50", "6:40", "7:30", "8:20" — Inter, 11px, Regular, #666666 |
| 그리드 선 | #333333, 1px, 5개 수평선 |
| 영역 채움 | 선형 그래디언트 (위→아래): #4A9EFF80 → #4A9EFF20 |
| 라인 스트로크 | #4A9EFF, 1.5px, round cap/join |
| 평균 페이스 기준선 | #FFFFFF66, 1px, 점선 |

#### 3.5.4 X축

| 속성 | 값 |
|------|------|
| 형식 | 시:분:초 (예: "0:00", "20:23", "40:47", "1:01:10", "1:21:34", "1:41:57") |
| 폰트 | Inter, 10px, Regular, #666666 |
| 타임라인 도트 | 원형 8x8px, #666666 |
| 라벨 | "시간(시:분:초)", Inter, 12px, Regular, #666666, 중앙 정렬 |

---

### 3.6 구간별 페이스 섹션 (Split Pace Table)

| 속성 | 값 |
|------|------|
| 배경 | `$backgroundDark` (#0D0D0D) |
| 패딩 | 20px |
| 내부 간격 | 6px |

#### 3.6.1 섹션 헤더

| 속성 | 값 |
|------|------|
| 제목 | "구간별 페이스", Inter, 18px, Bold (700), #FFFFFF |
| 평균 표시 | "평균 5'30\"", Inter, 13px, Regular, #9CA3AF |

#### 3.6.2 테이블 헤더

| 컬럼 | 텍스트 | 너비 | 정렬 |
|------|--------|------|------|
| Km | "Km" | 32px (고정) | 좌측 |
| 페이스 | "페이스" | 48px (고정) | 좌측 |
| 바 | (시각화) | fill_container | - |
| 고도 | "고도" | 40px (고정) | 우측 |
| 심박수 | "심박수" | 32px (고정) | 우측 |

| 속성 | 값 |
|------|------|
| 폰트 | Inter, 12px, SemiBold (600), #9CA3AF |
| 패딩 | 상하 8px |
| 구분선 | #333333, 1px |

#### 3.6.3 데이터 행

| 속성 | 값 |
|------|------|
| 행 높이 | 32px |
| 폰트 | Inter, 13px, Medium (500), #FFFFFF |
| 너비 | 테이블 헤더와 동일한 컬럼 너비 |

##### 페이스 바

| 속성 | 값 |
|------|------|
| 높이 | 14px |
| 모서리 | cornerRadius: 2 |
| 색상 | #4A90D9 |
| 너비 | 페이스 값에 비례 (빠를수록 넓게) |

##### 예시 데이터

| Km | 페이스 | 바 너비 | 고도 | 심박수 |
|----|--------|---------|------|--------|
| 1 | 5'24" | 110px | 98 | 143 |
| 2 | 5'32" | 90px | -1 | 158 |
| 3 | 5'18" | 130px | -177 | 162 |
| 4 | 5'42" | 65px | 34 | 152 |
| 5 | 5'12" | 140px | 111 | 158 |

---

### 3.7 고도 그래프 섹션 (Elevation Graph)

| 속성 | 값 |
|------|------|
| 배경 | `$backgroundDark` (#0D0D0D) |
| 패딩 | 상: 24px, 좌우: 24px, 하: 16px |
| 내부 간격 | 16px |

#### 3.7.1 섹션 헤더

| 속성 | 값 |
|------|------|
| 제목 | "고도", Inter, 16px, Bold (700), #FFFFFF + chevron-down 16px #FFFFFF, gap: 6px |
| 구분선 | #333333, 1px |

#### 3.7.2 최소/최대 고도 행

| 속성 | 값 |
|------|------|
| 레이아웃 | 2칸 균등 분할, 세로 구분선 (#333333, 높이 45px) |

| 항목 | 값 | 단위 | 라벨 |
|------|------|------|------|
| 최소 | "19", Inter, 28px, Bold (700), #FFFFFF | "m", 16px, #9CA3AF | "최소", 13px, #9CA3AF |
| 최대 | "144", Inter, 28px, Bold (700), #FFFFFF | "m", 16px, #9CA3AF | "최대", 13px, #9CA3AF |

#### 3.7.3 차트 영역

| 속성 | 값 |
|------|------|
| 높이 | 220px |
| Y축 라벨 | "150", "100", "50" — Inter, 11px, Regular, #666666 |
| 그리드 선 | #333333, 1px, 4개 수평선 |
| 영역 채움 | 선형 그래디언트 (위→아래): #4CAF5090 → #4CAF5010 (녹색) |
| 라인 스트로크 | #4CAF50, 1.5px, round cap/join |

#### 3.7.4 X축

| 속성 | 값 |
|------|------|
| 형식 | 시:분:초 |
| 폰트 | Inter, 10px, Regular, #666666 |
| 라벨 | "시간(시:분:초)", 12px, #666666, 중앙 |

---

### 3.8 케이던스 그래프 섹션 (Cadence Graph)

| 속성 | 값 |
|------|------|
| 배경 | `$backgroundDark` (상위 컨테이너 상속) |
| 패딩 | 24px |
| 내부 간격 | 16px |

#### 3.8.1 섹션 헤더

| 속성 | 값 |
|------|------|
| 제목 | "케이던스", Inter, 16px, Bold (700), #FFFFFF |
| 평균 표시 | "평균 174 spm", Inter, 12px, Regular, `$textTertiary` |

#### 3.8.2 차트 영역

| 속성 | 값 |
|------|------|
| 높이 | 120px |
| Y축 라벨 | "200", "170", "140" — Inter, 9px, Regular, `$textTertiary` |
| 라인 스트로크 | `$BrandOrange` (#FF6F00), 2.5px, round cap/join |
| 영역 채움 | 선형 그래디언트 (위→아래): #FF6F0030 → #FF6F0005 (오렌지) |

#### 3.8.3 X축

| 속성 | 값 |
|------|------|
| 라벨 | "0km", "1km", "2km", "3km", "4km", "5km" |
| 폰트 | Inter, 10px, Regular, `$textTertiary` |
| 정렬 | space_between |

---

### 3.9 심박수 그래프 섹션 (Heart Rate Graph)

| 속성 | 값 |
|------|------|
| 배경 | `$backgroundDark` (상위 컨테이너 상속) |
| 패딩 | 24px |
| 내부 간격 | 16px |

#### 3.9.1 섹션 헤더

| 속성 | 값 |
|------|------|
| 제목 | "심박수", Inter, 16px, Bold (700), #FFFFFF |
| 평균 표시 | 하트 아이콘 (lucide heart, 14px, `$heartRed`) + "평균 156 bpm", Inter, 12px, Regular, `$textTertiary`, gap: 4px |

#### 3.9.2 차트 영역

| 속성 | 값 |
|------|------|
| 높이 | 120px |
| Y축 라벨 | "180", "155", "130", "105" — Inter, 9px, Regular, `$textTertiary` |
| 라인 스트로크 | `$heartRed` (#EF4444), 2.5px, round cap/join |
| 영역 채움 | 선형 그래디언트 (위→아래): #EF444430 → #EF444405 (빨간색) |

#### 3.9.3 X축

| 속성 | 값 |
|------|------|
| 라벨 | "0km", "1km", "2km", "3km", "4km", "5km" |
| 폰트 | Inter, 10px, Regular, `$textTertiary` |

#### 3.9.4 심박 존 (Heart Rate Zones) 섹션

| 속성 | 값 |
|------|------|
| 제목 | "심박 존", Inter, 14px, SemiBold (600), #FFFFFF |
| 패딩 | 상: 16px |
| 내부 간격 | 8px |

##### 존별 바 차트

| Zone | 라벨 색상 | 바 색상 | 비율 예시 | 설명 |
|------|-----------|---------|-----------|------|
| Zone 5 | `$heartRed` (#EF4444) | `$heartRed` | 8% | 최대 강도 |
| Zone 4 | #F97316 | #F97316 | 35% | 높은 강도 |
| Zone 3 | #EAB308 | #EAB308 | 28% | 중간 강도 유산소 |
| Zone 2 | #8bc34a | #8bc34a | 20% | 가벼운 유산소 |
| Zone 1 | #60A5FA | #60A5FA | 9% | 매우 가벼운 운동 |

##### 존 바 공통 스타일

| 속성 | 값 |
|------|------|
| 라벨 너비 | 48px (고정), Inter, 11px, SemiBold (600) |
| 바 높이 | 16px |
| 바 모서리 | cornerRadius: 4 |
| 바 배경 | #FFFFFF10 |
| 바 채움 | 각 Zone 색상, 비율에 비례하는 너비 |
| 퍼센티지 | 30px (고정), Inter, 11px, Medium (500), `$textTertiary` |
| 행 간격 | gap: 10px |

---

### 3.10 섹션 간 구분선

모든 주요 섹션 사이에 동일한 구분선이 삽입된다.

| 속성 | 값 |
|------|------|
| 색상 | `$surfaceDark` (#262626) |
| 높이 | 8px (주요 구분), 1px (경량 구분) |

---

### 3.11 하단 여백

| 속성 | 값 |
|------|------|
| 높이 | 40px |
| 용도 | 스크롤 끝 여백, 홈 인디케이터 대응 |

---

## 4. 데이터 모델

### 4.1 러닝 결과 (RunningResult)

```typescript
interface RunningResult {
  id: string;                        // 활동 UUID
  userId: string;

  // 거리/시간
  distanceKm: number;                // 총 거리 (km, 소수점 2자리)
  durationDisplay: string;           // "28:45" (MM:SS 또는 H:MM:SS)
  startedAt: string;                 // ISO 8601
  endedAt: string;                   // ISO 8601
  dateDisplay: string;               // "2025년 1월 15일 수요일 06:30 - 06:58"

  // 핵심 통계
  avgPaceDisplay: string;            // "5'30\""
  avgPaceSecondsPerKm: number;       // 330
  bestPaceDisplay: string;           // "4'47\""
  bestPaceSecondsPerKm: number;      // 287
  calories: number;                  // 387 kcal
  avgHeartRate: number;              // 156 bpm
  cadenceAvg: number;                // 174 spm
  totalSteps: number;                // 5247

  // 경로
  routeCoordinates: Coordinate[];    // GPS 좌표 배열
  startCoordinate: Coordinate;       // 출발점
  endCoordinate: Coordinate;         // 도착점
  mapImageUrl?: string;              // 정적 지도 이미지 URL

  // 스플릿 데이터
  splits: SplitPaceData[];

  // 시계열 데이터
  paceTimeSeries: TimeSeriesPoint[];     // 페이스 (시간 축)
  elevationTimeSeries: TimeSeriesPoint[]; // 고도 (시간 축)
  cadenceDistSeries: DistSeriesPoint[];  // 케이던스 (거리 축)
  heartRateDistSeries: DistSeriesPoint[]; // 심박수 (거리 축)

  // 고도
  elevationMin: number;              // 최소 고도 (m)
  elevationMax: number;              // 최대 고도 (m)

  // 심박 존
  heartRateZones: HeartRateZoneDistribution;
}
```

### 4.2 스플릿 페이스 데이터 (SplitPaceData)

```typescript
interface SplitPaceData {
  km: number;                    // 구간 번호 (1, 2, 3...)
  paceDisplay: string;           // "5'24\""
  paceSecondsPerKm: number;      // 324
  elevation: number;             // 고도 변화 (m, +/-)
  heartRate: number;             // 구간 평균 심박수
  barWidthRatio: number;         // 0~1, 최고 페이스 대비 비율
}
```

### 4.3 시계열 데이터

```typescript
interface TimeSeriesPoint {
  timestamp: number;             // Unix ms (시간 축)
  value: number;                 // 페이스(초/km), 고도(m) 등
}

interface DistSeriesPoint {
  distanceKm: number;            // 거리 축 (km)
  value: number;                 // 케이던스(spm), 심박수(bpm) 등
}
```

### 4.4 심박 존 분포 (HeartRateZoneDistribution)

```typescript
interface HeartRateZoneDistribution {
  zone1Percent: number;          // Zone 1 비율 (0~100)
  zone2Percent: number;
  zone3Percent: number;
  zone4Percent: number;
  zone5Percent: number;
}
```

---

## 5. API 요구사항

### 5.1 러닝 결과 상세 조회

```
GET /api/v1/activities/{activityId}/detail/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `RunningResult` 객체 (경로, 스플릿, 시계열, 존 분포 포함) |
| 응답 404 | 해당 활동 없음 |
| 캐싱 | 활동 데이터는 변경되지 않으므로 장기 캐싱 가능 |

### 5.2 정적 지도 이미지 조회

```
GET /api/v1/activities/{activityId}/map-image/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | 이미지 URL 또는 바이너리 |
| 용도 | 지도 섹션 배경 이미지 (경로가 오버레이된 정적 지도) |
| 비고 | 클라이언트에서 MapView 스냅샷 대안 가능 |

### 5.3 공유 이미지 생성

```
POST /api/v1/activities/{activityId}/share-image/
Authorization: Bearer {access_token}
```

| 항목 | 스펙 |
|------|------|
| 응답 200 | `{ imageUrl: string, shareText: string }` |
| 용도 | SNS 공유용 이미지 + 텍스트 생성 |
| 비고 | 클라이언트 뷰 캡처 방식도 대안 가능 |

---

## 6. 상태 관리

### 6.1 러닝 결과 화면 상태

```typescript
interface RunningResultState {
  // 데이터
  result: RunningResult | null;
  loading: boolean;
  error: string | null;

  // 지도
  mapReady: boolean;
  mapImageLoaded: boolean;

  // 공유
  isSharing: boolean;
  shareError: string | null;

  // 스크롤
  scrollPosition: number;
}
```

### 6.2 상태 전이 규칙

| 액션 | 상태 변경 |
|------|-----------|
| 화면 진입 (러닝 종료 후) | 로컬에 저장된 RunSession 데이터를 RunningResult로 변환하여 즉시 표시. 동시에 서버 저장 및 상세 데이터 조회 |
| 화면 진입 (캘린더에서) | `activityId`로 서버 API 조회, 로딩 스켈레톤 표시 |
| 공유 버튼 탭 | `isSharing = true` → 공유 이미지 생성 → 시스템 공유 시트 → `isSharing = false` |
| 뒤로가기 | 이전 화면으로 네비게이션 pop |

### 6.3 캐싱 전략

| 항목 | 저장소 | TTL |
|------|--------|-----|
| 러닝 결과 데이터 | MMKV | 영구 (활동 데이터 불변) |
| 지도 이미지 | 파일 캐시 | 영구 |
| 시계열 데이터 | MMKV | 영구 |

---

## 7. 엣지 케이스

### 7.1 데이터 부족

| 케이스 | 처리 |
|--------|------|
| **심박수 데이터 없음** (워치 미연동) | 통계 그리드에서 심박수 값 "-" 표시, 심박수 그래프 섹션 및 심박 존 숨김 |
| **케이던스 데이터 없음** | 통계 그리드에서 케이던스 값 "-" 표시, 케이던스 그래프 섹션 숨김 |
| **걸음수 데이터 없음** | 통계 그리드에서 걸음수 값 "-" 표시 |
| **고도 데이터 없음** (GPS 고도 미지원) | 스플릿 테이블에서 고도 컬럼 "-" 표시, 고도 그래프 섹션 숨김 |
| **매우 짧은 러닝 (1km 미만)** | 스플릿 테이블 없음 ("구간 데이터가 부족합니다" 메시지), 그래프는 가능한 범위까지 표시 |

### 7.2 GPS/지도

| 케이스 | 처리 |
|--------|------|
| **GPS 경로 데이터 없음** | 지도 섹션에 "경로 데이터가 없습니다" 메시지, 통계 데이터는 정상 표시 |
| **지도 이미지 로딩 실패** | 단색 배경 (`$mapDark`) + 경로 폴리라인만 표시 |
| **극단적으로 긴 경로** | 지도 줌 레벨 자동 조정 (전체 경로가 보이도록 fitToCoordinates) |

### 7.3 그래프 관련

| 케이스 | 처리 |
|--------|------|
| **시계열 데이터 포인트가 너무 적음** | 최소 5개 포인트 이상일 때 그래프 표시, 미달 시 "데이터가 부족합니다" |
| **극단적인 값 스파이크** | 이상치 필터링 (3-sigma 기준) 적용 후 그래프 렌더링 |
| **Y축 스케일** | 데이터 범위에 따라 자동 스케일 조정, 최소/최대 여백 10% |

### 7.4 공유 기능

| 케이스 | 처리 |
|--------|------|
| **공유 이미지 생성 실패** | "공유 이미지를 만들 수 없습니다" 토스트, 텍스트만 공유 대안 제공 |
| **시스템 공유 시트 취소** | 정상 처리, 별도 액션 없음 |

### 7.5 네트워크/성능

| 케이스 | 처리 |
|--------|------|
| **러닝 종료 직후 오프라인** | 로컬에 저장된 세션 데이터로 결과 화면 즉시 렌더링, 서버 동기화는 나중에 |
| **캘린더에서 진입 시 오프라인** | 캐시된 데이터가 있으면 표시, 없으면 에러 화면 |
| **대용량 시계열 데이터** | 그래프 렌더링 시 데이터 포인트 다운샘플링 (최대 300포인트) |
| **스크롤 성능** | 긴 스크롤 페이지이므로 그래프 섹션은 LazyLoad 적용 (뷰포트 진입 시 렌더링) |

### 7.6 UI/UX

| 케이스 | 처리 |
|--------|------|
| **화면 회전** | 세로 모드 고정 |
| **접근성** | 통계 값에 accessibilityLabel 적용 (예: "평균 페이스 5분 30초") |
| **다이나믹 타입** | 주요 수치 텍스트는 시스템 폰트 크기에 비례하되, 그래프 라벨은 고정 크기 유지 |

---

## 부록: 디자인 토큰 요약

| 토큰 | 값 | 용도 |
|------|------|------|
| `$backgroundDark` | #0D0D0D | 화면 전체 배경 |
| `$surfaceDark` | #262626 | 섹션 구분선 |
| `$mapDark` | #1F2937 | 지도 섹션 배경 |
| `$BrandOrange` | #FF6F00 | 러닝 경로, 출발/도착 뱃지, 케이던스 그래프 라인 |
| `$heartRed` | #EF4444 | 심박수 아이콘, 심박수 그래프 라인, Zone 5 |
| `$textTertiary` | #9CA3AF | 단위, 라벨, 보조 텍스트 |
| `#4A9EFF` | 직접값 | 페이스 그래프 라인/영역, 도움말 텍스트 |
| `#4A90D9` | 직접값 | 스플릿 페이스 바 |
| `#4CAF50` | 직접값 | 고도 그래프 라인/영역 |
| `#F97316` | 직접값 | Heart Rate Zone 4 |
| `#EAB308` | 직접값 | Heart Rate Zone 3 |
| `#8bc34a` | 직접값 | Heart Rate Zone 2 |
| `#60A5FA` | 직접값 | Heart Rate Zone 1 |
| `#333333` | 직접값 | 그리드 선, 구분선 |
| `#666666` | 직접값 | 차트 축 라벨 |
| `#FFFFFF` | 직접값 | 주요 수치 텍스트 |
| `#FFFFFF99` | 직접값 | 단위 텍스트 반투명 |
| `#00000060` | 직접값 | 지도 위 버튼 배경 |

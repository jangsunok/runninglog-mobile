# 러닝 트래킹 프론트엔드 아키텍처

> GPS 기반 달리기 기록 기능 전용 설계. 외부 연동(애플건강 등) 제외, 앱 자체 GPS 기록에 집중.

---

## 1. 핵심 아키텍처 다이어그램 (텍스트)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              [UI Layer]                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │ RunScreen (active)   │  │ MapView              │  │ Dashboard           │ │
│  │ - 시작/일시정지/종료  │  │ - 폴리라인 경로      │  │ - 거리/시간/페이스  │ │
│  │ - 라우팅 진입점      │  │ - 현재 위치 마커     │  │ - 실시간 수치 구독  │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬──────────┘ │
│             │                         │                         │            │
│             └─────────────────────────┼─────────────────────────┘            │
│                                       │ subscribe (Zustand)                  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         [State Layer - Zustand]                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ runStore                                                               │  │
│  │ - status: 'idle' | 'running' | 'paused' | 'finished'                   │  │
│  │ - currentSession: { id, startedAt, coordinates[], distance, duration } │  │
│  │ - liveMetrics: { distance, duration, paceMinPerKm }                    │  │
│  │ - actions: startRun, pauseRun, resumeRun, finishRun, addLocations       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│             ┌─────────────────────────┼─────────────────────────┐           │
│             │ persist                 │                         │ hydrate   │
│             ▼                         ▼                         ▼           │
│  ┌──────────────────┐    ┌────────────────────┐    ┌────────────────────┐   │
│  │ MMKV / Redux-     │    │ LocationService    │    │ RunHistory (목록)   │   │
│  │ persist           │    │ - start/stop       │    │ - 완료된 세션 목록  │   │
│  │ - session 백업    │    │ - task 등록/해제   │    │ - 서버 동기화 후보  │   │
│  └──────────────────┘    └─────────┬──────────┘    └────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼───────────────────────────────────────┐
│                    [Native / Service Layer]                                 │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐ │
│  │ expo-task-manager (defineTask)                                         │ │
│  │ - TASK_NAME: 'RUNNING_LOG_LOCATION'                                    │ │
│  │ - 콜백: data.locations → runStore.addLocations() + persist 체크        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ expo-location                                                          │ │
│  │ - startLocationUpdatesAsync(TASK_NAME, { accuracy, distanceInterval,  │ │
│  │     timeInterval })                                                    │ │
│  │ - stopLocationUpdatesAsync(TASK_NAME)                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름 요약

| 상태       | 흐름 |
|-----------|------|
| **Running** | 사용자 "시작" → `startRun()` → 위치 권한 확인 → `Location.startLocationUpdatesAsync` → Task 콜백에서 좌표 수신 → `addLocations()` → 거리/페이스 재계산 → 1분 또는 500m 도달 시 로컬 임시 저장 |
| **Paused**  | "일시정지" → `pauseRun()` → `Location.stopLocationUpdatesAsync` → UI만 duration 타이머 유지, 좌표 수집 중단 |
| **Resume**  | "재개" → `resumeRun()` → `startLocationUpdatesAsync` 다시 호출 → 좌표 수집 재개 |
| **Finished**| "종료" → `finishRun()` → 위치 업데이트 중지 → 현재 세션을 완료 목록에 저장 → MMKV/DB에 영구 저장 → status → 'idle' |

---

## 2. UI 컴포넌트 구조 제안

```
app/(tabs)/run/
├── index.tsx          # 기록 목록 (과거 러닝 목록)
├── active.tsx         # 러닝 중 전용 화면 (전체 화면, 절전 고려)
└── [id].tsx           # 기록 상세 (지도 + 통계)

components/run/
├── RunMapView.tsx     # react-native-maps MapView, 폴리라인 + 현재 위치
├── RunDashboard.tsx   # 거리, 경과 시간, 현재 페이스(min/km) 카드
├── RunControls.tsx    # 시작 / 일시정지 / 재개 / 종료 버튼
└── RunPersistenceBanner.tsx  # (선택) "마지막 세션 복구 가능" 안내
```

- **MapView**: `coordinates[]`를 `Polyline`으로 표시, 마지막 좌표에 마커. 지도 영역은 경로 bounding box + padding.
- **Dashboard**: `runStore.liveMetrics` 구독, `formatDistance`, `formatDuration`, `formatPace`로 표시.

---

## 3. 데이터 유실 방지 (1분 또는 500m 임시 저장)

- **트리거**: `addLocations()` 내부에서
  - 마지막 저장 시각으로부터 **1분 경과** 또는
  - 마지막 저장 위치로부터 **누적 500m 이상** 이동 시
- **저장 위치**: MMKV 키 `running_session_draft` 또는 Redux-persist의 `run` slice 중 `currentSession` 백업.
- **저장 내용**: `{ sessionId, startedAt, coordinates, totalDistanceMeters, totalDurationMs, status }` (직렬화 가능한 형태).
- **앱 재시작 시**: 스토어 hydrate 후 `currentSession`이 있고 `status === 'running' | 'paused'`이면 "이어서 하기" 옵션 제공.

---

## 4. 기술 스택 매핑

| 요구사항           | 구현 |
|--------------------|------|
| 실시간 트래킹      | expo-location + expo-task-manager 백그라운드 태스크 |
| **거리 계산**      | **`lib/utils/geo.ts`: Haversine 공식 사용. 단순 직선거리가 아닌 지구 곡률을 반영한 구면 거리(m)** |
| 페이스 계산        | `paceMinPerKm = durationMs/60000 / (distanceKm)` (Haversine으로 구한 거리 기반) |
| 상태 (Running 등)  | Zustand `runStore` |
| 1분/500m 임시 저장 | Zustand 미들웨어 또는 `addLocations` 내부에서 MMKV 직접 쓰기 |
| 로컬 캐싱          | MMKV 또는 Redux-persist (Zustand persist 미들웨어) |
| 지도               | react-native-maps (Expo config plugin) |

---

## 5. 의존성 추가

```bash
npx expo install expo-location expo-task-manager react-native-maps
npm install zustand
# MMKV 사용 시 (선택)
npm install react-native-mmkv
```

- `app.json`에 `react-native-maps`용 config plugin 추가 필요 (Expo 문서 참고).
- iOS: `Info.plist` 위치 사용 설명 및 `UIBackgroundModes: location`.
- Android: 아래 "Android Foreground Service 및 상단 알림", "Permissions Flow" 참고.

---

## 5-1. Android Foreground Service 및 상단 알림

**요구사항**: 앱이 백그라운드로 가도 Android 상단 알림창에 "기록 중"임을 표시.

- **구현**: `expo-location` config plugin으로 **Android Foreground Service** 활성화.
  - `isAndroidForegroundServiceEnabled: true` → `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION` 권한 및 포그라운드 서비스 사용.
  - `isAndroidBackgroundLocationEnabled: true` → 백그라운드 위치 추적 허용.
- **동작**: `Location.startLocationUpdatesAsync()` 호출 시 Android가 포그라운드 서비스를 시작하고, **상단 알림에 위치 추적 중임을 표시** (OS 기본 또는 expo-location 제공 알림). 사용자가 앱을 내려도 "기록 중" 상태가 알림으로 유지됨.
- **설정 위치**: `app.json` → `plugins`에 `expo-location` 플러그인 추가 (아래 의존성/설정 섹션 및 실제 `app.json` 반영).

---

## 5-2. 거리 계산: Haversine 공식

**요구사항**: 좌표(위도, 경도) 사이 거리를 **단순 직선거리가 아닌 지구 곡률을 반영한 공식**으로 계산.

- **구현**: `lib/utils/geo.ts`에서 **Haversine formula** 사용.
  - 두 점의 위·경도를 라디안으로 변환 후, 구면 삼각법으로 대권 거리(great-circle distance) 계산.
  - 지구 반지름 6,371km 기준, 반환 단위 m.
- **함수**: `distanceMeters(a, b)`, `totalDistanceMeters(coordinates[])` — 모두 Haversine 기반.

---

## 5-3. Permissions Flow (위치 권한 순차 요청)

**요구사항**: 위치 권한(Foreground & Background)을 **순차적으로** 요청.

- **구현**: `services/location/LocationService.ts`의 `requestLocationPermissions()`.
  1. **1단계**: `Location.requestForegroundPermissionsAsync()` 호출 → "앱 사용 중" 위치 권한 요청.
  2. **2단계**: Foreground가 `granted`일 때만 `Location.requestBackgroundPermissionsAsync()` 호출 → "항상" 또는 "백그라운드에서도" 위치 권한 요청.
- **순서**: Foreground 먼저, 허용된 경우에만 Background 요청 (정책 및 UX 권장 사항 준수).
- **사용 시점**: 러닝 "시작" 버튼 직전 또는 active 화면 마운트 시 한 번 호출 후, `startLocationUpdates()` 실행.

---

## 6. expo-task-manager 백그라운드 위치 추적 서비스 코드 구조

### 6.1 태스크 정의 (`services/location/backgroundLocationTask.ts`)

- **역할**: `TaskManager.defineTask(LOCATION_TASK_NAME, callback)`로 백그라운드에서 들어오는 위치 배열을 받아 스토어에 반영.
- **등록 시점**: 앱 진입 시 한 번만 등록되어야 하므로 `app/_layout.tsx`에서 `import '@/services/location/backgroundLocationTask'`로 사이드 이펙트만 실행.
- **콜백**: `data.locations` (expo-location의 `LocationObject[]`) → `Coordinate[]`로 변환 후 `runStore.getState().addLocations(coordinates)` 호출.

### 6.2 위치 서비스 (`services/location/LocationService.ts`)

- **requestLocationPermissions()**: **Foreground 권한 먼저** 요청 → 허용 시 **Background 권한 순차** 요청 (Permissions Flow). 러닝 시작 전 호출.
- **startLocationUpdates(options?)**: 위 권한 요청 후 `Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options)` 호출. Android에서는 포그라운드 서비스로 상단 알림 표시.
- **stopLocationUpdates()**: `Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)`.
- **옵션**: `accuracy`, `distanceInterval`(m), `timeInterval`(ms), `showsBackgroundLocationIndicator` 등. 러닝용 권장: `BestForNavigation`, `distanceInterval: 10`, `timeInterval: 5000`.

### 6.3 데이터 흐름

```
[expo-location 네이티브] → 위치 갱신
    → [expo-task-manager] 태스크 콜백 실행
    → backgroundLocationTask: data.locations → runStore.addLocations()
    → runStore: coordinates 누적, 거리/페이스 재계산, (1분/500m 시) persistDraft()
```

---

## 7. 운동 데이터 Zustand Store 구조 예시

### 7.1 상태 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `status` | `'idle' \| 'running' \| 'paused' \| 'finished'` | 현재 러닝 상태 |
| `currentSession` | `RunSession \| null` | 진행 중인 세션 (id, startedAt, coordinates[], totalDistanceMeters, totalDurationMs, status, pausedDurationMs) |
| `liveMetrics` | `LiveMetrics` | UI용 실시간 수치 (distanceMeters, durationMs, paceMinPerKm) |
| `history` | `RunRecord[]` | 완료된 러닝 목록 (서버 동기화 후보) |
| `_lastPersistAt` / `_distanceAtLastPersist` | number | 1분/500m 드래프트 저장 시점·거리 |

### 7.2 액션

| 액션 | 동작 |
|------|------|
| `startRun()` | 새 `RunSession` 생성, status → 'running', persist 시점 초기화 |
| `pauseRun()` | status → 'paused', updatedAt 갱신 (duration은 UI에서 타이머로 유지) |
| `resumeRun()` | status → 'running', pausedDurationMs 누적 |
| `finishRun()` | 위치 업데이트 중지 후 `RunRecord` 생성, history에 추가, currentSession null, persist 클리어 |
| `addLocations(coordinates)` | coordinates 병합, totalDistanceMeters/totalDurationMs/pace 재계산, liveMetrics 갱신, 1분 또는 500m 시 persistDraft 호출 |
| `reset()` | currentSession·liveMetrics 초기화, 드래프트 삭제 |
| `restoreDraftIfNeeded()` | 로컬 드래프트 로드 후 status가 running/paused면 currentSession·liveMetrics 복구, "이어서 하기"용 |

### 7.3 파일 위치

- 스토어: `stores/runStore.ts`
- 타입: `types/run.ts`
- 거리/페이스 유틸: `lib/utils/geo.ts`
- 드래프트 저장: `services/run/persistDraft.ts` (MMKV/AsyncStorage 연동 시 이 파일만 교체)

---

이어서 **실제 구현**은 `stores/runStore.ts`, `services/location/backgroundLocationTask.ts`, `services/location/LocationService.ts`, `services/run/persistDraft.ts`에 코드로 반영되어 있습니다.

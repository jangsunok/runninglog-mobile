# 러닝로그 API 스펙

> Base URL: `/api/v1/`
> Auth: `Authorization: Bearer <access_token>` (JWT)

---

## 인증 API

### POST `/mobile/auth/register/`
회원가입 후 JWT 토큰 발급

**Request:**
```json
{ "email": "user@example.com", "nickname": "러너", "password": "..." }
```

**Response (201):**
```json
{
  "user": { "id": 1, "email": "...", "nickname": "...", "theme_preference": "system", ... },
  "access_token": "...",
  "refresh_token": "..."
}
```

### POST `/mobile/auth/login/`
이메일 로그인

**Request:**
```json
{ "email": "user@example.com", "password": "..." }
```

### POST `/mobile/auth/kakao/`
카카오 SDK 토큰으로 로그인

**Request:**
```json
{ "kakao_access_token": "..." }
```

### POST `/mobile/auth/token/refresh/`
Access Token 갱신

**Request:**
```json
{ "refresh_token": "..." }
```

### GET `/mobile/auth/me/`
현재 사용자 정보 조회

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "러너",
  "profile_image_url": "https://...",
  "following_count": 5,
  "followers_count": 10,
  "theme_preference": "system"
}
```

### PATCH `/mobile/auth/me/`
사용자 정보 수정

**Request:**
```json
{ "nickname": "새닉네임", "theme_preference": "dark" }
```

### POST `/mobile/auth/logout/`
로그아웃

**Request:**
```json
{ "refresh_token": "..." }
```

### POST `/mobile/auth/withdraw/`
계정 탈퇴 (90일 유예)

**Response (200):**
```json
{
  "success": true,
  "message": "계정이 비활성화되었습니다. 90일 이내 재로그인 시 복구됩니다.",
  "deactivated_at": "2025-01-15T10:00:00Z"
}
```

---

## 러닝 활동 API

### GET `/activities/`
활동 목록 (페이지네이션)

**Query:** `page`, `page_size`

### POST `/activities/`
활동 생성

### GET `/activities/{id}/`
활동 상세

### PUT `/activities/{id}/`
활동 수정

### DELETE `/activities/{id}/`
활동 삭제

---

## 통계 API

### GET `/statistics/summary/`
전체 통계 요약

### GET `/statistics/daily/?from=2025-01-01&to=2025-01-31`
일별 통계

### GET `/statistics/weekly/?year=2025`
주별 통계

### GET `/statistics/monthly/?year=2025`
월별 통계

### GET `/statistics/yearly/`
연별 통계 (최근 5년)

---

## 목표 API

### GET `/goals/current/`
이번 달 목표 조회

**Response (200):**
```json
{
  "id": 1,
  "year": 2025,
  "month": 1,
  "goal_type": "DISTANCE",
  "target_value": 100.0,
  "current_value": 45.2,
  "progress_percent": 45.2,
  "is_achieved": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### POST `/goals/`
목표 생성 (이미 존재하면 업데이트)

**Request:**
```json
{ "goal_type": "DISTANCE", "target_value": 100.0 }
```

**goal_type:** `DISTANCE` (km), `TIME` (분), `COUNT` (횟수)

### PATCH `/goals/{id}/`
목표 수정

### DELETE `/goals/{id}/`
목표 삭제

---

## 업적/메달 API

### GET `/achievements/current/`
이번 달 업적

**Response (200):**
```json
{
  "year": 2025,
  "month": 1,
  "achievements": [
    {
      "id": 1,
      "distance_type": "5K",
      "distance_type_display": "5K",
      "best_time": "00:23:45",
      "best_time_display": "23'45\"",
      "medal_type": "GOLD",
      "is_personal_record": true,
      "activity": 123,
      "created_at": "2025-01-10T06:30:00Z"
    }
  ]
}
```

### GET `/achievements/?year=2025&month=1`
특정 월 업적 조회

### GET `/achievements/history/`
월별 업적 요약

**Response (200):**
```json
{
  "history": [
    { "year": 2025, "month": 1, "gold_count": 2, "silver_count": 1, "total_records": 3 }
  ]
}
```

---

## 월간 분석 API

### GET `/analysis/monthly/?year=2025&month=1`
월간 분석 데이터

**Response (200):**
```json
{
  "year": 2025,
  "month": 1,
  "total_distance": 105.3,
  "distance_change_rate": 12.5,
  "total_run_count": 15,
  "total_duration_seconds": 45000,
  "total_duration_display": "12h 30m",
  "total_calories": 8500,
  "avg_pace": "5'30\"",
  "min_pace": "4'45\"",
  "max_pace": "6'30\"",
  "avg_heart_rate": 155,
  "heart_rate_zones": { "zone1": 10, "zone2": 20, "zone3": 35, "zone4": 25, "zone5": 10 },
  "total_elevation_gain": 450.0,
  "avg_cadence": 172,
  "recent_months_data": [
    { "year": 2024, "month": 8, "distance": 80.2 }
  ]
}
```

### GET `/analysis/ai/?year=2025&month=1`
AI 코칭 코멘트

**Response (200):**
```json
{
  "year": 2025,
  "month": 1,
  "ai_distance_comment": "지난달 대비 12.5% 증가했습니다.",
  "ai_pace_comment": "평균 페이스가 안정적입니다.",
  "ai_heart_rate_comment": "심박수 Zone 3-4 비율이 높아 효율적입니다.",
  "ai_overall_comment": "전반적으로 좋은 컨디션입니다.",
  "ai_generated_at": "2025-02-01T00:00:00Z"
}
```

**Response (202):** AI 분석 생성 중

### GET `/analysis/available-months/`
분석 가능한 월 목록

---

## 알림 API

### GET `/notifications/?page=1&page_size=20`
알림 목록

**Response (200):**
```json
{
  "total_count": 15,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 1,
      "notification_type": "ACHIEVEMENT",
      "title": "5K 개인 기록 달성!",
      "body": "23분 45초로 새로운 5K 기록을 세웠습니다.",
      "emoji": "🏅",
      "is_read": false,
      "created_at": "2025-01-15T06:30:00Z",
      "time_display": "오늘 06:30",
      "action_url": "/run/123",
      "related_id": 123
    }
  ],
  "unread_count": 3
}
```

### GET `/notifications/unread-count/`
읽지 않은 알림 수

**Response:** `{ "count": 3 }`

### PATCH `/notifications/{id}/read/`
단일 알림 읽음

### POST `/notifications/read-all/`
전체 읽음

**Response:** `{ "success": true, "updated_count": 5 }`

---

## 알림 설정 API

### GET `/settings/notifications/`
현재 알림 설정

**Response (200):**
```json
{
  "push_enabled": true,
  "marketing_enabled": false,
  "night_push_enabled": false,
  "gps_consent": true
}
```

### PATCH `/settings/notifications/`
알림 설정 변경

**Request (partial):**
```json
{ "marketing_enabled": true }
```

---

## 동기화 API

### POST `/sync/samsung-health/`
삼성헬스 동기화

### POST `/sync/apple-health/`
애플건강 동기화

### GET `/sync/logs/`
동기화 로그 (최근 50건)

---

## 개인 기록 API

### GET `/personal-records/`
개인 기록 목록 (읽기 전용)

---

## 에러 응답 형식

모든 에러는 다음 형식으로 반환:
```json
{ "error": "에러 메시지" }
```

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 202 | 처리 중 (AI 분석 등) |
| 204 | 삭제 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 404 | 리소스 없음 |

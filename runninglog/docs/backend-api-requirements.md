# 백엔드 API 구현 요구사항

> 모바일 앱 PRD(01~07) 및 디자인 파일 기반으로 정리한, 백엔드에 추가 구현이 필요한 API 목록

## 현재 상태 요약

### 이미 구현된 API

| 기능 | 엔드포인트 | 비고 |
|------|-----------|------|
| 인증 (이메일/카카오) | `/api/v1/mobile/auth/*` | JWT 기반 |
| 사용자 프로필 조회/수정 | `/api/v1/users/{id}/` | GET/PUT |
| 러닝 활동 CRUD | `/api/v1/activities/` | 목록/상세/생성/수정/삭제 |
| 개인 기록 (PR) | `/api/v1/personal-records/` | 읽기 전용, 자동 추적 |
| 통계 (일/주/월/연) | `/api/v1/statistics/*` | summary, daily, weekly, monthly, yearly |
| Apple Health 동기화 | `/api/v1/sync/apple-health/` | POST |
| Samsung Health 동기화 | `/api/v1/sync/samsung-health/` | POST |
| 마라톤 정보 | `/api/v1/marathons/` | 읽기 전용 |
| 커뮤니티 | `/api/v1/posts/`, `/api/v1/comments/` | CRUD |
| Q&A | `/api/v1/questions/` | AI 답변 생성 |
| 팔로우/팔로워 | `/api/v1/users/{id}/follow/` | |
| 첨부파일 | `/api/v1/attachments/` | S3 기반 |
| 계정 탈퇴 | User soft delete | 90일 유예 |

---

## 신규 구현 필요 API

### 1. 월간 목표 (Goals) API

> PRD: 03-training.md — 트레이닝 탭의 목표 설정/관리

#### 모델: `Goal`

```python
class Goal(DefaultTimeStampModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    year = models.IntegerField()
    month = models.IntegerField()
    goal_type = models.CharField(max_length=20, choices=[
        ('DISTANCE', '거리 (km)'),
        ('TIME', '시간 (분)'),
        ('COUNT', '횟수'),
    ])
    target_value = models.FloatField()        # 목표 값
    current_value = models.FloatField(default=0)  # 현재 달성 값
    is_achieved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'year', 'month')
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/goals/current/` | 이번 달 목표 조회 (없으면 404) |
| POST | `/api/v1/goals/` | 목표 생성 |
| PATCH | `/api/v1/goals/{id}/` | 목표 수정 |
| DELETE | `/api/v1/goals/{id}/` | 목표 삭제 |

#### 요청/응답

```json
// POST /api/v1/goals/
// Request
{
  "goal_type": "DISTANCE",
  "target_value": 100.0
}

// Response (Goal 객체)
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

#### 로직

- `current_value`는 활동 생성/삭제 시 자동 재계산 (signal 또는 post_save)
- DISTANCE: 해당 월 활동의 총 거리(km)
- TIME: 해당 월 활동의 총 시간(분)
- COUNT: 해당 월 활동 횟수
- 목표 달성 시 `is_achieved = True`로 자동 업데이트

---

### 2. 업적/메달 (Achievements) API

> PRD: 03-training.md — 업적 메달 시스템

#### 모델: `Achievement`

```python
class Achievement(DefaultTimeStampModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    year = models.IntegerField()
    month = models.IntegerField()
    distance_type = models.CharField(max_length=20, choices=[
        ('5K', '5K'),
        ('10K', '10K'),
        ('HALF', '하프마라톤'),
        ('FULL', '풀마라톤'),
    ])
    best_time = models.DurationField()          # 해당 월 최고 기록
    medal_type = models.CharField(max_length=10, choices=[
        ('GOLD', '골드'),
        ('SILVER', '실버'),
        ('NONE', '없음'),
    ], default='NONE')
    activity = models.ForeignKey('activity.RunningActivity', on_delete=models.SET_NULL, null=True)
    is_personal_record = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'year', 'month', 'distance_type')
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/achievements/` | 업적 목록 (year, month 쿼리 파라미터) |
| GET | `/api/v1/achievements/current/` | 이번 달 업적 |
| GET | `/api/v1/achievements/history/` | 월별 업적 요약 히스토리 |

#### 응답

```json
// GET /api/v1/achievements/current/
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
      "activity_id": 123,
      "achieved_at": "2025-01-10T06:30:00Z"
    }
  ]
}

// GET /api/v1/achievements/history/
{
  "history": [
    {
      "year": 2025,
      "month": 1,
      "gold_count": 2,
      "silver_count": 1,
      "total_records": 3
    }
  ]
}
```

#### 로직

- 활동 저장 시 거리가 5K/10K/Half/Full 이상인지 체크
- 해당 거리 타입의 기존 최고 기록과 비교하여 메달 부여
- GOLD: 개인 최고 기록 갱신
- SILVER: 해당 월 내 2번째 이상 기록
- 자동 계산 (활동 생성 signal에서 처리)

---

### 3. 월간 분석 (Monthly Analysis) API

> PRD: 04-analyze.md — 기록분석 탭

#### 모델: `MonthlyAnalysis`

```python
class MonthlyAnalysis(DefaultTimeStampModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_analyses')
    year = models.IntegerField()
    month = models.IntegerField()

    # 거리 분석
    total_distance = models.FloatField(default=0)
    distance_change_rate = models.FloatField(default=0)  # 전월 대비 %

    # 페이스 분석
    avg_pace = models.CharField(max_length=20, default='')
    min_pace = models.CharField(max_length=20, default='')
    max_pace = models.CharField(max_length=20, default='')

    # 심박수 분석
    avg_heart_rate = models.IntegerField(null=True)
    zone_1_ratio = models.FloatField(default=0)
    zone_2_ratio = models.FloatField(default=0)
    zone_3_ratio = models.FloatField(default=0)
    zone_4_ratio = models.FloatField(default=0)
    zone_5_ratio = models.FloatField(default=0)

    # 기타 통계
    total_run_count = models.IntegerField(default=0)
    total_duration_seconds = models.IntegerField(default=0)
    total_calories = models.IntegerField(default=0)
    total_elevation_gain = models.FloatField(default=0)
    avg_cadence = models.FloatField(null=True)

    # AI 분석 코멘트
    ai_distance_comment = models.TextField(blank=True, default='')
    ai_pace_comment = models.TextField(blank=True, default='')
    ai_heart_rate_comment = models.TextField(blank=True, default='')
    ai_overall_comment = models.TextField(blank=True, default='')
    ai_generated_at = models.DateTimeField(null=True)

    # 6개월 히스토리 (JSON)
    recent_months_data = models.JSONField(default=list)

    class Meta:
        unique_together = ('user', 'year', 'month')
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/analysis/monthly/` | 월간 분석 데이터 (?year=&month=) |
| GET | `/api/v1/analysis/ai/` | AI 코칭 코멘트 (?year=&month=) |
| GET | `/api/v1/analysis/available-months/` | 분석 가능한 월 목록 |
| POST | `/api/v1/analysis/feedback/` | AI 분석 피드백 |

#### 응답

```json
// GET /api/v1/analysis/monthly/?year=2025&month=1
{
  "year": 2025,
  "month": 1,
  "total_distance": 105.3,
  "distance_change_rate": 12.5,
  "total_run_count": 15,
  "total_duration_display": "12:30:00",
  "total_calories": 8500,
  "avg_pace": "5'30\"",
  "min_pace": "4'45\"",
  "max_pace": "6'30\"",
  "avg_heart_rate": 155,
  "heart_rate_zones": {
    "zone1": 10, "zone2": 20, "zone3": 35, "zone4": 25, "zone5": 10
  },
  "total_elevation_gain": 450.0,
  "avg_cadence": 172,
  "recent_months": [
    { "year": 2024, "month": 8, "distance": 80.2 },
    { "year": 2024, "month": 9, "distance": 90.1 },
    { "year": 2024, "month": 10, "distance": 85.5 },
    { "year": 2024, "month": 11, "distance": 95.0 },
    { "year": 2024, "month": 12, "distance": 93.6 },
    { "year": 2025, "month": 1, "distance": 105.3 }
  ]
}

// GET /api/v1/analysis/ai/?year=2025&month=1
{
  "year": 2025,
  "month": 1,
  "distance_comment": "지난달 대비 12.5% 증가했습니다. 꾸준한 훈련이 돋보입니다.",
  "pace_comment": "평균 페이스가 안정적입니다. 인터벌 훈련을 추가하면 더 빨라질 수 있습니다.",
  "heart_rate_comment": "심박수 Zone 3-4 비율이 높아 유산소 효율이 좋습니다.",
  "overall_comment": "전반적으로 좋은 컨디션입니다. 주 4회 이상 달리기를 유지하세요.",
  "generated_at": "2025-02-01T00:00:00Z"
}
```

#### 로직

- 매월 1일 자동 계산 (Celery task) 또는 요청 시 lazy 계산
- 6개월 히스토리 데이터 포함
- AI 코멘트는 OpenAI/Claude API로 비동기 생성
- 생성 중이면 202 응답, 완료 시 200 응답

---

### 4. 푸시 알림 (Notifications) API

> PRD: 07-push-notifications.md — 알림 시스템

#### 모델: `Notification`

```python
class Notification(DefaultTimeStampModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=[
        ('ACHIEVEMENT', '업적 달성'),
        ('GOAL_COMPLETE', '목표 완료'),
        ('WEEKLY_SUMMARY', '주간 리포트'),
        ('COMMENT', '댓글'),
        ('SERVICE_UPDATE', '서비스 업데이트'),
        ('MARKETING', '마케팅'),
    ])
    title = models.CharField(max_length=200)
    body = models.TextField()
    emoji = models.CharField(max_length=10, blank=True, default='')
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True, default='')
    related_id = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/notifications/` | 알림 목록 (cursor 페이지네이션) |
| GET | `/api/v1/notifications/unread-count/` | 읽지 않은 알림 수 |
| PATCH | `/api/v1/notifications/{id}/read/` | 단일 알림 읽음 처리 |
| POST | `/api/v1/notifications/read-all/` | 전체 읽음 처리 |

#### 응답

```json
// GET /api/v1/notifications/?cursor=xxx&limit=20
{
  "results": [
    {
      "id": 1,
      "type": "ACHIEVEMENT",
      "title": "5K 개인 기록 달성! 🏅",
      "body": "23분 45초로 새로운 5K 기록을 세웠습니다.",
      "emoji": "🏅",
      "is_read": false,
      "created_at": "2025-01-15T06:30:00Z",
      "time_display": "오늘 06:30",
      "action_url": "/run/123"
    }
  ],
  "unread_count": 3,
  "next_cursor": "abc123",
  "has_more": true
}

// GET /api/v1/notifications/unread-count/
{
  "count": 3
}
```

---

### 5. 알림 설정 (Notification Settings) API

> PRD: 05-mypage-settings.md — 알림 및 동의 설정

#### 모델: `NotificationSetting`

```python
class NotificationSetting(DefaultTimeStampModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_setting')
    push_enabled = models.BooleanField(default=True)
    marketing_enabled = models.BooleanField(default=False)
    night_push_enabled = models.BooleanField(default=False)
    gps_consent = models.BooleanField(default=True)
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/settings/notifications/` | 현재 알림 설정 조회 |
| PATCH | `/api/v1/settings/notifications/` | 알림 설정 변경 |

#### 응답

```json
// GET /api/v1/settings/notifications/
{
  "push_enabled": true,
  "marketing_enabled": false,
  "night_push_enabled": false,
  "gps_consent": true
}

// PATCH /api/v1/settings/notifications/
// Request: { "marketing_enabled": true }
// Response: 동일 구조
```

---

### 6. 사용자 설정 확장 (User Settings) API

> PRD: 05-mypage-settings.md — 테마 설정, 데이터 소스

#### User 모델 확장 필드

```python
# User 모델에 추가
theme_preference = models.CharField(max_length=10, choices=[
    ('system', '시스템 설정'),
    ('light', '라이트'),
    ('dark', '다크'),
], default='system')
```

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/mobile/auth/me/` | 현재 사용자 정보 (기존) — theme_preference 추가 |
| PATCH | `/api/v1/mobile/auth/me/` | 사용자 정보 수정 — theme_preference 포함 |

#### 응답 (기존 me 엔드포인트 확장)

```json
// GET /api/v1/mobile/auth/me/
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "러닝러버",
  "profile_image": "https://...",
  "theme_preference": "system",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 7. 계정 탈퇴 (모바일) API

> PRD: 05-mypage-settings.md — 탈퇴하기

기존 User 모델에 soft delete가 구현되어 있으나, 모바일 전용 엔드포인트가 필요.

#### 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/v1/mobile/auth/withdraw/` | 계정 탈퇴 (90일 유예) |

#### 요청/응답

```json
// POST /api/v1/mobile/auth/withdraw/
// Request: (없음 또는 확인 비밀번호)

// Response
{
  "success": true,
  "message": "계정이 비활성화되었습니다. 90일 이내 재로그인 시 복구됩니다.",
  "deactivated_at": "2025-01-15T10:00:00Z"
}
```

---

## 구현 우선순위

| 순위 | API | 이유 |
|------|-----|------|
| 1 | 월간 목표 (Goals) | 트레이닝 탭 핵심 기능 |
| 2 | 업적/메달 (Achievements) | 트레이닝 탭 핵심 기능 |
| 3 | 푸시 알림 (Notifications) | 마이페이지 알림 기능 |
| 4 | 알림 설정 (Notification Settings) | 마이페이지 설정 |
| 5 | 월간 분석 (Monthly Analysis) | 기록분석 탭 |
| 6 | 사용자 설정 확장 | 테마, 프로필 |
| 7 | 계정 탈퇴 (모바일) | 마이페이지 설정 |

---

## 기술 참고사항

- **인증**: 모든 신규 API는 JWT Bearer 토큰 인증 사용
- **페이지네이션**: 알림은 cursor 기반, 나머지는 offset 기반
- **자동 계산**: Goals.current_value, Achievements 은 활동 생성/삭제 시 signal로 갱신
- **AI 코멘트**: 월간 분석 AI 코멘트는 Celery task로 비동기 생성
- **알림 발송**: FCM (Firebase Cloud Messaging) 사용, 업적/목표 달성 시 자동 발송

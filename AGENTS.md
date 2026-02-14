# AGENTS.md (Workspace)

이 워크스페이스는 **모노레포** 구조입니다. 패키지별 역할은 다음과 같습니다.

## 패키지 구성

| 패키지 | 설명 |
|--------|------|
| **runninglog** | **Expo** 기반 모바일 앱. iOS/Android용 러닝 로그 앱을 구현하기 위한 프론트엔드 패키지. |
| **runninglog-backend** | **Django** 기반 백엔드 서버. API·인증·데이터 저장 등 서버 사이드 로직을 담당. |

- 모바일 앱 코드를 수정할 때는 `runninglog/` 내부의 패턴과 **`runninglog/AGENTS.md`**를 참고하세요.
- 백엔드 코드를 수정할 때는 **`runninglog-backend/AGENTS.md`**의 Django 전용 가이드를 참고하세요.

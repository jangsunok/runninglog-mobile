# Changelog 작성

프로젝트의 변경 사항을 분석하여 CHANGELOG.md 파일을 작성하거나 업데이트합니다.

## 작업 절차

1. **변경 사항 분석**: 아래 명령어로 마지막 changelog 이후(또는 전체) 커밋 히스토리를 분석합니다.
   - `git log --oneline --no-merges` 로 커밋 목록 확인
   - `git diff` 로 주요 변경 내용 파악
   - 기존 CHANGELOG.md가 있으면 읽어서 마지막 기록된 버전/날짜 이후의 변경만 추가

2. **변경 사항 분류**: 각 커밋을 아래 카테고리로 분류합니다.
   - **Added**: 새로운 기능 추가
   - **Changed**: 기존 기능 변경/개선
   - **Fixed**: 버그 수정
   - **Removed**: 제거된 기능
   - **Refactored**: 리팩토링 (기능 변경 없음)
   - **Deps**: 의존성 업데이트

3. **CHANGELOG.md 작성**: [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 형식을 따릅니다.

## 작성 형식

```markdown
# Changelog

이 프로젝트의 모든 주요 변경 사항을 기록합니다.

## [Unreleased]

### Added
- 새로운 기능 설명

### Changed
- 변경된 기능 설명

### Fixed
- 수정된 버그 설명

## [버전] - YYYY-MM-DD

### Added
- 기능 설명
```

## 규칙

- 한국어로 작성합니다.
- 각 항목은 사용자 관점에서 이해할 수 있게 작성합니다. (커밋 메시지를 그대로 복사하지 않음)
- 관련된 여러 커밋은 하나의 항목으로 합칩니다.
- 내부 리팩토링이나 사소한 변경은 생략할 수 있습니다.
- 날짜는 ISO 8601 형식 (YYYY-MM-DD)을 사용합니다.
- 인자가 제공되면 해당 범위의 커밋만 분석합니다. (예: `v1.0.0..HEAD`, `--since="2024-01-01"`)
- 인자가 없으면 마지막 changelog 기록 이후 또는 전체 커밋을 분석합니다.

## 인자 활용

$ARGUMENTS 값이 있으면 git log 범위나 옵션으로 사용합니다.
예시:
- `/changelog v1.0.0..HEAD` → v1.0.0 이후 변경사항만
- `/changelog --since="2024-06-01"` → 6월 1일 이후 변경사항만

이제 위 절차에 따라 CHANGELOG.md를 작성하거나 업데이트하세요.

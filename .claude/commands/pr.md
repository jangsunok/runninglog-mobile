# Pull Request 생성

현재 브랜치의 변경 사항을 분석하여 CHANGELOG.md를 업데이트하고 PR을 생성합니다.

## 작업 절차

### 1단계: 현재 상태 파악

아래 명령어를 병렬로 실행하여 현재 상태를 파악합니다.
- `git status` — 커밋되지 않은 변경사항 확인 (있으면 커밋 여부를 사용자에게 확인)
- `git branch --show-current` — 현재 브랜치 확인
- `git log main..HEAD --oneline --no-merges` — main 대비 커밋 목록
- `git diff main...HEAD --stat` — main 대비 변경 파일 요약
- `git remote -v` — 리모트 확인

### 2단계: 변경 사항 분석

- `git diff main...HEAD` 로 전체 변경 내용을 상세 분석합니다.
- 변경된 파일들을 읽어서 기능적 변화를 파악합니다.
- 관련 커밋들을 기능 단위로 그룹화합니다.

### 3단계: CHANGELOG.md 업데이트

`/changelog` 스킬의 규칙에 따라 CHANGELOG.md를 업데이트합니다.

- main 브랜치 대비 변경사항만 분석하여 추가합니다.
- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 형식을 따릅니다.
- 변경사항을 **Added / Changed / Fixed / Removed / Refactored / Deps** 카테고리로 분류합니다.
- 한국어로, 사용자 관점에서 이해할 수 있게 작성합니다.
- CHANGELOG.md 변경사항을 커밋합니다. (메시지: `docs: update CHANGELOG.md`)

### 4단계: PR 생성

아래 형식으로 `gh pr create`를 실행합니다.

**PR 제목**: 70자 이내, 변경 핵심을 요약 (영문)

**PR 본문 형식**:
```
## Summary
<1-3줄 요약 (한국어)>

## Changes
<카테고리별 변경사항 목록 (한국어)>

### Added
- 항목

### Changed
- 항목

### Fixed
- 항목

## Test Plan
- [ ] 테스트 항목들

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- HEREDOC을 사용하여 본문을 전달합니다.
- base 브랜치는 main으로 설정합니다.
- 리모트에 푸시되지 않았으면 `-u` 플래그와 함께 먼저 푸시합니다.

## 인자 활용

$ARGUMENTS 값이 있으면 `gh pr create`의 추가 옵션으로 사용합니다.
예시:
- `/pr --draft` → 드래프트 PR로 생성
- `/pr --reviewer username` → 리뷰어 지정
- `/pr --label bug` → 라벨 지정

## 규칙

- PR 본문의 Changes 섹션은 CHANGELOG.md에 추가한 내용과 일치시킵니다.
- 커밋되지 않은 변경사항이 있으면 사용자에게 먼저 확인합니다.
- main 브랜치에서는 PR을 생성하지 않습니다. (경고 후 중단)
- PR 생성 후 URL을 사용자에게 알려줍니다.

이제 위 절차에 따라 CHANGELOG.md를 업데이트하고 PR을 생성하세요.

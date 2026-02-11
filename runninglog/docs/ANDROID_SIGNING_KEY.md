# Android 앱 서명 키(인증서) 식별 값 확인

카카오 개발자 콘솔 등에서 **Android 앱의 패키지명 + 서명 인증서 SHA-1(또는 SHA-256)** 을 등록할 때 사용합니다.

---

## 1. 로컬 개발용 (Debug 키스토어)

로컬에서 `npx expo run:android` 로 빌드할 때는 **Android 기본 debug keystore**가 사용됩니다.

### SHA-1 / SHA-256 한 번에 확인

```bash
# macOS / Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

출력에서 다음 두 줄을 복사해 사용하면 됩니다.

- **SHA1:** `XX:XX:XX:...` (콜론 포함)
- **SHA256:** `XX:XX:XX:...` (콜론 포함)

### npm 스크립트로 실행

프로젝트 루트에서:

```bash
npm run android:sha1
```

---

## 2. EAS Build 사용 시 (배포/프로덕션 키)

EAS로 Android 빌드를 하면 **EAS가 관리하는 keystore**로 서명됩니다.

### 방법 A: EAS CLI로 키 정보 확인

```bash
npx eas credentials --platform android
```

프로젝트·빌드 프로필 선택 후, Android 키스토어 정보에서 SHA-1/SHA-256을 확인할 수 있습니다. (이미 생성된 경우)

### 방법 B: 키스토어 파일이 있는 경우

EAS에서 keystore를 다운로드했거나 로컬에 있다면:

```bash
keytool -list -v -keystore /경로/your-release.keystore -alias your-key-alias
```

비밀번호 입력 후 출력된 SHA1, SHA256 값을 사용합니다.

---

## 3. 카카오 개발자 콘솔에 등록

1. [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션
2. 해당 앱 선택 → **앱 설정** → **플랫폼**
3. **Android** 플랫폼 추가
4. **패키지명**: `app.json`의 `expo.android.package` (예: `life.runninglog`)
5. **키 해시**: 위에서 확인한 **SHA-1** 값(콜론 포함) 또는 **SHA-256** 값을 등록

개발용과 배포용 키가 다르면 **Debug 키 해시**와 **Release 키 해시**를 각각 등록해야 합니다.

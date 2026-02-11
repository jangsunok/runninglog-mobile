import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandOrange } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerUser } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { isValidEmail, isValidPassword } from '@/lib/utils/validation';

export default function JoinScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  /** 비밀번호 눈 버튼 기본 off(비밀번호 숨김) */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputBg = isDark ? '#262626' : '#FFFFFF';
  const inputBorder = isDark ? '#404040' : '#E5E5E5';
  const inputColor = isDark ? '#FAFAFA' : '#0D0D0D';
  const labelColor = isDark ? '#FAFAFA' : '#0D0D0D';

  const emailInvalid = email.trim().length > 0 && !isValidEmail(email);
  const emailError = emailInvalid ? '올바른 이메일 형식을 입력해 주세요.' : null;

  const passwordInvalid = password.length > 0 && !isValidPassword(password);
  const passwordError = passwordInvalid
    ? '8자 이상, 영문 대문자/소문자/숫자 중 하나 이상 포함해 주세요.'
    : null;

  const canSubmit =
    email.trim().length > 0 &&
    isValidEmail(email) &&
    password.length > 0 &&
    isValidPassword(password) &&
    confirmPassword === password &&
    confirmPassword.length > 0 &&
    nickname.trim().length >= 2 &&
    nickname.trim().length <= 20 &&
    agreePrivacy;

  const showErrorToast = (message: string) => {
    Toast.show({
      type: 'error',
      text1: '회원가입 실패',
      text2: message,
      visibilityTime: 3000,
    });
  };

  const handleJoin = async () => {
    if (!email.trim()) {
      showErrorToast('이메일을 입력해 주세요.');
      return;
    }
    if (!password) {
      showErrorToast('비밀번호를 입력해 주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      showErrorToast('8자 이상, 영문 대문자/소문자/숫자 중 하나 이상 포함해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast('비밀번호가 일치하지 않습니다.');
      return;
    }
    const trimmedNick = nickname.trim();
    if (trimmedNick.length < 2 || trimmedNick.length > 20) {
      showErrorToast('닉네임은 2~20자 사이로 입력해 주세요.');
      return;
    }
    if (!agreePrivacy) {
      showErrorToast('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        email: email.trim(),
        password,
        nickname: trimmedNick,
      });
      Toast.show({
        type: 'success',
        text1: '회원가입 완료',
        text2: '로그인해 주세요.',
        visibilityTime: 3000,
      });
      router.replace('/(auth)/login');
    } catch (e) {
      if (e instanceof ApiError) {
        showErrorToast(e.message || `회원가입 실패 (${e.status})`);
      } else {
        showErrorToast(e instanceof Error ? e.message : '회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoJoin = () => {
    Toast.show({
      type: 'info',
      text1: '준비 중',
      text2: '카카오 로그인은 준비 중입니다.',
      visibilityTime: 3000,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={styles.title}>
            회원가입
          </ThemedText>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.loginLink, pressed && styles.loginLinkPressed]}
          >
            <ThemedText style={styles.loginLinkText}>
              계정이 있으신가요? <ThemedText style={styles.loginLinkHighlight}>로그인하기</ThemedText>
            </ThemedText>
          </Pressable>

          <View style={styles.form}>
            <ThemedText style={[styles.label, { color: labelColor }]}>이메일</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: emailInvalid ? '#dc2626' : inputBorder,
                  color: inputColor,
                },
              ]}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? (
              <Text style={styles.fieldError}>{emailError}</Text>
            ) : null}

            <ThemedText style={[styles.label, { color: labelColor }]}>비밀번호</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  {
                    backgroundColor: inputBg,
                    borderColor: passwordInvalid ? '#dc2626' : inputBorder,
                    color: inputColor,
                  },
                ]}
                placeholder="8자 이상, 영문 대문자/소문자/숫자 중 하나 이상 포함"
                placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeIcon}
                hitSlop={8}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={22}
                  color={isDark ? '#A3A3A3' : '#737373'}
                />
              </Pressable>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError}>{passwordError}</Text>
            ) : null}

            <ThemedText style={[styles.label, { color: labelColor }]}>비밀번호 확인</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor },
                ]}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword((v) => !v)}
                style={styles.eyeIcon}
                hitSlop={8}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={22}
                  color={isDark ? '#A3A3A3' : '#737373'}
                />
              </Pressable>
            </View>

            <ThemedText style={[styles.label, { color: labelColor }]}>닉네임</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor }]}
              placeholder="2~20자 사이로 입력하세요"
              placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />

            <Pressable
              onPress={() => setAgreePrivacy((v) => !v)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
                {agreePrivacy ? (
                  <Text style={styles.checkboxCheck}>✓</Text>
                ) : null}
              </View>
              <View style={styles.checkboxLabelWrap}>
                <ThemedText style={styles.checkboxLabel}>
                  개인정보 수집·이용에 동의합니다
                </ThemedText>
                <View style={styles.privacySubRow}>
                  <ThemedText style={styles.privacySubText}>
                  <Pressable onPress={() => router.push('/(auth)/privacy-policy')} hitSlop={4}>
                    <Text style={styles.privacyLink}>개인정보 처리방침</Text>
                  </Pressable>에서 자세한 내용을 확인할 수 있습니다.{' '}
                  </ThemedText>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={handleJoin}
              disabled={!canSubmit || loading}
              style={({ pressed }) => [
                styles.submitButton,
                canSubmit ? styles.submitButtonActive : styles.submitButtonDisabled,
                pressed && canSubmit && styles.submitButtonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>회원가입</Text>
              )}
            </Pressable>
            <ThemedText style={styles.instructionText}>
              모든 필수 항목을 입력하고 개인정보 수집·이용에 동의해야 회원가입할 수 있습니다.
            </ThemedText>

            <View style={[styles.divider, { marginTop: 24 }]}>
              <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
              <ThemedText style={styles.dividerText}>또는</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.kakaoButton, pressed && styles.kakaoButtonPressed]}
              onPress={handleKakaoJoin}
            >
              <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  loginLink: {
    marginBottom: 24,
  },
  loginLinkPressed: {
    opacity: 0.8,
  },
  loginLinkText: {
    fontSize: 14,
    opacity: 0.9,
  },
  loginLinkHighlight: {
    color: BrandOrange,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  form: {
    width: '100%',
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  fieldError: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    marginBottom: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: BrandOrange,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabelWrap: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  privacySubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  privacySubText: {
    fontSize: 12,
    opacity: 0.8,
  },
  privacyLink: {
    fontSize: 12,
    color: BrandOrange,
    opacity: 0.8,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonActive: {
    backgroundColor: BrandOrange,
  },
  submitButtonDisabled: {
    backgroundColor: BrandOrange,
    opacity: 0.3,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.7,
    fontSize: 14,
  },
  kakaoButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoButtonPressed: {
    opacity: 0.9,
  },
  kakaoIcon: {
    marginRight: 8,
  },
  kakaoButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '600',
  },
});

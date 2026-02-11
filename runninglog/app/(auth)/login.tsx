import { login as KakaoUserLogin } from '@react-native-kakao/user';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Logo } from '@/constants/assets';
import { BrandOrange } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loginWithEmail, loginWithKakao } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { isValidEmail } from '@/lib/utils/validation';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const showErrorToast = (message: string) => {
    Toast.show({
      type: 'error',
      text1: '로그인 실패',
      text2: message,
      visibilityTime: 3000,
    });
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      showErrorToast('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    if (!isValidEmail(email)) {
      showErrorToast('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const { access_token, refresh_token } = await loginWithEmail(email.trim(), password);
      await login(access_token, refresh_token);
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError) {
        showErrorToast(e.message || `로그인 실패 (${e.status})`);
      } else {
        showErrorToast(e instanceof Error ? e.message : '로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (Platform.OS === 'web') {
      Toast.show({
        type: 'info',
        text1: '앱에서 이용해 주세요',
        text2: '카카오 로그인은 iOS/Android 앱에서 이용할 수 있습니다.',
        visibilityTime: 3000,
      });
      return;
    }
    setKakaoLoading(true);
    try {
      const token = await KakaoUserLogin();
      const { access_token, refresh_token } = await loginWithKakao(token.accessToken);
      await login(access_token, refresh_token);
      Toast.show({
        type: 'success',
        text1: '로그인 완료',
        text2: '카카오 로그인되었습니다.',
        visibilityTime: 2000,
      });
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError) {
        showErrorToast(e.message || `카카오 로그인에 실패했습니다. (${e.status})`);
      } else {
        showErrorToast(e instanceof Error ? e.message : '카카오 로그인에 실패했습니다.');
      }
    } finally {
      setKakaoLoading(false);
    }
  };

  const inputBg = isDark ? '#262626' : '#F5F5F5';
  const inputBorder = isDark ? '#404040' : '#E5E5E5';
  const inputColor = isDark ? '#FAFAFA' : '#0D0D0D';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={[styles.logoWrapper, isDark && styles.logoWrapperDark]}>
          <Image source={Logo.png} style={styles.logo} contentFit="contain" />
        </View>
        <Pressable
          onPress={() => router.push('/(auth)/join')}
          style={({ pressed }) => [styles.joinLink, pressed && styles.joinLinkPressed]}
        >
          <ThemedText style={styles.joinLinkText}>
            계정이 없으신가요? <ThemedText style={styles.joinLinkHighlight}>회원가입하기</ThemedText>
          </ThemedText>
        </Pressable>
        {/* <ThemedText type="title" style={styles.title}>
          러닝로그
        </ThemedText> */}
        {/* <ThemedText style={styles.subtitle}>
          로그인 후 서비스를 이용할 수 있습니다.
        </ThemedText> */}

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor }]}
            placeholder="이메일"
            placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor }]}
            placeholder="비밀번호"
            placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              loading && styles.primaryButtonDisabled,
            ]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={BrandOrange} />
          ) : (
              <Text style={styles.primaryButtonText}>이메일로 로그인</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
          <ThemedText style={styles.dividerText}>또는</ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.kakaoButton,
            pressed && styles.kakaoButtonPressed,
            kakaoLoading && styles.kakaoButtonDisabled,
          ]}
          onPress={handleKakaoLogin}
          disabled={kakaoLoading}
        >
          {kakaoLoading ? (
            <ActivityIndicator color="#191919" size="small" />
          ) : (
            <Text style={styles.kakaoButtonText}>카카오톡 로그인</Text>
          )}
        </Pressable>

        {__DEV__ && (
          <>
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
              <ThemedText style={styles.dividerText}>DEV</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.devButton,
                pressed && styles.devButtonPressed,
              ]}
              onPress={async () => {
                await login('dev-token', 'dev-refresh');
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.devButtonText}>로그인 없이 둘러보기 (Dev)</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 20,
    // backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoWrapperDark: {
    // backgroundColor: '#000000',
  },
  joinLink: {
    marginBottom: 16,
  },
  joinLinkPressed: {
    opacity: 0.8,
  },
  joinLinkText: {
    fontSize: 14,
    opacity: 0.9,
  },
  joinLinkHighlight: {
    color: BrandOrange,
    fontSize: 14,
    // fontWeight: '600',
    textDecorationLine: 'underline',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: BrandOrange,
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoButtonPressed: {
    opacity: 0.9,
  },
  kakaoButtonDisabled: {
    opacity: 0.7,
  },
  kakaoButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '600',
  },
  devButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtonPressed: {
    opacity: 0.9,
  },
  devButtonText: {
    color: '#FAFAFA',
    fontSize: 16,
    fontWeight: '600',
  },
});

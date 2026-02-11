import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { BrandOrange } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LogoutScreen() {
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleCancel = () => {
    router.back();
  };

  const borderColor = isDark ? '#404040' : '#E5E5E5';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          로그아웃
        </ThemedText>
        <ThemedText style={styles.message}>
          로그아웃 하시겠습니까?
        </ThemedText>
        <View style={styles.buttons}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              { borderColor },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.cancelButtonText}>취소</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.button,
              styles.logoutButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 320,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: BrandOrange,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});

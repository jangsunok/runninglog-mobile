import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ChevronLeft, User as UserIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateProfile, uploadProfileImage, type User } from '@/lib/api/auth';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);


  const fetchUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      setNickname(data.nickname ?? '');
    } catch {
      Toast.show({ type: 'error', text1: '프로필을 불러오지 못했어요.' });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const nicknameChanged = nickname.trim() !== '' && nickname.trim() !== (user?.nickname ?? '');

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !user) return;

    const prev = user.nickname;
    setSaving(true);
    setUser({ ...user, nickname: trimmed });

    try {
      const updated = await updateProfile({ nickname: trimmed });
      setUser(updated);
      setNickname(updated.nickname ?? trimmed);
      Toast.show({ type: 'success', text1: '닉네임이 변경되었어요.' });
    } catch {
      setUser({ ...user, nickname: prev });
      setNickname(prev ?? '');
      Toast.show({ type: 'error', text1: '닉네임 변경에 실패했어요.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    const prevUri = localImageUri;
    const prevUrl = user?.profile_image_url;
    setLocalImageUri(uri);

    try {
      const updated = await uploadProfileImage(uri);
      setUser(updated);
      Toast.show({ type: 'success', text1: '프로필 사진이 변경되었어요.' });
    } catch {
      setLocalImageUri(prevUri);
      if (user) setUser({ ...user, profile_image_url: prevUrl });
      Toast.show({ type: 'error', text1: '사진 변경에 실패했어요.' });
    }
  };

  const avatarSource = localImageUri ?? user?.profile_image_url;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          프로필 설정
        </ThemedText>
      </View>

      <View style={styles.content}>
        {/* 프로필 사진 */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: c.lightGray }]}>
            {avatarSource ? (
              <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
            ) : (
              <UserIcon size={36} color={c.textSecondary} />
            )}
          </View>
          <Pressable onPress={handlePickImage}>
            <ThemedText style={[styles.changePhotoText, { color: BrandOrange }]}>
              사진 변경
            </ThemedText>
          </Pressable>
        </View>

        {/* 닉네임 */}
        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: c.textSecondary }]}>
            닉네임
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: c.text,
                borderColor: c.lightGray,
                backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#F9FAFB',
              },
            ]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor={c.textTertiary}
            maxLength={20}
          />
          <Pressable
            style={[
              styles.saveBtn,
              { opacity: nicknameChanged && !saving ? 1 : 0.4 },
            ]}
            onPress={handleSave}
            disabled={!nicknameChanged || saving}
          >
            <ThemedText style={styles.saveBtnText}>
              {saving ? '저장 중...' : '저장'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoText: { fontSize: 14, fontWeight: '600' },
  field: { paddingVertical: 16, gap: 8 },
  label: { fontSize: 13, fontWeight: '500' },
  input: {
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  saveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: BrandOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

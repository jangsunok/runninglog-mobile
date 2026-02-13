import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { withdrawAccount } from '@/lib/api/auth';

export default function WithdrawScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const handleWithdraw = async () => {
    try {
      await withdrawAccount();
      await logout();
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('탈퇴 실패', e.message || '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: '#00000066' }]}>
      <View style={[styles.modal, { backgroundColor: c.background }]}>
        {/* Content */}
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontFamily: F.inter700 }]}>
            정말 탈퇴하시겠어요?
          </ThemedText>
          <ThemedText style={[styles.modalDesc, { color: c.textSecondary }]}>
            {'탈퇴 시 계정은 즉시 \'비활성화\'되며,\n90일 후 모든 데이터가 영구 삭제됩니다.'}
          </ThemedText>
          <View style={[styles.warningBox, { backgroundColor: '#FFF3E0' }]}>
            <AlertTriangle size={16} color={BrandOrange} />
            <ThemedText style={[styles.warningText, { color: BrandOrange }]}>
              90일 이내 재가입 시 기존 데이터를 복원할 수 없습니다.
            </ThemedText>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable
            style={[styles.btn, { borderRightWidth: 1, borderRightColor: c.border }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.cancelText, { fontFamily: F.inter600 }]}>취소</ThemedText>
          </Pressable>
          <Pressable style={styles.btn} onPress={handleWithdraw}>
            <ThemedText style={[styles.withdrawText, { fontFamily: F.inter600 }]}>
              탈퇴하기
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 320,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  modalContent: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, textAlign: 'center' },
  modalDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
  },
  warningText: { fontSize: 13, flex: 1 },
  divider: { height: 1 },
  btnRow: { flexDirection: 'row', height: 52 },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 16 },
  withdrawText: { fontSize: 16, color: '#FF3B30' },
});

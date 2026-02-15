import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Mail, MessageCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SUPPORT_EMAIL = 'support@runninglog.life';

type FaqItem = { q: string; a: string };

const FAQ_LIST: FaqItem[] = [
  {
    q: '러닝 기록은 어떻게 저장되나요?',
    a: 'GPS 기반으로 실시간 위치를 추적하며, 러닝 종료 시 거리·페이스·시간 등이 자동 저장됩니다.',
  },
  {
    q: 'Apple Health / Samsung Health 연동은 어떻게 하나요?',
    a: '마이페이지 → 데이터 소스 연동에서 건강 앱 토글을 켜면 자동으로 연동됩니다. 권한 허용이 필요합니다.',
  },
  {
    q: 'Strava나 Garmin 계정을 연결하고 싶어요.',
    a: '마이페이지 → 데이터 소스 연동 → 서비스 연동에서 "연결하기"를 눌러 OAuth 인증을 진행하세요.',
  },
  {
    q: '닉네임은 어떻게 변경하나요?',
    a: '마이페이지 → 프로필 설정에서 닉네임을 수정한 뒤 "저장" 버튼을 누르면 됩니다.',
  },
  {
    q: '알림이 오지 않아요.',
    a: '마이페이지 → 알림 및 동의 설정에서 알림이 켜져 있는지 확인하고, 기기 설정에서도 앱 알림을 허용해주세요.',
  },
  {
    q: '다크 모드를 지원하나요?',
    a: '네, 마이페이지 → 테마 설정에서 라이트/다크/시스템 설정 중 선택할 수 있습니다.',
  },
  {
    q: '데이터를 삭제하고 싶어요.',
    a: '마이페이지 하단의 "탈퇴하기"를 통해 계정과 모든 데이터를 삭제할 수 있습니다. 삭제된 데이터는 복구할 수 없습니다.',
  },
  {
    q: '오프라인에서도 러닝 기록이 가능한가요?',
    a: 'GPS 신호만 있다면 오프라인에서도 기록이 가능합니다. 인터넷 연결 시 서버에 자동으로 동기화됩니다.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleCopyEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
      Toast.show({ type: 'error', text1: '메일 앱을 열 수 없습니다.' });
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          고객센터
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 이메일 문의 */}
        <Pressable
          style={[styles.card, { borderColor: c.border }]}
          onPress={handleCopyEmail}
        >
          <Mail size={24} color={BrandOrange} />
          <View style={styles.cardContent}>
            <ThemedText style={[styles.cardTitle, { fontFamily: F.inter600 }]}>
              이메일 문의
            </ThemedText>
            <ThemedText style={[styles.cardDesc, { color: c.textSecondary }]}>
              {SUPPORT_EMAIL}
            </ThemedText>
          </View>
          <ExternalLink size={18} color={c.textTertiary} />
        </Pressable>

        {/* 자주 묻는 질문 */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <MessageCircle size={22} color={BrandOrange} />
            <ThemedText style={[styles.faqSectionTitle, { fontFamily: F.inter700 }]}>
              자주 묻는 질문
            </ThemedText>
          </View>

          <View style={[styles.faqList, { borderColor: c.border }]}>
            {FAQ_LIST.map((item, index) => (
              <View key={index}>
                {index > 0 && <View style={[styles.faqDivider, { backgroundColor: c.border }]} />}
                <Pressable style={styles.faqRow} onPress={() => toggleFaq(index)}>
                  <ThemedText style={[styles.faqQuestion, { fontFamily: F.inter500 }]}>
                    {item.q}
                  </ThemedText>
                  {expandedIndex === index ? (
                    <ChevronUp size={18} color={c.textTertiary} />
                  ) : (
                    <ChevronDown size={18} color={c.textTertiary} />
                  )}
                </Pressable>
                {expandedIndex === index && (
                  <View style={[styles.faqAnswer, { backgroundColor: c.lightGray }]}>
                    <ThemedText style={[styles.faqAnswerText, { color: c.textSecondary }]}>
                      {item.a}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  content: { padding: 20, gap: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardContent: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13 },
  faqSection: { gap: 12 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faqSectionTitle: { fontSize: 15 },
  faqList: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  faqQuestion: { fontSize: 14, flex: 1 },
  faqDivider: { height: 1 },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  faqAnswerText: { fontSize: 13, lineHeight: 20 },
});

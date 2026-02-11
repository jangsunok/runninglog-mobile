import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AnalyzeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">기록 분석</ThemedText>
      <ThemedText style={styles.subtitle}>기록 분석 화면이 여기에 구현됩니다.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  subtitle: { opacity: 0.8, marginTop: 8 },
});

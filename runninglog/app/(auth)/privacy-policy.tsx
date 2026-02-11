import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

/** 항상 서비스 도메인 개인정보처리방침만 로드 (localhost 미사용) */
const PRIVACY_POLICY_URL = 'https://runninglog.life/privacy-policy';

function PrivacyPolicyContent() {
  const [loading, setLoading] = useState(true);
  const onLoadEnd = useCallback(() => setLoading(false), []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webViewWrap}>
        <iframe
          src={PRIVACY_POLICY_URL}
          title="개인정보 처리방침"
          style={iframeStyle}
        />
      </View>
    );
  }

  return (
    <View style={styles.webViewWrap}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6F00" />
        </View>
      ) : null}
      <WebView
        source={{ uri: PRIVACY_POLICY_URL }}
        originWhitelist={['https://runninglog.life', 'https://*']}
        style={styles.webView}
        onLoadEnd={onLoadEnd}
        startInLoadingState
        scalesPageToFit={Platform.OS === 'android'}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const iframeStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
  border: 0,
  minHeight: '100%',
};

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          hitSlop={8}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0D0D0D" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          개인정보 처리방침
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <PrivacyPolicyContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#0D0D0D',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  webViewWrap: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

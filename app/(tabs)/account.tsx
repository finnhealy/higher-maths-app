import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { syncSignedInUserState } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';

export default function AccountScreen() {
  const router = useRouter();
  const { colors, mode, setMode, toggleDarkMode } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function authenticate(authMode: 'login' | 'signup') {
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase not configured', 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.');
      return;
    }

    setLoading(true);
    const response =
      authMode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (response.error) {
      Alert.alert('Authentication error', response.error.message);
      return;
    }

    if (response.data.user?.id) {
      await syncSignedInUserState(response.data.user.id);
    }

    Alert.alert(authMode === 'login' ? 'Logged in' : 'Account created', 'Your progress will sync while you are signed in.');
    router.replace('/');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to sync Supabase progress, or keep using guest mode locally.</Text>

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text }]}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text }]}
            value={password}
          />

          <PrimaryButton title="Login" disabled={loading || !email || !password} onPress={() => authenticate('login')} />
          <PrimaryButton title="Create account" variant="secondary" disabled={loading || !email || !password} onPress={() => authenticate('signup')} />
          <PrimaryButton title="Continue as guest" variant="ghost" onPress={() => router.replace('/')} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Dark mode</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Current setting: {mode}</Text>
            </View>
            <PrimaryButton title="Toggle" variant="secondary" onPress={toggleDarkMode} style={styles.smallButton} />
          </View>

          <View style={styles.segmented}>
            {(['system', 'light', 'dark'] as const).map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => setMode(item)}
                style={[
                  styles.segment,
                  { borderColor: colors.border, backgroundColor: item === mode ? colors.primary : colors.cardAlt },
                ]}
              >
                <Text style={[styles.segmentText, { color: item === mode ? '#FFFFFF' : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  card: {
    gap: 14,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  smallButton: {
    minHeight: 44,
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
});

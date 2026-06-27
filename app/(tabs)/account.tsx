import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { topicLessons } from '@/data/lessonContent';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getAttempts, getGardenState, getProgress, syncSignedInUserState } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';

type SignedInUser = {
  id: string;
  email?: string;
  name: string;
};

type AccountStats = {
  completedQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lessonsCompleted: number;
  totalLessons: number;
  coins: number;
  plants: number;
  attempts: number;
};

const totalLessonCount = topicLessons.reduce((total, topic) => total + topic.subtopics.length, 0);

export default function AccountScreen() {
  const router = useRouter();
  const { colors, mode, setMode, toggleDarkMode } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [stats, setStats] = useState<AccountStats>({
    completedQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    lessonsCompleted: 0,
    totalLessons: totalLessonCount,
    coins: 0,
    plants: 0,
    attempts: 0,
  });

  const loadAccount = useCallback(async () => {
    const { data } = isSupabaseConfigured ? await supabase.auth.getUser() : { data: { user: null } };
    const currentUser = data.user;
    const userId = currentUser?.id;
    const progress = await getProgress(userId);
    const garden = await getGardenState(userId);
    const attempts = await getAttempts();
    const totals = Object.values(progress.topics).reduce(
      (acc, topic) => ({
        completed: acc.completed + topic.completed,
        correct: acc.correct + topic.correct,
      }),
      { completed: 0, correct: 0 },
    );

    setUser(
      currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            name:
              typeof currentUser.user_metadata?.name === 'string'
                ? currentUser.user_metadata.name
                : typeof currentUser.user_metadata?.full_name === 'string'
                  ? currentUser.user_metadata.full_name
                  : currentUser.email?.split('@')[0] ?? 'Learner',
          }
        : null,
    );
    setStats({
      completedQuestions: totals.completed,
      correctAnswers: totals.correct,
      accuracy: totals.completed > 0 ? Math.round((totals.correct / totals.completed) * 100) : 0,
      lessonsCompleted: garden.rewardedLessonIds.length,
      totalLessons: totalLessonCount,
      coins: garden.coins,
      plants: garden.plants.filter((plant) => plant.tileIndex !== undefined).length,
      attempts: attempts.length,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccount();
    }, [loadAccount]),
  );

  async function authenticate(authMode: 'login' | 'signup') {
    if (!isSupabaseConfigured) {
      const message = 'Account sync is not configured yet. Please try again later.';
      setStatus({ tone: 'error', message });
      Alert.alert('Account sync unavailable', message);
      return;
    }

    const trimmedEmail = email.trim();

    try {
      setLoading(true);
      setStatus({ tone: 'info', message: authMode === 'login' ? 'Logging in...' : 'Creating account...' });

      const response =
        authMode === 'login'
          ? await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
          : await supabase.auth.signUp({ email: trimmedEmail, password });

      if (response.error) {
        setStatus({ tone: 'error', message: response.error.message });
        Alert.alert('Authentication error', response.error.message);
        return;
      }

      if (response.data.user?.id && response.data.session) {
        setStatus({ tone: 'info', message: 'Syncing your progress...' });
        await syncSignedInUserState(response.data.user.id);
        await loadAccount();
      }

      const message =
        authMode === 'signup' && !response.data.session
          ? 'Account created. Check your email to confirm your account before logging in.'
          : 'You are signed in. Your progress will sync while you use the app.';
      setStatus({ tone: 'success', message });
      Alert.alert(authMode === 'login' ? 'Logged in' : 'Account created', message);

      if (response.data.session) {
        router.replace('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setStatus({ tone: 'error', message });
      Alert.alert('Authentication error', message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus({ tone: 'error', message: error.message });
        return;
      }

      setUser(null);
      setStatus({ tone: 'success', message: 'Signed out. This device will keep using local guest progress.' });
      await loadAccount();
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Could not sign out.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Account</Text>
          {user ? (
            <>
              <View style={[styles.profileBadge, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <Text style={styles.profileAvatar}>{user.name.slice(0, 1).toUpperCase()}</Text>
                <View style={styles.rowText}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{user.name}</Text>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>{user.email ?? 'Signed in'}</Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Your progress, coins, lessons, and garden are syncing with your account.</Text>
              <PrimaryButton title={loading ? 'Please wait...' : 'Sign out'} variant="secondary" disabled={loading} onPress={signOut} />
            </>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Create an account to sync progress, or keep using guest mode locally.</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setStatus(null);
                }}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text }]}
                value={email}
              />
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => {
                  setPassword(value);
                  setStatus(null);
                }}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text }]}
                value={password}
              />
              <PrimaryButton title={loading ? 'Please wait...' : 'Login'} disabled={loading || !email.trim() || !password} onPress={() => authenticate('login')} />
              <PrimaryButton title="Create account" variant="secondary" disabled={loading || !email.trim() || !password} onPress={() => authenticate('signup')} />
              <PrimaryButton title="Continue as guest" variant="ghost" onPress={() => router.replace('/')} />
            </>
          )}
          {status && (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.statusText,
                {
                  backgroundColor: status.tone === 'error' ? '#FEE2E2' : status.tone === 'success' ? '#DCFCE7' : colors.cardAlt,
                  color: status.tone === 'error' ? '#991B1B' : status.tone === 'success' ? '#166534' : colors.text,
                },
              ]}
            >
              {status.message}
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedQuestions}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Questions</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.accuracy}%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Accuracy</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.lessonsCompleted}/{stats.totalLessons}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Lessons</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.coins}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Coins</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.plants}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Plants</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.correctAnswers}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Correct</Text>
            </View>
          </View>
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
  profileBadge: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 46,
    fontSize: 20,
    fontWeight: '900',
  },
  statusText: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
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

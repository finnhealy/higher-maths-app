import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { topicLessons } from '@/data/lessonContent';
import { getSoundEnabled, setSoundEnabled } from '@/lib/feedback';
import { getAttempts, getGardenState, getProgress, resetLearningState, syncSignedInUserState } from '@/lib/storage';
import { getStudyReminderNotificationsEnabled, setStudyReminderNotificationsEnabled } from '@/lib/studyReminderNotifications';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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
type AuthMode = 'login' | 'signup';

export default function AccountScreen() {
  const router = useRouter();
  const { colors, mode, radii, setMode, toggleDarkMode, typography } = useAppTheme();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(true);
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
    const soundEnabled = await getSoundEnabled();
    const studyRemindersEnabled = await getStudyReminderNotificationsEnabled();
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
    setSoundOn(soundEnabled);
    setNotificationsOn(studyRemindersEnabled);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccount();
    }, [loadAccount]),
  );

  function selectAuthMode(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setStatus(null);
  }

  async function authenticate(selectedAuthMode: AuthMode) {
    if (!isSupabaseConfigured) {
      const message = 'Account sync is not configured yet. Please try again later.';
      setStatus({ tone: 'error', message });
      Alert.alert('Account sync unavailable', message);
      return;
    }

    const trimmedEmail = email.trim();

    try {
      setLoading(true);
      setStatus({ tone: 'info', message: selectedAuthMode === 'login' ? 'Signing in...' : 'Creating account...' });

      const response =
        selectedAuthMode === 'login'
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
        selectedAuthMode === 'signup' && !response.data.session
          ? 'Account created. Check your email to confirm your account before logging in.'
          : 'You are signed in. Your progress will sync while you use the app.';
      setStatus({ tone: 'success', message });
      Alert.alert(selectedAuthMode === 'login' ? 'Signed in' : 'Account created', message);

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

  async function updateSoundPreference(enabled: boolean) {
    const previousSoundOn = soundOn;
    setSoundOn(enabled);

    try {
      await setSoundEnabled(enabled);
    } catch {
      setSoundOn(previousSoundOn);
      Alert.alert('Sound setting not saved', 'Please try changing the sound setting again.');
    }
  }

  async function updateNotificationPreference(enabled: boolean) {
    const previousNotificationsOn = notificationsOn;

    if (enabled) {
      Alert.alert(
        'Would you like Higher Maths practice reminders?',
        'Higher Maths can send one daily reminder if you have not practised that day. You can turn reminders off anytime in Account settings.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => setNotificationsOn(false),
          },
          {
            text: 'Enable reminders',
            onPress: enableNotificationPreference,
          },
        ],
      );
      return;
    }

    setNotificationsOn(false);

    try {
      await setStudyReminderNotificationsEnabled(false);
    } catch {
      setNotificationsOn(previousNotificationsOn);
      Alert.alert('Notification setting not saved', 'Please try changing the notification setting again.');
    }
  }

  async function enableNotificationPreference() {
    const previousNotificationsOn = notificationsOn;
    setNotificationsOn(true);

    try {
      const enabled = await setStudyReminderNotificationsEnabled(true);
      setNotificationsOn(enabled);

      if (!enabled) {
        Alert.alert('Notifications not enabled', 'You can enable notifications later from your device settings.');
      }
    } catch {
      setNotificationsOn(previousNotificationsOn);
      Alert.alert('Notification setting not saved', 'Please try changing the notification setting again.');
    }
  }

  function confirmResetLearningState() {
    Alert.alert(
      'Reset progress?',
      'This will clear your questions, accuracy, completed lessons, coins, and garden. Your sign-in, theme, and sound settings will stay the same.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetAccountProgress,
        },
      ],
    );
  }

  async function resetAccountProgress() {
    try {
      setLoading(true);
      setStatus({ tone: 'info', message: 'Resetting your progress...' });
      await resetLearningState(user?.id);
      await loadAccount();
      setStatus({ tone: 'success', message: 'Progress reset. The app is ready as new.' });
      Alert.alert('Progress reset', 'Your progress, coins, lessons, and garden have been reset.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reset progress. Please try again.';
      setStatus({ tone: 'error', message });
      Alert.alert('Reset failed', message);
    } finally {
      setLoading(false);
    }
  }

  function confirmDeleteAccount() {
    if (!user) {
      return;
    }

    Alert.alert(
      'Delete account?',
      'This permanently deletes your account, synced progress, attempts, coins, and garden. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ],
    );
  }

  async function deleteAccount() {
    if (!user) {
      return;
    }

    if (!isSupabaseConfigured) {
      const message = 'Account sync is not configured yet. Please try again later.';
      setStatus({ tone: 'error', message });
      Alert.alert('Account deletion unavailable', message);
      return;
    }

    try {
      setLoading(true);
      setStatus({ tone: 'info', message: 'Deleting your account...' });

      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut().catch(() => undefined);
      await resetLearningState();
      setUser(null);
      await loadAccount();

      const message = 'Your account and synced learning data have been deleted.';
      setStatus({ tone: 'success', message });
      Alert.alert('Account deleted', message);
      router.replace('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete your account. Please try again.';
      setStatus({ tone: 'error', message });
      Alert.alert('Delete account failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
        <Card gap="md" padding="lg">
          <AppText variant="title">Account</AppText>
          {user ? (
            <>
              <View style={[styles.profileBadge, { backgroundColor: colors.cardAlt, borderColor: colors.border, borderRadius: radii.lg }]}>
                <Text style={styles.profileAvatar}>{user.name.slice(0, 1).toUpperCase()}</Text>
                <View style={styles.rowText}>
                  <AppText variant="subheading">{user.name}</AppText>
                  <AppText muted>{user.email ?? 'Signed in'}</AppText>
                </View>
              </View>
              <AppText muted>Your progress, coins, lessons, and garden are syncing with your account.</AppText>
              <PrimaryButton title={loading ? 'Please wait...' : 'Sign out'} variant="secondary" disabled={loading} onPress={signOut} />
              <PrimaryButton
                title={loading ? 'Please wait...' : 'Delete account'}
                variant="destructive"
                disabled={loading}
                onPress={confirmDeleteAccount}
              />
            </>
          ) : (
            <>
              <AppText muted>Sign in to sync progress, or keep using guest mode locally.</AppText>
              <View style={styles.segmented}>
                {(['login', 'signup'] as const).map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: item === authMode }}
                    key={item}
                    onPress={() => selectAuthMode(item)}
                    style={[
                      styles.segment,
                      { borderColor: colors.border, backgroundColor: item === authMode ? colors.primary : colors.cardAlt },
                    ]}
                  >
                    <Text style={[styles.segmentText, typography.label, { color: item === authMode ? '#FFFFFF' : colors.text }]}>
                      {item === 'login' ? 'Sign in' : 'Register'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                importantForAutofill="yes"
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setStatus(null);
                }}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                style={[styles.input, typography.body, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text, borderRadius: radii.lg }]}
                textContentType="username"
                value={email}
              />
              <TextInput
                autoCapitalize="none"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                importantForAutofill="yes"
                onChangeText={(value) => {
                  setPassword(value);
                  setStatus(null);
                }}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={[styles.input, typography.body, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text, borderRadius: radii.lg }]}
                textContentType={authMode === 'login' ? 'password' : 'newPassword'}
                value={password}
              />
              <PrimaryButton
                title={loading ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Create account'}
                disabled={loading || !email.trim() || !password}
                onPress={() => authenticate(authMode)}
              />
              <PrimaryButton title="Continue as guest" variant="ghost" onPress={() => router.replace('/')} />
            </>
          )}
          {status && (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.statusText,
                typography.label,
                {
                  backgroundColor: status.tone === 'error' ? '#FEE2E2' : status.tone === 'success' ? '#DCFCE7' : colors.cardAlt,
                  color: status.tone === 'error' ? '#991B1B' : status.tone === 'success' ? '#166534' : colors.text,
                  borderRadius: radii.lg,
                },
              ]}
            >
              {status.message}
            </Text>
          )}
        </Card>

        <Card>
          <AppText variant="subheading">Stats</AppText>
          <View style={styles.statsGrid}>
            <StatTile label="Questions" value={stats.completedQuestions} style={styles.statTile} />
            <StatTile label="Accuracy" value={`${stats.accuracy}%`} style={styles.statTile} />
            <StatTile label="Lessons" value={`${stats.lessonsCompleted}/${stats.totalLessons}`} style={styles.statTile} />
            <StatTile label="Coins" value={stats.coins} style={styles.statTile} />
            <StatTile label="Plants" value={stats.plants} style={styles.statTile} />
            <StatTile label="Correct" value={stats.correctAnswers} style={styles.statTile} />
          </View>
        </Card>

        <Card>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subheading">Dark mode</AppText>
              <AppText muted>Current setting: {mode}</AppText>
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
                <Text style={[styles.segmentText, typography.label, { color: item === mode ? '#FFFFFF' : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subheading">Sound</AppText>
              <AppText muted>{soundOn ? 'Sound effects on' : 'Sound effects off'}</AppText>
            </View>
            <Switch
              accessibilityLabel="Sound effects"
              onValueChange={updateSoundPreference}
              value={soundOn}
              trackColor={{ false: colors.border, true: `${colors.primary}66` }}
              thumbColor={soundOn ? colors.primary : '#F8FAFC'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subheading">Notifications</AppText>
              <AppText muted>{notificationsOn ? 'Daily study reminders on' : 'Daily study reminders off'}</AppText>
            </View>
            <Switch
              accessibilityLabel="Daily study reminders"
              onValueChange={updateNotificationPreference}
              value={notificationsOn}
              trackColor={{ false: colors.border, true: `${colors.primary}66` }}
              thumbColor={notificationsOn ? colors.primary : '#F8FAFC'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subheading">Reset progress</AppText>
              <AppText muted>Start again with fresh stats, coins, lessons, and garden.</AppText>
            </View>
            <PrimaryButton
              title={loading ? 'Please wait...' : 'Reset'}
              variant="secondary"
              disabled={loading}
              onPress={confirmResetLearningState}
              style={styles.smallButton}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subheading">Privacy policy</AppText>
              <AppText muted>How progress, account sync, and app preferences are handled.</AppText>
            </View>
            <PrimaryButton title="View" variant="secondary" onPress={() => router.push('/privacy-policy')} style={styles.smallButton} />
          </View>
        </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  profileBadge: {
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statTile: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 128,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  rowText: {
    flex: 1,
  },
  smallButton: {
    minHeight: 44,
    minWidth: 96,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentText: {
    textTransform: 'capitalize',
  },
});

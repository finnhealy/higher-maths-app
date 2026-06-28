import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

const policySections = [
  {
    title: 'What we collect',
    body: [
      'The app saves your learning progress, question attempts, accuracy, completed lessons, coins, garden items, theme, and sound settings.',
      'If you create an account, we also store the email address connected to that account so your progress can sync across devices.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'Your data is used to show your progress, unlock completed lessons, restore your garden, and keep your experience consistent when you return.',
      'We do not sell your personal information or use it for advertising.',
    ],
  },
  {
    title: 'Where it is stored',
    body: [
      'Guest progress is stored locally on your device.',
      'Signed-in account data may be synced with Supabase, which provides the authentication and database service used by the app.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can use the app as a guest without creating an account.',
      'You can reset your learning progress from the Account screen. Signing out keeps local guest progress on the device.',
      'If you create an account, you can delete it from the Account screen. This deletes your synced account data and clears local learning progress on that device.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'If you have questions about privacy or want help with your data, contact the app developer through the support channel where you received the app.',
    ],
  },
] as const;

export default function PrivacyPolicyScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />

      <View style={styles.header}>
        <AppText variant="title">Privacy Policy</AppText>
        <AppText muted>Effective date: 28 June 2026</AppText>
      </View>

      <Card gap="lg" padding="lg">
        <AppText>
          This policy explains what information Higher Maths uses and how it is handled. The app is designed to keep data collection limited to what is needed for learning progress and account sync.
        </AppText>

        {policySections.map((section) => (
          <View key={section.title} style={styles.section}>
            <AppText variant="subheading">{section.title}</AppText>
            {section.body.map((paragraph) => (
              <AppText key={paragraph} muted>
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  section: {
    gap: 8,
  },
});

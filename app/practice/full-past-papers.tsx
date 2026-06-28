import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';

export default function FullPastPapersScreen() {
  const router = useRouter();

  return (
    <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.container}>
      <EmptyState
        title="Full past papers coming soon"
        message="Complete paper practice will appear here once the paper library is added."
        action={<PrimaryButton title="Back to Practice" onPress={() => router.replace('/practice')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';

export default function PastPaperEmptyScreen() {
  const router = useRouter();

  return (
    <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.container}>
      <EmptyState
        title="Past paper questions coming soon"
        message="This section is ready for official questions once they are added."
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

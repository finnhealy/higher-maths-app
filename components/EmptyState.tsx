import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';

type EmptyStateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <Card padding="lg" gap="md" style={styles.card}>
      <View style={styles.copy}>
        <AppText align="center" variant="heading">
          {title}
        </AppText>
        {message ? (
          <AppText align="center" muted>
            {message}
          </AppText>
        ) : null}
      </View>
      {action}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
  },
  copy: {
    gap: 8,
  },
});

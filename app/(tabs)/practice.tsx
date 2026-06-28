import { useRouter } from 'expo-router';

import { PracticeModeCard } from '@/components/PracticeModeCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';

export default function PracticeLauncherScreen() {
  const router = useRouter();

  return (
    <Screen>
      <SectionHeader title="Practice" subtitle="Choose how you want to build exam confidence." />

      <PracticeModeCard
        accentColor="#2563EB"
        description="Use the existing topic question sets and jump straight into focused practice."
        icon="Q"
        meta="Current question flow"
        title="Topic Question Bank"
        onPress={() => router.push('/practice/topic-bank')}
      />

      <PracticeModeCard
        accentColor="#0F766E"
        description="Build a custom set by topic, year, paper, and question count."
        icon="P"
        meta="Placeholder ready for official questions"
        title="Past Paper Question Bank"
        onPress={() => router.push('/practice/past-paper-topics')}
      />

      <PracticeModeCard
        accentColor="#7C3AED"
        description="Sit complete papers when the past paper library is added."
        icon="F"
        meta="Coming soon"
        title="Full Past Papers"
        onPress={() => router.push('/practice/full-past-papers')}
      />
    </Screen>
  );
}

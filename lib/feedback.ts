import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type FeedbackEvent = 'correct' | 'incorrect' | 'coin' | 'lessonComplete' | 'plant' | 'water' | 'select';

const SOUND_ENABLED_KEY = 'higher-maths-sound-enabled';

let audioReady = false;
let soundEnabled = true;
let soundPreferenceLoad: Promise<boolean> | null = null;

function toBase64(bytes: Uint8Array) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const combined = (first << 16) | (second << 8) | third;

    output += chars[(combined >> 18) & 63];
    output += chars[(combined >> 12) & 63];
    output += index + 1 < bytes.length ? chars[(combined >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? chars[combined & 63] : '=';
  }

  return output;
}

function wavDataUri(frequencies: number[], durationMs = 95) {
  const sampleRate = 22050;
  const samplesPerTone = Math.floor((sampleRate * durationMs) / 1000);
  const gapSamples = Math.floor(sampleRate * 0.018);
  const totalSamples = frequencies.length * samplesPerTone + Math.max(0, frequencies.length - 1) * gapSamples;
  const dataSize = totalSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let sampleIndex = 0;
  frequencies.forEach((frequency, toneIndex) => {
    for (let index = 0; index < samplesPerTone; index += 1) {
      const fade = Math.min(1, index / 120, (samplesPerTone - index) / 160);
      const wave = Math.sin((2 * Math.PI * frequency * index) / sampleRate);
      view.setInt16(44 + sampleIndex * 2, Math.floor(wave * 9500 * fade), true);
      sampleIndex += 1;
    }

    if (toneIndex < frequencies.length - 1) {
      for (let index = 0; index < gapSamples; index += 1) {
        view.setInt16(44 + sampleIndex * 2, 0, true);
        sampleIndex += 1;
      }
    }
  });

  const bytes = new Uint8Array(buffer);

  return `data:audio/wav;base64,${toBase64(bytes)}`;
}

function warmChimeDataUri(frequencies: number[], durationMs = 125) {
  const sampleRate = 22050;
  const samplesPerTone = Math.floor((sampleRate * durationMs) / 1000);
  const overlapSamples = Math.floor(sampleRate * 0.028);
  const toneStride = Math.max(1, samplesPerTone - overlapSamples);
  const totalSamples = toneStride * Math.max(0, frequencies.length - 1) + samplesPerTone;
  const dataSize = totalSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const mix = new Float32Array(totalSamples);

  function writeString(offset: number, value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  }

  frequencies.forEach((frequency, toneIndex) => {
    const start = toneIndex * toneStride;
    for (let index = 0; index < samplesPerTone; index += 1) {
      const sampleIndex = start + index;
      const time = index / sampleRate;
      const attack = Math.min(1, index / Math.floor(sampleRate * 0.012));
      const decay = Math.exp(-4.2 * (index / samplesPerTone));
      const wave =
        Math.sin(2 * Math.PI * frequency * time) * 0.72 +
        Math.sin(2 * Math.PI * frequency * 2 * time) * 0.18 +
        Math.sin(2 * Math.PI * frequency * 3 * time) * 0.06;

      mix[sampleIndex] += wave * attack * decay * 0.42;
    }
  });

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  mix.forEach((sample, index) => {
    const softened = Math.tanh(sample);
    view.setInt16(44 + index * 2, Math.floor(softened * 12000), true);
  });

  return `data:audio/wav;base64,${toBase64(new Uint8Array(buffer))}`;
}

const soundSources: Record<FeedbackEvent, string> = {
  correct: warmChimeDataUri([523.25, 659.25], 135),
  incorrect: wavDataUri([220, 165], 105),
  coin: warmChimeDataUri([587.33, 783.99, 987.77], 92),
  lessonComplete: warmChimeDataUri([523.25, 659.25, 783.99], 145),
  plant: warmChimeDataUri([392, 523.25, 659.25], 115),
  water: warmChimeDataUri([493.88, 587.33], 90),
  select: warmChimeDataUri([523.25], 64),
};

type FeedbackPlayer = ReturnType<typeof createAudioPlayer>;

const players: Partial<Record<FeedbackEvent, FeedbackPlayer>> = {};

export async function getSoundEnabled() {
  if (!soundPreferenceLoad) {
    soundPreferenceLoad = AsyncStorage.getItem(SOUND_ENABLED_KEY)
      .then((stored) => {
        soundEnabled = stored !== 'false';
        return soundEnabled;
      })
      .catch(() => soundEnabled);
  }

  return soundPreferenceLoad;
}

export async function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  soundPreferenceLoad = Promise.resolve(enabled);

  await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

function getPlayer(event: FeedbackEvent) {
  if (Platform.OS === 'web' && typeof globalThis.Audio === 'undefined') {
    return null;
  }

  if (!players[event]) {
    const player = createAudioPlayer({ uri: soundSources[event] }, { keepAudioSessionActive: true });
    player.volume = event === 'incorrect' ? 0.16 : 0.2;
    players[event] = player;
  }

  return players[event];
}

async function prepareAudio() {
  if (audioReady) {
    return;
  }

  audioReady = true;
  await setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
  });
}

async function playSound(event: FeedbackEvent) {
  try {
    if (!(await getSoundEnabled())) {
      return;
    }

    const player = getPlayer(event);
    if (!player) {
      return;
    }

    await prepareAudio();
    await player.seekTo(0);
    player.play();
  } catch {
    // Audio is a reward layer, not core app logic.
  }
}

async function playHaptic(event: FeedbackEvent) {
  try {
    if (event === 'correct' || event === 'lessonComplete' || event === 'plant') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (event === 'incorrect') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (event === 'coin') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (event === 'water') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    }
    await Haptics.selectionAsync();
  } catch {
    // Haptics are optional and unavailable on some devices.
  }
}

export function playFeedback(event: FeedbackEvent) {
  void playSound(event);
  void playHaptic(event);
}

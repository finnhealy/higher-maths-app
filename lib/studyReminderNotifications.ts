import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

const CHANNEL_ID = 'study-reminders';
const LAST_OPENED_KEY = 'higher-maths-last-opened-date';
const STUDY_REMINDERS_ENABLED_KEY = 'higher-maths-study-reminders-enabled';
const REMINDER_ID_PREFIX = 'higher-maths-study-reminder-';
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;
const DAYS_TO_SCHEDULE = 60;

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isStudyReminder = notification.request.content.data?.kind === 'dailyStudyReminder';

    return {
      shouldShowBanner: !isStudyReminder,
      shouldShowList: !isStudyReminder,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getReminderDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
  return date;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Study reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#208AEF',
  });
}

async function cancelStudyReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const studyReminderIds = scheduled
    .map((notification) => notification.identifier)
    .filter((identifier) => identifier.startsWith(REMINDER_ID_PREFIX));

  await Promise.all(studyReminderIds.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)));
}

export async function getStudyReminderNotificationsEnabled() {
  const storedPreference = await AsyncStorage.getItem(STUDY_REMINDERS_ENABLED_KEY);
  return storedPreference === 'true';
}

async function hasNotificationPermission() {
  const currentPermissions = await Notifications.getPermissionsAsync();
  return currentPermissions.granted;
}

async function requestNotificationPermission() {
  const currentPermissions = await Notifications.getPermissionsAsync();
  return currentPermissions.granted ? currentPermissions : Notifications.requestPermissionsAsync();
}

async function scheduleStudyReminders() {
  await cancelStudyReminders();

  const reminderSchedules = Array.from({ length: DAYS_TO_SCHEDULE }, (_, index) => {
    const daysFromToday = index + 1;
    return Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_ID_PREFIX}${daysFromToday}`,
      content: {
        title: 'Keep your Higher Maths streak going',
        body: 'A quick practice session today will keep the ideas warm.',
        data: {
          kind: 'dailyStudyReminder',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getReminderDate(daysFromToday),
        channelId: CHANNEL_ID,
      },
    });
  });

  await Promise.all(reminderSchedules);
}

async function refreshStudyReminderSchedule() {
  if (Platform.OS === 'web') {
    return;
  }

  await AsyncStorage.setItem(LAST_OPENED_KEY, getLocalDateKey());

  const studyRemindersEnabled = await getStudyReminderNotificationsEnabled();
  if (!studyRemindersEnabled) {
    await cancelStudyReminders();
    return;
  }

  await ensureAndroidChannel();

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    await AsyncStorage.setItem(STUDY_REMINDERS_ENABLED_KEY, 'false');
    await cancelStudyReminders();
    return;
  }

  await scheduleStudyReminders();
}

export async function setStudyReminderNotificationsEnabled(enabled: boolean) {
  await AsyncStorage.setItem(STUDY_REMINDERS_ENABLED_KEY, 'false');
  await cancelStudyReminders();

  if (!enabled || Platform.OS === 'web') {
    return false;
  }

  await ensureAndroidChannel();

  const permissions = await requestNotificationPermission();
  if (!permissions.granted) {
    return false;
  }

  await AsyncStorage.setItem(STUDY_REMINDERS_ENABLED_KEY, 'true');
  await AsyncStorage.setItem(LAST_OPENED_KEY, getLocalDateKey());
  await scheduleStudyReminders();
  return true;
}

export function useStudyReminderNotifications() {
  useEffect(() => {
    void refreshStudyReminderSchedule();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshStudyReminderSchedule();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

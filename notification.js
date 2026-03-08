import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function initNotifications() {

  await Notifications.requestPermissionsAsync();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

}

export async function scheduleDailyNotifications() {

  // Agua
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Hidratación",
      body: "Tomá agua. Tu cuerpo la necesita.",
    },
    trigger: { hour: 9, minute: 0, repeats: true },
  });

  // Journaling
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧠 Journaling",
      body: "Es momento de escribir y ordenar tu mente.",
    },
    trigger: { hour: 10, minute: 30, repeats: true },
  });

  // Grounding
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌞 Grounding",
      body: "Salí al sol unos minutos y conectá con la tierra.",
    },
    trigger: { hour: 12, minute: 0, repeats: true },
  });

  // Comer consciente
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🥑 Alimentación",
      body: "Comé consciente. Elegí alimentos reales.",
    },
    trigger: { hour: 14, minute: 0, repeats: true },
  });

  // Dormir
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "😴 Hora de dormir",
      body: "Apagá pantallas y descansá. Tu cuerpo se regenera.",
    },
    trigger: { hour: 22, minute: 0, repeats: true },
  });

}
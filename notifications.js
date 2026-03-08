import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Mensajes por día — EL UMBRAL ────────────────────────────
const MENSAJES_UMBRAL = {
  1:  { title: '🔥 Día 1 — La decisión',          body: 'Hoy no empezás a hacer. Hoy decidís ser. Arrancá.' },
  2:  { title: '⚡ Día 2 — El hambre real',         body: 'No todo lo que sentís como hambre es hambre. Respirá primero.' },
  3:  { title: '💪 Día 3 — El cuerpo se queja',    body: 'Los síntomas son señales de que el cambio está ocurriendo. No pares.' },
  4:  { title: '🧠 Día 4 — La claridad llega',     body: 'Sin glucosa el cerebro no se apaga. Se enciende. Confiá.' },
  5:  { title: '⚡ Día 5 — Energía diferente',      body: 'Esta no es energía prestada. Es tuya. Sentila.' },
  6:  { title: '🔥 Día 6 — El primer dolor',       body: 'El músculo que duele es el que creció. Seguí.' },
  7:  { title: '🏆 Día 7 — Semana 1 completa',     body: '7 días. Tu cuerpo ya está en cetosis. Esto recién empieza.' },
  8:  { title: '🌊 Día 8 — La adaptación',         body: 'Tu cuerpo aprendió. Ahora es momento de exigir más.' },
  9:  { title: '💡 Día 9 — El patrón',             body: 'Ya ves el patrón. Ya sabés qué funciona. Usalo.' },
  10: { title: '🔥 Día 10 — Doble dígito',         body: '10 días. La mayoría abandona antes. Vos no.' },
  11: { title: '⚡ Día 11 — La tentación',          body: 'La tentación no es el problema. Tu respuesta a ella sí. Elegí.' },
  12: { title: '🧘 Día 12 — El silencio',          body: 'El silencio también es práctica. Hoy meditá 5 minutos extra.' },
  13: { title: '💪 Día 13 — Casi la mitad',        body: 'Mañana es la mitad. Hoy prepará el cruce.' },
  14: { title: '🏅 Día 14 — Semana 2 completa',    body: '14 días. La adaptación terminó. Ahora consolidás.' },
  15: { title: '⚡ Día 15 — La mitad exacta',       body: '15 días. Lo que construiste no se borra. Seguí.' },
  16: { title: '🔥 Día 16 — Los hábitos toman forma', body: 'Ya no es esfuerzo. Ya es quién sos.' },
  17: { title: '🧠 Día 17 — La identidad',         body: '¿Cómo te describirías hoy? Eso sos ahora.' },
  18: { title: '💡 Día 18 — El proceso',           body: 'No construís el resultado. Construís el proceso que lo produce.' },
  19: { title: '⚡ Día 19 — La constancia',         body: 'La constancia no es motivación. Es decisión. Tomala.' },
  20: { title: '🏆 Día 20 — Dos tercios',          body: '20 días. La parte final es la más importante.' },
  21: { title: '🌟 Día 21 — Semana 3 completa',    body: '21 días. Un hábito real. Vos lo sabías antes que la ciencia.' },
  22: { title: '🔥 Día 22 — El cruce',             body: 'Entraste a la semana del cruce. Sin vuelta atrás.' },
  23: { title: '💪 Día 23 — La fuerza real',       body: 'La fuerza real es no negociar con vos mismo. Jamás.' },
  24: { title: '🧘 Día 24 — La presencia',         body: 'Estar presente es el hábito más difícil y el más valioso.' },
  25: { title: '⚡ Día 25 — Quedan 5',              body: '5 días. ¿Quién eras el Día 1? ¿Quién sos hoy?' },
  26: { title: '🔥 Día 26 — La recta final',       body: 'La recta final exige lo mejor. No lo que te queda. Lo mejor.' },
  27: { title: '💡 Día 27 — El legado',            body: '¿Qué hábito de estos 30 días va a quedar para siempre?' },
  28: { title: '🏅 Día 28 — Casi ahí',             body: '2 días. Nadie recuerda al que casi terminó. Vos vas a terminar.' },
  29: { title: '⚡ Día 29 — El último esfuerzo',    body: 'Mañana cruzás el Umbral. Hoy dalo todo.' },
  30: { title: '🏆 Día 30 — EL UMBRAL CRUZADO',    body: '30 días. Lo dijiste. Lo hiciste. Eso es identidad. — Diego Gaitán' },
};

// ─── Mensajes por día — EL DESPERTAR ─────────────────────────
const MENSAJES_DESPERTAR = {
  1:  { title: '🌅 Día 1 — El Despertar comienza',    body: 'El Umbral fue la puerta. Ahora vivís del otro lado.' },
  2:  { title: '🌅 Día 2 — La consciencia',           body: '¿Quién sos cuando nadie mira? Esa es tu identidad real.' },
  3:  { title: '💜 Día 3 — El soltar',                body: 'Lo viejo no se va solo. Hay que decidir soltarlo. Hoy.' },
  4:  { title: '⚡ Día 4 — La profundidad',            body: 'El trabajo superficial da resultados superficiales. Andá más profundo.' },
  5:  { title: '🌟 Día 5 — La expansión',             body: 'Tu zona de confort es el techo. El Despertar te saca del techo.' },
  6:  { title: '💜 Día 6 — La vulnerabilidad',        body: 'La vulnerabilidad no es debilidad. Es el coraje de ser real.' },
  7:  { title: '🏆 Día 7 — Semana 1 del Despertar',   body: '7 días de trabajo profundo. Ya sos diferente al que empezó.' },
  8:  { title: '🌅 Día 8 — Soltar lo viejo',          body: '¿Qué estás cargando que no te pertenece? Hoy identificalo.' },
  9:  { title: '⚡ Día 9 — El peso',                   body: 'Soltar no es perder. Es hacer espacio para lo que sí te sirve.' },
  10: { title: '💡 Día 10 — El nuevo yo',             body: '10 días. El viejo vos ya no puede vivir acá. No hay lugar.' },
  11: { title: '💜 Día 11 — La gratitud',             body: 'La gratitud no es emoción. Es práctica. Escribí 3 cosas hoy.' },
  12: { title: '🌅 Día 12 — El propósito',            body: '¿Para qué hacés todo esto? Esa respuesta es tu combustible.' },
  13: { title: '⚡ Día 13 — La disciplina amorosa',    body: 'Tratate con la misma exigencia que le pedirías a alguien que amás.' },
  14: { title: '🏅 Día 14 — Semana 2 completa',       body: 'Soltaste. Ahora construís. Semana 3 empieza mañana.' },
  15: { title: '🌟 Día 15 — Construir',               body: 'No reparás lo viejo. Creás lo nuevo. Esa es la diferencia.' },
  16: { title: '💜 Día 16 — Los cimientos',           body: 'Los grandes edificios tienen cimientos invisibles. Los tuyos son estos hábitos.' },
  17: { title: '⚡ Día 17 — La visión',                body: '¿Quién sos en 1 año si seguís exactamente este camino? Visualizalo.' },
  18: { title: '🌅 Día 18 — El momentum',             body: 'El momentum no se crea. Se mantiene. Seguí apareciendo.' },
  19: { title: '💡 Día 19 — La coherencia',           body: 'Coherencia es cuando lo que pensás, decís y hacés es lo mismo.' },
  20: { title: '🏆 Día 20 — Sin vuelta atrás',        body: '20 días de El Despertar. Ya no hay vuelta atrás y está bien así.' },
  21: { title: '🌟 Día 21 — Semana 3 completa',       body: 'Construiste algo real. Semana 4: expandirlo al mundo.' },
  22: { title: '🌅 Día 22 — Expandir',                body: 'Lo que construiste adentro ahora se expande afuera. Es tiempo.' },
  23: { title: '💜 Día 23 — El impacto',              body: '¿Qué huella dejás en la gente que te rodea? Eso es liderazgo.' },
  24: { title: '⚡ Día 24 — Presencia total',          body: 'Estar completamente presente es el regalo más grande que podés dar.' },
  25: { title: '💡 Día 25 — El servicio',             body: 'La identidad más poderosa es la que crece y sirve al mismo tiempo.' },
  26: { title: '🌅 Día 26 — La integración',          body: 'Todo lo que aprendiste: ¿cómo lo integrás a tu vida real?' },
  27: { title: '🔥 Día 27 — El legado',               body: '¿Qué de todo esto quedará cuando termines? Ese es tu legado.' },
  28: { title: '⚡ Día 28 — La plenitud',              body: '2 días. No es el final. Es el comienzo del resto de tu vida.' },
  29: { title: '🌟 Día 29 — El último paso',          body: 'Mañana completás El Despertar. Hoy sé completamente vos.' },
  30: { title: '🌅 Día 30 — EL DESPERTAR COMPLETADO', body: '30 días. Cruzaste el umbral y despertaste. Eso no te lo saca nadie. — Diego Gaitán' },
};

// ─── Hábitos diarios fijos ────────────────────────────────────
const HABITOS_DIARIOS = [
  { title: '💧 Hidratación',  body: 'Tomá agua. Tu cuerpo la necesita ahora.',               hour: 9,  minute: 0  },
  { title: '🌞 Grounding',    body: 'Salí al sol unos minutos y conectá con la tierra.',      hour: 11, minute: 0  },
  { title: '✍️ Journaling',   body: 'Es momento de escribir y ordenar tu mente.',             hour: 16, minute: 0  },
  { title: '🧘 Respiración',  body: 'Hacé 5 minutos de respiración consciente ahora.',        hour: 19, minute: 0  },
  { title: '😴 Descanso',     body: 'Desconectá pantallas. Tu cuerpo se regenera durmiendo.', hour: 22, minute: 0  },
];

// ─── Registro permisos y canal Android ───────────────────────
export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: true,
    });
  }
}

// ─── Hábitos diarios fijos (se llama al iniciar la app) ──────
export async function scheduleDailyHabits() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const h of HABITOS_DIARIOS) {
    await Notifications.scheduleNotificationAsync({
      content: { title: h.title, body: h.body, sound: true },
      trigger: { type: 'daily', hour: h.hour, minute: h.minute },
    });
  }
}

// ─── Notificación del próximo día del programa ───────────────
// Llamar desde App.js cuando el usuario completa un día
// programa: 'umbral' | 'despertar'  /  diaActual: 1-30
export async function scheduleProximoDia(programa, diaActual) {
  try {
    // Cancelar notificación de programa previa
    await Notifications.cancelScheduledNotificationAsync('programa-dia').catch(() => {});

    const proximoDia = diaActual + 1;
    if (proximoDia > 30) return; // Programa terminado

    const mensajes = programa === 'despertar' ? MENSAJES_DESPERTAR : MENSAJES_UMBRAL;
    const msg = mensajes[proximoDia];
    if (!msg) return;

    // Disparar mañana a las 8am
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(8, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      identifier: 'programa-dia',
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
        data: { programa, dia: proximoDia },
      },
      trigger: { date: manana },
    });
  } catch (e) {}
}

// ─── Notificación inmediata de bienvenida al programa ────────
export async function notificarInicioProgramma(programa) {
  const titulo = programa === 'despertar' ? 'EL DESPERTAR' : 'EL UMBRAL';
  const emoji  = programa === 'despertar' ? '🌅' : '🔥';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} Arrancaste ${titulo}`,
      body: 'Día 1 desbloqueado. Tu transformación empieza ahora. — Diego Gaitán',
      sound: true,
    },
    trigger: null, // inmediata
  });
}

// ─── Notificación recordatorio si no completó el día ─────────
// Llamar una vez al día para recordar completar el día actual
// programa: 'umbral' | 'despertar'  /  diaActual: 1-30
export async function scheduleRecordatorioDia(programa, diaActual) {
  try {
    await Notifications.cancelScheduledNotificationAsync('recordatorio-dia').catch(() => {});

    const mensajes = programa === 'despertar' ? MENSAJES_DESPERTAR : MENSAJES_UMBRAL;
    const msg = mensajes[diaActual];
    if (!msg) return;

    // Recordatorio a las 20hs si no completó el día
    const hoy = new Date();
    hoy.setHours(20, 0, 0, 0);
    if (hoy < new Date()) return; // Ya pasaron las 20hs de hoy

    await Notifications.scheduleNotificationAsync({
      identifier: 'recordatorio-dia',
      content: {
        title: `⏰ ${msg.title}`,
        body: `Todavía podés completar el día de hoy. ${msg.body}`,
        sound: true,
        data: { programa, dia: diaActual },
      },
      trigger: { date: hoy },
    });
  } catch (e) {}
}

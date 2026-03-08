import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sumarXP } from "../xp";
import { cacheGetJSON, cacheSetJSON, cacheInvalidate } from "../cache";

const HABITS = [
  { key: "alimentacion", label: "Alimentación", icon: "🥩" },
  { key: "hidratacion", label: "Hidratación", icon: "💧" },
  { key: "respiracion", label: "Respiración", icon: "🫁" },
  { key: "meditacion", label: "Meditación", icon: "🧘" },
  { key: "escritura", label: "Escritura", icon: "✍️" },
  { key: "grounding", label: "Grounding + sol", icon: "🌞" },
  { key: "ejercicios", label: "Ejercicios", icon: "🏃" },
];

const WEEKLY_MESSAGES = {
  7: "No llegaste hasta acá por casualidad. Estos 7 días son prueba de que sí podés sostenerte. Tu nueva identidad no se está pensando, se está construyendo.",
  14: "Dos semanas de compromiso cambian más que meses de intención vacía. Lo que estás haciendo no es solo disciplina: es respeto por tu vida.",
  21: "Hoy no sos la misma persona que empezó. Tu cuerpo, tu mente y tu energía ya están entendiendo que llegó una nueva versión de vos.",
  28: "Veintiocho días después, ya no estás improvisando. Estás encarnando una identidad distinta. Lo que sigue no es volver atrás: es expandirte.",
};

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

function getStreak(history) {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDate(d);
    const percent = history?.[key]?.percent || 0;

    if (percent > 0) streak++;
    else break;
  }
  return streak;
}

function getHeatColor(percent) {
  if (percent >= 100) return "#22c55e";
  if (percent >= 70) return "#84cc16";
  if (percent >= 40) return "#c9a84c";
  if (percent > 0) return "#7c5a18";
  return "#1a1a14";
}

function getStreakMessage(streak) {
  if (streak <= 0) {
    return "Toda transformación empieza con una decisión. Hoy puede ser el día en que dejes de negociar con vos.";
  }
  if (streak === 1) {
    return "Hoy no cumpliste un hábito. Diste una señal. Le mostraste a tu mente que esta vez va en serio.";
  }
  if (streak === 2) {
    return "Dos días seguidos ya no son casualidad. Cuando repetís lo correcto, la identidad empieza a moverse.";
  }
  if (streak === 3) {
    return "Ya rompiste la inercia. El cambio empezó a reconocerte porque dejaste de abandonarte tan rápido.";
  }
  if (streak <= 5) {
    return "Estás dejando de depender de la motivación. Lo que aparece ahora es más poderoso: dirección.";
  }
  if (streak <= 7) {
    return "Una semana sosteniéndote no es poca cosa. Esto ya no es entusiasmo: empieza a parecerse a identidad.";
  }
  if (streak <= 10) {
    return "Tu vieja versión pierde fuerza cada vez que vos cumplís aunque no tengas ganas. Ahí nace el verdadero poder.";
  }
  if (streak <= 14) {
    return "Dos semanas de coherencia valen más que meses de promesas vacías. Estás construyendo respeto por vos.";
  }
  if (streak <= 21) {
    return "La disciplina ya está echando raíz. Lo que antes costaba, ahora empieza a sentirse natural.";
  }
  if (streak <= 30) {
    return "No estás acumulando días. Estás consolidando una identidad capaz de sostener lo que antes se caía.";
  }
  return "Tu racha ya no habla de impulso. Habla de quién sos cuando decidís no volver atrás.";
}

function getIdentityLevel(streak) {
  if (streak <= 0) return "Inicio";
  if (streak <= 3) return "Despertando";
  if (streak <= 7) return "En construcción";
  if (streak <= 14) return "Consolidando";
  if (streak <= 21) return "Echando raíz";
  if (streak <= 30) return "Expansión";
  return "Encarnada";
}


// ── Skeleton Progress ─────────────────────────────────────────
function SkeletonPulse({ w, h, r = 8, mt = 0 }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width: w, height: h, borderRadius: r, backgroundColor: '#1e1e18', opacity: anim, marginTop: mt }} />;
}

function ProgressSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0c' }} scrollEnabled={false}>
      <View style={{ backgroundColor: '#1a1508', padding: 24, paddingTop: 56 }}>
        <SkeletonPulse w={80} h={14} r={6} />
        <SkeletonPulse w={200} h={28} r={8} mt={12} />
        <SkeletonPulse w={140} h={14} r={6} mt={8} />
      </View>
      <View style={{ padding: 16, gap: 12 }}>
        <SkeletonPulse w={'100%'} h={90} r={18} />
        <SkeletonPulse w={'100%'} h={200} r={18} />
        {Array.from({ length: 7 }, (_, i) => <SkeletonPulse key={i} w={'100%'} h={56} r={14} />)}
      </View>
    </ScrollView>
  );
}

export default function ProgressScreen({ member, onBack, onLogout }) {
  const firstName = member?.name?.split(" ")[0] || "Vos";
  const memberKey = member?.phone || member?.id || "guest";
  const storageKey = `progress_${memberKey}`;
  const today = useMemo(() => todayKey(), []);
  const xpOtorgadoHoy = React.useRef(false);

  const [checks, setChecks] = useState(
    HABITS.reduce((acc, h) => ({ ...acc, [h.key]: false }), {})
  );
  const [history, setHistory] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg]         = useState('');
  const [toastColor, setToastColor]     = useState('#4ade80');

  const doneCount = Object.values(checks).filter(Boolean).length;
  const percent = Math.round((doneCount / HABITS.length) * 100);
  const streak = getStreak(history);
  const streakMessage = getStreakMessage(streak);
  const identityLevel = getIdentityLevel(streak);

  const challengeDay = useMemo(() => {
    const joinedAt = new Date(member?.joined_at || member?.payment_date || new Date());
    const daysIn = Math.max(1, Math.round((new Date() - joinedAt) / 86400000));
    return Math.min(daysIn, 30);
  }, [member]);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        // Intentar desde caché primero (TTL 2 min para hábitos)
        const cached = await cacheGetJSON(AsyncStorage, storageKey);
        if (cached) {
          if (!alive) return;
          setHistory(cached);
          if (cached?.[today]?.checks) setChecks(cached[today].checks);
          if (alive) setLoaded(true);
          return;
        }
        const raw = await AsyncStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : {};

        if (!alive) return;

        setHistory(parsed);
        await cacheSetJSON(AsyncStorage, storageKey, parsed);

        if (parsed?.[today]?.checks) {
          setChecks(parsed[today].checks);
        }
      } catch (e) {
        console.log("Error loading progress:", e);
      } finally {
        if (alive) setLoaded(true);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [storageKey, today]);

  useEffect(() => {
    if (!loaded) return;

    setHistory((prev) => {
      const updated = {
        ...prev,
        [today]: {
          checks,
          percent,
          updatedAt: new Date().toISOString(),
        },
      };

      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((e) =>
        console.log("Error saving progress:", e)
      );
      cacheInvalidate(storageKey);

      return updated;
    });
  }, [checks, loaded, percent, storageKey, today]);

  useEffect(() => {
    if (!loaded) return;

    if ([7, 14, 21, 28].includes(challengeDay)) {
      const flagKey = `${storageKey}_msg_${challengeDay}`;
      AsyncStorage.getItem(flagKey).then((alreadyShown) => {
        if (!alreadyShown) {
          Alert.alert(`Día ${challengeDay} 🔥`, WEEKLY_MESSAGES[challengeDay]);
          AsyncStorage.setItem(flagKey, "shown");
        }
      });
    }
  }, [loaded, challengeDay, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    if (percent === 100 && !xpOtorgadoHoy.current) {
      xpOtorgadoHoy.current = true;
      sumarXP(memberKey, 'habitos_100', 'Hábitos al 100%').catch(() => {});
      Alert.alert(
        "Día perfecto 🏆 +30 XP",
        "Hoy cumpliste los 7 hábitos de Identidad Atómica. No fue suerte. Fue decisión."
      );
    }
  }, [percent, loaded]);

  function toggle(key) {
    setChecks((prev) => {
      const newChecks = { ...prev, [key]: !prev[key] };
      const done = Object.values(newChecks).filter(Boolean).length;
      const total = HABITS.length;
      if (!prev[key]) {
        // solo mostrar al marcar, no al desmarcar
        if (done === 1) showProgressToast('🌱 Primer hábito del día. El movimiento crea momentum.', '#4ade80');
        else if (done === 2) showProgressToast('⚡ Dos hábitos. Ya sos mejor que ayer.', '#60a5fa');
        else if (done === 3) showProgressToast('🔥 Mitad del camino. Seguí, esto es identidad.', '#f97316');
        else if (done === 4) showProgressToast('💪 4 de 7. Más de la mitad. Sos disciplina.', '#c9a84c');
        else if (done === 5) showProgressToast('⚡ 5 hábitos. Hoy sos una máquina, seguí.', '#a78bfa');
        else if (done === 6) showProgressToast('🏆 Solo falta uno. El último es el más importante.', '#fbbf24');
      }
      return newChecks;
    });
  }

  function showProgressToast(msg, color) {
    setToastMsg(msg);
    setToastColor(color);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setHistory(parsed);
      if (parsed?.[today]?.checks) setChecks(parsed[today].checks);
    } catch(e) {}
    setRefreshing(false);
  }

  const heatDays = getLastNDays(28);

  if (!loaded) return <ProgressSkeleton />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#c9a84c"
          colors={["#c9a84c"]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Mi progreso</Text>
        <Text style={styles.subTitle}>
          {firstName}, hoy {today} vamos por hábitos reales.
        </Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>HOY</Text>
          <Text style={styles.progressBig}>{percent}%</Text>
          <Text style={styles.progressSmall}>
            {doneCount} de {HABITS.length} hábitos completados
          </Text>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statMini}>
            <Text style={styles.statMiniNumber}>{challengeDay}</Text>
            <Text style={styles.statMiniLabel}>Día</Text>
          </View>

          <View style={styles.statMini}>
            <Text style={styles.statMiniNumber}>{streak}</Text>
            <Text style={styles.statMiniLabel}>Racha</Text>
          </View>

          <View style={styles.statMini}>
            <Text style={styles.statMiniNumber}>{identityLevel}</Text>
            <Text style={styles.statMiniLabel}>Identidad</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>🔥 RACHA ACTUAL</Text>
          <Text style={styles.streakNumber}>{streak} días</Text>
          <Text style={styles.streakText}>{streakMessage}</Text>
        </View>

        <Text style={styles.sectionTitle}>Checklist del día</Text>

        {HABITS.map((h) => {
          const ok = checks[h.key];
          return (
            <TouchableOpacity
              key={h.key}
              style={[styles.row, ok && styles.rowActive]}
              onPress={() => toggle(h.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.rowIcon}>{h.icon}</Text>
              <Text style={styles.rowLabel}>{h.label}</Text>
              <Text style={[styles.rowCheck, { color: ok ? "#4ade80" : "#6a5a40" }]}>
                {ok ? "✓" : "○"}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ── TOAST PROGRESO ── */}
        {toastVisible && (
          <View style={[styles.toastBar, { borderColor: toastColor + '60', backgroundColor: toastColor + '15' }]}>
            <Text style={[styles.toastText, { color: toastColor }]}>{toastMsg}</Text>
          </View>
        )}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>IDENTIDAD</Text>
          <Text style={styles.quoteText}>
            Tu identidad no cambia en un día. Cambia cuando repetís acciones correctas hasta que se vuelven quien sos.
          </Text>
          <Text style={styles.quoteAuthor}>— Diego Gaitán</Text>
        </View>

        <Text style={styles.sectionTitle}>Mapa de disciplina</Text>
        <Text style={styles.mapSub}>Últimos 28 días</Text>

        <View style={styles.heatmap}>
          {heatDays.map((day) => {
            const p = history?.[day]?.percent || 0;
            return (
              <View
                key={day}
                style={[styles.heatCell, { backgroundColor: getHeatColor(p) }]}
              />
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <Text style={styles.legendText}>0%</Text>
          <View style={[styles.legendBox, { backgroundColor: "#1a1a14" }]} />
          <View style={[styles.legendBox, { backgroundColor: "#7c5a18" }]} />
          <View style={[styles.legendBox, { backgroundColor: "#c9a84c" }]} />
          <View style={[styles.legendBox, { backgroundColor: "#84cc16" }]} />
          <View style={[styles.legendBox, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.legendText}>100%</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0c" },

  header: {
    backgroundColor: "#1a1508",
    padding: 24,
    paddingTop: 56,
    paddingBottom: 18,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "#2a2010",
  },

  backText: {
    color: "#c9a84c",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  logoutBtn: { padding: 8 },
  logoutText: { color: "#4a3a20", fontSize: 13 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f0e6c8",
    marginBottom: 6,
  },

  subTitle: {
    fontSize: 13,
    color: "#6a5a40",
    lineHeight: 18,
  },

  progressCard: {
    marginTop: 16,
    backgroundColor: "#13120f",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
  },

  progressLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c9a84c",
    marginBottom: 10,
  },

  progressBig: {
    fontSize: 40,
    fontWeight: "900",
    color: "#f0e6c8",
    marginBottom: 6,
  },

  progressSmall: {
    fontSize: 12,
    color: "#6a5a40",
    marginBottom: 12,
  },

  progressBg: {
    backgroundColor: "#1e1e18",
    borderRadius: 10,
    height: 12,
  },

  progressFill: {
    backgroundColor: "#c9a84c",
    borderRadius: 10,
    height: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  statMini: {
    flex: 1,
    backgroundColor: "#13120f",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2010",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 86,
  },

  statMiniNumber: {
    color: "#f0e6c8",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },

  statMiniLabel: {
    color: "#8a7a60",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },

  body: { padding: 16 },

  streakCard: {
    backgroundColor: "#13120f",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.22)",
    marginBottom: 20,
  },

  streakLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c9a84c",
    marginBottom: 10,
  },

  streakNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#f0e6c8",
    marginBottom: 10,
  },

  streakText: {
    color: "#e8e0d0",
    fontSize: 15,
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8a7a60",
    marginBottom: 12,
    letterSpacing: 1,
  },

  mapSub: {
    color: "#6a5a40",
    marginBottom: 12,
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13120f",
    borderWidth: 1,
    borderColor: "#2a2010",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  rowActive: {
    borderColor: "rgba(74,222,128,0.35)",
  },

  rowIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  rowLabel: {
    flex: 1,
    color: "#e8e0d0",
    fontSize: 15,
    fontWeight: "700",
  },

  rowCheck: {
    fontSize: 18,
    fontWeight: "900",
  },

  toastBar: {
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 12,
    alignItems: 'center',
  },
  toastText: { fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 20 },
  quoteCard: {
    marginTop: 12,
    marginBottom: 22,
    backgroundColor: "#13120f",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
  },

  quoteTitle: {
    color: "#c9a84c",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
  },

  quoteText: {
    color: "#e8e0d0",
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 10,
  },

  quoteAuthor: {
    color: "#6a5a40",
    fontSize: 12,
  },

  heatmap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },

  heatCell: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a2010",
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },

  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },

  legendText: {
    color: "#6a5a40",
    fontSize: 11,
  },
});
import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const TOTAL_DIAS = 30;

function getIdentityLevel(streak) {
  if (streak <= 0) return "Inicio";
  if (streak <= 3) return "Despertando";
  if (streak <= 7) return "En construcción";
  if (streak <= 14) return "Consolidando";
  if (streak <= 21) return "Echando raíz";
  if (streak <= 30) return "Expansión";
  return "Encarnada";
}

function getIdentityTitle(streak) {
  if (streak <= 0) return "Todo empieza con una decisión";
  if (streak <= 3) return "Rompiste la inercia";
  if (streak <= 7) return "Ya no es casualidad";
  if (streak <= 14) return "Tu identidad está cambiando";
  if (streak <= 21) return "La disciplina está echando raíz";
  if (streak <= 30) return "Estás encarnando una nueva versión";
  return "Tu identidad ya no mira atrás";
}

function getIdentityMessage(streak) {
  if (streak <= 0) {
    return "Tu identidad no cambia cuando lo pensás. Cambia cuando dejás de negociar con vos y empezás a cumplirte.";
  }
  if (streak <= 3) {
    return "Los primeros días son una señal. Le estás mostrando a tu mente que esta vez no vas a abandonarte tan rápido.";
  }
  if (streak <= 7) {
    return "Una semana sosteniéndote ya no es motivación. Empieza a parecerse a una identidad que quiere quedarse.";
  }
  if (streak <= 14) {
    return "Dos semanas de coherencia cambian más que meses de intención vacía. Te estás volviendo alguien que cumple.";
  }
  if (streak <= 21) {
    return "Lo que antes costaba ahora empieza a echar raíz. La disciplina deja de ser esfuerzo y empieza a volverse parte de vos.";
  }
  if (streak <= 30) {
    return "No estás acumulando días. Estás consolidando una versión capaz de sostener lo que antes siempre se caía.";
  }
  return "Ya no se trata de empezar. Se trata de honrar a la persona en la que te convertiste.";
}

const DAY_TITLES = {
  1: "Decisión",
  2: "Orden",
  3: "Disciplina",
  4: "Identidad",
  5: "Energía",
  6: "Dominio",
  7: "Consolidación",
  8: "Reenfoque interno",
  9: "Limpieza emocional",
  10: "Ayuno consciente",
  11: "Estabilidad y foco",
  12: "Carnívoro estratégico",
  13: "Reconstrucción",
  14: "Compromiso",
  15: "Renacer interno",
  16: "Poder total",
  17: "Enfoque y dirección",
  18: "Ketotariano liviano",
  19: "Carnívoro en foco",
  20: "Ayuno 16 horas",
  21: "Cierre de ciclo",
  22: "Claridad",
  23: "Conciencia",
  24: "Reset carnívoro",
  25: "Construcción",
  26: "Cetosis profunda",
  27: "Expansión",
  28: "Integración",
  29: "Ayuno profundo",
  30: "Renacimiento",
};

export default function IdentityScreen({
  member,
  umbralStartedAt,
  umbralCompletedDays = [],
  habitStreak = 0,
  onBack,
  onOpenUmbral,
  onOpenProgress,
}) {
  const firstName = member?.name?.split(" ")[0] || "Vos";
  const completedCount = Array.isArray(umbralCompletedDays) ? umbralCompletedDays.length : 0;

  const diaActualUmbral = useMemo(() => {
    if (!umbralStartedAt) return 1;
    const inicio = new Date(umbralStartedAt);
    const hoy = new Date();
    const diff = Math.floor((hoy - inicio) / 86400000);
    return Math.max(1, Math.min(TOTAL_DIAS, diff + 1));
  }, [umbralStartedAt]);

  const progresoUmbral = Math.round((completedCount / TOTAL_DIAS) * 100);
  const identityLevel = getIdentityLevel(habitStreak);
  const identityTitle = getIdentityTitle(habitStreak);
  const identityMessage = getIdentityMessage(habitStreak);
  const todayFocus = DAY_TITLES[diaActualUmbral] || "Identidad Atómica";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Identidad Atómica</Text>
        <Text style={styles.subTitle}>Tu centro. Tu dirección. Tu nueva versión.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>🧬 IDENTIDAD</Text>
          <Text style={styles.heroTitle}>{identityTitle}</Text>
          <Text style={styles.heroText}>
            {firstName}, {identityMessage}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{habitStreak}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{identityLevel}</Text>
            <Text style={styles.statLabel}>Nivel</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}/{TOTAL_DIAS}</Text>
            <Text style={styles.statLabel}>Umbral</Text>
          </View>
        </View>

        <View style={styles.focusCard}>
          <Text style={styles.focusLabel}>HOY TE TOCA</Text>
          <Text style={styles.focusTitle}>Día {diaActualUmbral} — {todayFocus}</Text>
          <Text style={styles.focusText}>
            La identidad no se cambia pensando en los 30 días. Se cambia sosteniendo el de hoy.
          </Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progresoUmbral}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progresoUmbral}% completado · {completedCount}/{TOTAL_DIAS} días
            </Text>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>FRASE DE PODER</Text>
          <Text style={styles.quoteText}>
            Tu identidad no cambia en un día.
            Cambia cuando repetís acciones correctas
            hasta que se vuelven quien sos.
          </Text>
          <Text style={styles.quoteAuthor}>— Diego Gaitán</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onOpenUmbral} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Entrar a EL UMBRAL →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenProgress} activeOpacity={0.9}>
          <Text style={styles.secondaryBtnText}>Ver mi progreso →</Text>
        </TouchableOpacity>

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
  },

  backBtn: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "#2a2010",
    alignSelf: "flex-start",
  },

  backText: {
    color: "#c9a84c",
    fontWeight: "800",
    fontSize: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#f0e6c8",
    marginBottom: 4,
  },

  subTitle: {
    fontSize: 13,
    color: "#6a5a40",
  },

  body: {
    padding: 16,
  },

  heroCard: {
    backgroundColor: "#13120f",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    marginBottom: 16,
  },

  heroLabel: {
    fontSize: 10,
    letterSpacing: 4,
    color: "#c9a84c",
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 25,
    lineHeight: 34,
    fontWeight: "900",
    color: "#f0e6c8",
    marginBottom: 12,
  },

  heroText: {
    fontSize: 15,
    color: "#e8e0d0",
    lineHeight: 26,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#13120f",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2010",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 92,
  },

  statNumber: {
    color: "#f0e6c8",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },

  statLabel: {
    color: "#8a7a60",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },

  focusCard: {
    backgroundColor: "#13120f",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    marginBottom: 16,
  },

  focusLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c9a84c",
    marginBottom: 10,
  },

  focusTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#f0e6c8",
    marginBottom: 10,
  },

  focusText: {
    fontSize: 14,
    color: "#e8e0d0",
    lineHeight: 24,
    marginBottom: 14,
  },

  progressWrap: {
    marginTop: 2,
  },

  progressBg: {
    backgroundColor: "#1e1e18",
    borderRadius: 10,
    height: 10,
    marginBottom: 8,
  },

  progressFill: {
    backgroundColor: "#c9a84c",
    borderRadius: 10,
    height: 10,
  },

  progressText: {
    fontSize: 12,
    color: "#8a7a60",
  },

  quoteCard: {
    backgroundColor: "#13120f",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.18)",
    marginBottom: 16,
  },

  quoteLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c9a84c",
    marginBottom: 12,
  },

  quoteText: {
    fontSize: 18,
    lineHeight: 30,
    color: "#f0e6c8",
    fontWeight: "700",
    marginBottom: 10,
  },

  quoteAuthor: {
    fontSize: 12,
    color: "#6a5a40",
  },

  primaryBtn: {
    backgroundColor: "#c9a84c",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryBtnText: {
    color: "#0a0a0c",
    fontWeight: "900",
    fontSize: 15,
  },

  secondaryBtn: {
    backgroundColor: "#13120f",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2010",
  },

  secondaryBtnText: {
    color: "#f0e6c8",
    fontWeight: "800",
    fontSize: 15,
  },
});
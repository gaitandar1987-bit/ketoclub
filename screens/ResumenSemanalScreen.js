import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width: SW } = Dimensions.get('window');

// ─── Mensajes por semana ───────────────────────────────────────
const MENSAJES = {
  1: {
    titulo:  "Semana 1 completada 🔥",
    sub:     "Arrancaste. Eso ya es más de lo que hace el 90%.",
    cuerpo:  "Los primeros 7 días son los más difíciles. Tu cuerpo se adaptó, tu mente resistió. Lo que sentís ahora — ese pequeño orgullo silencioso — es la base de todo lo que viene.",
    color:   '#c9a84c',
    emoji:   '⚡',
  },
  2: {
    titulo:  "Semana 2 completada 💎",
    sub:     "Dos semanas de compromiso valen más que meses de intención.",
    cuerpo:  "Ya no estás probando si podés. Ya sabés que podés. Lo que estás construyendo ahora no es solo disciplina — es respeto por tu vida.",
    color:   '#a78bfa',
    emoji:   '🔱',
  },
  3: {
    titulo:  "Semana 3 completada 🌅",
    sub:     "Hoy no sos la misma persona que empezó.",
    cuerpo:  "21 días después, tu cerebro ya empezó a recablear los hábitos. No estás improvisando. Estás construyendo una identidad distinta desde adentro.",
    color:   '#4ade80',
    emoji:   '🌱',
  },
  4: {
    titulo:  "Semana 4 completada 👑",
    sub:     "La línea de llegada está a la vista.",
    cuerpo:  "28 días de elegirte. Lo que aprendiste sobre vos este mes no lo podés desaprender. Estás a días de cruzar el umbral. No pares ahora.",
    color:   '#fbbf24',
    emoji:   '👑',
  },
};

// ─── Barra mini hábitos ────────────────────────────────────────
function BarraHabito({ label, pct, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct / 100, duration: 800, delay: 300, useNativeDriver: false }).start();
  }, []);
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.bg}>
        <Animated.View style={[barStyles.fill, {
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: color,
        }]} />
      </View>
      <Text style={[barStyles.pct, { color }]}>{pct}%</Text>
    </View>
  );
}
const barStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  label: { fontSize: 12, color: '#8a7a60', width: 90 },
  bg:    { flex: 1, backgroundColor: '#1e1e18', borderRadius: 6, height: 8, overflow: 'hidden' },
  fill:  { height: 8, borderRadius: 6 },
  pct:   { fontSize: 11, fontWeight: '900', width: 36, textAlign: 'right' },
});

// ─── Componente principal ──────────────────────────────────────
export default function ResumenSemanalScreen({
  member,
  semana,               // 1, 2, 3 o 4
  programa,             // 'umbral' | 'despertar'
  completedDays = [],
  startedAtISO,
  onContinuar,
}) {
  const memberKey = member?.phone || member?.id || 'guest';
  const color     = MENSAJES[semana]?.color || '#c9a84c';
  const msg       = MENSAJES[semana] || MENSAJES[1];

  // ── Animaciones de entrada ───────────────────────────────────
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const slideIn   = useRef(new Animated.Value(40)).current;
  const scaleIcon = useRef(new Animated.Value(0.5)).current;

  // ── Stats de la semana ───────────────────────────────────────
  const [statsHabitos, setStatsHabitos] = useState(null);
  const [statsSueno,   setStatsSueno]   = useState(0);
  const [statsAyuno,   setStatsAyuno]   = useState(0);
  const [statsPasos,   setStatsPasos]   = useState(0);

  const diaInicio = (semana - 1) * 7 + 1;
  const diaFin    = semana * 7;
  const diasSemana = completedDays.filter(d => d >= diaInicio && d <= diaFin).length;
  const pctPrograma = Math.round((diasSemana / 7) * 100);

  useEffect(() => {
    // Animación entrada
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideIn, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleIcon, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
    cargarStats();
  }, []);

  async function cargarStats() {
    try {
      // Calcular rango de fechas de la semana
      const start = new Date(startedAtISO);
      const dias  = [];
      for (let i = diaInicio - 1; i < diaFin; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        dias.push(key);
      }

      const [rawHabitos, rawSueno, rawAyuno, rawPasos] = await Promise.all([
        AsyncStorage.getItem(`progress_${memberKey}`),
        AsyncStorage.getItem(`sueno_${memberKey}`),
        AsyncStorage.getItem(`ayuno_historial_${memberKey}`),
        AsyncStorage.getItem(`pasos_${memberKey}`),
      ]);

      const habitos = rawHabitos ? JSON.parse(rawHabitos) : {};
      const sueno   = rawSueno   ? JSON.parse(rawSueno)   : {};
      const ayuno   = rawAyuno   ? JSON.parse(rawAyuno)   : {};
      const pasos   = rawPasos   ? JSON.parse(rawPasos)   : {};

      // Promedio hábitos semana
      const pctHabitos = dias.reduce((acc, k) => acc + (habitos[k]?.percent || 0), 0) / 7;

      // Días con sueño ≥7h
      const diasSueno = dias.filter(k => (sueno[k]?.horas || 0) >= 7).length;

      // Días con ayuno
      const diasAyuno = dias.filter(k => !!ayuno[k]).length;

      // Días con ≥5000 pasos
      const diasPasos = dias.filter(k => (pasos[k] || 0) >= 5000).length;

      setStatsHabitos(Math.round(pctHabitos));
      setStatsSueno(diasSueno);
      setStatsAyuno(diasAyuno);
      setStatsPasos(diasPasos);
    } catch(e) {}
  }

  async function handleContinuar() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Marcar este resumen como visto
    await AsyncStorage.setItem(`resumen_semana_${semana}_${memberKey}`, 'visto');
    onContinuar?.();
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Fondo glow ── */}
        <View style={[styles.bgGlow, { backgroundColor: color + '15' }]} />

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideIn }] }}>

          {/* ── Icono central ── */}
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleIcon }] }]}>
            <View style={[styles.iconCircle, { borderColor: color + '60', backgroundColor: color + '20' }]}>
              <Text style={styles.iconEmoji}>{msg.emoji}</Text>
            </View>
            <View style={[styles.iconRing, { borderColor: color + '25' }]} />
          </Animated.View>

          {/* ── Semana chip ── */}
          <View style={[styles.semanaChip, { backgroundColor: color + '20', borderColor: color + '50' }]}>
            <Text style={[styles.semanaChipTxt, { color }]}>
              SEMANA {semana} · {programa === 'despertar' ? 'EL DESPERTAR' : 'EL UMBRAL'}
            </Text>
          </View>

          {/* ── Título ── */}
          <Text style={[styles.titulo, { color }]}>{msg.titulo}</Text>
          <Text style={styles.sub}>{msg.sub}</Text>

          {/* ── Cuerpo motivacional ── */}
          <View style={[styles.cuerpoCard, { borderColor: color + '30' }]}>
            <Text style={styles.cuerpoTxt}>{msg.cuerpo}</Text>
            <Text style={styles.cuerpoAutor}>— Diego Gaitán</Text>
          </View>

          {/* ── Stats de la semana ── */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 TU SEMANA EN NÚMEROS</Text>

            {/* Días del programa */}
            <View style={[styles.diaProgCard, { borderColor: color + '40', backgroundColor: color + '08' }]}>
              <Text style={[styles.diaProgNum, { color }]}>{diasSemana}/7</Text>
              <Text style={styles.diaProgLabel}>días del programa completados</Text>
              <View style={styles.diaProgBarBg}>
                <View style={[styles.diaProgBarFill, { width: `${pctPrograma}%`, backgroundColor: color }]} />
              </View>
            </View>

            {/* Stats protocolo */}
            <View style={styles.protocoloGrid}>
              {[
                { emoji: '🌙', label: 'Noches ≥7h', val: statsSueno, total: 7, color: '#a78bfa' },
                { emoji: '⏱️', label: 'Días ayuno',  val: statsAyuno, total: 7, color: '#fb923c' },
                { emoji: '👣', label: 'Días pasos',  val: statsPasos, total: 7, color: '#4ade80' },
              ].map((s, i) => (
                <View key={i} style={[styles.protocoloItem, { borderColor: s.color + '30' }]}>
                  <Text style={styles.protocoloEmoji}>{s.emoji}</Text>
                  <Text style={[styles.protocoloNum, { color: s.val > 0 ? s.color : '#2a2010' }]}>
                    {s.val}/{s.total}
                  </Text>
                  <Text style={styles.protocoloLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Hábitos barra */}
            {statsHabitos !== null && (
              <View style={styles.habitosBarra}>
                <BarraHabito
                  label="⚡ Hábitos"
                  pct={statsHabitos}
                  color={color}
                />
              </View>
            )}
          </View>

          {/* ── Mensaje de empuje ── */}
          {semana < 4 && (
            <View style={[styles.empujeCard, { borderColor: color + '30' }]}>
              <Text style={[styles.empujeTitulo, { color }]}>
                Semana {semana + 1}: {['', 'La Adaptación', 'La Consolidación', 'El Cruce', ''][semana]}
              </Text>
              <Text style={styles.empujeSub}>
                {semana === 1 && 'Tu cuerpo ya adaptó. Ahora viene la profundización.'}
                {semana === 2 && 'Los hábitos se consolidan. El cambio se vuelve permanente.'}
                {semana === 3 && 'La recta final. Cruzá el límite que te tenías puesto.'}
              </Text>
            </View>
          )}

          {semana === 4 && (
            <View style={[styles.empujeCard, { borderColor: '#fbbf24' + '50', backgroundColor: '#fbbf24' + '08' }]}>
              <Text style={[styles.empujeTitulo, { color: '#fbbf24' }]}>🏆 A días del cierre</Text>
              <Text style={styles.empujeSub}>
                Completaste las 4 semanas. Los últimos días son los más importantes. No pares ahora.
              </Text>
            </View>
          )}

          {/* ── Botón continuar ── */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color, shadowColor: color }]}
            onPress={handleContinuar}
            activeOpacity={0.88}
          >
            <Text style={styles.btnTxt}>
              {semana < 4 ? `Seguir a la semana ${semana + 1} →` : '¡Cerrar y seguir adelante! 🔥'}
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0a0a0c' },
  scroll:          { padding: 24, paddingTop: 64, paddingBottom: 60 },
  bgGlow:          { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },

  iconWrap:        { alignItems: 'center', marginBottom: 24, position: 'relative' },
  iconCircle:      { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  iconEmoji:       { fontSize: 54 },
  iconRing:        { position: 'absolute', width: 148, height: 148, borderRadius: 74, borderWidth: 1 },

  semanaChip:      { alignSelf: 'center', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  semanaChipTxt:   { fontSize: 10, fontWeight: '900', letterSpacing: 2 },

  titulo:          { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8, lineHeight: 36 },
  sub:             { fontSize: 15, color: '#8a7a60', textAlign: 'center', marginBottom: 24, lineHeight: 24 },

  cuerpoCard:      { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 20 },
  cuerpoTxt:       { fontSize: 15, color: '#e8e0d0', lineHeight: 26, fontStyle: 'italic', marginBottom: 12 },
  cuerpoAutor:     { fontSize: 12, color: '#6a5a40' },

  statsCard:       { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', marginBottom: 16 },
  statsTitle:      { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 16 },

  diaProgCard:     { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', marginBottom: 16 },
  diaProgNum:      { fontSize: 36, fontWeight: '900', marginBottom: 4 },
  diaProgLabel:    { fontSize: 12, color: '#6a5a40', marginBottom: 10 },
  diaProgBarBg:    { width: '100%', backgroundColor: '#1e1e18', borderRadius: 6, height: 8, overflow: 'hidden' },
  diaProgBarFill:  { height: 8, borderRadius: 6 },

  protocoloGrid:   { flexDirection: 'row', gap: 8, marginBottom: 16 },
  protocoloItem:   { flex: 1, backgroundColor: '#0a0a0c', borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  protocoloEmoji:  { fontSize: 20 },
  protocoloNum:    { fontSize: 18, fontWeight: '900' },
  protocoloLabel:  { fontSize: 9, color: '#4a3a20', fontWeight: '700', textAlign: 'center' },

  habitosBarra:    { marginTop: 4 },

  empujeCard:      { backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 20 },
  empujeTitulo:    { fontSize: 14, fontWeight: '900', marginBottom: 6 },
  empujeSub:       { fontSize: 13, color: '#6a5a40', lineHeight: 20 },

  btn:             { borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  btnTxt:          { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
});

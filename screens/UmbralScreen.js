import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const TOTAL = 30;
const COLOR = '#c9a84c';

const SEMANAS = [
  { numero: 1, nombre: 'EL ARRANQUE',      dias: '1–7',   color: '#c9a84c', desc: 'Empezá desde donde estás. Sin excusas.' },
  { numero: 2, nombre: 'LA ADAPTACIÓN',    dias: '8–14',  color: '#f97316', desc: 'Tu cuerpo aprende. Tu mente sigue.' },
  { numero: 3, nombre: 'LA CONSOLIDACIÓN', dias: '15–21', color: '#4ade80', desc: 'Los hábitos dejan de ser esfuerzo.' },
  { numero: 4, nombre: 'EL CRUCE',         dias: '22–30', color: '#60a5fa', desc: 'Cruzás el umbral. Sin vuelta atrás.' },
];

function PulsingDot({ color = COLOR, size = 8, delay = 0 }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: anim,
    }} />
  );
}

export default function UmbralScreen({
  member, startedAtISO, completedDays = [],
  onBack, onOpenDays, onOpenProgress, onOpenCommunity,
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const completados   = Array.isArray(completedDays) ? completedDays.length : 0;
  const progress      = completados / TOTAL;
  const diaActual     = startedAtISO
    ? Math.max(1, Math.min(TOTAL, Math.floor((Date.now() - new Date(startedAtISO)) / 86400000) + 1))
    : 1;
  const semanaActual  = Math.ceil(diaActual / 7);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.headerDots}>
            <PulsingDot color={COLOR} size={5} delay={0} />
            <PulsingDot color={COLOR} size={4} delay={250} />
            <PulsingDot color={COLOR} size={5} delay={500} />
          </View>
          <Text style={styles.headerSobre}>IDENTIDAD ATÓMICA · MES 1</Text>
          <Text style={styles.headerTitulo}>EL UMBRAL</Text>
          <Text style={styles.headerSub}>
            El Umbral te forja.{'\n'}
            30 días para demostrar que tu palabra tiene peso.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.body}>

        {/* ── STATS ── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          {[
            { valor: diaActual,                          label: 'Día actual'  },
            { valor: completados,                        label: 'Completados' },
            { valor: `${Math.round(progress * 100)}%`,  label: 'Progreso'    },
            { valor: semanaActual,                       label: 'Semana'      },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValor}>{s.valor}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── BARRA PROGRESO ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressLabel}>PROGRESO TOTAL</Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBg}>
            <Animated.View style={[
              styles.progressFill,
              { width: `${progress * 100}%`, opacity: fadeAnim },
            ]} />
          </View>
          <Text style={styles.progressSub}>{completados} de 30 días completados</Text>
        </View>

        {/* ── SEMANAS ── */}
        <Text style={styles.sectionTitle}>Las 4 semanas</Text>
        <View style={styles.semanasGrid}>
          {SEMANAS.map((s) => {
            const estaActual = semanaActual === s.numero;
            const completada = semanaActual > s.numero;
            return (
              <View key={s.numero} style={[
                styles.semanaCard,
                { borderColor: s.color + (estaActual ? '60' : '25') },
                estaActual && { backgroundColor: s.color + '10' },
              ]}>
                {completada && (
                  <View style={[styles.semanaCheckBadge, { backgroundColor: s.color + '20', borderColor: s.color + '40' }]}>
                    <Text style={[styles.semanaCheckTxt, { color: s.color }]}>✓</Text>
                  </View>
                )}
                {estaActual && (
                  <View style={[styles.semanaActivaBadge, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}>
                    <Text style={[styles.semanaActivaTxt, { color: s.color }]}>AHORA</Text>
                  </View>
                )}
                <Text style={[styles.semanaNumero, { color: s.color }]}>S{s.numero}</Text>
                <Text style={[styles.semanaNombre, { color: estaActual ? s.color : '#8a7a60' }]}>{s.nombre}</Text>
                <Text style={styles.semanaDias}>Días {s.dias}</Text>
                <Text style={styles.semanaDesc}>{s.desc}</Text>
              </View>
            );
          })}
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => onOpenDays?.(startedAtISO || new Date().toISOString())}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaBtnTxt}>🔥  Ver los 30 días  →</Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => onOpenProgress?.()} style={styles.linkBtn} activeOpacity={0.8}>
            <Text style={styles.linkTxt}>📊 Ver progreso →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onOpenCommunity?.()} style={styles.linkBtn} activeOpacity={0.8}>
            <Text style={styles.linkTxt}>💬 Comunidad →</Text>
          </TouchableOpacity>
        </View>

        {/* ── MANIFIESTO ── */}
        <View style={styles.manifiestoCard}>
          <Text style={styles.manifiestoLabel}>📜 MANIFIESTO DEL UMBRAL</Text>
          <Text style={styles.manifiestoTxt}>
            {'"Ya demostraste que tu palabra tiene peso.\nAhora no se trata de probar nada.\nSe trata de cruzar.\n\nEl Umbral no es un programa.\nEs el primer acto de elegirte a vos mismo."'}
          </Text>
          <Text style={styles.manifiestoAutor}>— Diego Gaitán</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0c' },
  header:             { backgroundColor: '#130f0a', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)' },
  backBtn:            { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 20 },
  backTxt:            { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerDots:         { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 14 },
  headerSobre:        { fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  headerTitulo:       { fontSize: 44, fontWeight: '900', color: '#c9a84c', letterSpacing: 2, marginBottom: 10 },
  headerSub:          { fontSize: 14, color: '#8a7a60', lineHeight: 22 },
  body:               { padding: 16 },
  statsRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox:            { flex: 1, backgroundColor: '#13120f', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  statValor:          { fontSize: 22, fontWeight: '900', color: '#c9a84c', marginBottom: 2 },
  statLabel:          { fontSize: 9, color: '#6a5a40', fontWeight: '700', letterSpacing: 1 },
  progressCard:       { backgroundColor: '#13120f', borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.3)', marginBottom: 24 },
  progressTopRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel:      { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2 },
  progressPct:        { fontSize: 14, color: '#c9a84c', fontWeight: '900' },
  progressBg:         { backgroundColor: '#1e1e18', borderRadius: 8, height: 10, marginBottom: 8 },
  progressFill:       { backgroundColor: '#c9a84c', borderRadius: 8, height: 10, shadowColor: '#c9a84c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6 },
  progressSub:        { fontSize: 12, color: '#6a5a40' },
  sectionTitle:       { fontSize: 11, fontWeight: '900', color: '#6a5a40', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  semanasGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  semanaCard:         { width: '47.5%', backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, padding: 14, position: 'relative', overflow: 'hidden' },
  semanaCheckBadge:   { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  semanaCheckTxt:     { fontSize: 11, fontWeight: '900' },
  semanaActivaBadge:  { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  semanaActivaTxt:    { fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  semanaNumero:       { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  semanaNombre:       { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  semanaDias:         { fontSize: 10, color: '#4a3a20', marginBottom: 6, fontWeight: '700' },
  semanaDesc:         { fontSize: 11, color: '#6a5a40', lineHeight: 16 },
  ctaBtn:             { backgroundColor: '#c9a84c', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#c9a84c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  ctaBtnTxt:          { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
  linksRow:           { flexDirection: 'row', gap: 10, marginBottom: 20 },
  linkBtn:            { flex: 1, backgroundColor: '#13120f', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  linkTxt:            { color: '#c9a84c', fontSize: 12, fontWeight: '800' },
  manifiestoCard:     { backgroundColor: '#13120f', borderRadius: 18, padding: 22, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.3)' },
  manifiestoLabel:    { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 14 },
  manifiestoTxt:      { fontSize: 15, color: '#c8bfa8', lineHeight: 26, fontStyle: 'italic', marginBottom: 12 },
  manifiestoAutor:    { fontSize: 12, color: '#6a5a40', fontWeight: '600' },
});

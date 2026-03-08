import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const SEMANAS = [
  { nombre: 'Despertar', color: '#a78bfa', dias: 7,  inicio: 1,  desc: 'Reconocé quién sos' },
  { nombre: 'Soltar',    color: '#60a5fa', dias: 7,  inicio: 8,  desc: 'Liberá lo viejo' },
  { nombre: 'Construir', color: '#4ade80', dias: 7,  inicio: 15, desc: 'Creá lo nuevo' },
  { nombre: 'Expandir',  color: '#fbbf24', dias: 9,  inicio: 22, desc: 'Vivilo de verdad' },
];

const COLOR = '#a78bfa';

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

export default function DespertarScreen({ completedDays = [], startedAtISO, onBack, onOpenDays }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fadeStats    = useRef(new Animated.Value(0)).current;
  const slideStats   = useRef(new Animated.Value(20)).current;
  const fadeSemanas  = useRef(new Animated.Value(0)).current;
  const slideSemanas = useRef(new Animated.Value(20)).current;
  const fadeInfo     = useRef(new Animated.Value(0)).current;
  const slideInfo    = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeStats,  { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(slideStats, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeSemanas,  { toValue: 1, duration: 600, delay: 360, useNativeDriver: true }),
      Animated.timing(slideSemanas, { toValue: 0, duration: 600, delay: 360, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeInfo,  { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }),
      Animated.timing(slideInfo, { toValue: 0, duration: 600, delay: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const completados = Array.isArray(completedDays) ? completedDays.length : 0;
  const progress    = completados / 30;
  const diaActual   = startedAtISO
    ? Math.max(1, Math.min(30, Math.floor((Date.now() - new Date(startedAtISO)) / 86400000) + 1))
    : 1;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
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
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeTxt}>🌅 MES 2</Text></View>
            <View style={styles.badge}><Text style={styles.badgeTxt}>30 DÍAS</Text></View>
          </View>
          <Text style={styles.headerSobre}>IDENTIDAD ATÓMICA · MES 2</Text>
          <Text style={styles.headerTitulo}>EL DESPERTAR</Text>
          <Text style={styles.headerSub}>
            La evolución después del Umbral.{'\n'}
            El siguiente nivel de tu transformación.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.body}>

        {/* STATS */}
        <Animated.View style={[styles.statsRow, { opacity: fadeStats, transform: [{ translateY: slideStats }] }]}>
          {[
            { valor: `${diaActual}`,                    label: 'Día actual'  },
            { valor: `${completados}`,                  label: 'Completados' },
            { valor: `${Math.round(progress * 100)}%`, label: 'Progreso'    },
            { valor: Math.ceil(diaActual / 7),          label: 'Semana'      },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValor}>{s.valor}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* PROGRESO */}
        <Animated.View style={{ opacity: fadeStats, transform: [{ translateY: slideStats }] }}>
          <View style={styles.progressCard}>
            <View style={styles.progressTopRow}>
              <Text style={styles.progressLabel}>PROGRESO TOTAL</Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressSub}>{completados} de 30 días completados</Text>
          </View>
        </Animated.View>

        {/* SEMANAS */}
        <Animated.View style={{ opacity: fadeSemanas, transform: [{ translateY: slideSemanas }] }}>
          <Text style={styles.sectionTitle}>Las 4 semanas</Text>
          {SEMANAS.map((s, i) => {
            const diasSemana        = Array.from({ length: s.dias }, (_, j) => s.inicio + j);
            const completadosSemana = diasSemana.filter(d => (completedDays || []).includes(d)).length;
            const semanaActualIdx   = Math.ceil(diaActual / 7) - 1;
            const estaActual        = semanaActualIdx === i;
            return (
              <View key={i} style={[styles.semanaCard, {
                borderColor: s.color + (estaActual ? '60' : '30'),
                backgroundColor: estaActual ? s.color + '0d' : '#13120f',
              }]}>
                {estaActual && (
                  <View style={[styles.semanaActivaBadge, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}>
                    <Text style={[styles.semanaActivaTxt, { color: s.color }]}>AHORA</Text>
                  </View>
                )}
                <View style={styles.semanaInner}>
                  <View style={[styles.semanaNum, { backgroundColor: s.color + '20', borderColor: s.color + '40' }]}>
                    <Text style={[styles.semanaNumTxt, { color: s.color }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.semanaNombre, { color: estaActual ? s.color : '#8a7a60' }]}>{s.nombre}</Text>
                    <Text style={styles.semanaDesc}>{s.desc}</Text>
                    <Text style={styles.semanaDias}>Días {s.inicio}–{s.inicio + s.dias - 1}</Text>
                    <View style={styles.semanaProgressBg}>
                      <View style={[styles.semanaProgressFill, {
                        width: `${(completadosSemana / s.dias) * 100}%`,
                        backgroundColor: s.color,
                      }]} />
                    </View>
                  </View>
                  <Text style={[styles.semanaCnt, { color: s.color }]}>{completadosSemana}/{s.dias}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* INFO + BOTÓN + MANIFIESTO */}
        <Animated.View style={{ opacity: fadeInfo, transform: [{ translateY: slideInfo }] }}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>¿Qué es El Despertar?</Text>
            <Text style={styles.infoTxt}>
              El Umbral te enseñó a cruzar límites. El Despertar te enseña a vivir sin ellos.
              30 días de trabajo más profundo: consciencia, propósito, identidad real y expansión total.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => onOpenDays?.()}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnTxt}>
              {completados > 0 ? `🌅  Continuar — Día ${diaActual}  →` : '🌅  Comenzar El Despertar  →'}
            </Text>
          </TouchableOpacity>

          <View style={styles.manifiestoCard}>
            <Text style={styles.manifiestoLabel}>📜 MANIFIESTO DEL DESPERTAR</Text>
            <Text style={styles.manifiestoTxt}>
              {'"El Umbral fue la puerta.\nEl Despertar es el territorio.\n\nNo viniste hasta acá para quedarte en el umbral.\nViniste para vivir del otro lado."'}
            </Text>
            <Text style={styles.manifiestoAutor}>— Diego Gaitán</Text>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0c' },
  header:             { backgroundColor: '#1a1508', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(167,139,250,0.2)' },
  backBtn:            { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.08)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', marginBottom: 20 },
  backTxt:            { color: '#a78bfa', fontWeight: '900', fontSize: 12 },
  headerDots:         { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 14 },
  badgeRow:           { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge:              { backgroundColor: 'rgba(167,139,250,0.15)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeTxt:           { color: '#a78bfa', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  headerSobre:        { fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  headerTitulo:       { fontSize: 44, fontWeight: '900', color: '#a78bfa', letterSpacing: 2, marginBottom: 10 },
  headerSub:          { fontSize: 14, color: '#8a7a60', lineHeight: 22 },
  body:               { padding: 16 },
  statsRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox:            { flex: 1, backgroundColor: '#13120f', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  statValor:          { fontSize: 22, fontWeight: '900', color: '#a78bfa', marginBottom: 2 },
  statLabel:          { fontSize: 9, color: '#6a5a40', fontWeight: '700', letterSpacing: 1 },
  progressCard:       { backgroundColor: '#13120f', borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.3)', marginBottom: 24 },
  progressTopRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel:      { fontSize: 10, color: '#a78bfa', fontWeight: '900', letterSpacing: 2 },
  progressPct:        { fontSize: 14, color: '#a78bfa', fontWeight: '900' },
  progressBg:         { backgroundColor: '#1e1e18', borderRadius: 8, height: 10, marginBottom: 8 },
  progressFill:       { backgroundColor: '#a78bfa', borderRadius: 8, height: 10, shadowColor: '#a78bfa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6 },
  progressSub:        { fontSize: 12, color: '#6a5a40' },
  sectionTitle:       { fontSize: 11, fontWeight: '900', color: '#6a5a40', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  semanaCard:         { borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 10, position: 'relative', overflow: 'hidden' },
  semanaActivaBadge:  { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  semanaActivaTxt:    { fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  semanaInner:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  semanaNum:          { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  semanaNumTxt:       { fontSize: 18, fontWeight: '900' },
  semanaNombre:       { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  semanaDesc:         { fontSize: 12, color: '#6a5a40', marginBottom: 4 },
  semanaDias:         { fontSize: 10, color: '#4a3a20', fontWeight: '700', marginBottom: 6 },
  semanaProgressBg:   { backgroundColor: '#1e1e18', borderRadius: 4, height: 4 },
  semanaProgressFill: { borderRadius: 4, height: 4 },
  semanaCnt:          { fontSize: 13, fontWeight: '900', flexShrink: 0 },
  infoCard:           { backgroundColor: '#13120f', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', padding: 18, marginBottom: 16 },
  infoTitle:          { fontSize: 14, fontWeight: '900', color: '#f0e6c8', marginBottom: 8 },
  infoTxt:            { fontSize: 14, color: '#c8bfa8', lineHeight: 22 },
  ctaBtn:             { backgroundColor: '#a78bfa', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16, shadowColor: '#a78bfa', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  ctaBtnTxt:          { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
  manifiestoCard:     { backgroundColor: '#13120f', borderRadius: 18, padding: 22, borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.3)' },
  manifiestoLabel:    { fontSize: 10, color: '#a78bfa', fontWeight: '900', letterSpacing: 2, marginBottom: 14 },
  manifiestoTxt:      { fontSize: 15, color: '#c8bfa8', lineHeight: 26, fontStyle: 'italic', marginBottom: 12 },
  manifiestoAutor:    { fontSize: 12, color: '#6a5a40', fontWeight: '600' },
});

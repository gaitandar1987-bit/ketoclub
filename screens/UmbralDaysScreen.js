import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const TOTAL = 30;

const SEMANAS_CONFIG = [
  { numero: 1, nombre: 'EL ARRANQUE',      rango: [1, 7],   color: '#c9a84c', emoji: '⚡' },
  { numero: 2, nombre: 'LA ADAPTACIÓN',    rango: [8, 14],  color: '#f97316', emoji: '🔄' },
  { numero: 3, nombre: 'LA CONSOLIDACIÓN', rango: [15, 21], color: '#4ade80', emoji: '🌱' },
  { numero: 4, nombre: 'EL CRUCE',         rango: [22, 30], color: '#60a5fa', emoji: '🚀' },
];

// ─── Hook countdown hasta medianoche ────────────────────────
function useCountdown() {
  const [tiempo, setTiempo] = useState(() => calcularTiempo());

  function calcularTiempo() {
    const ahora    = new Date();
    const manana   = new Date();
    manana.setDate(ahora.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    const diff     = manana - ahora;
    const horas    = Math.floor(diff / 3600000);
    const minutos  = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return { horas, minutos, segundos };
  }

  useEffect(() => {
    const interval = setInterval(() => setTiempo(calcularTiempo()), 1000);
    return () => clearInterval(interval);
  }, []);

  return tiempo;
}

// ─── Widget countdown ────────────────────────────────────────
function CountdownWidget({ diasDesbloqueados, completados, color = '#c9a84c' }) {
  const { horas, minutos, segundos } = useCountdown();
  const proximoDia = diasDesbloqueados + 1;

  if (proximoDia > TOTAL) return null; // ya desbloqueó todo
  if (completados.includes(diasDesbloqueados)) {
    // El día actual ya está completado — mostrar próximo
  }

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <View style={[countStyles.widget, { borderColor: color + '30' }]}>
      <View style={countStyles.leftCol}>
        <Text style={[countStyles.label, { color }]}>⏳ PRÓXIMO DÍA</Text>
        <Text style={countStyles.diaTxt}>
          Día <Text style={[countStyles.diaNum, { color }]}>{proximoDia}</Text> se desbloquea en
        </Text>
      </View>
      <View style={countStyles.timerRow}>
        {[
          { val: pad(horas),    unit: 'hs'  },
          { val: ':',           unit: null  },
          { val: pad(minutos),  unit: 'min' },
          { val: ':',           unit: null  },
          { val: pad(segundos), unit: 'seg' },
        ].map((t, i) =>
          t.unit === null ? (
            <Text key={i} style={[countStyles.sep, { color }]}>{t.val}</Text>
          ) : (
            <View key={i} style={countStyles.timerUnit}>
              <Text style={[countStyles.timerNum, { color }]}>{t.val}</Text>
              <Text style={countStyles.timerLabel}>{t.unit}</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const countStyles = StyleSheet.create({
  widget:    { backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftCol:   { flex: 1 },
  label:     { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  diaTxt:    { fontSize: 12, color: '#6a5a40' },
  diaNum:    { fontWeight: '900', fontSize: 13 },
  timerRow:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  timerUnit: { alignItems: 'center' },
  timerNum:  { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  timerLabel:{ fontSize: 8, color: '#4a3a20', fontWeight: '700', marginTop: 1 },
  sep:       { fontSize: 18, fontWeight: '900', marginBottom: 8, marginHorizontal: 1 },
});

export default function UmbralDaysScreen({ startedAtISO, completedDays = [], onBack, onOpenDay }) {
  const completados = Array.isArray(completedDays) ? completedDays : [];

  const diasDesbloqueados = useMemo(() => {
    if (!startedAtISO) return 2;
    const diaActual = Math.floor((Date.now() - new Date(startedAtISO)) / 86400000) + 1;
    return Math.min(TOTAL, diaActual + 1);
  }, [startedAtISO]);

  function getEstadoDia(dia) {
    if (completados.includes(dia)) return 'completado';
    if (dia <= diasDesbloqueados)  return 'disponible';
    return 'bloqueado';
  }

  const totalCompletados = completados.length;
  const progress = totalCompletados / TOTAL;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>MES 1 · IDENTIDAD ATÓMICA</Text>
        <Text style={styles.headerTitulo}>EL UMBRAL</Text>
        <Text style={styles.headerSub}>30 días para cruzar el límite.</Text>

        <View style={styles.headerProgress}>
          <View style={styles.headerProgressBg}>
            <View style={[styles.headerProgressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.headerProgressTxt}>
            {totalCompletados}/30 completados · Día desbloqueado: {diasDesbloqueados}
          </Text>
        </View>
      </View>

      <View style={styles.body}>

        {/* ── COUNTDOWN ── */}
        <CountdownWidget
          diasDesbloqueados={diasDesbloqueados}
          completados={completados}
          color="#c9a84c"
        />

        {/* ── LEYENDA ── */}
        <View style={styles.leyenda}>
          {[
            { color: '#c9a84c', icono: '✓', label: 'Completado' },
            { color: '#f0e6c8', icono: '●', label: 'Disponible' },
            { color: '#2a2218', icono: '🔒', label: 'Bloqueado'  },
          ].map((l, i) => (
            <View key={i} style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: l.color + '30', borderColor: l.color + '50' }]}>
                <Text style={{ fontSize: 9, color: l.color }}>{l.icono}</Text>
              </View>
              <Text style={styles.leyendaTxt}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* ── SEMANAS ── */}
        {SEMANAS_CONFIG.map((semana) => {
          const diasSemana = Array.from(
            { length: semana.rango[1] - semana.rango[0] + 1 },
            (_, i) => semana.rango[0] + i
          );
          const completadosSemana = diasSemana.filter(d => completados.includes(d)).length;
          const totalSemana = diasSemana.length;

          return (
            <View key={semana.numero} style={styles.semanaSection}>

              <View style={[styles.semanaHeader, { borderLeftColor: semana.color }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.semanaHeaderTop}>
                    <Text style={styles.semanaEmoji}>{semana.emoji}</Text>
                    <Text style={[styles.semanaNombre, { color: semana.color }]}>
                      SEMANA {semana.numero} · {semana.nombre}
                    </Text>
                  </View>
                  <Text style={styles.semanaDias}>Días {semana.rango[0]}–{semana.rango[1]}</Text>
                </View>
                <View style={[styles.semanaProgressChip, { backgroundColor: semana.color + '15', borderColor: semana.color + '35' }]}>
                  <Text style={[styles.semanaProgressTxt, { color: semana.color }]}>
                    {completadosSemana}/{totalSemana}
                  </Text>
                </View>
              </View>

              <View style={styles.diasGrid}>
                {diasSemana.map((dia) => {
                  const estado     = getEstadoDia(dia);
                  const bloqueado  = estado === 'bloqueado';
                  const completado = estado === 'completado';
                  const disponible = estado === 'disponible';

                  return (
                    <TouchableOpacity
                      key={dia}
                      style={[
                        styles.diaCard,
                        completado && [styles.diaCardCompletado, { borderColor: semana.color, backgroundColor: semana.color + '15' }],
                        disponible && [styles.diaCardDisponible, { borderColor: semana.color + '50' }],
                        bloqueado  && styles.diaCardBloqueado,
                      ]}
                      onPress={() => {
                        if (!bloqueado) onOpenDay(dia, startedAtISO || new Date().toISOString());
                      }}
                      activeOpacity={bloqueado ? 1 : 0.85}
                    >
                      <Text style={[
                        styles.diaNro,
                        completado && { color: semana.color },
                        disponible && { color: '#f0e6c8' },
                        bloqueado  && { color: '#2a2218' },
                      ]}>
                        {dia}
                      </Text>

                      {completado && (
                        <View style={[styles.diaIconWrap, { backgroundColor: semana.color + '25' }]}>
                          <Text style={[styles.diaIcon, { color: semana.color }]}>✓</Text>
                        </View>
                      )}
                      {disponible && (
                        <View style={[styles.diaIconWrap, { backgroundColor: semana.color + '15' }]}>
                          <Text style={styles.diaIconPlay}>▶</Text>
                        </View>
                      )}
                      {bloqueado && (
                        <View style={styles.diaIconWrapLock}>
                          <Text style={styles.diaIconLock}>🔒</Text>
                        </View>
                      )}

                      {completado && (
                        <View style={[styles.diaGlow, { backgroundColor: semana.color + '08' }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const CARD_SIZE = (width - 32 - 40) / 5;

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#0a0a0c' },
  header:               { backgroundColor: '#130f0a', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)' },
  backBtn:              { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 20 },
  backTxt:              { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerSobre:          { fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo:         { fontSize: 36, fontWeight: '900', color: '#c9a84c', letterSpacing: 1, marginBottom: 6 },
  headerSub:            { fontSize: 13, color: '#8a7a60', marginBottom: 18 },
  headerProgress:       { gap: 8 },
  headerProgressBg:     { backgroundColor: '#1e1e18', borderRadius: 8, height: 8 },
  headerProgressFill:   { backgroundColor: '#c9a84c', borderRadius: 8, height: 8, shadowColor: '#c9a84c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
  headerProgressTxt:    { fontSize: 11, color: '#6a5a40', fontWeight: '700' },
  body:                 { padding: 16 },
  leyenda:              { flexDirection: 'row', gap: 16, backgroundColor: '#13120f', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  leyendaItem:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot:           { width: 22, height: 22, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  leyendaTxt:           { fontSize: 11, color: '#6a5a40', fontWeight: '700' },
  semanaSection:        { marginBottom: 24 },
  semanaHeader:         { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, paddingLeft: 12, marginBottom: 14 },
  semanaHeaderTop:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  semanaEmoji:          { fontSize: 16 },
  semanaNombre:         { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  semanaDias:           { fontSize: 10, color: '#4a3a20', fontWeight: '700' },
  semanaProgressChip:   { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  semanaProgressTxt:    { fontSize: 11, fontWeight: '900' },
  diasGrid:             { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8 },
  diaCard:              { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 12, borderWidth: 1.5, borderColor: '#2a2010', backgroundColor: '#13120f', alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden', position: 'relative' },
  diaCardCompletado:    { shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  diaCardDisponible:    { backgroundColor: '#161410' },
  diaCardBloqueado:     { backgroundColor: '#0d0c09', borderColor: '#1a1810' },
  diaNro:               { fontSize: 15, fontWeight: '900' },
  diaIconWrap:          { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  diaIcon:              { fontSize: 10, fontWeight: '900' },
  diaIconPlay:          { fontSize: 8, color: '#f0e6c8' },
  diaIconWrapLock:      { alignItems: 'center', justifyContent: 'center' },
  diaIconLock:          { fontSize: 10, opacity: 0.5 },
  diaGlow:              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 },
});

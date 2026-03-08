import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Alert, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sumarXP } from '../xp';
import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

// ─── Metas ───────────────────────────────────────────────────
const METAS = [
  {
    pasos: 5000, emoji: '🥉', titulo: 'Activado', premio: 'Guerrero en Movimiento',
    desc: 'Tu cuerpo despertó. El movimiento es medicina keto.',
    color: '#fb923c', colorBg: 'rgba(251,146,60,0.12)', colorBorder: 'rgba(251,146,60,0.4)',
    frase: 'Cada paso activa tu metabolismo y potencia la cetosis 🔥',
  },
  {
    pasos: 8000, emoji: '🥈', titulo: 'En Llamas', premio: 'Quemador de Grasa',
    desc: 'Entraste en la zona de máxima oxidación de grasa.',
    color: '#c9a84c', colorBg: 'rgba(201,168,76,0.12)', colorBorder: 'rgba(201,168,76,0.4)',
    frase: '8.000 pasos = zona dorada de quema de grasa cetogénica 💛',
  },
  {
    pasos: 10000, emoji: '🏆', titulo: 'Legendario', premio: 'Atleta Keto Élite',
    desc: '10.000 pasos. Sos una máquina de transformación.',
    color: '#a78bfa', colorBg: 'rgba(167,139,250,0.12)', colorBorder: 'rgba(167,139,250,0.4)',
    frase: 'Nivel élite. Pocos llegan, menos mantienen. Vos lo hiciste. 👑',
  },
];

function hoyKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function ultimosDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n-1-i));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
}

const DIAS_CORTOS = ['D','L','M','X','J','V','S'];

// ─── Anillo de progreso ───────────────────────────────────────
function AnilloProgreso({ pasos, meta, color }) {
  const pct = Math.min(pasos / meta, 1);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={anilloStyles.wrap}>
      <View style={anilloStyles.fondo}>
        {Array.from({ length: 40 }, (_, i) => {
          const angulo = (i / 40) * 360;
          const activo = (i / 40) < pct;
          return (
            <View key={i} style={[anilloStyles.segmento, {
              transform: [{ rotate: `${angulo}deg` }, { translateY: -68 }],
              backgroundColor: activo ? color : '#1e1e18',
              opacity: activo ? (0.6 + (i / 40) * 0.4) : 1,
            }]} />
          );
        })}
        <View style={anilloStyles.centro}>
          <Text style={[anilloStyles.pasosNum, { color }]}>{pasos.toLocaleString()}</Text>
          <Text style={anilloStyles.pasosTxt}>pasos hoy</Text>
          <Text style={[anilloStyles.pasosPct, { color }]}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>
    </View>
  );
}

const anilloStyles = StyleSheet.create({
  wrap:     { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  fondo:    { width: 180, height: 180, borderRadius: 90, backgroundColor: '#0d0a1a',
              borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)',
              alignItems: 'center', justifyContent: 'center', position: 'relative' },
  segmento: { position: 'absolute', width: 4, height: 14, borderRadius: 2, left: 88, top: 90 },
  centro:   { alignItems: 'center' },
  pasosNum: { fontSize: 28, fontWeight: '900' },
  pasosTxt: { fontSize: 11, color: '#6a5a40', marginTop: 2 },
  pasosPct: { fontSize: 16, fontWeight: '900', marginTop: 4 },
});

// ─── Screen principal ─────────────────────────────────────────
export default function PasosScreen({ member, onBack }) {
  const memberKey = member?.phone || member?.id || 'guest';
  const [pasosHoy, setPasosHoy]         = useState(0);
  const [estado, setEstado]             = useState('iniciando'); // iniciando | ok | sin_permiso | sin_app | manual
  const [historial, setHistorial]       = useState({});
  const [metaActiva, setMetaActiva]     = useState(1);
  const [vistaActiva, setVistaActiva]   = useState('hoy');
  const [inputManual, setInputManual]   = useState('');
  const [cargando, setCargando]         = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  const metaActual = METAS[metaActiva];

  useEffect(() => {
    iniciarHealthConnect();
    cargarHistorial();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  async function iniciarHealthConnect() {
    try {
      setCargando(true);
      // 1. Inicializar Health Connect
      const isInit = await initialize();
      if (!isInit) {
        setEstado('sin_app');
        setCargando(false);
        return;
      }

      // 2. Pedir permisos
      const perms = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
      ]);

      const tienePermiso = perms.some(p => p.recordType === 'Steps' && p.accessType === 'read');
      if (!tienePermiso) {
        setEstado('sin_permiso');
        setCargando(false);
        return;
      }

      setEstado('ok');
      // 3. Leer pasos de hoy
      await leerPasosHoy();
      // 4. Actualizar cada 60 segundos
      intervalRef.current = setInterval(leerPasosHoy, 60000);
      setCargando(false);
    } catch (e) {
      console.log('[pasos] Error Health Connect:', e);
      setEstado('manual');
      setCargando(false);
    }
  }

  async function leerPasosHoy() {
    try {
      const ahora  = new Date();
      const inicio = new Date(ahora);
      inicio.setHours(0, 0, 0, 0);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: inicio.toISOString(),
          endTime: ahora.toISOString(),
        },
      });

      const total = result.records.reduce((acc, r) => acc + (r.count || 0), 0);
      setPasosHoy(total);

      // Guardar en historial
      const hoy = hoyKey();
      const raw = await AsyncStorage.getItem(`pasos_${memberKey}`);
      const data = raw ? JSON.parse(raw) : {};
      data[hoy] = total;
      await AsyncStorage.setItem(`pasos_${memberKey}`, JSON.stringify(data));
      setHistorial(data);

      // XP si supera 5000
      if (total >= 5000) {
        await sumarXP(memberKey, 'pasos_5k', `${total} pasos`);
      }
    } catch (e) {
      console.log('[pasos] Error leyendo pasos:', e);
    }
  }

  async function cargarHistorial() {
    try {
      const raw = await AsyncStorage.getItem(`pasos_${memberKey}`);
      if (raw) setHistorial(JSON.parse(raw));
    } catch (e) {}
  }

  async function guardarManual() {
    const n = parseInt(inputManual, 10);
    if (isNaN(n) || n < 0 || n > 100000) {
      Alert.alert('Valor inválido', 'Ingresá un número entre 0 y 100.000');
      return;
    }
    const hoy = hoyKey();
    const raw = await AsyncStorage.getItem(`pasos_${memberKey}`);
    const data = raw ? JSON.parse(raw) : {};
    data[hoy] = n;
    await AsyncStorage.setItem(`pasos_${memberKey}`, JSON.stringify(data));
    setPasosHoy(n);
    setHistorial(data);
    setInputManual('');
    if (n >= 5000) await sumarXP(memberKey, 'pasos_5k', `${n} pasos manual`);
    Alert.alert('✅ Guardado', `${n.toLocaleString()} pasos registrados para hoy`);
  }

  const dias7 = ultimosDias(7);
  const maxPasos = Math.max(...dias7.map(k => historial[k] || 0), 1000);

  // ── Stats ──
  const totalSemana  = dias7.reduce((a, k) => a + (historial[k] || 0), 0);
  const diasActivos  = dias7.filter(k => (historial[k] || 0) >= 5000).length;
  const promedioDia  = Math.round(totalSemana / 7);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · MOVIMIENTO</Text>
        <Text style={styles.headerTitulo}>Pasos</Text>
        <Text style={styles.headerSub}>Cada paso activa tu cetosis</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {[['hoy','Hoy'],['historial','Historial']].map(([k, label]) => (
          <TouchableOpacity
            key={k}
            style={[styles.tab, vistaActiva === k && styles.tabActiva]}
            onPress={() => setVistaActiva(k)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabTxt, vistaActiva === k && styles.tabTxtActiva]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {vistaActiva === 'hoy' ? (
          <>
            {/* ── ESTADO HEALTH CONNECT ── */}
            {estado === 'sin_app' && (
              <View style={styles.alertCard}>
                <Text style={styles.alertEmoji}>📲</Text>
                <Text style={styles.alertTitulo}>Instalá Health Connect</Text>
                <Text style={styles.alertSub}>
                  Health Connect es la app de Google que sincroniza tus pasos automáticamente. 
                  Instalala desde Play Store y volvé a abrir esta pantalla.
                </Text>
                <Text style={styles.alertLink}>Buscá "Health Connect" en Play Store</Text>
              </View>
            )}

            {estado === 'sin_permiso' && (
              <View style={styles.alertCard}>
                <Text style={styles.alertEmoji}>🔒</Text>
                <Text style={styles.alertTitulo}>Permiso necesario</Text>
                <Text style={styles.alertSub}>
                  Necesitamos acceso a tus pasos para sincronizarlos automáticamente.
                </Text>
                <TouchableOpacity style={styles.alertBtn} onPress={iniciarHealthConnect} activeOpacity={0.85}>
                  <Text style={styles.alertBtnTxt}>Dar permiso →</Text>
                </TouchableOpacity>
              </View>
            )}

            {estado === 'manual' && (
              <View style={styles.alertCard}>
                <Text style={styles.alertEmoji}>📱</Text>
                <Text style={styles.alertTitulo}>Carga manual</Text>
                <Text style={styles.alertSub}>
                  No se pudo conectar con Health Connect. Ingresá tus pasos manualmente:
                </Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={styles.manualInput}
                    value={inputManual}
                    onChangeText={setInputManual}
                    keyboardType="numeric"
                    placeholder="Ej: 7500"
                    placeholderTextColor="#4a3a20"
                    maxLength={6}
                  />
                  <TouchableOpacity style={styles.manualBtn} onPress={guardarManual} activeOpacity={0.85}>
                    <Text style={styles.manualBtnTxt}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── SELECTOR META ── */}
            <View style={styles.metaSelectCard}>
              <Text style={styles.seccionLabel}>🎯 META DEL DÍA</Text>
              <View style={styles.metaRow}>
                {METAS.map((m, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.metaBtn, metaActiva === i && {
                      borderColor: m.color, backgroundColor: m.colorBg,
                    }]}
                    onPress={() => setMetaActiva(i)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.metaBtnEmoji}>{m.emoji}</Text>
                    <Text style={[styles.metaBtnNum, metaActiva === i && { color: m.color }]}>
                      {(m.pasos / 1000).toFixed(0)}k
                    </Text>
                    <Text style={[styles.metaBtnLabel, metaActiva === i && { color: m.color }]}>
                      {m.titulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── ANILLO PRINCIPAL ── */}
            <View style={[styles.anilloCard, { borderColor: metaActual.colorBorder }]}>
              {estado === 'ok' && (
                <View style={styles.syncBadge}>
                  <View style={styles.syncDot} />
                  <Text style={styles.syncTxt}>Sincronizado automáticamente</Text>
                </View>
              )}
              <AnilloProgreso pasos={pasosHoy} meta={metaActual.pasos} color={metaActual.color} />
              <Text style={[styles.metaNombre, { color: metaActual.color }]}>
                {metaActual.emoji} Meta: {metaActual.pasos.toLocaleString()} pasos
              </Text>
              {pasosHoy >= metaActual.pasos ? (
                <View style={[styles.logradoCard, { backgroundColor: metaActual.colorBg, borderColor: metaActual.colorBorder }]}>
                  <Text style={[styles.logradoTitulo, { color: metaActual.color }]}>
                    {metaActual.emoji} ¡{metaActual.premio}!
                  </Text>
                  <Text style={styles.logradoDesc}>{metaActual.frase}</Text>
                </View>
              ) : (
                <View style={styles.faltanWrap}>
                  <Text style={[styles.faltanNum, { color: metaActual.color }]}>
                    {(metaActual.pasos - pasosHoy).toLocaleString()}
                  </Text>
                  <Text style={styles.faltanTxt}>pasos para tu meta</Text>
                </View>
              )}
            </View>

            {/* ── STATS SEMANA ── */}
            <View style={styles.statsCard}>
              <Text style={styles.seccionLabel}>📊 ESTA SEMANA</Text>
              <View style={styles.statsRow}>
                {[
                  { num: totalSemana.toLocaleString(), label: 'Total pasos' },
                  { num: promedioDia.toLocaleString(), label: 'Promedio/día' },
                  { num: `${diasActivos}/7`, label: 'Días activos' },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={styles.statNum}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ── HISTORIAL 7 DÍAS ── */}
            <View style={styles.histCard}>
              <Text style={styles.seccionLabel}>📈 ÚLTIMOS 7 DÍAS</Text>
              <View style={styles.barrasWrap}>
                {dias7.map((k, i) => {
                  const pasos = historial[k] || 0;
                  const pct   = pasos / maxPasos;
                  const dia   = new Date(k + 'T12:00:00');
                  const color = pasos >= 10000 ? '#a78bfa' : pasos >= 8000 ? '#c9a84c' : pasos >= 5000 ? '#fb923c' : '#2a2010';
                  return (
                    <View key={k} style={styles.barraWrap}>
                      <Text style={styles.barraVal}>{pasos >= 1000 ? `${(pasos/1000).toFixed(1)}k` : pasos || ''}</Text>
                      <View style={styles.barraBg}>
                        <View style={[styles.barraFill, { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.barraDia}>{DIAS_CORTOS[dia.getDay()]}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Leyenda */}
              <View style={styles.leyendaRow}>
                {[
                  { color: '#fb923c', label: '5k+' },
                  { color: '#c9a84c', label: '8k+' },
                  { color: '#a78bfa', label: '10k+' },
                ].map((l, i) => (
                  <View key={i} style={styles.leyendaItem}>
                    <View style={[styles.leyendaDot, { backgroundColor: l.color }]} />
                    <Text style={styles.leyendaTxt}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── METAS ── */}
            <View style={styles.metasCard}>
              <Text style={styles.seccionLabel}>🏆 METAS</Text>
              {METAS.map((m, i) => {
                const diasLogrado = Object.values(historial).filter(p => p >= m.pasos).length;
                return (
                  <View key={i} style={[styles.metaItem, { borderColor: m.colorBorder, backgroundColor: m.colorBg }]}>
                    <Text style={styles.metaItemEmoji}>{m.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.metaItemTitulo, { color: m.color }]}>{m.premio}</Text>
                      <Text style={styles.metaItemDesc}>{m.pasos.toLocaleString()} pasos · {diasLogrado} días logrado</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0a0a0c' },
  header:         { backgroundColor: '#1a1508', padding: 24, paddingTop: 56,
                    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn:        { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14,
                    borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 1, borderColor: '#2a2010', marginBottom: 20 },
  backText:       { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerSobre:    { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo:   { fontSize: 36, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub:      { fontSize: 13, color: '#6a5a40' },

  tabs:           { flexDirection: 'row', backgroundColor: '#13120f',
                    borderBottomWidth: 1, borderBottomColor: '#2a2010' },
  tab:            { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActiva:      { borderBottomWidth: 2, borderBottomColor: '#c9a84c' },
  tabTxt:         { fontSize: 13, color: '#6a5a40', fontWeight: '700' },
  tabTxtActiva:   { color: '#c9a84c', fontWeight: '900' },

  body:           { flex: 1, padding: 16 },

  alertCard:      { backgroundColor: '#13120f', borderRadius: 20, padding: 24,
                    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.3)',
                    alignItems: 'center', marginBottom: 16 },
  alertEmoji:     { fontSize: 40, marginBottom: 12 },
  alertTitulo:    { fontSize: 18, fontWeight: '900', color: '#f0e6c8', marginBottom: 8 },
  alertSub:       { fontSize: 13, color: '#8a7a60', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  alertLink:      { fontSize: 13, color: '#c9a84c', fontWeight: '700' },
  alertBtn:       { backgroundColor: '#c9a84c', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  alertBtnTxt:    { color: '#0a0a0c', fontWeight: '900', fontSize: 15 },

  manualRow:      { flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' },
  manualInput:    { flex: 1, backgroundColor: '#1e1e18', borderRadius: 12, borderWidth: 1,
                    borderColor: 'rgba(201,168,76,0.3)', color: '#f0e6c8', fontSize: 16,
                    paddingHorizontal: 16, paddingVertical: 12 },
  manualBtn:      { backgroundColor: '#c9a84c', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  manualBtnTxt:   { color: '#0a0a0c', fontWeight: '900', fontSize: 14 },

  syncBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  syncDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  syncTxt:        { fontSize: 11, color: '#4ade80', fontWeight: '700' },

  metaSelectCard: { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                    borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  seccionLabel:   { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 14 },
  metaRow:        { flexDirection: 'row', gap: 8 },
  metaBtn:        { flex: 1, backgroundColor: '#0a0a0c', borderRadius: 14,
                    borderWidth: 1.5, borderColor: '#2a2010', padding: 12, alignItems: 'center', gap: 4 },
  metaBtnEmoji:   { fontSize: 20 },
  metaBtnNum:     { fontSize: 16, fontWeight: '900', color: '#6a5a40' },
  metaBtnLabel:   { fontSize: 9, color: '#4a3a20', fontWeight: '700' },

  anilloCard:     { backgroundColor: '#13120f', borderRadius: 20, padding: 20,
                    borderWidth: 1.5, marginBottom: 14, alignItems: 'center' },
  metaNombre:     { fontSize: 13, fontWeight: '900', marginTop: 8, marginBottom: 12 },
  logradoCard:    { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', width: '100%' },
  logradoTitulo:  { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  logradoDesc:    { fontSize: 12, color: '#8a7a60', textAlign: 'center', lineHeight: 18 },
  faltanWrap:     { alignItems: 'center', marginTop: 4 },
  faltanNum:      { fontSize: 32, fontWeight: '900' },
  faltanTxt:      { fontSize: 12, color: '#6a5a40', marginTop: 4 },

  statsCard:      { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                    borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  statsRow:       { flexDirection: 'row' },
  statItem:       { flex: 1, alignItems: 'center' },
  statNum:        { fontSize: 18, fontWeight: '900', color: '#c9a84c', marginBottom: 3 },
  statLabel:      { fontSize: 9, color: '#6a5a40', letterSpacing: 0.5, textAlign: 'center' },

  histCard:       { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                    borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  barrasWrap:     { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 6, marginBottom: 12 },
  barraWrap:      { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barraVal:       { fontSize: 8, color: '#6a5a40', marginBottom: 4 },
  barraBg:        { width: '100%', backgroundColor: '#1e1e18', borderRadius: 6, height: 80, overflow: 'hidden',
                    justifyContent: 'flex-end' },
  barraFill:      { width: '100%', borderRadius: 6 },
  barraDia:       { fontSize: 10, color: '#4a3a20', marginTop: 6 },
  leyendaRow:     { flexDirection: 'row', gap: 16, marginTop: 4 },
  leyendaItem:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot:     { width: 8, height: 8, borderRadius: 4 },
  leyendaTxt:     { fontSize: 11, color: '#6a5a40' },

  metasCard:      { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                    borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 12,
                    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  metaItemEmoji:  { fontSize: 24 },
  metaItemTitulo: { fontSize: 14, fontWeight: '900', marginBottom: 3 },
  metaItemDesc:   { fontSize: 12, color: '#6a5a40' },
});

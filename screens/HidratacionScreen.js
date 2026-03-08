import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { sumarXP } from '../xp';

// ─── Config ───────────────────────────────────────────────────
const META_VASOS = 8;
const ML_POR_VASO = 250;

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

// ─── Beneficios por nivel de hidratación ─────────────────────
const NIVELES_HIDRA = [
  { vasos: 2, emoji: '💧', titulo: 'Mínimo vital',    color: '#6b7280', desc: 'Tu cuerpo está en modo supervivencia.' },
  { vasos: 4, emoji: '🌊', titulo: 'Activando',       color: '#3b82f6', desc: 'Tu metabolismo empieza a despertar.' },
  { vasos: 6, emoji: '⚡', titulo: 'Cetosis activa',  color: '#c9a84c', desc: 'Hidratación óptima para quemar grasa.' },
  { vasos: 8, emoji: '🔥', titulo: 'Modo élite',      color: '#a78bfa', desc: 'Tu cuerpo opera al máximo nivel.' },
];

// ─── Componente Vaso animado ──────────────────────────────────
function Vaso({ lleno, onPress, index, color }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillAnim  = useRef(new Animated.Value(lleno ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: lleno ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [lleno]);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    onPress(index);
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[vasoStyles.wrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={vasoStyles.vaso}>
          <Animated.View style={[vasoStyles.fill, {
            height: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          }]} />
          <Text style={[vasoStyles.emoji, lleno && vasoStyles.emojiLleno]}>
            {lleno ? '💧' : '○'}
          </Text>
        </View>
        <Text style={[vasoStyles.num, lleno && { color }]}>{index + 1}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const vasoStyles = StyleSheet.create({
  wrap:       { alignItems: 'center', gap: 4 },
  vaso:       { width: 36, height: 48, borderRadius: 8, borderWidth: 1.5,
                borderColor: '#2a2010', backgroundColor: '#0a0a0c',
                overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill:       { position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 6 },
  emoji:      { fontSize: 14, color: '#2a2010', zIndex: 1 },
  emojiLleno: { color: '#fff' },
  num:        { fontSize: 9, color: '#4a3a20', fontWeight: '700' },
});

// ─── Screen principal ─────────────────────────────────────────
export default function HidratacionScreen({ member, onBack }) {
  const memberKey = member?.phone || member?.id || 'guest';
  const [vasos,      setVasos]      = useState(0);
  const [historial,  setHistorial]  = useState({});
  const [vista,      setVista]      = useState('hoy'); // hoy | info | electrolitos
  const [xpGanado,   setXpGanado]   = useState(false);

  const celebAnim   = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarDatos();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: vasos / META_VASOS,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [vasos]);

  async function cargarDatos() {
    try {
      const hoy = hoyKey();
      const raw = await AsyncStorage.getItem(`hidratacion_${memberKey}`);
      const data = raw ? JSON.parse(raw) : {};
      setHistorial(data);
      setVasos(data[hoy] || 0);
    } catch(e) {}
  }

  async function toggleVaso(index) {
    const hoy = hoyKey();
    const raw = await AsyncStorage.getItem(`hidratacion_${memberKey}`);
    const data = raw ? JSON.parse(raw) : {};
    const actual = data[hoy] || 0;

    let nuevo;
    if (index < actual) {
      // Desmarcar — reducir al index
      nuevo = index;
    } else {
      // Marcar hasta index+1
      nuevo = index + 1;
    }

    data[hoy] = nuevo;
    await AsyncStorage.setItem(`hidratacion_${memberKey}`, JSON.stringify(data));
    setVasos(nuevo);
    setHistorial({ ...data });

    // Celebración al llegar a la meta
    if (nuevo === META_VASOS && actual < META_VASOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      celebrar();
      if (!xpGanado) {
        await sumarXP(memberKey, 'hidratacion_meta', '8 vasos completados');
        setXpGanado(true);
      }
    }
  }

  function celebrar() {
    Animated.sequence([
      Animated.timing(celebAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(celebAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  const nivelActual = [...NIVELES_HIDRA].reverse().find(n => vasos >= n.vasos) || NIVELES_HIDRA[0];
  const pct         = Math.round((vasos / META_VASOS) * 100);
  const mlTotal     = vasos * ML_POR_VASO;
  const dias7       = ultimosDias(7);
  const maxHist     = Math.max(...dias7.map(k => historial[k] || 0), META_VASOS);
  const promedio    = Math.round(dias7.reduce((a, k) => a + (historial[k] || 0), 0) / 7);
  const diasMeta    = dias7.filter(k => (historial[k] || 0) >= META_VASOS).length;

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · PROTOCOLO</Text>
        <Text style={styles.headerTitulo}>Hidratación</Text>
        <Text style={styles.headerSub}>El agua es el primer nutriente keto</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {[['hoy','💧 Hoy'], ['info','📊 Stats'], ['electrolitos','⚗️ Electrolitos']].map(([k, label]) => (
          <TouchableOpacity
            key={k}
            style={[styles.tab, vista === k && styles.tabActiva]}
            onPress={() => setVista(k)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabTxt, vista === k && styles.tabTxtActiva]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ══════════════════════ TAB HOY ══════════════════════ */}
        {vista === 'hoy' && (
          <>
            {/* Celebración meta */}
            <Animated.View style={[styles.celebCard, {
              opacity: celebAnim,
              transform: [{ scale: celebAnim.interpolate({ inputRange: [0,1], outputRange: [0.8, 1] }) }]
            }]}>
              <Text style={styles.celebTxt}>🎉 ¡Meta del día completada!</Text>
            </Animated.View>

            {/* Card nivel */}
            <Animated.View style={[styles.nivelCard, {
              borderColor: nivelActual.color + '50',
              transform: [{ scale: pulseAnim }],
            }]}>
              <Text style={styles.nivelEmoji}>{nivelActual.emoji}</Text>
              <Text style={[styles.nivelTitulo, { color: nivelActual.color }]}>{nivelActual.titulo}</Text>
              <Text style={styles.nivelDesc}>{nivelActual.desc}</Text>
              <Text style={[styles.nivelMl, { color: nivelActual.color }]}>{mlTotal} ml · {pct}%</Text>

              {/* Barra progreso */}
              <View style={styles.progressBg}>
                <Animated.View style={[styles.progressFill, {
                  width: progressAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }),
                  backgroundColor: nivelActual.color,
                }]} />
              </View>
              <Text style={styles.progressLabel}>{vasos} de {META_VASOS} vasos</Text>
            </Animated.View>

            {/* Vasos interactivos */}
            <View style={styles.vasosCard}>
              <Text style={styles.seccionLabel}>TOCÁ PARA REGISTRAR</Text>
              <View style={styles.vasosGrid}>
                {Array.from({ length: META_VASOS }, (_, i) => (
                  <Vaso
                    key={i}
                    index={i}
                    lleno={i < vasos}
                    onPress={toggleVaso}
                    color={nivelActual.color}
                  />
                ))}
              </View>
              <Text style={styles.vasosTip}>
                {vasos === 0 && '¡Empezá con el primer vaso del día! 💪'}
                {vasos > 0 && vasos < META_VASOS && `${META_VASOS - vasos} vasos más para completar tu meta`}
                {vasos >= META_VASOS && '✅ ¡Meta completada! Tu cuerpo te lo agradece'}
              </Text>
            </View>

            {/* Niveles */}
            <View style={styles.nivelesCard}>
              <Text style={styles.seccionLabel}>NIVELES DE HOY</Text>
              {NIVELES_HIDRA.map((n, i) => (
                <View key={i} style={[styles.nivelRow, vasos >= n.vasos && { opacity: 1 }, vasos < n.vasos && { opacity: 0.35 }]}>
                  <Text style={styles.nivelRowEmoji}>{n.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.nivelRowTitulo, { color: n.color }]}>{n.titulo}</Text>
                    <Text style={styles.nivelRowDesc}>{n.desc}</Text>
                  </View>
                  <Text style={[styles.nivelRowVasos, { color: n.color }]}>{n.vasos}💧</Text>
                  {vasos >= n.vasos && <Text style={styles.nivelCheck}>✓</Text>}
                </View>
              ))}
            </View>

            {/* Frase */}
            <View style={styles.fraseCard}>
              <Text style={styles.fraseTxt}>
                "En keto perdés agua y electrolitos más rápido. Hidratarte no es opcional — es parte del protocolo."
              </Text>
              <Text style={styles.fraseAutor}>— Diego Gaitán</Text>
            </View>
          </>
        )}

        {/* ══════════════════════ TAB STATS ══════════════════════ */}
        {vista === 'info' && (
          <>
            {/* Stats semana */}
            <View style={styles.statsCard}>
              <Text style={styles.seccionLabel}>📊 ESTA SEMANA</Text>
              <View style={styles.statsRow}>
                {[
                  { num: `${promedio}`, label: 'Promedio\nvasos/día', color: '#3b82f6' },
                  { num: `${diasMeta}/7`, label: 'Días con\nmeta completa', color: '#a78bfa' },
                  { num: `${Math.round(promedio * ML_POR_VASO / 1000 * 10) / 10}L`, label: 'Litros\npromedio', color: '#c9a84c' },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Historial barras */}
            <View style={styles.histCard}>
              <Text style={styles.seccionLabel}>ÚLTIMOS 7 DÍAS</Text>
              <View style={styles.barrasWrap}>
                {dias7.map((k) => {
                  const v    = historial[k] || 0;
                  const pctB = v / maxHist;
                  const dia  = new Date(k + 'T12:00:00');
                  const color = v >= META_VASOS ? '#a78bfa' : v >= 6 ? '#c9a84c' : v >= 4 ? '#3b82f6' : '#2a2010';
                  return (
                    <View key={k} style={styles.barraWrap}>
                      <Text style={styles.barraVal}>{v > 0 ? v : ''}</Text>
                      <View style={styles.barraBg}>
                        <View style={[styles.barraFill, {
                          height: `${Math.max(pctB * 100, v > 0 ? 8 : 0)}%`,
                          backgroundColor: color,
                        }]} />
                      </View>
                      <Text style={styles.barraDia}>{DIAS_CORTOS[dia.getDay()]}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.leyendaRow}>
                {[
                  { color: '#3b82f6', label: '4+' },
                  { color: '#c9a84c', label: '6+' },
                  { color: '#a78bfa', label: '8 ✓' },
                ].map((l, i) => (
                  <View key={i} style={styles.leyendaItem}>
                    <View style={[styles.leyendaDot, { backgroundColor: l.color }]} />
                    <Text style={styles.leyendaTxt}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Por qué importa */}
            <View style={styles.infoCard}>
              <Text style={styles.seccionLabel}>💡 POR QUÉ ES CLAVE EN KETO</Text>
              {[
                { emoji: '🔥', titulo: 'Potencia la cetosis', desc: 'El agua es necesaria para que el hígado procese y libere cuerpos cetónicos eficientemente.' },
                { emoji: '⚡', titulo: 'Elimina fatiga keto', desc: 'La mayoría del "keto flu" es deshidratación. 8 vasos al día lo previenen casi completamente.' },
                { emoji: '🧠', titulo: 'Claridad mental', desc: 'El cerebro es 75% agua. Hidratado pensás mejor, tomás mejores decisiones.' },
                { emoji: '💪', titulo: 'Rendimiento físico', desc: 'Incluso un 2% de deshidratación reduce tu fuerza y resistencia notablemente.' },
                { emoji: '🏆', titulo: 'Quema grasa', desc: 'El agua es el medio de transporte de la grasa movilizada. Sin agua, la grasa no se mueve.' },
              ].map((item, i) => (
                <View key={i} style={styles.infoItem}>
                  <Text style={styles.infoEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitulo}>{item.titulo}</Text>
                    <Text style={styles.infoDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ══════════════════════ TAB ELECTROLITOS ══════════════════════ */}
        {vista === 'electrolitos' && (
          <>
            {/* Hero */}
            <View style={styles.electroHero}>
              <Text style={styles.electroHeroEmoji}>⚗️</Text>
              <Text style={styles.electroHeroTitulo}>Recarga de Electrolitos</Text>
              <Text style={styles.electroHeroSub}>
                En keto el cuerpo excreta sodio, potasio y magnesio más rápido. Esta bebida los repone de forma natural.
              </Text>
            </View>

            {/* Receta principal */}
            <View style={styles.recetaCard}>
              <View style={styles.recetaHeader}>
                <Text style={styles.recetaChip}>RECETA OFICIAL KETOCLUB</Text>
                <Text style={styles.recetaTitulo}>Agua de Electrolitos</Text>
                <Text style={styles.recetaSub}>Para 1 litro · Tomar 1 vez por día</Text>
              </View>

              {/* Ingredientes */}
              <View style={styles.ingredientesWrap}>
                {[
                  {
                    emoji: '💧', nombre: 'Agua',
                    cantidad: '1 litro',
                    detalle: 'Filtrada, mineral o temperatura ambiente',
                    color: '#3b82f6',
                  },
                  {
                    emoji: '🧂', nombre: 'Sal marina o del Himalaya',
                    cantidad: '3 gramos',
                    detalle: 'Aproximadamente ½ cucharadita de té. Aporta sodio y minerales traza.',
                    color: '#fb923c',
                  },
                  {
                    emoji: '🍋', nombre: 'Jugo de limón',
                    cantidad: '½ limón',
                    detalle: 'Exprimido fresco. Aporta potasio, vitamina C y mejora el sabor.',
                    color: '#fbbf24',
                  },
                ].map((ing, i) => (
                  <View key={i} style={[styles.ingCard, { borderColor: ing.color + '40' }]}>
                    <View style={[styles.ingIconWrap, { backgroundColor: ing.color + '15' }]}>
                      <Text style={styles.ingEmoji}>{ing.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.ingTopRow}>
                        <Text style={[styles.ingNombre, { color: ing.color }]}>{ing.nombre}</Text>
                        <View style={[styles.ingCantChip, { backgroundColor: ing.color + '20', borderColor: ing.color + '40' }]}>
                          <Text style={[styles.ingCant, { color: ing.color }]}>{ing.cantidad}</Text>
                        </View>
                      </View>
                      <Text style={styles.ingDetalle}>{ing.detalle}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Preparación */}
              <View style={styles.prepCard}>
                <Text style={styles.prepTitulo}>⚡ PREPARACIÓN</Text>
                {[
                  'Llená 1 litro de agua en una jarra o botella.',
                  'Agregá ½ cucharadita de sal marina o del Himalaya.',
                  'Exprimí medio limón y agregá el jugo.',
                  'Mezclá bien y tomá durante el día, de a sorbos.',
                ].map((paso, i) => (
                  <View key={i} style={styles.prepPaso}>
                    <View style={styles.prepNum}>
                      <Text style={styles.prepNumTxt}>{i + 1}</Text>
                    </View>
                    <Text style={styles.prepTxt}>{paso}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Cuándo tomar */}
            <View style={styles.cuandoCard}>
              <Text style={styles.seccionLabel}>⏰ CUÁNDO TOMARLO</Text>
              {[
                { emoji: '🌅', momento: 'Al despertar', desc: 'En ayunas, antes del café. Reactiva el metabolismo.' },
                { emoji: '🏋️', momento: 'Antes de entrenar', desc: 'Prepara los músculos y mejora el rendimiento.' },
                { emoji: '😴', momento: 'Si tenés calambres', desc: 'Señal clara de déficit de electrolitos.' },
                { emoji: '🤒', momento: 'Si sentís "keto flu"', desc: 'Fatiga, dolor de cabeza o mareos — es deshidratación.' },
              ].map((c, i) => (
                <View key={i} style={styles.cuandoItem}>
                  <Text style={styles.cuandoEmoji}>{c.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cuandoMomento}>{c.momento}</Text>
                    <Text style={styles.cuandoDesc}>{c.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Variaciones */}
            <View style={styles.varCard}>
              <Text style={styles.seccionLabel}>🔄 VARIACIONES</Text>
              {[
                { titulo: 'Versión menta', extra: '+ hojas de menta fresca', color: '#4ade80' },
                { titulo: 'Versión jengibre', extra: '+ rodaja de jengibre fresco', color: '#fb923c' },
                { titulo: 'Versión pepino', extra: '+ rodajas de pepino', color: '#6ee7b7' },
              ].map((v, i) => (
                <View key={i} style={[styles.varItem, { borderColor: v.color + '30' }]}>
                  <Text style={[styles.varTitulo, { color: v.color }]}>{v.titulo}</Text>
                  <Text style={styles.varExtra}>{v.extra}</Text>
                </View>
              ))}
            </View>

            {/* Frase final */}
            <View style={styles.fraseCard}>
              <Text style={styles.fraseTxt}>
                "No es solo agua. Es el vehículo que lleva los nutrientes a tus células y saca los desechos. En keto, es tu mejor aliado."
              </Text>
              <Text style={styles.fraseAutor}>— Diego Gaitán</Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0a0a0c' },

  header:           { backgroundColor: '#1a1508', padding: 24, paddingTop: 56,
                      borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn:          { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14,
                      borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)',
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 20 },
  backTxt:          { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerSobre:      { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo:     { fontSize: 36, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub:        { fontSize: 13, color: '#6a5a40' },

  tabs:             { flexDirection: 'row', backgroundColor: '#13120f',
                      borderBottomWidth: 1, borderBottomColor: '#2a2010' },
  tab:              { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActiva:        { borderBottomWidth: 2, borderBottomColor: '#c9a84c' },
  tabTxt:           { fontSize: 11, color: '#6a5a40', fontWeight: '700' },
  tabTxtActiva:     { color: '#c9a84c', fontWeight: '900' },

  body:             { flex: 1, padding: 16 },
  seccionLabel:     { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 14 },

  celebCard:        { backgroundColor: '#1a2a1a', borderRadius: 16, padding: 16,
                      borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.4)',
                      alignItems: 'center', marginBottom: 12 },
  celebTxt:         { fontSize: 16, fontWeight: '900', color: '#4ade80' },

  nivelCard:        { backgroundColor: '#13120f', borderRadius: 20, padding: 24,
                      borderWidth: 1.5, alignItems: 'center', marginBottom: 14 },
  nivelEmoji:       { fontSize: 44, marginBottom: 8 },
  nivelTitulo:      { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  nivelDesc:        { fontSize: 13, color: '#8a7a60', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  nivelMl:          { fontSize: 18, fontWeight: '900', marginBottom: 14 },
  progressBg:       { width: '100%', backgroundColor: '#1e1e18', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 8 },
  progressFill:     { height: 10, borderRadius: 8 },
  progressLabel:    { fontSize: 12, color: '#6a5a40' },

  vasosCard:        { backgroundColor: '#13120f', borderRadius: 20, padding: 20,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  vasosGrid:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  vasosTip:         { fontSize: 12, color: '#6a5a40', textAlign: 'center', lineHeight: 18 },

  nivelesCard:      { backgroundColor: '#13120f', borderRadius: 20, padding: 20,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  nivelRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  nivelRowEmoji:    { fontSize: 22, width: 30, textAlign: 'center' },
  nivelRowTitulo:   { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  nivelRowDesc:     { fontSize: 12, color: '#6a5a40', lineHeight: 18 },
  nivelRowVasos:    { fontSize: 12, fontWeight: '900' },
  nivelCheck:       { fontSize: 16, color: '#4ade80', marginLeft: 4 },

  fraseCard:        { backgroundColor: '#13120f', borderRadius: 18, padding: 20,
                      borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 14 },
  fraseTxt:         { fontSize: 14, color: '#e8e0d0', lineHeight: 24, fontStyle: 'italic', marginBottom: 10 },
  fraseAutor:       { fontSize: 12, color: '#6a5a40' },

  statsCard:        { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  statsRow:         { flexDirection: 'row' },
  statItem:         { flex: 1, alignItems: 'center' },
  statNum:          { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel:        { fontSize: 10, color: '#6a5a40', textAlign: 'center', lineHeight: 16 },

  histCard:         { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  barrasWrap:       { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 6, marginBottom: 12 },
  barraWrap:        { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barraVal:         { fontSize: 9, color: '#6a5a40', marginBottom: 4 },
  barraBg:          { width: '100%', backgroundColor: '#1e1e18', borderRadius: 6, height: 80,
                      overflow: 'hidden', justifyContent: 'flex-end' },
  barraFill:        { width: '100%', borderRadius: 6 },
  barraDia:         { fontSize: 10, color: '#4a3a20', marginTop: 6 },
  leyendaRow:       { flexDirection: 'row', gap: 16 },
  leyendaItem:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot:       { width: 8, height: 8, borderRadius: 4 },
  leyendaTxt:       { fontSize: 11, color: '#6a5a40' },

  infoCard:         { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  infoItem:         { flexDirection: 'row', gap: 14, marginBottom: 18, alignItems: 'flex-start' },
  infoEmoji:        { fontSize: 24, width: 32, textAlign: 'center' },
  infoTitulo:       { fontSize: 14, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  infoDesc:         { fontSize: 13, color: '#8a7a60', lineHeight: 20 },

  electroHero:      { backgroundColor: '#13120f', borderRadius: 20, padding: 24,
                      borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.3)',
                      alignItems: 'center', marginBottom: 14 },
  electroHeroEmoji: { fontSize: 48, marginBottom: 12 },
  electroHeroTitulo:{ fontSize: 22, fontWeight: '900', color: '#f0e6c8', marginBottom: 8 },
  electroHeroSub:   { fontSize: 13, color: '#8a7a60', textAlign: 'center', lineHeight: 22 },

  recetaCard:       { backgroundColor: '#13120f', borderRadius: 20, padding: 20,
                      borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.25)', marginBottom: 14 },
  recetaHeader:     { alignItems: 'center', marginBottom: 20 },
  recetaChip:       { fontSize: 9, color: '#c9a84c', fontWeight: '900', letterSpacing: 2,
                      backgroundColor: 'rgba(201,168,76,0.12)', borderRadius: 999,
                      paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  recetaTitulo:     { fontSize: 20, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  recetaSub:        { fontSize: 12, color: '#6a5a40' },

  ingredientesWrap: { gap: 12, marginBottom: 20 },
  ingCard:          { flexDirection: 'row', gap: 14, borderRadius: 16,
                      borderWidth: 1.5, padding: 16, alignItems: 'flex-start' },
  ingIconWrap:      { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ingEmoji:         { fontSize: 24 },
  ingTopRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  ingNombre:        { fontSize: 15, fontWeight: '900' },
  ingCantChip:      { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  ingCant:          { fontSize: 11, fontWeight: '900' },
  ingDetalle:       { fontSize: 12, color: '#8a7a60', lineHeight: 18 },

  prepCard:         { backgroundColor: '#0a0a0c', borderRadius: 16, padding: 16 },
  prepTitulo:       { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 14 },
  prepPaso:         { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  prepNum:          { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(201,168,76,0.2)',
                      borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  prepNumTxt:       { fontSize: 11, fontWeight: '900', color: '#c9a84c' },
  prepTxt:          { flex: 1, fontSize: 13, color: '#e8e0d0', lineHeight: 20 },

  cuandoCard:       { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  cuandoItem:       { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  cuandoEmoji:      { fontSize: 22, width: 30, textAlign: 'center' },
  cuandoMomento:    { fontSize: 14, fontWeight: '900', color: '#f0e6c8', marginBottom: 3 },
  cuandoDesc:       { fontSize: 12, color: '#8a7a60', lineHeight: 18 },

  varCard:          { backgroundColor: '#13120f', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#2a2010', marginBottom: 14 },
  varItem:          { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
                      flexDirection: 'row', alignItems: 'center', gap: 12 },
  varTitulo:        { fontSize: 14, fontWeight: '900', flex: 1 },
  varExtra:         { fontSize: 12, color: '#6a5a40' },
});

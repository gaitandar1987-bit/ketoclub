import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PROGRAMAS = {
  umbral: {
    key: 'umbral',
    numero: 'MES 1',
    nombre: 'EL UMBRAL',
    emoji: '🔥',
    color: '#c9a84c',
    colorDark: '#7a5a1a',
    subtitulo: 'Cruzá el límite que te mantuvo estancado.',
    tagline: '30 días de disciplina, identidad y transformación real.',
    descripcion: 'El Umbral no es un programa de dieta.\nEs el primer acto de elegirte a vos mismo.\n\nAquí vas a construir los hábitos que definen quién sos cuando nadie te mira. Vas a aprender que tu cuerpo es consecuencia de tu identidad, no al revés.\n\n30 días para demostrar que tu palabra tiene peso.\n30 días para cruzar el límite que te mantuvo donde estás.\n30 días para ser irreversiblemente diferente.',
    contrato: 'Me comprometo durante 30 días a cruzar el umbral que me separaba de quien quiero ser.\n\nEsto no es un intento. Es una decisión.\n\nVoy a seguir el protocolo nutricional keto, las prácticas diarias y las preguntas de profundidad — especialmente cuando no tenga ganas.\n\nEntiendo que la disciplina que construya aquí va a vivir en mí para siempre.',
    icono: '⚡',
    stats: ['Ayuno 16:8', '5 prácticas diarias', '30 preguntas profundas', 'Keto base'],
  },
  despertar: {
    key: 'despertar',
    numero: 'MES 2',
    nombre: 'EL DESPERTAR',
    emoji: '🌅',
    color: '#a78bfa',
    colorDark: '#4a2a8a',
    subtitulo: 'Activá la versión de vos que siempre existió.',
    tagline: 'Para quienes ya demostraron que su palabra tiene peso.',
    descripcion: 'El Umbral te forjó.\nEl Despertar te revela.\n\nAquí no se construyen hábitos. Se activa una identidad que ya existe dentro tuyo y que estaba esperando permiso para emerger.\n\nEste proceso va más adentro. Toca tu energía vital, tu propósito, tu legado. Toca lo que dejás cuando ya no estés.\n\n30 días para ir más profundo que el cuerpo.\n30 días para fluir desde la fuerza.\n30 días para despertar al que siempre fuiste.',
    contrato: 'Habiendo cruzado el Umbral y demostrado que mi palabra tiene peso, me comprometo durante 30 días a actuar desde mi versión más expandida y más honesta.\n\nVoy a ir más allá del cuerpo. Voy a trabajar mi energía, mi sueño, mi espiritualidad y mi propósito.\n\nEntiendo que este proceso no me pide perfección. Me pide coherencia. Y eso lo puedo dar.',
    icono: '✨',
    stats: ['Ayuno 16:8 avanzado', '5 pilares integrados', 'Identidad profunda', 'Keto avanzado'],
  },
};

function PulsingDot({ color, size = 8, delay = 0 }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
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

export default function ProgramSelectionScreen({ member, onSelect }) {
  const [modalPrograma, setModalPrograma] = useState(null);
  const [nombre, setNombre] = useState(member?.name?.split(' ')[0] || '');
  const [firmando, setFirmando] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleFirmar() {
    if (!nombre.trim()) {
      Alert.alert('Falta tu nombre', 'Escribí tu nombre para firmar el contrato.');
      return;
    }
    Alert.alert(
      `¿Estás seguro, ${nombre.trim()}?`,
      `Una vez que activés ${PROGRAMAS[modalPrograma].nombre}, el otro programa quedará bloqueado hasta el próximo mes.\n\nEsta es tu decisión.`,
      [
        { text: 'Esperar', style: 'cancel' },
        {
          text: '✍️ Firmar y comenzar',
          onPress: async () => {
            setFirmando(true);
            const memberKey = member?.phone || member?.id || 'guest';
            const ahora = new Date().toISOString();
            await AsyncStorage.setItem(`selected_program_${memberKey}`, modalPrograma);
            await AsyncStorage.setItem(`program_selected_at_${memberKey}`, ahora);
            await AsyncStorage.setItem(`program_contract_name_${memberKey}`, nombre.trim());
            setTimeout(() => {
              setFirmando(false);
              setModalPrograma(null);
              onSelect(modalPrograma, ahora);
            }, 600);
          },
        },
      ]
    );
  }

  const prog = modalPrograma ? PROGRAMAS[modalPrograma] : null;

  return (
    <View style={styles.container}>

      {/* ── FONDO ── */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── INTRO ── */}
        <Animated.View style={[styles.intro, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.introDots}>
            <PulsingDot color="#c9a84c" size={6} delay={0} />
            <PulsingDot color="#c9a84c" size={4} delay={300} />
            <PulsingDot color="#c9a84c" size={6} delay={600} />
          </View>
          <Text style={styles.introSobre}>IDENTIDAD ATÓMICA · DIEGO GAITÁN</Text>
          <Text style={styles.introTitulo}>Elegí tu{'\n'}programa.</Text>
          <Text style={styles.introSub}>
            Solo podés activar uno por mes.{'\n'}
            La otra puerta se cierra hasta la próxima activación.{'\n'}
            Elegí con consciencia.
          </Text>
          <View style={styles.introLinea} />
        </Animated.View>

        {/* ── CARDS ── */}
        {Object.values(PROGRAMAS).map((p, index) => (
          <Animated.View
            key={p.key}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: Animated.add(slideAnim, new Animated.Value(index * 20)) }],
            }}
          >
            <TouchableOpacity
              style={[styles.card, { borderColor: p.color + '50' }]}
              onPress={() => setModalPrograma(p.key)}
              activeOpacity={0.9}
            >
              {/* Glow top */}
              <View style={[styles.cardGlowTop, { backgroundColor: p.color + '18' }]} />

              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.cardNumeroWrap, { backgroundColor: p.color + '18', borderColor: p.color + '40' }]}>
                  <Text style={[styles.cardNumero, { color: p.color }]}>{p.numero}</Text>
                </View>
                <Text style={styles.cardEmoji}>{p.emoji}</Text>
              </View>

              {/* Nombre */}
              <Text style={[styles.cardNombre, { color: p.color }]}>{p.nombre}</Text>
              <Text style={styles.cardSubtitulo}>{p.subtitulo}</Text>
              <Text style={styles.cardTagline}>{p.tagline}</Text>

              {/* Stats */}
              <View style={styles.cardStats}>
                {p.stats.map((s, i) => (
                  <View key={i} style={[styles.statChip, { borderColor: p.color + '30' }]}>
                    <View style={[styles.statDot, { backgroundColor: p.color }]} />
                    <Text style={styles.statTxt}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <View style={[styles.cardCTA, { backgroundColor: p.color + '15', borderColor: p.color + '40' }]}>
                <Text style={[styles.cardCTATxt, { color: p.color }]}>
                  {p.icono}  Activar {p.nombre}  →
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* ── AVISO ── */}
        <View style={styles.aviso}>
          <Text style={styles.avisoIcon}>🔒</Text>
          <Text style={styles.avisoTxt}>
            Al activar un programa, el otro queda bloqueado durante 30 días.
            Cada mes se habilita una nueva activación.
          </Text>
        </View>

        <Text style={styles.footer}>Ketoclub · Diego Gaitán</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════════════════
          MODAL DE CONTRATO
      ══════════════════════════════════════════════════════ */}
      <Modal
        visible={!!modalPrograma}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalPrograma(null)}
      >
        {prog && (
          <ScrollView
            style={[styles.modalContainer, { backgroundColor: '#0a0a0c' }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Glow */}
            <View style={[styles.modalGlow, { backgroundColor: prog.color + '12' }]} />

            {/* Cerrar */}
            <TouchableOpacity
              onPress={() => setModalPrograma(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseTxt}>✕ Cerrar</Text>
            </TouchableOpacity>

            {/* Número y emoji */}
            <View style={styles.modalTopRow}>
              <View style={[styles.modalNumeroWrap, { backgroundColor: prog.color + '20', borderColor: prog.color + '50' }]}>
                <Text style={[styles.modalNumero, { color: prog.color }]}>{prog.numero}</Text>
              </View>
              <Text style={styles.modalEmoji}>{prog.emoji}</Text>
            </View>

            {/* Título */}
            <Text style={[styles.modalNombre, { color: prog.color }]}>{prog.nombre}</Text>
            <Text style={styles.modalSubtitulo}>{prog.subtitulo}</Text>

            {/* Separador */}
            <View style={[styles.modalSep, { backgroundColor: prog.color + '40' }]} />

            {/* Descripción */}
            <Text style={styles.modalDescTxt}>{prog.descripcion}</Text>

            {/* Separador 2 */}
            <View style={[styles.modalSep, { backgroundColor: prog.color + '25' }]} />

            {/* Contrato */}
            <View style={[styles.contratoWrap, { borderColor: prog.color + '35', backgroundColor: prog.color + '06' }]}>
              <Text style={[styles.contratoTitulo, { color: prog.color }]}>
                ✍️  CONTRATO DE IDENTIDAD
              </Text>
              <Text style={styles.contratoTxt}>{prog.contrato}</Text>

              {/* Firma */}
              <View style={styles.firmaWrap}>
                <Text style={[styles.firmaLabel, { color: prog.color }]}>
                  Tu nombre como firma:
                </Text>
                <TextInput
                  style={[styles.firmaInput, { borderColor: prog.color + '50', color: prog.color }]}
                  placeholder="Escribí tu nombre..."
                  placeholderTextColor="#4a3a20"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                <Text style={styles.firmaFecha}>
                  Fecha: {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>

            {/* Botón firmar */}
            <TouchableOpacity
              style={[styles.firmarBtn, {
                backgroundColor: prog.color,
                shadowColor: prog.color,
                opacity: firmando ? 0.7 : 1,
              }]}
              onPress={handleFirmar}
              activeOpacity={0.88}
              disabled={firmando}
            >
              <Text style={styles.firmarBtnTxt}>
                {firmando ? 'Activando...' : `✍️  Firmar y activar ${prog.nombre}`}
              </Text>
            </TouchableOpacity>

            {/* Aviso cierre */}
            <View style={styles.modalAviso}>
              <Text style={styles.modalAvisoEmoji}>⚠️</Text>
              <Text style={styles.modalAvisoTxt}>
                Al confirmar, el otro programa quedará bloqueado durante 30 días.
                Esta decisión no se puede deshacer.
              </Text>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08070a' },
  bgGlow1: {
    position: 'absolute', top: -100, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  bgGlow2: {
    position: 'absolute', top: 400, right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(167,139,250,0.05)',
  },
  scroll: { padding: 20, paddingTop: 60 },

  // Intro
  intro: { marginBottom: 36 },
  introDots: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 16 },
  introSobre: { fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 3, marginBottom: 12 },
  introTitulo: {
    fontSize: 46, fontWeight: '900', color: '#f0e6c8',
    lineHeight: 50, marginBottom: 16, letterSpacing: -1,
  },
  introSub: {
    fontSize: 14, color: '#8a7a60', lineHeight: 24,
  },
  introLinea: {
    height: 1, backgroundColor: 'rgba(201,168,76,0.2)',
    marginTop: 28,
  },

  // Cards
  card: {
    backgroundColor: '#100f0c',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardGlowTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 80, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  cardNumeroWrap: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  cardNumero: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  cardEmoji: { fontSize: 32 },
  cardNombre: {
    fontSize: 34, fontWeight: '900', letterSpacing: 1,
    marginBottom: 8,
  },
  cardSubtitulo: {
    fontSize: 16, color: '#e8e0d0', fontWeight: '700',
    marginBottom: 6, lineHeight: 22,
  },
  cardTagline: {
    fontSize: 13, color: '#6a5a40', lineHeight: 20, marginBottom: 20,
  },
  cardStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  statDot: { width: 5, height: 5, borderRadius: 3 },
  statTxt: { fontSize: 11, color: '#8a7a60', fontWeight: '700' },
  cardCTA: {
    borderWidth: 1.5, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  cardCTATxt: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  // Aviso
  aviso: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, padding: 16, marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  avisoIcon: { fontSize: 16 },
  avisoTxt: { fontSize: 12, color: '#4a3a20', lineHeight: 20, flex: 1 },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: '#2a2218', fontWeight: '700',
    letterSpacing: 2, marginTop: 28,
  },

  // Modal
  modalContainer: { flex: 1, padding: 24, paddingTop: 56 },
  modalGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
  },
  modalCloseBtn: {
    alignSelf: 'flex-end', padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, marginBottom: 24,
  },
  modalCloseTxt: { color: '#4a3a20', fontSize: 12, fontWeight: '900' },
  modalTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  modalNumeroWrap: {
    borderWidth: 1.5, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  modalNumero: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  modalEmoji: { fontSize: 44 },
  modalNombre: {
    fontSize: 38, fontWeight: '900', letterSpacing: 1,
    marginBottom: 8,
  },
  modalSubtitulo: {
    fontSize: 16, color: '#e8e0d0', fontWeight: '600',
    lineHeight: 24, marginBottom: 24,
  },
  modalSep: { height: 1, marginVertical: 24, borderRadius: 1 },
  modalDescTxt: {
    fontSize: 15, color: '#c8bfa8', lineHeight: 28,
    fontStyle: 'italic', marginBottom: 4,
  },

  // Contrato
  contratoWrap: {
    borderRadius: 20, borderWidth: 1.5, padding: 22, marginBottom: 20,
  },
  contratoTitulo: {
    fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 16,
  },
  contratoTxt: {
    fontSize: 14, color: '#e8e0d0', lineHeight: 26, marginBottom: 24,
  },
  firmaWrap: { gap: 10 },
  firmaLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  firmaInput: {
    borderWidth: 1.5, borderRadius: 12,
    padding: 14, fontSize: 16, fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  firmaFecha: { fontSize: 11, color: '#4a3a20', fontStyle: 'italic' },

  // Botón firmar
  firmarBtn: {
    borderRadius: 18, paddingVertical: 20,
    alignItems: 'center',
    shadowOpacity: 0.5, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10, marginBottom: 16,
  },
  firmarBtnTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 17, letterSpacing: 0.3 },

  // Aviso modal
  modalAviso: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  modalAvisoEmoji: { fontSize: 14 },
  modalAvisoTxt: { fontSize: 12, color: '#4a3a20', lineHeight: 20, flex: 1 },
});
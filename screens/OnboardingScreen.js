import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, TextInput, ScrollView, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

// ─── Slides introductorios ────────────────────────────────────
const SLIDES = [
  { icon: '🔥', titulo: 'Bienvenida a\nKetoclub',       sub: 'La comunidad de transformación real. Acá no hay excusas, hay resultados.',                         color: '#c9a84c', bg: '#1a1205' },
  { icon: '🥑', titulo: 'Keto simple\ny real',          sub: 'Sin complicaciones. Comida real, hábitos reales, resultados que se ven y se sienten.',              color: '#4ade80', bg: '#051a0e' },
  { icon: '🧘', titulo: 'Cuerpo, mente\ny espíritu',    sub: 'Respiración, journaling, grounding y meditación. Tu transformación es integral.',                   color: '#a78bfa', bg: '#0d0514' },
  { icon: '👑', titulo: 'Tu identidad\nte espera',      sub: 'En 30 días vas a ser una persona diferente. Comprometete con vos misma hoy.',                       color: '#f87171', bg: '#1a0505' },
];

const OBJETIVOS = [
  { id: 'bajar_peso',     emoji: '⚖️',  label: 'Bajar de peso',       desc: 'Reducir grasa y sentirme liviano/a' },
  { id: 'energia',        emoji: '⚡',  label: 'Más energía',          desc: 'Dejar el cansancio crónico atrás'   },
  { id: 'mente',          emoji: '🧠',  label: 'Control mental',       desc: 'Foco, disciplina y claridad'        },
  { id: 'rendimiento',    emoji: '💪',  label: 'Rendimiento físico',   desc: 'Fuerza, resistencia y vitalidad'    },
];

const EXPERIENCIAS = [
  { id: 'principiante', emoji: '🌱', label: 'Principiante', desc: 'Recién empiezo con keto' },
  { id: 'intermedio',   emoji: '🔥', label: 'Intermedio',   desc: 'Llevo un tiempo en keto' },
  { id: 'avanzado',     emoji: '💎', label: 'Avanzado',     desc: 'Keto es mi estilo de vida' },
];

// ─── Barra de progreso de pasos ───────────────────────────────
function ProgressBar({ step, total, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: step / total,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step]);

  return (
    <View style={pbStyles.wrap}>
      <Animated.View style={[pbStyles.fill, {
        width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        backgroundColor: color,
      }]} />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  wrap: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginHorizontal: 24, marginTop: 8 },
  fill: { height: 3, borderRadius: 3 },
});

// ─── Paso: Nombre ─────────────────────────────────────────────
function StepNombre({ nombre, setNombre, onNext }) {
  const inputAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(inputAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }, []);

  return (
    <Animated.View style={[stepStyles.wrap, { opacity: inputAnim, transform: [{ scale: inputAnim.interpolate({ inputRange: [0,1], outputRange: [0.92,1] }) }] }]}>
      <Text style={stepStyles.emoji}>✍️</Text>
      <Text style={stepStyles.titulo}>¿Cómo te llamás?</Text>
      <Text style={stepStyles.sub}>Tu nombre va a aparecer en tu experiencia dentro de la app.</Text>

      <TextInput
        style={stepStyles.input}
        placeholder="Tu nombre..."
        placeholderTextColor="#4a3a20"
        value={nombre}
        onChangeText={setNombre}
        autoFocus
        maxLength={30}
        returnKeyType="done"
        onSubmitEditing={() => nombre.trim() && onNext()}
      />

      <TouchableOpacity
        style={[stepStyles.btn, { backgroundColor: nombre.trim() ? '#c9a84c' : '#2a2010' }]}
        onPress={() => nombre.trim() && onNext()}
        activeOpacity={0.85}
      >
        <Text style={[stepStyles.btnTxt, { color: nombre.trim() ? '#0a0a0c' : '#4a3a20' }]}>
          Continuar →
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Paso: Objetivo ───────────────────────────────────────────
function StepObjetivo({ objetivo, setObjetivo, onNext }) {
  return (
    <View style={stepStyles.wrap}>
      <Text style={stepStyles.emoji}>🎯</Text>
      <Text style={stepStyles.titulo}>¿Cuál es tu objetivo principal?</Text>
      <Text style={stepStyles.sub}>Vamos a personalizar tu experiencia según lo que buscás.</Text>

      <View style={stepStyles.opciones}>
        {OBJETIVOS.map(o => (
          <TouchableOpacity
            key={o.id}
            style={[stepStyles.opcion, objetivo === o.id && stepStyles.opcionSeleccionada]}
            onPress={() => setObjetivo(o.id)}
            activeOpacity={0.85}
          >
            <Text style={stepStyles.opcionEmoji}>{o.emoji}</Text>
            <View style={stepStyles.opcionTextos}>
              <Text style={[stepStyles.opcionLabel, objetivo === o.id && { color: '#c9a84c' }]}>{o.label}</Text>
              <Text style={stepStyles.opcionDesc}>{o.desc}</Text>
            </View>
            {objetivo === o.id && <Text style={stepStyles.opcionCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[stepStyles.btn, { backgroundColor: objetivo ? '#c9a84c' : '#2a2010' }]}
        onPress={() => objetivo && onNext()}
        activeOpacity={0.85}
      >
        <Text style={[stepStyles.btnTxt, { color: objetivo ? '#0a0a0c' : '#4a3a20' }]}>Continuar →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Paso: Experiencia ────────────────────────────────────────
function StepExperiencia({ experiencia, setExperiencia, onNext }) {
  return (
    <View style={stepStyles.wrap}>
      <Text style={stepStyles.emoji}>📊</Text>
      <Text style={stepStyles.titulo}>¿Cuánta experiencia tenés con keto?</Text>
      <Text style={stepStyles.sub}>Sin juicios. Cada punto de partida es válido.</Text>

      <View style={stepStyles.opciones}>
        {EXPERIENCIAS.map(e => (
          <TouchableOpacity
            key={e.id}
            style={[stepStyles.opcion, experiencia === e.id && stepStyles.opcionSeleccionada]}
            onPress={() => setExperiencia(e.id)}
            activeOpacity={0.85}
          >
            <Text style={stepStyles.opcionEmoji}>{e.emoji}</Text>
            <View style={stepStyles.opcionTextos}>
              <Text style={[stepStyles.opcionLabel, experiencia === e.id && { color: '#c9a84c' }]}>{e.label}</Text>
              <Text style={stepStyles.opcionDesc}>{e.desc}</Text>
            </View>
            {experiencia === e.id && <Text style={stepStyles.opcionCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[stepStyles.btn, { backgroundColor: experiencia ? '#c9a84c' : '#2a2010' }]}
        onPress={() => experiencia && onNext()}
        activeOpacity={0.85}
      >
        <Text style={[stepStyles.btnTxt, { color: experiencia ? '#0a0a0c' : '#4a3a20' }]}>Continuar →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Paso: Foto de perfil ─────────────────────────────────────
function StepFoto({ foto, setFoto, nombre, onFinish }) {
  async function elegirFoto(fuente) {
    try {
      const opts = { allowsEditing: true, aspect: [1, 1], quality: 0.8 };
      let result;
      if (fuente === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        result = await ImagePicker.launchCameraAsync(opts);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        result = await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ImagePicker.MediaTypeOptions.Images });
      }
      if (!result.canceled) setFoto(result.assets[0].uri);
    } catch (e) {}
  }

  return (
    <View style={stepStyles.wrap}>
      <Text style={stepStyles.emoji}>📸</Text>
      <Text style={stepStyles.titulo}>Tu foto de perfil</Text>
      <Text style={stepStyles.sub}>Opcional. Podés cambiarla cuando quieras.</Text>

      <TouchableOpacity
        style={stepStyles.fotoCircle}
        onPress={() => elegirFoto('library')}
        activeOpacity={0.85}
      >
        {foto
          ? <Image source={{ uri: foto }} style={stepStyles.fotoImg} />
          : (
            <View style={stepStyles.fotoPlaceholder}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={stepStyles.fotoHint}>Tocar para elegir</Text>
            </View>
          )
        }
      </TouchableOpacity>

      <View style={stepStyles.fotoBtns}>
        <TouchableOpacity style={stepStyles.fotoBtnSec} onPress={() => elegirFoto('camera')} activeOpacity={0.8}>
          <Text style={stepStyles.fotoBtnSecTxt}>📷 Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={stepStyles.fotoBtnSec} onPress={() => elegirFoto('library')} activeOpacity={0.8}>
          <Text style={stepStyles.fotoBtnSecTxt}>🖼 Galería</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[stepStyles.btn, { backgroundColor: '#c9a84c' }]} onPress={onFinish} activeOpacity={0.85}>
        <Text style={[stepStyles.btnTxt, { color: '#0a0a0c' }]}>
          {foto ? `¡Listo, ${nombre}! 🔥` : 'Omitir y entrar →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  wrap:               { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emoji:              { fontSize: 52, marginBottom: 20 },
  titulo:             { fontSize: 28, fontWeight: '900', color: '#f0e6c8', textAlign: 'center', marginBottom: 10, lineHeight: 36 },
  sub:                { fontSize: 14, color: '#6a5a40', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  input:              { width: '100%', backgroundColor: '#13120f', borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)', borderRadius: 16, padding: 18, color: '#f0e6c8', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  opciones:           { width: '100%', gap: 10, marginBottom: 24 },
  opcion:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, borderColor: '#2a2010', padding: 16, gap: 14 },
  opcionSeleccionada: { borderColor: '#c9a84c', backgroundColor: 'rgba(201,168,76,0.08)' },
  opcionEmoji:        { fontSize: 26 },
  opcionTextos:       { flex: 1 },
  opcionLabel:        { fontSize: 15, fontWeight: '900', color: '#f0e6c8', marginBottom: 2 },
  opcionDesc:         { fontSize: 12, color: '#4a3a20' },
  opcionCheck:        { fontSize: 16, color: '#c9a84c', fontWeight: '900' },
  btn:                { width: '100%', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnTxt:             { fontSize: 16, fontWeight: '900' },
  fotoCircle:         { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(201,168,76,0.4)', marginBottom: 20 },
  fotoImg:            { width: 140, height: 140 },
  fotoPlaceholder:    { width: 140, height: 140, backgroundColor: '#13120f', alignItems: 'center', justifyContent: 'center', gap: 6 },
  fotoHint:           { fontSize: 11, color: '#4a3a20', fontWeight: '700' },
  fotoBtns:           { flexDirection: 'row', gap: 12, marginBottom: 24 },
  fotoBtnSec:         { backgroundColor: '#13120f', borderWidth: 1, borderColor: '#2a2010', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  fotoBtnSecTxt:      { color: '#c9a84c', fontWeight: '700', fontSize: 13 },
});

// ─── OnboardingScreen principal ───────────────────────────────
const TOTAL_PASOS_PERSONALIZACION = 4; // nombre, objetivo, experiencia, foto

export default function OnboardingScreen({ member, onFinish }) {
  // Fase 1: slides introductorios
  const [slideActual, setSlideActual] = useState(0);
  const [fasePersonalizacion, setFasePersonalizacion] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);

  // Datos del usuario
  const [nombre,      setNombre]      = useState(member?.name?.split(' ')[0] || '');
  const [objetivo,    setObjetivo]    = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [foto,        setFoto]        = useState(null);

  // Animación de transición
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slide = SLIDES[slideActual];

  function animTransicion(fn) {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      fn();
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    });
  }

  function siguienteSlide() {
    if (slideActual < SLIDES.length - 1) {
      animTransicion(() => setSlideActual(s => s + 1));
    } else {
      animTransicion(() => setFasePersonalizacion(true));
    }
  }

  function saltarSlides() {
    animTransicion(() => setFasePersonalizacion(true));
  }

  function siguientePaso() {
    animTransicion(() => setPasoActual(p => p + 1));
  }

  async function terminar() {
    const memberKey = member?.phone || member?.id || 'guest';
    try {
      await AsyncStorage.setItem(`perfil_nombre_${memberKey}`,      nombre.trim());
      await AsyncStorage.setItem(`perfil_objetivo_${memberKey}`,    objetivo);
      await AsyncStorage.setItem(`perfil_experiencia_${memberKey}`, experiencia);
      if (foto) await AsyncStorage.setItem(`foto_${memberKey}`,     foto);
    } catch (e) {}
    onFinish({ nombre: nombre.trim(), objetivo, experiencia, foto });
  }

  // ── FASE 1: slides ──────────────────────────────────────────
  if (!fasePersonalizacion) {
    return (
      <View style={[styles.container, { backgroundColor: slide.bg }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={saltarSlides} style={styles.skipBtn}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.iconCircle, { borderColor: slide.color + '50', backgroundColor: slide.color + '18' }]}>
            <Text style={styles.icon}>{slide.icon}</Text>
            <View style={[styles.iconGlow, { backgroundColor: slide.color + '20' }]} />
          </View>
          <Text style={[styles.titulo, { color: slide.color }]}>{slide.titulo}</Text>
          <Text style={styles.sub}>{slide.sub}</Text>
          <View style={styles.brandRow}>
            <View style={[styles.brandLine, { backgroundColor: slide.color + '40' }]} />
            <Text style={[styles.brandText, { color: slide.color + '80' }]}>KETOCLUB</Text>
            <View style={[styles.brandLine, { backgroundColor: slide.color + '40' }]} />
          </View>
        </Animated.View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <TouchableOpacity key={i} onPress={() => animTransicion(() => setSlideActual(i))}>
                <View style={[
                  styles.dot,
                  i === slideActual
                    ? { backgroundColor: slide.color, width: 24, borderRadius: 4 }
                    : { backgroundColor: slide.color + '30', width: 8 },
                ]} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: slide.color }]}
            onPress={siguienteSlide}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {slideActual < SLIDES.length - 1 ? 'Siguiente →' : 'Personalizar mi experiencia →'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.terms}>Al continuar aceptás los términos de uso de Ketoclub</Text>
        </View>
      </View>
    );
  }

  // ── FASE 2: personalización ──────────────────────────────────
  const pasoColor = pasoActual === 4 ? '#c9a84c' : '#c9a84c';

  return (
    <View style={[styles.container, { backgroundColor: '#0a0a0c' }]}>
      {/* Top bar con progreso */}
      <View style={styles.topBarPaso}>
        <Text style={styles.pasoLabel}>PASO {pasoActual} DE {TOTAL_PASOS_PERSONALIZACION}</Text>
      </View>
      <ProgressBar step={pasoActual} total={TOTAL_PASOS_PERSONALIZACION} color="#c9a84c" />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {pasoActual === 1 && (
          <StepNombre nombre={nombre} setNombre={setNombre} onNext={siguientePaso} />
        )}
        {pasoActual === 2 && (
          <StepObjetivo objetivo={objetivo} setObjetivo={setObjetivo} onNext={siguientePaso} />
        )}
        {pasoActual === 3 && (
          <StepExperiencia experiencia={experiencia} setExperiencia={setExperiencia} onNext={siguientePaso} />
        )}
        {pasoActual === 4 && (
          <StepFoto foto={foto} setFoto={setFoto} nombre={nombre} onFinish={terminar} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'space-between' },
  topBar:       { paddingTop: 60, paddingHorizontal: 24, alignItems: 'flex-end' },
  topBarPaso:   { paddingTop: 60, paddingHorizontal: 24, alignItems: 'center' },
  pasoLabel:    { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 2 },
  skipBtn:      { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  skipText:     { color: '#4a3a20', fontSize: 13, fontWeight: '700' },
  content:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle:   { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 36, position: 'relative' },
  iconGlow:     { position: 'absolute', width: 170, height: 170, borderRadius: 85 },
  icon:         { fontSize: 60 },
  titulo:       { fontSize: 34, fontWeight: '900', textAlign: 'center', marginBottom: 16, lineHeight: 42, letterSpacing: 0.5 },
  sub:          { fontSize: 16, color: '#c8bfa8', lineHeight: 26, textAlign: 'center', marginBottom: 28 },
  brandRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLine:    { flex: 1, height: 1 },
  brandText:    { fontSize: 11, fontWeight: '900', letterSpacing: 4 },
  bottom:       { paddingHorizontal: 24, paddingBottom: 48 },
  dots:         { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24, alignItems: 'center' },
  dot:          { height: 8, borderRadius: 4 },
  btn:          { borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 16, shadowColor: '#c9a84c', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  btnText:      { color: '#0a0a0c', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  terms:        { fontSize: 11, color: '#2a2010', textAlign: 'center' },
});

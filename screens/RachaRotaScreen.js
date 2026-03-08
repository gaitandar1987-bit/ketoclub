import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SW, height: SH } = Dimensions.get('window');

const MENSAJES = [
  {
    titulo:  "Hoy no pudo ser.",
    cuerpo:  "Eso no te define. Define el momento en que decidís volver.",
    accion:  "Retomar mañana →",
  },
  {
    titulo:  "La racha se cortó.",
    cuerpo:  "Pero la identidad no. Una caída no borra lo que ya construiste.",
    accion:  "Volver a empezar →",
  },
  {
    titulo:  "Un día sin completar.",
    cuerpo:  "Todos los que llegaron lejos tuvieron días así. La diferencia es que volvieron.",
    accion:  "Volver mañana →",
  },
];

// Partícula que cae
function Particula({ delay, color }) {
  const y     = useRef(new Animated.Value(-20)).current;
  const x     = useRef(new Animated.Value(Math.random() * SW)).current;
  const alpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y,     { toValue: SH * 0.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(alpha, { toValue: 0.6,       duration: 400,  useNativeDriver: true }),
      ]),
      Animated.timing(alpha, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      particulaStyles.dot,
      { backgroundColor: color, opacity: alpha, transform: [{ translateY: y }, { translateX: x }] }
    ]} />
  );
}
const particulaStyles = StyleSheet.create({
  dot: { position: 'absolute', top: 0, width: 4, height: 4, borderRadius: 2 },
});

export default function RachaRotaScreen({ rachaAnterior = 0, onRetomar, onCerrar }) {
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const slideUp  = useRef(new Animated.Value(60)).current;
  const scaleNum = useRef(new Animated.Value(0.4)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const msg = MENSAJES[Math.floor(Math.random() * MENSAJES.length)];

  useEffect(() => {
    // Haptic suave — no agresivo
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Shake del número
    Animated.sequence([
      Animated.delay(300),
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
      ]),
    ]).start();

    // Entrada general
    Animated.parallel([
      Animated.timing(fadeIn,   { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp,  { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleNum, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Partículas grises cayendo */}
      {Array.from({ length: 12 }, (_, i) => (
        <Particula key={i} delay={i * 120} color={i % 3 === 0 ? '#c9a84c40' : '#ffffff15'} />
      ))}

      <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        {/* Número de racha perdida */}
        <Animated.View style={[styles.rachaWrap, { transform: [{ scale: scaleNum }, { translateX: shakeAnim }] }]}>
          <View style={styles.rachaCircle}>
            <Text style={styles.rachaNum}>{rachaAnterior}</Text>
            <Text style={styles.rachaDias}>{rachaAnterior === 1 ? 'día' : 'días'}</Text>
          </View>
          <Text style={styles.rachaLabel}>de racha</Text>
          <Text style={styles.rachaCruz}>✕</Text>
        </Animated.View>

        {/* Mensaje */}
        <Text style={styles.titulo}>{msg.titulo}</Text>
        <Text style={styles.cuerpo}>{msg.cuerpo}</Text>

        {/* Línea divisoria */}
        <View style={styles.divider} />

        {/* Frase de reencuadre */}
        <View style={styles.reencuadreCard}>
          <Text style={styles.reencuadreTxt}>
            "No perdiste lo que construiste. Perdiste solo el contador. Volvé a encenderlo."
          </Text>
          <Text style={styles.reencuadreAutor}>— Diego Gaitán</Text>
        </View>

        {/* Botones */}
        <TouchableOpacity
          style={styles.btnRetomar}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRetomar?.();
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.btnRetomarTxt}>{msg.accion}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnCerrar}
          onPress={() => {
            Haptics.selectionAsync();
            onCerrar?.();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.btnCerrarTxt}>Cerrar</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#07060a',
    alignItems: 'center', justifyContent: 'center',
    padding: 28,
  },
  content: { width: '100%', alignItems: 'center' },

  rachaWrap:   { alignItems: 'center', marginBottom: 32, position: 'relative' },
  rachaCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#13120f',
    borderWidth: 2, borderColor: 'rgba(248,113,113,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#f87171', shadowOpacity: 0.15,
    shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  rachaNum:    { fontSize: 52, fontWeight: '900', color: '#f87171' },
  rachaDias:   { fontSize: 12, color: '#6a5a40', fontWeight: '700', marginTop: -4 },
  rachaLabel:  { fontSize: 13, color: '#4a3a20', marginTop: 10, fontWeight: '700', letterSpacing: 1 },
  rachaCruz:   {
    position: 'absolute', top: -8, right: -8,
    fontSize: 22, color: '#f87171', fontWeight: '900',
  },

  titulo:  { fontSize: 26, fontWeight: '900', color: '#f0e6c8', textAlign: 'center', marginBottom: 12 },
  cuerpo:  { fontSize: 15, color: '#8a7a60', textAlign: 'center', lineHeight: 24, marginBottom: 24 },

  divider: { width: 40, height: 2, backgroundColor: '#2a2010', borderRadius: 1, marginBottom: 24 },

  reencuadreCard: {
    backgroundColor: '#13120f', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
    padding: 20, marginBottom: 32, width: '100%',
  },
  reencuadreTxt:   { fontSize: 14, color: '#c8bfa8', lineHeight: 24, fontStyle: 'italic', marginBottom: 10 },
  reencuadreAutor: { fontSize: 12, color: '#4a3a20' },

  btnRetomar: {
    backgroundColor: '#c9a84c', borderRadius: 16,
    paddingVertical: 18, width: '100%', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#c9a84c', shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  btnRetomarTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },

  btnCerrar:    { paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnCerrarTxt: { color: '#4a3a20', fontSize: 14, fontWeight: '700' },
});

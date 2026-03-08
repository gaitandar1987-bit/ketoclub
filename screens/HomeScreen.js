import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Image, Animated, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNivel, getProgreso, sumarXP } from '../xp';
import { cacheGetJSON, cacheSetJSON, cacheInvalidatePrefix } from '../cache';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

// ─── Helpers haptic ───────────────────────────────────────────
const haptic = {
  leve:      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medio:     () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  fuerte:    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  exito:     () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  seleccion: () => Haptics.selectionAsync(),
};

// ─── Hook countdown hasta medianoche ─────────────────────────
function useCountdownHome() {
  const calc = () => {
    const ahora  = new Date();
    const manana = new Date();
    manana.setDate(ahora.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    const diff = manana - ahora;
    return {
      horas:    Math.floor(diff / 3600000),
      minutos:  Math.floor((diff % 3600000) / 60000),
      segundos: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const TIPS = [
  "El ayuno no es privarte, es darle a tu cuerpo el descanso que merece.",
  "Cada vez que elegís proteína sobre azúcar, estás eligiéndote a vos mismo.",
  "La constancia supera siempre al talento.",
  "Hoy es un buen día para tomar agua, moverse y respirar profundo.",
  "Tu cuerpo sana cuando lo tratás bien. Confiá en el proceso.",
  "La disciplina no es un esfuerzo. Es una expresión de quién sos.",
  "No construís una vida con grandes gestos. La construís con pequeñas victorias diarias.",
];

const TOTAL_DIAS = 30;

const GRID_ITEMS = [
  { icon: '🥑', label: 'Recetas',      key: 'recetas',      color: '#4ade80' },
  { icon: '📚', label: 'Biblioteca',   key: 'biblioteca',   color: '#fbbf24' },
  { icon: '💪', label: 'Entrenar',     key: 'entrenar',     color: '#f97316' },
  { icon: '💬', label: 'Comunidad',    key: 'comunidad',    color: '#60a5fa' },
  { icon: '📊', label: 'Hábitos',      key: 'habitos',      color: '#c9a84c' },
  { icon: '📏', label: 'Medidas',      key: 'medidas',      color: '#a78bfa' },
  { icon: '🔔', label: 'Alertas',      key: 'alertas',      color: '#f43f5e' },
  { icon: '🧘', label: 'Meditaciones', key: 'meditaciones', color: '#e879f9' },
  { icon: '🍽️', label: 'Ayuno',        key: 'ayuno',        color: '#fb923c' },
  { icon: '👟', label: 'Pasos',        key: 'pasos',        color: '#34d399' },
  { icon: '💧', label: 'Hidratación',  key: 'hidratacion',  color: '#60a5fa' },
  { icon: '🤖', label: '24/7',         key: 'chat',         color: '#4ade80' },
  { icon: '👤', label: 'Perfil',       key: 'perfil',       color: '#c9a84c' },
  { icon: '💳', label: 'Renovar',      key: 'renovar',      color: '#f87171' },
];

// ─── Hook animación de entrada ────────────────────────────────
function useEntrada(delay = 0) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity: fade, transform: [{ translateY: slide }] };
}

// ─── PressCard ────────────────────────────────────────────────
function PressCard({ onPress, style, children, hapticType = 'leve' }) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPressIn={() => { setPressed(true); haptic[hapticType]?.(); }}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      activeOpacity={1}
      style={[style, pressed && { transform: [{ scale: 0.975 }], opacity: 0.92 }]}
    >
      {children}
    </TouchableOpacity>
  );
}

// ─── GridItem ─────────────────────────────────────────────────
function GridItem({ icon, label, color, onPress }) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPressIn={() => { setPressed(true); haptic.seleccion(); }}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      activeOpacity={1}
      style={[
        styles.gridItem,
        { borderColor: pressed ? color : color + '40' },
        pressed && {
          backgroundColor: color + '18',
          transform: [{ scale: 0.93 }],
          shadowColor: color,
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        },
      ]}
    >
      <Text style={styles.gridIcon}>{icon}</Text>
      <Text style={[styles.gridLabel, { color: pressed ? color : '#8a7a60' }]}>
        {label}
      </Text>
      {pressed && (
        <View style={[styles.gridGlow, { backgroundColor: color + '15' }]} />
      )}
    </TouchableOpacity>
  );
}


// ── Skeleton loader ───────────────────────────────────────────
function SkeletonBox({ w, h: ht, r = 10, mt = 0 }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: w, height: ht, borderRadius: r,
      backgroundColor: '#1e1e18', opacity: anim, marginTop: mt,
    }} />
  );
}

function HomeScreenSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0c' }} scrollEnabled={false}>
      {/* Header skeleton */}
      <View style={{ backgroundColor: '#1a1508', padding: 24, paddingTop: 56, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonBox w={54} h={54} r={27} />
          <View style={{ gap: 8 }}>
            <SkeletonBox w={160} h={18} r={8} />
            <SkeletonBox w={100} h={12} r={6} />
          </View>
        </View>
        <SkeletonBox w={'100%'} h={12} r={6} mt={4} />
      </View>
      {/* Cards skeleton */}
      <View style={{ padding: 16, gap: 14 }}>
        <SkeletonBox w={'100%'} h={200} r={20} />
        <SkeletonBox w={'100%'} h={70} r={16} />
        <SkeletonBox w={'100%'} h={120} r={18} />
        <SkeletonBox w={'100%'} h={90} r={16} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {Array.from({ length: 6 }, (_, i) => <SkeletonBox key={i} w={'30%'} h={70} r={14} />)}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────
export default function HomeScreen({
  member,
  selectedProgram,
  umbralStartedAt,
  umbralCompletedDays,
  bannerDiaPendiente = false,
  xpTotal = 0,
  despertarStartedAt,
  despertarCompletedDays,
  onLogout,
  onOpenIdentity,
  onOpenUmbral,
  onOpenDespertar,
  onOpenProgress,
  onOpenMeasurements,
  onOpenCommunity,
  onOpenNotifications,
  onOpenProfile,
  onOpenRenewal,
  onOpenMeditaciones,
  onOpenRecetas,
  onOpenAyuno,
  refreshKey,
  onOpenChat,
  onOpenBiblioteca,
  onOpenEntrenamientos,
  onOpenHidratacion,
  onOpenPasos,
}) {
  const [tip]          = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [fotoPerfil,   setFotoPerfil]   = useState(null);
  const [perfilNombre, setPerfilNombre] = useState('');
  const [perfilObj,    setPerfilObj]    = useState('');
  const [perfilExp,    setPerfilExp]    = useState('');
  const [vasos,        setVasos]        = useState(0);
  const [pasosHoy,     setPasosHoy]     = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const vasosAnim = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  // ── Animaciones escalonadas ──────────────────────────────
  const animHeader   = useEntrada(0);
  const animCard     = useEntrada(120);
  const animChat     = useEntrada(200);
  const animPrograma = useEntrada(280);
  const animTip      = useEntrada(360);
  const animGrid     = useEntrada(440);
  const animInfo     = useEntrada(520);

  const firstName   = perfilNombre || member?.name?.split(' ')[0] || 'Bienvenido';
  const expiresAt   = new Date(member?.expires_at);
  const daysLeft    = Math.floor((expiresAt - new Date()) / 86400000);
  const statusColor = daysLeft <= 3 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#4ade80';
  const memberKey   = member?.phone || member?.id || 'guest';
  const nivelInfo   = getNivel(xpTotal);
  const progresoXP  = getProgreso(xpTotal);

  useEffect(() => { cargarPerfil(); cargarVasos(); cargarPasosHoy(); }, [refreshKey]);

  async function cargarPerfil() {
    try {
      // Siempre leer directo de AsyncStorage para que la foto esté actualizada
      const [f, n, o, e] = await Promise.all([
        AsyncStorage.getItem(`foto_${memberKey}`),
        AsyncStorage.getItem(`perfil_nombre_${memberKey}`),
        AsyncStorage.getItem(`perfil_objetivo_${memberKey}`),
        AsyncStorage.getItem(`perfil_experiencia_${memberKey}`),
      ]);
      if (f) setFotoPerfil(f);
      if (n) setPerfilNombre(n);
      if (o) setPerfilObj(o);
      if (e) setPerfilExp(e);
    } catch (e) {}
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([cargarPerfil(), cargarVasos(), cargarPasosHoy()]);
    setRefreshing(false);
  }

  function hoyKeyH() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  async function cargarPasosHoy() {
    try {
      const memberKey2 = member?.phone || member?.id || 'guest';
      const d = new Date();
      const hoy = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const raw = await AsyncStorage.getItem(`pasos_${memberKey2}`);
      const data = raw ? JSON.parse(raw) : {};
      setPasosHoy(data[hoy] || 0);
    } catch(e) {}
  }

  async function cargarVasos() {
    try {
      const raw = await AsyncStorage.getItem(`hidratacion_${memberKey}`);
      const data = raw ? JSON.parse(raw) : {};
      const n = data[hoyKeyH()] || 0;
      setVasos(n);
      // Animar vasos ya llenos
      for (let i = 0; i < n && i < 8; i++) {
        vasosAnim[i].setValue(1);
      }
    } catch(e) {}
  }

  async function agregarVaso() {
    if (vasos >= 8) return;
    const nuevo = vasos + 1;
    // Animar el vaso nuevo
    Animated.spring(vasosAnim[nuevo - 1], {
      toValue: 1, tension: 200, friction: 7, useNativeDriver: true,
    }).start();
    setVasos(nuevo);
    try {
      const raw = await AsyncStorage.getItem(`hidratacion_${memberKey}`);
      const data = raw ? JSON.parse(raw) : {};
      data[hoyKeyH()] = nuevo;
      await AsyncStorage.setItem(`hidratacion_${memberKey}`, JSON.stringify(data));
      // Haptic + XP al llegar a 8 vasos
      if (nuevo === 8) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await sumarXP(memberKey, 'habitos_100', 'Hidratación completa 8 vasos');
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch(e) {}
  }

  async function quitarVaso() {
    if (vasos <= 0) return;
    vasosAnim[vasos - 1].setValue(0);
    const nuevo = vasos - 1;
    setVasos(nuevo);
    try {
      const raw = await AsyncStorage.getItem(`hidratacion_${memberKey}`);
      const data = raw ? JSON.parse(raw) : {};
      data[hoyKeyH()] = nuevo;
      await AsyncStorage.setItem(`hidratacion_${memberKey}`, JSON.stringify(data));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch(e) {}
  }

  async function cambiarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem(`foto_${memberKey}`, uri);
      setFotoPerfil(uri);
    }
  }

  // ── Derivados del programa ───────────────────────────────
  const esDespertar = selectedProgram === 'despertar';

  const completadosActivos = esDespertar
    ? (Array.isArray(despertarCompletedDays) ? despertarCompletedDays.length : 0)
    : (Array.isArray(umbralCompletedDays)    ? umbralCompletedDays.length    : 0);

  const startedAtActivo = esDespertar ? despertarStartedAt : umbralStartedAt;

  const diaActual = useMemo(() => {
    if (!startedAtActivo) return 1;
    const diff = Math.floor((Date.now() - new Date(startedAtActivo)) / 86400000);
    return Math.max(1, Math.min(TOTAL_DIAS, diff + 1));
  }, [startedAtActivo]);

  const progress        = completadosActivos / TOTAL_DIAS;
  const progressPercent = Math.round(progress * 100);
  const colorActivo     = esDespertar ? '#a78bfa' : '#c9a84c';

  // ── Countdown próximo día ────────────────────────────────
  const { horas: cdH, minutos: cdM, segundos: cdS } = useCountdownHome();
  const pad = (n) => String(n).padStart(2, '0');
  const proximoDia = Math.min(30, diaActual + 1);
  const hayProximoDia = proximoDia <= 30;
  const nombreActivo    = esDespertar ? 'EL DESPERTAR' : 'EL UMBRAL';
  const chipActivo      = esDespertar ? '🌅 MES 2' : '🔥 MES 1';
  const subActivo       = esDespertar
    ? 'La evolución después del Umbral. Tu identidad más profunda.'
    : 'Cruzá el límite que te mantuvo estancado. Un día a la vez.';
  const nombreBloqueado = esDespertar ? 'EL UMBRAL' : 'EL DESPERTAR';

  function abrirProgramaActivo() {
    if (esDespertar) onOpenDespertar?.();
    else onOpenUmbral?.();
  }

  const handlers = {
    recetas:      onOpenRecetas,
    biblioteca:   onOpenBiblioteca,
    entrenar:     onOpenEntrenamientos,
    comunidad:    onOpenCommunity,
    habitos:      onOpenProgress,
    medidas:      onOpenMeasurements,
    alertas:      onOpenNotifications,
    meditaciones: onOpenMeditaciones,
    ayuno:        onOpenAyuno,
  refreshKey,
    pasos:        onOpenPasos,
    hidratacion:  onOpenHidratacion,
    chat:         onOpenChat,
    perfil:       onOpenProfile,
    renovar:      onOpenRenewal,
  };

  if (loading) return <HomeScreenSkeleton />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#c9a84c"
          colors={["#c9a84c"]}
        />
      }
    >

      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, animHeader]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => onOpenProfile?.()}
            activeOpacity={0.85}
          >
            {fotoPerfil
              ? <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
              : (
                <TouchableOpacity
                  style={styles.avatarPlaceholder}
                  onPress={cambiarFoto}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20 }}>📸</Text>
                </TouchableOpacity>
              )
            }
            <View>
              <Text style={styles.greeting}>{(() => {
                const h = new Date().getHours();
                const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
                const emojis = { bajar_peso: '⚖️', energia: '⚡', mente: '🧠', rendimiento: '💪' };
                const emoji = emojis[perfilObj] || '🔥';
                return `${saludo}, ${firstName} ${emoji}`;
              })()}</Text>
              <Text style={styles.subGreeting}>Ver perfil →</Text>
              {perfilExp ? (
                <View style={styles.expChip}>
                  <Text style={styles.expChipTxt}>
                    {perfilExp === 'principiante' ? '🌱 Principiante' : perfilExp === 'intermedio' ? '🔥 Intermedio' : '💎 Avanzado'}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.xpChip, { borderColor: nivelInfo.color + '60' }]}>
                <Text style={[styles.xpChipTxt, { color: nivelInfo.color }]}>
                  {nivelInfo.emoji} Nv.{nivelInfo.nivel} {nivelInfo.nombre} · {xpTotal} XP
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutTxt}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.memberBadge}>
          <View style={[styles.memberDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.memberStatus, { color: statusColor }]}>
            {daysLeft <= 0
              ? 'Membresía vencida'
              : `Membresía activa · ${daysLeft} días restantes`}
          </Text>
          {daysLeft <= 7 && daysLeft > 0 && (
            <TouchableOpacity onPress={onOpenRenewal} style={styles.renewBtn} activeOpacity={0.85}>
              <Text style={styles.renewTxt}>Renovar →</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ── BANNER DÍA PENDIENTE ── */}
      {bannerDiaPendiente && (
        <TouchableOpacity
          style={[styles.bannerDia, { borderColor: colorActivo + '60' }]}
          onPress={() => { haptic.medio(); abrirProgramaActivo(); }}
          activeOpacity={0.88}
        >
          <View style={[styles.bannerDiaPulse, { backgroundColor: colorActivo }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerDiaTitulo, { color: colorActivo }]}>
              🔥 Tu día {diaActual} te está esperando
            </Text>
            <Text style={styles.bannerDiaSub}>
              Tocar para completar el día de hoy
            </Text>
          </View>
          <Text style={[styles.bannerDiaArrow, { color: colorActivo }]}>→</Text>
        </TouchableOpacity>
      )}

      <View style={styles.body}>

        {/* ── CARD IDENTIDAD ── */}
        <Animated.View style={animCard}>
          <PressCard
            onPress={abrirProgramaActivo}
            style={[styles.identidadCard, { borderColor: colorActivo + '55' }]}
          >
            <View style={[styles.identidadGlow, { backgroundColor: colorActivo + '12' }]} />
            <View style={styles.cardTopRow}>
              <View style={[styles.identidadChip, {
                backgroundColor: colorActivo + '20',
                borderColor: colorActivo + '50',
              }]}>
                <Text style={[styles.identidadChipTxt, { color: colorActivo }]}>
                  {chipActivo} · ACTIVO
                </Text>
              </View>
              <Text style={styles.cardTapHint}>Tocar →</Text>
            </View>
            <Text style={styles.identidadLabel}>✨ DESAFÍO DEL MES</Text>
            <Text style={styles.identidadTitulo}>{nombreActivo}</Text>
            <Text style={styles.identidadSub}>{subActivo}</Text>
            <Text style={[styles.challengeDay, { color: colorActivo }]}>
              Día {diaActual} de 30
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${progress * 100}%`,
                backgroundColor: colorActivo,
                shadowColor: colorActivo,
              }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressTxt}>{progressPercent}% completado</Text>
              <Text style={styles.progressTxt}>{completadosActivos}/30 días ✓</Text>
            </View>
            {hayProximoDia && (
              <View style={styles.countdownRow}>
                <Text style={[styles.countdownLabel, { color: colorActivo }]}>⏳ Próximo día en</Text>
                <Text style={[styles.countdownDigits, { color: colorActivo }]}>
                  {pad(cdH)}:{pad(cdM)}:{pad(cdS)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.identidadBtn, { backgroundColor: colorActivo, shadowColor: colorActivo }]}
              onPress={() => { haptic.medio(); abrirProgramaActivo(); }}
              activeOpacity={0.88}
            >
              <Text style={styles.identidadBtnTxt}>Continuar {nombreActivo} →</Text>
            </TouchableOpacity>
          </PressCard>
        </Animated.View>

        {/* ── TIP DEL DÍA ── */}
        <Animated.View style={animTip}>
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>✨ REFLEXIÓN DEL DÍA</Text>
            <Text style={styles.tipTxt}>"{tip}"</Text>
            <Text style={styles.tipAutor}>— Diego Gaitán</Text>
          </View>
        </Animated.View>

        {/* ── CHAT BANNER ── */}
        <Animated.View style={animChat}>
          <PressCard onPress={() => onOpenChat?.()} style={styles.chatBanner}>
            <View style={styles.chatBannerLeft}>
              <View style={styles.chatDot} />
              <View>
                <Text style={styles.chatBannerTitle}>🤖 Keto Coach · 24/7 con vos</Text>
                <Text style={styles.chatBannerSub}>Tu IA personal que conoce tu progreso real</Text>
              </View>
            </View>
            <Text style={styles.chatArrow}>→</Text>
          </PressCard>
        </Animated.View>


        {/* ── WIDGET HIDRATACIÓN ── */}
        <Animated.View style={animGrid}>
          <TouchableOpacity onPress={onOpenHidratacion} activeOpacity={0.95}>
          <View style={styles.hidraCard}>
            <View style={styles.hidraHeader}>
              <Text style={styles.hidraTitle}>💧 HIDRATACIÓN HOY</Text>
              <Text style={styles.hidraMeta}>{vasos}/8 vasos</Text>
            </View>
            {/* Vasos */}
            <View style={styles.vasosRow}>
              {Array.from({ length: 8 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={agregarVaso}
                  activeOpacity={0.8}
                  style={styles.vasoWrap}
                >
                  <Animated.View style={[
                    styles.vaso,
                    {
                      opacity: vasosAnim[i].interpolate({ inputRange: [0,1], outputRange: [0.2, 1] }),
                      transform: [{ scale: vasosAnim[i].interpolate({ inputRange: [0,1], outputRange: [0.7, 1] }) }],
                      backgroundColor: i < vasos ? '#60a5fa' : 'transparent',
                      borderColor: i < vasos ? '#60a5fa' : '#2a2010',
                    }
                  ]}>
                    <Text style={styles.vasoEmoji}>{i < vasos ? '💧' : '○'}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
            {/* Barra progreso */}
            <View style={styles.hidraBarBg}>
              <Animated.View style={[styles.hidraBarFill, { width: `${(vasos / 8) * 100}%` }]} />
            </View>
            {/* Footer */}
            <View style={styles.hidraFooter}>
              <Text style={styles.hidraSub}>
                {vasos === 0 && 'Empezá tu hidratación diaria 💧'}
                {vasos > 0 && vasos < 4 && `${8 - vasos} vasos más para la meta 💪`}
                {vasos >= 4 && vasos < 8 && `¡Casi! ${8 - vasos} vasos más ⚡`}
                {vasos === 8 && '¡Meta cumplida! Hidratación perfecta 🏆'}
              </Text>
              {vasos > 0 && (
                <TouchableOpacity onPress={quitarVaso} activeOpacity={0.7}>
                  <Text style={styles.hidraUndo}>↩</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── WIDGET PASOS ── */}
        <Animated.View style={animGrid}>
          <TouchableOpacity onPress={onOpenPasos} activeOpacity={0.95}>
          <View style={styles.pasosCard}>
            <View style={styles.pasosHeader}>
              <Text style={styles.pasosTitle}>👟 PASOS HOY</Text>
              <Text style={styles.pasosMeta}>{pasosHoy.toLocaleString()}</Text>
            </View>
            <View style={styles.pasosBarBg}>
              <View style={[styles.pasosBarFill, {
                width: `${Math.min((pasosHoy / 10000) * 100, 100)}%`
              }]} />
            </View>
            <View style={styles.pasosFooter}>
              <Text style={styles.pasosSub}>
                {pasosHoy === 0 && '¡Empezá a moverte hoy! 🚶'}
                {pasosHoy > 0 && pasosHoy < 5000 && `${(10000 - pasosHoy).toLocaleString()} pasos para la meta 💪`}
                {pasosHoy >= 5000 && pasosHoy < 10000 && `¡Casi! ${(10000 - pasosHoy).toLocaleString()} pasos más ⚡`}
                {pasosHoy >= 10000 && '🏆 ¡Meta de 10.000 pasos completada!'}
              </Text>
              <Text style={styles.pasosMeta2}>{Math.min(Math.round((pasosHoy/10000)*100),100)}%</Text>
            </View>
          </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── WIDGET AYUNO ── */}
        <Animated.View style={animGrid}>
          <TouchableOpacity onPress={onOpenAyuno} activeOpacity={0.95}>
            <View style={[styles.pasosCard, { borderColor: 'rgba(251,146,60,0.3)' }]}>
              <View style={styles.pasosHeader}>
                <Text style={styles.pasosTitle}>🍽️ AYUNO</Text>
                <Text style={[styles.pasosMeta, { color: '#fb923c' }]}>Tocar para registrar</Text>
              </View>
              <View style={[styles.pasosBarBg, { backgroundColor: 'rgba(251,146,60,0.1)' }]}>
                <View style={[styles.pasosBarFill, { width: '0%', backgroundColor: '#fb923c' }]} />
              </View>
              <View style={styles.pasosFooter}>
                <Text style={styles.pasosSub}>Registrá tu ayuno intermitente 💪</Text>
                <Text style={[styles.pasosMeta2, { color: '#fb923c' }]}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── GRID ── */}
        <Animated.View style={animGrid}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.grid}>
            {GRID_ITEMS.map((item) => (
              <GridItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                color={item.color}
                onPress={() => {
                  const fn = handlers[item.key];
                  if (fn) fn();
                  else Alert.alert(item.label, 'Próximamente 😉');
                }}
              />
            ))}
          </View>
        </Animated.View>


        {/* ── PROGRAMAS ── */}
        <Animated.View style={animPrograma}>
          <Text style={styles.sectionTitle}>Programa activo</Text>
          <View style={styles.programasWrap}>

            <PressCard
              onPress={abrirProgramaActivo}
              style={[styles.programCard, { borderColor: colorActivo + '55' }]}
            >
              <View style={[styles.programCardGlow, { backgroundColor: colorActivo + '14' }]} />
              <View style={styles.programTop}>
                <View style={[styles.programChip, {
                  backgroundColor: colorActivo + '20',
                  borderColor: colorActivo + '50',
                }]}>
                  <Text style={[styles.programChipTxt, { color: colorActivo }]}>
                    {chipActivo} · ACTIVO
                  </Text>
                </View>
                <Text style={styles.programMeta}>30 días</Text>
              </View>
              <Text style={[styles.programTitulo, { color: colorActivo }]}>{nombreActivo}</Text>
              <Text style={styles.programSub}>{subActivo}</Text>
              <View style={styles.programProgressWrap}>
                <View style={styles.programProgressBg}>
                  <View style={[styles.programProgressFill, {
                    width: `${progress * 100}%`,
                    backgroundColor: colorActivo,
                    shadowColor: colorActivo,
                  }]} />
                </View>
                <Text style={styles.programProgressTxt}>
                  Día actual: {diaActual} · Completados: {completadosActivos}/30
                </Text>
              </View>
              <View style={[styles.programBtn, {
                backgroundColor: colorActivo,
                shadowColor: colorActivo,
              }]}>
                <Text style={styles.programBtnTxt}>Continuar →</Text>
              </View>
            </PressCard>

            <View style={styles.bloqueadoCard}>
              <View style={styles.programTop}>
                <View style={styles.bloqueadoChip}>
                  <Text style={styles.bloqueadoChipTxt}>🔒 BLOQUEADO</Text>
                </View>
                <Text style={styles.programMeta}>Próximo mes</Text>
              </View>
              <Text style={styles.bloqueadoTitulo}>{nombreBloqueado}</Text>
              <Text style={styles.programSub}>
                Se activa en el próximo ciclo mensual. Completá este mes primero.
              </Text>
              <View style={styles.bloqueadoBtn}>
                <Text style={styles.bloqueadoBtnTxt}>🔒 Disponible el próximo ciclo</Text>
              </View>
            </View>

          </View>
        </Animated.View>

        {/* ── INFO MEMBRESÍA ── */}
        <Animated.View style={animInfo}>
          <View style={styles.infoCard}>
            <TouchableOpacity onPress={() => onOpenProfile?.()} activeOpacity={0.85}>
              <View style={styles.infoTitleRow}>
                <Text style={styles.infoTitle}>Tu membresía</Text>
                <Text style={styles.infoVerPerfil}>Ver perfil →</Text>
              </View>
            </TouchableOpacity>
            {[
              ['Nombre',   member?.name || '—'],
              ['Programa', nombreActivo],
              ['Vence',    expiresAt.toLocaleDateString('es-AR')],
            ].map(([label, val]) => (
              <View key={label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[
                  styles.infoVal,
                  label === 'Programa' && { color: colorActivo, fontWeight: '900' },
                ]}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },

  header: {
    backgroundColor: '#1a1508',
    padding: 24, paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  avatarRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:            { width: 54, height: 54, borderRadius: 27, borderWidth: 2.5, borderColor: '#c9a84c' },
  avatarPlaceholder: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#13120f', borderWidth: 2, borderColor: 'rgba(201,168,76,0.4)', alignItems: 'center', justifyContent: 'center' },
  greeting:          { fontSize: 22, fontWeight: '800', color: '#f0e6c8' },
  subGreeting:       { fontSize: 12, color: '#c9a84c', marginTop: 3, fontWeight: '600' },
  logoutBtn:         { padding: 8 },
  logoutTxt:         { color: '#4a3a20', fontSize: 13 },
  memberBadge:       { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  memberDot:         { width: 8, height: 8, borderRadius: 4 },
  memberStatus:      { fontSize: 13, fontWeight: '700' },
  renewBtn:          { backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.35)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  renewTxt:          { color: '#f87171', fontSize: 11, fontWeight: '900' },

  body: { padding: 16 },

  identidadCard:    { backgroundColor: '#13120f', borderRadius: 20, borderWidth: 2, padding: 20, marginBottom: 14, overflow: 'hidden', position: 'relative', shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 5 },
  identidadGlow:    { position: 'absolute', top: 0, left: 0, right: 0, height: 80, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cardTopRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  identidadChip:    { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  identidadChipTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  cardTapHint:      { fontSize: 11, color: '#6a5a40', fontWeight: '700' },
  identidadLabel:   { fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  identidadTitulo:  { fontSize: 26, fontWeight: '900', color: '#f0e6c8', marginBottom: 4, letterSpacing: 0.5 },
  identidadSub:     { fontSize: 13, color: '#6a5a40', lineHeight: 20, marginBottom: 10 },
  challengeDay:     { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  progressBg:       { backgroundColor: '#1e1e18', borderRadius: 8, height: 10, marginBottom: 6 },
  progressFill:     { borderRadius: 8, height: 10, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  progressFooter:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  progressTxt:      { fontSize: 12, color: '#6a5a40' },
  identidadBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  identidadBtnTxt:  { color: '#0a0a0c', fontWeight: '900', fontSize: 14 },
  countdownRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 10 },
  countdownLabel:   { fontSize: 11, fontWeight: '700', opacity: 0.8 },
  countdownDigits:  { fontSize: 15, fontWeight: '900', letterSpacing: 1 },

  chatBanner:      { backgroundColor: '#0a1a0a', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(74,222,128,0.5)', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, shadowColor: '#4ade80', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
  chatBannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  chatDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ade80', shadowColor: '#4ade80', shadowOpacity: 0.8, shadowRadius: 4, flexShrink: 0 },
  chatBannerTitle: { fontSize: 14, fontWeight: '900', color: '#f0e6c8', marginBottom: 2 },
  chatBannerSub:   { fontSize: 12, color: '#4a6a4a' },
  chatArrow:       { fontSize: 20, color: '#4ade80', fontWeight: '900' },

  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#6a5a40', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },

  programasWrap:       { gap: 12, marginBottom: 24 },
  programCard:         { backgroundColor: '#13120f', borderRadius: 20, borderWidth: 2, padding: 20, overflow: 'hidden', position: 'relative', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  programCardGlow:     { position: 'absolute', top: 0, left: 0, right: 0, height: 80, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  programTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  programChip:         { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  programChipTxt:      { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  programMeta:         { color: '#6a5a40', fontSize: 12, fontWeight: '700' },
  programTitulo:       { fontSize: 26, fontWeight: '900', marginBottom: 6, letterSpacing: 0.5 },
  programSub:          { fontSize: 13, color: '#6a5a40', lineHeight: 20, marginBottom: 16 },
  programProgressWrap: { marginBottom: 16 },
  programProgressBg:   { backgroundColor: '#1e1e18', borderRadius: 8, height: 8, marginBottom: 6 },
  programProgressFill: { borderRadius: 8, height: 8, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  programProgressTxt:  { fontSize: 11, color: '#8a7a60' },
  programBtn:          { borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  programBtnTxt:       { color: '#0a0a0c', fontWeight: '900', fontSize: 15 },

  bloqueadoCard:    { backgroundColor: '#0f0f0a', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', opacity: 0.6 },
  bloqueadoChip:    { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  bloqueadoChipTxt: { color: '#4a3a20', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  bloqueadoTitulo:  { fontSize: 22, fontWeight: '900', color: '#3a3020', marginBottom: 6, letterSpacing: 0.5 },
  bloqueadoBtn:     { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  bloqueadoBtnTxt:  { color: '#4a3a20', fontWeight: '700', fontSize: 13 },

  tipCard:  { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.25)', marginBottom: 24 },
  tipLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 12, fontWeight: '900' },
  tipTxt:   { fontSize: 16, color: '#e8e0d0', lineHeight: 28, fontStyle: 'italic', marginBottom: 10 },
  tipAutor: { fontSize: 12, color: '#6a5a40', fontWeight: '600' },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gridItem: { backgroundColor: '#13120f', borderWidth: 1.5, borderRadius: 16, padding: 16, alignItems: 'center', width: '30.5%', position: 'relative', overflow: 'hidden' },
  gridGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 },
  gridIcon: { fontSize: 26, marginBottom: 8 },
  gridLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  infoCard:     { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.2)' },
  infoTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  infoTitle:    { fontSize: 14, fontWeight: '800', color: '#f0e6c8' },
  infoVerPerfil:{ fontSize: 12, color: '#c9a84c', fontWeight: '700' },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a14' },
  infoLabel:    { fontSize: 13, color: '#6a5a40' },
  infoVal:      { fontSize: 13, color: '#f0e6c8', fontWeight: '600' },
  xpChip:       { marginTop: 5, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: 'rgba(0,0,0,0.3)' },

  // ── Pasos ──
  pasosCard:    { backgroundColor: '#13120f', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(52,211,153,0.3)', padding: 18, marginBottom: 8 },
  pasosHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pasosTitle:   { fontSize: 10, color: '#34d399', fontWeight: '900', letterSpacing: 2 },
  pasosMeta:    { fontSize: 14, color: '#f0e6c8', fontWeight: '900' },
  pasosMeta2:   { fontSize: 12, color: '#34d399', fontWeight: '900' },
  pasosBarBg:   { backgroundColor: '#1e1e18', borderRadius: 6, height: 6, marginBottom: 10, overflow: 'hidden' },
  pasosBarFill: { height: 6, borderRadius: 6, backgroundColor: '#34d399', shadowColor: '#34d399', shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  pasosFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pasosSub:     { fontSize: 12, color: '#6a5a40', flex: 1 },

  // ── Hidratación ──
  hidraCard:    { backgroundColor: '#13120f', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.3)', padding: 18, marginBottom: 8 },
  hidraHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hidraTitle:   { fontSize: 10, color: '#60a5fa', fontWeight: '900', letterSpacing: 2 },
  hidraMeta:    { fontSize: 14, color: '#f0e6c8', fontWeight: '900' },
  vasosRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  vasoWrap:     { flex: 1, alignItems: 'center' },
  vaso:         { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  vasoEmoji:    { fontSize: 14 },
  hidraBarBg:   { backgroundColor: '#1e1e18', borderRadius: 6, height: 6, marginBottom: 10, overflow: 'hidden' },
  hidraBarFill: { height: 6, borderRadius: 6, backgroundColor: '#60a5fa', shadowColor: '#60a5fa', shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  hidraFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hidraSub:     { fontSize: 12, color: '#6a5a40', flex: 1 },
  hidraUndo:    { fontSize: 18, color: '#4a3a20', paddingHorizontal: 8 },
  xpChipTxt:    { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  bannerDia:       { marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  bannerDiaPulse:  { width: 10, height: 10, borderRadius: 5, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  bannerDiaTitulo: { fontSize: 14, fontWeight: '900', marginBottom: 3 },
  bannerDiaSub:    { fontSize: 12, color: '#6a5a40' },
  bannerDiaArrow:  { fontSize: 20, fontWeight: '900' },
});

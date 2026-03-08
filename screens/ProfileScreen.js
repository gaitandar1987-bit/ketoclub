import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Switch, Animated, Share } from 'react-native';
import { getNivel, getProgreso, getHistorialXP, XP_LABELS, NIVELES, sumarXP } from '../xp';
import { cacheGet, cacheSetJSON, cacheGetJSON } from '../cache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

const BADGES = [
  { key: 'primer_dia', icon: '🌱', titulo: 'Primer Paso', desc: 'Completaste tu primer día', condicion: (c) => c >= 1 },
  { key: 'semana', icon: '🔥', titulo: 'Una Semana', desc: '7 días completados', condicion: (c) => c >= 7 },
  { key: 'quince', icon: '⚡', titulo: 'A Mitad', desc: '15 días completados', condicion: (c) => c >= 15 },
  { key: 'veinte', icon: '💎', titulo: 'Imparable', desc: '20 días completados', condicion: (c) => c >= 20 },
  { key: 'umbral', icon: '👑', titulo: 'El Umbral', desc: '30 días — el reto completo', condicion: (c) => c >= 30 },
  { key: 'habitos', icon: '🧘', titulo: 'Disciplina', desc: 'Racha de 7+ días de hábitos', condicion: (_, streak) => streak >= 7 },
  { key: 'constancia', icon: '🌟', titulo: 'Constancia', desc: 'Racha de 14+ días de hábitos', condicion: (_, streak) => streak >= 14 },
  { key: 'identidad', icon: '🦁', titulo: 'Identidad', desc: 'Racha de 21+ días de hábitos', condicion: (_, streak) => streak >= 21 },
];

export default function ProfileScreen({ member, umbralCompletedDays = [], habitStreak = 0, umbralStartedAt, xpTotal = 0, memberKey: memberKeyProp, onBack, onOpenMeasurements, onLogout }) {
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [medidas, setMedidas] = useState([]);
  const [bioEnabled, setBioEnabled] = useState(true);
  const [historialXP, setHistorialXP] = useState([]);
  const [loading, setLoading] = useState(true);
  const skeletonAnim = useRef(new Animated.Value(0.4)).current;
  const xpBarAnim = useRef(new Animated.Value(0)).current;
  const nivelInfo  = getNivel(xpTotal);
  const progresoXP = getProgreso(xpTotal);
  const memberKeyLocal = memberKeyProp || member?.phone || member?.id || 'guest';
  const [bioDisponible, setBioDisponible] = useState(false);
  const badgesYaOtorgados = React.useRef(new Set());

  const firstName = member?.name?.split(' ')[0] || 'Usuario';
  const expiresAt = new Date(member?.expires_at);
  const daysLeft = Math.floor((expiresAt - new Date()) / 86400000);
  const statusColor = daysLeft <= 3 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#4ade80';
  const completados = Array.isArray(umbralCompletedDays) ? umbralCompletedDays.length : 0;
  const progressUmbral = Math.round((completados / 30) * 100);

  const diaActual = useMemo(() => {
    if (!umbralStartedAt) return 1;
    const diff = Math.floor((new Date() - new Date(umbralStartedAt)) / 86400000);
    return Math.max(1, Math.min(30, diff + 1));
  }, [umbralStartedAt]);

  useEffect(() => {
    // Animación skeleton pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(skeletonAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    Promise.all([cargarFoto(), cargarMedidas()]).finally(() => {
      setLoading(false);
      loop.stop();
    });
    cargarHistorialXP();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    checkBiometria();
  }, []);

  // Detectar logros nuevos y sumar XP
  useEffect(() => {
    const nuevos = BADGES.filter(b =>
      b.condicion(completados, habitStreak) &&
      !badgesYaOtorgados.current.has(b.key)
    );
    if (nuevos.length === 0) return;

    AsyncStorage.getItem(`badges_otorgados_${memberKeyLocal}`).then(raw => {
      const yaGuardados = raw ? JSON.parse(raw) : [];
      const realmente_nuevos = nuevos.filter(b => !yaGuardados.includes(b.key));

      if (realmente_nuevos.length === 0) {
        // Marcar en ref para no volver a chequear
        nuevos.forEach(b => badgesYaOtorgados.current.add(b.key));
        return;
      }

      // Guardar los nuevos
      const actualizados = [...new Set([...yaGuardados, ...realmente_nuevos.map(b => b.key)])];
      AsyncStorage.setItem(`badges_otorgados_${memberKeyLocal}`, JSON.stringify(actualizados));
      realmente_nuevos.forEach(b => badgesYaOtorgados.current.add(b.key));

      // Sumar XP por cada logro nuevo
      realmente_nuevos.forEach(b => {
        sumarXP(memberKeyLocal, 'logro', `Logro: ${b.titulo}`).catch(() => {});
      });
    }).catch(() => {});
  }, [completados, habitStreak]);

  useEffect(() => {
    Animated.timing(xpBarAnim, {
      toValue: progresoXP.pct / 100,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [xpTotal]);

  async function cargarHistorialXP() {
    try {
      const h = await getHistorialXP(memberKeyLocal);
      setHistorialXP(h.slice(0, 8));
    } catch(e) {}
  }

  // Error toast — reutilizable en cualquier acción
  const [errorMsg, setErrorMsg] = useState('');
  const errorAnim = useRef(new Animated.Value(0)).current;
  function showError(msg) {
    setErrorMsg(msg);
    Animated.sequence([
      Animated.timing(errorAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(errorAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setErrorMsg(''));
  }

  async function checkBiometria() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBioDisponible(compatible && enrolled);
      const saved = await AsyncStorage.getItem('bio_enabled');
      // Activado por defecto — null significa nunca tocado = activado
      setBioEnabled(saved !== 'false' && compatible && enrolled);
    } catch(e) {}
  }

  async function toggleBiometria(valor) {
    if (valor) {
      // Verificar que funcione antes de activar
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmá tu identidad para activar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar PIN',
      });
      if (result.success) {
        await AsyncStorage.setItem('bio_enabled', 'true');
        setBioEnabled(true);
        Alert.alert('✅ Activado', 'A partir de ahora la app pedirá tu huella/face al abrirse.');
      } else {
        Alert.alert('No activado', 'No se pudo verificar tu identidad.');
      }
    } else {
      await AsyncStorage.setItem('bio_enabled', 'false');
      setBioEnabled(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('session_member');
          onLogout?.();
        }
      },
    ]);
  }

  async function cargarFoto() {
    try {
      const key = `foto_${member?.phone || member?.id || 'guest'}`;
      const f = await cacheGet(AsyncStorage, key);
      if (f) setFotoPerfil(f);
    } catch(e) {}
  }

  async function cambiarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const key = `foto_${member?.phone || member?.id || 'guest'}`;
      await AsyncStorage.setItem(key, uri);
      setFotoPerfil(uri);
    }
  }

  async function cargarMedidas() {
    try {
      const key = `medidas_${member?.phone || member?.id || 'guest'}`;
      const data = await cacheGetJSON(AsyncStorage, key);
      if (data) setMedidas(data);
    } catch(e) {}
  }

  const badgesDesbloqueados = BADGES.filter(b => b.condicion(completados, habitStreak));
  const badgesBloqueados = BADGES.filter(b => !b.condicion(completados, habitStreak));

  const pesoData = medidas.map((m, i) => ({ sem: `S${i+1}`, val: parseFloat(m?.peso) || 0 })).filter(d => d.val > 0);
  const pesoMin = pesoData.length ? Math.min(...pesoData.map(d => d.val)) - 2 : 60;
  const pesoMax = pesoData.length ? Math.max(...pesoData.map(d => d.val)) + 2 : 80;
  const pesoRange = pesoMax - pesoMin || 1;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c' }}>
        <View style={[styles.header, { paddingTop: 56 }]}>
          <View style={{ width: 80, height: 32, backgroundColor: '#1a1810', borderRadius: 10, marginBottom: 20 }} />
          <Animated.View style={{ opacity: skeletonAnim }}>
            <View style={{ width: 120, height: 14, backgroundColor: '#1e1c16', borderRadius: 6, marginBottom: 8 }} />
            <View style={{ width: 200, height: 36, backgroundColor: '#1e1c16', borderRadius: 8, marginBottom: 6 }} />
          </Animated.View>
        </View>
        <View style={{ padding: 16, gap: 14 }}>
          <Animated.View style={{ opacity: skeletonAnim, backgroundColor: '#13120f', borderRadius: 18, padding: 20, flexDirection: 'row', gap: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a2010' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#1e1c16' }} />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ width: '60%', height: 18, backgroundColor: '#1e1c16', borderRadius: 6 }} />
              <View style={{ width: '40%', height: 14, backgroundColor: '#1e1c16', borderRadius: 6 }} />
            </View>
          </Animated.View>
          <Animated.View style={{ opacity: skeletonAnim, backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#2a2010', gap: 12 }}>
            <View style={{ width: 100, height: 12, backgroundColor: '#1e1c16', borderRadius: 6 }} />
            <View style={{ width: '100%', height: 10, backgroundColor: '#1e1c16', borderRadius: 6 }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1,2,3].map(i => <View key={i} style={{ flex: 1, height: 60, backgroundColor: '#1e1c16', borderRadius: 12 }} />)}
            </View>
          </Animated.View>
          <Animated.View style={{ opacity: skeletonAnim, backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#2a2010', gap: 10 }}>
            <View style={{ width: 80, height: 12, backgroundColor: '#1e1c16', borderRadius: 6 }} />
            {[1,2,3].map(i => <View key={i} style={{ width: '100%', height: 52, backgroundColor: '#1e1c16', borderRadius: 10 }} />)}
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <>
      {errorMsg !== '' && (
        <Animated.View style={{ position:'absolute', top:0, left:0, right:0, zIndex:999, backgroundColor:'#3a0a0a', padding:14, borderBottomWidth:1, borderBottomColor:'#f87171', opacity: errorAnim }}>
          <Text style={{ color:'#f87171', fontSize:13, fontWeight:'700', textAlign:'center' }}>⚠️ {errorMsg}</Text>
        </Animated.View>
      )}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <Text style={styles.headerSub}>Tu transformación en números</Text>
      </View>

      <View style={styles.body}>

        {/* FOTO + INFO */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={cambiarFoto} style={styles.avatarWrap}>
            {fotoPerfil
              ? <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
              : <View style={styles.avatarPlaceholder}><Text style={{ fontSize: 32 }}>📸</Text></View>
            }
            <View style={styles.avatarEdit}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{member?.name}</Text>
            <Text style={styles.profilePhone}>{member?.phone}</Text>
            <View style={styles.profileBadgeRow}>
              <View style={[styles.profileBadge, { borderColor: statusColor }]}>
                <View style={[styles.dot, { backgroundColor: statusColor }]} />
                <Text style={[styles.profileBadgeText, { color: statusColor }]}>
                  {daysLeft <= 0 ? 'Vencida' : `${daysLeft} días restantes`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* STATS RÁPIDOS */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{completados}</Text>
            <Text style={styles.statLabel}>Días{'\n'}completados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{habitStreak}</Text>
            <Text style={styles.statLabel}>Racha{'\n'}actual</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{badgesDesbloqueados.length}</Text>
            <Text style={styles.statLabel}>Logros{'\n'}obtenidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{progressUmbral}%</Text>
            <Text style={styles.statLabel}>Umbral{'\n'}completado</Text>
          </View>
        </View>

        {/* ── CARD XP / NIVEL ── */}
        <View style={[styles.xpCard, { borderColor: nivelInfo.color + '40' }]}>
          {/* Header nivel */}
          <View style={styles.xpHeaderRow}>
            <View style={[styles.xpNivelBadge, { backgroundColor: nivelInfo.color + '20', borderColor: nivelInfo.color + '50' }]}>
              <Text style={[styles.xpNivelTxt, { color: nivelInfo.color }]}>
                {nivelInfo.emoji} NIVEL {nivelInfo.nivel} — {nivelInfo.nombre.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.xpTotalTxt, { color: nivelInfo.color }]}>{xpTotal} XP</Text>
          </View>

          {/* Barra progreso */}
          <View style={styles.xpBarBg}>
            <Animated.View style={[styles.xpBarFill, {
              width: xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: nivelInfo.color,
              shadowColor: nivelInfo.color,
            }]} />
          </View>

          {/* Info siguiente nivel */}
          {progresoXP.siguiente ? (
            <View style={styles.xpNextRow}>
              <Text style={styles.xpNextTxt}>
                Faltan <Text style={{ color: nivelInfo.color, fontWeight: '900' }}>{progresoXP.falta} XP</Text> para {progresoXP.siguiente.emoji} {progresoXP.siguiente.nombre}
              </Text>
              <Text style={styles.xpPctTxt}>{progresoXP.pct}%</Text>
            </View>
          ) : (
            <Text style={[styles.xpNextTxt, { color: nivelInfo.color }]}>👑 Nivel máximo alcanzado</Text>
          )}

          {/* Niveles roadmap */}
          <View style={styles.xpRoadmap}>
            {NIVELES.map(n => (
              <View key={n.nivel} style={styles.xpRoadmapItem}>
                <Text style={[styles.xpRoadmapEmoji, { opacity: xpTotal >= n.min ? 1 : 0.25 }]}>{n.emoji}</Text>
                <Text style={[styles.xpRoadmapNombre, { color: xpTotal >= n.min ? n.color : '#2a2010' }]}>{n.nombre}</Text>
                <Text style={styles.xpRoadmapMin}>{n.min}</Text>
              </View>
            ))}
          </View>

          {/* Historial últimas acciones */}
          {historialXP.length > 0 && (
            <>
              <Text style={styles.xpHistorialTitulo}>Últimas acciones</Text>
              {historialXP.map((h, i) => (
                <View key={i} style={styles.xpHistorialRow}>
                  <Text style={styles.xpHistorialLabel}>{XP_LABELS[h.accion] || h.accion}</Text>
                  <Text style={[styles.xpHistorialPuntos, { color: nivelInfo.color }]}>+{h.puntos} XP</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* PROGRESO UMBRAL */}
        <View style={styles.umbralCard}>
          <View style={styles.umbralTop}>
            <Text style={styles.umbralLabel}>🔥 EL UMBRAL</Text>
            <Text style={styles.umbralDia}>Día {diaActual} de 30</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressUmbral}%` }]} />
          </View>
          <Text style={styles.progressText}>{completados}/30 días completados · {progressUmbral}%</Text>
          <View style={styles.diasGrid}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
              <View key={d} style={[
                styles.diaCircle,
                umbralCompletedDays.includes(d) && styles.diaCircleOk,
                d === diaActual && !umbralCompletedDays.includes(d) && styles.diaCircleHoy,
              ]}>
                <Text style={[styles.diaNum, umbralCompletedDays.includes(d) && styles.diaNumOk]}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GRÁFICO PESO */}
        {pesoData.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>📊 EVOLUCIÓN DE PESO</Text>
              <TouchableOpacity onPress={onOpenMeasurements}>
                <Text style={styles.chartLink}>Ver medidas →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartWrap}>
              {pesoData.map((d, i) => {
                const h = ((d.val - pesoMin) / pesoRange) * 100;
                return (
                  <View key={i} style={styles.barWrap}>
                    <Text style={styles.barVal}>{d.val}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: `${Math.max(5, h)}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{d.sem}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {pesoData.length === 0 && (
          <TouchableOpacity style={styles.noMedidasCard} onPress={onOpenMeasurements} activeOpacity={0.85}>
            <Text style={styles.noMedidasIcon}>📏</Text>
            <Text style={styles.noMedidasTitle}>Registrá tus medidas</Text>
            <Text style={styles.noMedidasSub}>Llevá el seguimiento de tu evolución semana a semana.</Text>
            <Text style={styles.noMedidasLink}>Ir a Medidas →</Text>
          </TouchableOpacity>
        )}

        {/* BADGES */}
        <Text style={styles.sectionTitle}>Logros desbloqueados</Text>
        {badgesDesbloqueados.length === 0 && (
          <View style={styles.noBadgesCard}>
            <Text style={styles.noBadgesText}>Completá días del Umbral y mantenés tu racha para desbloquear logros 🔥</Text>
          </View>
        )}
        <View style={styles.badgesGrid}>
          {badgesDesbloqueados.map(b => (
            <View key={b.key} style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeTitulo}>{b.titulo}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
        </View>
        {badgesBloqueados.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Por desbloquear</Text>
            <View style={styles.badgesGrid}>
              {badgesBloqueados.map(b => (
                <View key={b.key} style={[styles.badgeCard, styles.badgeCardLocked]}>
                  <Text style={[styles.badgeIcon, { opacity: 0.3 }]}>{b.icon}</Text>
                  <Text style={[styles.badgeTitulo, { color: '#4a3a20' }]}>{b.titulo}</Text>
                  <Text style={[styles.badgeDesc, { color: '#3a2a10' }]}>{b.desc}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* MEMBRESÍA */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tu membresía</Text>
          {[
            ['Nombre', member?.name],
            ['Teléfono', member?.phone],
            ['Tipo', member?.is_first ? 'Primer ingreso' : 'Renovación'],
            ['Vence', expiresAt.toLocaleDateString('es-AR')],
          ].map(([label, val]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoVal}>{val}</Text>
            </View>
          ))}
        </View>

        {/* SEGURIDAD */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔐 Seguridad</Text>

          {bioDisponible ? (
            <View style={styles.securityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.securityLabel}>Huella / Face ID</Text>
                <Text style={styles.securitySub}>Pedirá tu biometría al abrir la app</Text>
              </View>
              <Switch
                value={bioEnabled}
                onValueChange={toggleBiometria}
                trackColor={{ false: '#2a2010', true: 'rgba(201,168,76,0.5)' }}
                thumbColor={bioEnabled ? '#c9a84c' : '#4a3a20'}
              />
            </View>
          ) : (
            <View style={styles.securityRow}>
              <Text style={styles.securitySub}>Tu dispositivo no tiene biometría configurada.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={styles.logoutTxt}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
    </>
  );
}
// trailing

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', padding:24, paddingTop:56 },
  backBtn: { marginBottom:12, paddingVertical:8, paddingHorizontal:10, borderRadius:10, backgroundColor:'rgba(0,0,0,0.25)', borderWidth:1, borderColor:'#2a2010', alignSelf:'flex-start' },
  backText: { color:'#c9a84c', fontWeight:'800', fontSize:12 },
  headerTitle: { fontSize:28, fontWeight:'700', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:13, color:'#6a5a40' },
  body: { padding:16 },
  profileCard: { flexDirection:'row', alignItems:'center', backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1, borderColor:'rgba(201,168,76,0.25)', marginBottom:16, gap:16 },
  avatarWrap: { position:'relative' },
  avatar: { width:72, height:72, borderRadius:36, borderWidth:2, borderColor:'#c9a84c' },
  avatarPlaceholder: { width:72, height:72, borderRadius:36, backgroundColor:'#0a0a0c', borderWidth:1, borderColor:'rgba(201,168,76,0.3)', alignItems:'center', justifyContent:'center' },
  avatarEdit: { position:'absolute', bottom:0, right:0, backgroundColor:'#c9a84c', borderRadius:10, width:22, height:22, alignItems:'center', justifyContent:'center' },
  profileInfo: { flex:1 },
  profileName: { fontSize:18, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  profilePhone: { fontSize:12, color:'#6a5a40', marginBottom:8 },
  profileBadgeRow: { flexDirection:'row' },
  profileBadge: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderRadius:999, paddingHorizontal:10, paddingVertical:5 },
  dot: { width:6, height:6, borderRadius:3 },
  profileBadgeText: { fontSize:11, fontWeight:'700' },
  statsRow: { flexDirection:'row', backgroundColor:'#13120f', borderRadius:16, borderWidth:1, borderColor:'#2a2010', padding:16, marginBottom:16, alignItems:'center' },
  statItem: { flex:1, alignItems:'center' },
  statNum: { fontSize:20, fontWeight:'900', color:'#c9a84c', marginBottom:4 },
  statLabel: { fontSize:10, color:'#6a5a40', letterSpacing:0.5, textAlign:'center', lineHeight:14 },
  statDivider: { width:1, height:40, backgroundColor:'#2a2010' },
  umbralCard: { backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1, borderColor:'rgba(201,168,76,0.25)', marginBottom:16 },
  umbralTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  umbralLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', fontWeight:'900' },
  umbralDia: { fontSize:12, color:'#6a5a40', fontWeight:'700' },
  progressBg: { backgroundColor:'#1e1e18', borderRadius:8, height:10, marginBottom:8 },
  progressFill: { backgroundColor:'#c9a84c', borderRadius:8, height:10 },
  progressText: { fontSize:11, color:'#6a5a40', marginBottom:14 },
  diasGrid: { flexDirection:'row', flexWrap:'wrap', gap:6 },
  diaCircle: { width:28, height:28, borderRadius:14, backgroundColor:'#1a1a14', borderWidth:1, borderColor:'#2a2010', alignItems:'center', justifyContent:'center' },
  diaCircleOk: { backgroundColor:'rgba(201,168,76,0.2)', borderColor:'#c9a84c' },
  diaCircleHoy: { borderColor:'#f0e6c8', borderWidth:2 },
  diaNum: { fontSize:10, color:'#4a3a20', fontWeight:'700' },
  diaNumOk: { color:'#c9a84c' },
  chartCard: { backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1, borderColor:'#2a2010', marginBottom:16 },
  chartHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  chartLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', fontWeight:'900' },
  chartLink: { fontSize:12, color:'#c9a84c', fontWeight:'700' },
  chartWrap: { flexDirection:'row', alignItems:'flex-end', height:100, gap:8 },
  barWrap: { flex:1, alignItems:'center', height:'100%', justifyContent:'flex-end' },
  barVal: { fontSize:9, color:'#8a7a60', marginBottom:4 },
  barBg: { width:'100%', backgroundColor:'#1a1a14', borderRadius:6, height:70, justifyContent:'flex-end' },
  barFill: { backgroundColor:'#c9a84c', borderRadius:6, width:'100%' },
  barLabel: { fontSize:9, color:'#6a5a40', marginTop:4 },
  noMedidasCard: { backgroundColor:'#13120f', borderRadius:18, padding:24, borderWidth:1, borderColor:'#2a2010', marginBottom:16, alignItems:'center' },
  noMedidasIcon: { fontSize:32, marginBottom:10 },
  noMedidasTitle: { fontSize:16, fontWeight:'900', color:'#f0e6c8', marginBottom:6 },
  noMedidasSub: { fontSize:13, color:'#6a5a40', textAlign:'center', lineHeight:20, marginBottom:12 },
  noMedidasLink: { color:'#c9a84c', fontWeight:'900', fontSize:13 },
  sectionTitle: { fontSize:14, fontWeight:'700', color:'#8a7a60', marginBottom:12, letterSpacing:1 },
  noBadgesCard: { backgroundColor:'#13120f', borderRadius:14, padding:16, borderWidth:1, borderColor:'#2a2010', marginBottom:12 },
  noBadgesText: { fontSize:13, color:'#6a5a40', lineHeight:20, textAlign:'center' },
  badgesGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 },
  badgeCard: { backgroundColor:'#13120f', borderRadius:16, padding:14, borderWidth:1, borderColor:'rgba(201,168,76,0.25)', alignItems:'center', width:'30.5%' },
  badgeCardLocked: { borderColor:'#1a1a14', backgroundColor:'#0d0d0a' },
  badgeIcon: { fontSize:28, marginBottom:6 },
  badgeTitulo: { fontSize:11, fontWeight:'900', color:'#f0e6c8', textAlign:'center', marginBottom:4 },
  badgeDesc: { fontSize:10, color:'#6a5a40', textAlign:'center', lineHeight:14 },
  infoCard: { backgroundColor:'#13120f', borderRadius:16, padding:20, borderWidth:1, borderColor:'#2a2010', marginBottom:16 },
  infoTitle: { fontSize:14, fontWeight:'700', color:'#f0e6c8', marginBottom:14 },
  infoRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#1a1a14' },
  infoLabel: { fontSize:13, color:'#6a5a40' },
  infoVal: { fontSize:13, color:'#f0e6c8', fontWeight:'600' },
  securityCard: { backgroundColor:'#13120f', borderRadius:16, padding:20, borderWidth:1, borderColor:'#2a2010' },
  securityTitle: { fontSize:14, fontWeight:'700', color:'#f0e6c8', marginBottom:16 },
  securityRow: { flexDirection:'row', alignItems:'center', marginBottom:20 },
  securityLabel: { fontSize:14, color:'#f0e6c8', fontWeight:'700', marginBottom:3 },
  securitySub: { fontSize:12, color:'#6a5a40' },
  logoutBtn: { backgroundColor:'transparent', borderRadius:12, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'rgba(248,113,113,0.3)' },
  logoutTxt: { color:'#f87171', fontWeight:'900', fontSize:14 },

  // ── XP ──
  xpCard:             { backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1.5, marginBottom:16 },
  xpHeaderRow:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  xpNivelBadge:       { borderWidth:1.5, borderRadius:999, paddingHorizontal:12, paddingVertical:5 },
  xpNivelTxt:         { fontSize:10, fontWeight:'900', letterSpacing:1.5 },
  xpTotalTxt:         { fontSize:22, fontWeight:'900' },
  xpBarBg:            { backgroundColor:'#1e1e18', borderRadius:8, height:10, marginBottom:10, overflow:'hidden' },
  xpBarFill:          { height:10, borderRadius:8, shadowOpacity:0.5, shadowRadius:6, shadowOffset:{width:0,height:0} },
  xpNextRow:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  xpNextTxt:          { fontSize:12, color:'#6a5a40', flex:1 },
  xpPctTxt:           { fontSize:12, color:'#6a5a40', fontWeight:'700' },
  xpRoadmap:          { flexDirection:'row', justifyContent:'space-between', paddingVertical:14, borderTopWidth:1, borderTopColor:'#1e1e18', borderBottomWidth:1, borderBottomColor:'#1e1e18', marginBottom:14 },
  xpRoadmapItem:      { alignItems:'center', flex:1 },
  xpRoadmapEmoji:     { fontSize:18, marginBottom:3 },
  xpRoadmapNombre:    { fontSize:8, fontWeight:'900', textAlign:'center', letterSpacing:0.3 },
  xpRoadmapMin:       { fontSize:8, color:'#3a2a10', marginTop:2 },
  xpHistorialTitulo:  { fontSize:10, color:'#6a5a40', fontWeight:'900', letterSpacing:1.5, marginBottom:10 },
  xpHistorialRow:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:7, borderBottomWidth:1, borderBottomColor:'#1a1a14' },
  xpHistorialLabel:   { fontSize:12, color:'#8a7a60' },
  xpHistorialPuntos:  { fontSize:13, fontWeight:'900' },
});
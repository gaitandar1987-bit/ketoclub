import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

const COMUNIDADES = [
  {
    icon: '💬', nombre: 'WhatsApp',
    desc: 'El corazón de Identidad Atómica. Acá está la energía diaria de la tribu, las consultas, los logros y el apoyo real.',
    accion: 'Entrar a la tribu',
    url: 'https://chat.whatsapp.com/L6jw1L8HOKFB0GCwEBfm0G',
    color: '#25d366', prioridad: 'PRINCIPAL', badge: '🔥', esWhatsApp: true,
  },
  {
    icon: '📸', nombre: 'Instagram',
    desc: 'Seguinos para recetas, tips keto, recordatorios diarios y contenido que te vuelve a conectar con tu mejor versión.',
    accion: 'Seguir en Instagram',
    url: 'https://www.instagram.com/ketoclub_arg?igsh=MTRtOGZpNTJhNmZvZg==',
    color: '#e1306c', prioridad: 'DIARIO', badge: '✨', esWhatsApp: false,
  },
  {
    icon: '📘', nombre: 'Facebook',
    desc: 'Biblioteca viva de transformaciones, resultados y testimonios reales de la comunidad.',
    accion: 'Unirme al grupo',
    url: 'https://www.facebook.com/groups/430394521133627/?ref=share&mibextid=NSMWBT',
    color: '#4a90d9', prioridad: 'COMUNIDAD', badge: '📚', esWhatsApp: false,
  },
  {
    icon: '▶️', nombre: 'YouTube',
    desc: 'Videos, recetas, rutinas y contenido exclusivo del canal oficial de Ketoclub. Todo lo que necesitás en un solo lugar.',
    accion: 'Ver el canal',
    url: 'https://www.youtube.com/@ketoclubycomunidadcetogeni5730',
    color: '#ff0000', prioridad: 'CONTENIDO', badge: '🎥', esWhatsApp: false,
  },
];

async function abrirLink(url, nombre) {
  try { await Linking.openURL(url); }
  catch (e) { Alert.alert('Error', `No se pudo abrir ${nombre}. Verificá tu conexión.`); }
}

export default function CommunityScreen({ onBack, onOpenCommunityIntro }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · TRIBU</Text>
        <Text style={styles.headerTitulo}>Comunidad</Text>
        <Text style={styles.headerSub}>Tu tribu de transformación</Text>
      </View>

      <View style={styles.body}>

        {/* HERO */}
        <View style={styles.heroCard}>
          <Text style={styles.heroChip}>✨ IDENTIDAD ATÓMICA</Text>
          <Text style={styles.heroTitle}>+10.000 personas{'\n'}ya empezaron este camino</Text>
          <Text style={styles.heroDesc}>
            Este no es solo un programa. Es un proceso de transformación física, mental y espiritual que ya impactó miles de vidas.
          </Text>
        </View>

        {/* FRASE */}
        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>💬 POR QUÉ IMPORTA</Text>
          <Text style={styles.fraseTxt}>
            "La soledad es el enemigo del cambio. Nadie se transforma solo. Las personas que llegan a sus metas tienen algo en común: encontraron su tribu."
          </Text>
          <Text style={styles.fraseAutor}>— Diego Gaitán</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          {[
            { num: '500K+', label: 'En la comunidad' },
            { num: '4',     label: 'Espacios activos' },
            { num: 'REAL',  label: 'Transformación' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDiv} />}
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{s.num}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* AVISO WHATSAPP */}
        <TouchableOpacity
          style={styles.waBanner}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onOpenCommunityIntro?.(); }}
          activeOpacity={0.88}
        >
          <View style={styles.waBannerLeft}>
            <View style={styles.waDot} />
            <View>
              <Text style={styles.waTitulo}>🔥 Avisos oficiales</Text>
              <Text style={styles.waSub}>Los anuncios importantes van primero en WhatsApp</Text>
            </View>
          </View>
          <Text style={styles.waArrow}>→</Text>
        </TouchableOpacity>

        {/* CARDS REDES */}
        <Text style={styles.seccionLabel}>ELEGÍ DÓNDE CONECTARTE</Text>

        {COMUNIDADES.map((c) => (
          <TouchableOpacity
            key={c.nombre}
            style={[styles.redCard, { borderColor: c.color + '40' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              c.esWhatsApp ? onOpenCommunityIntro?.() : abrirLink(c.url, c.nombre);
            }}
            activeOpacity={0.88}
          >
            <View style={[styles.redIconWrap, { backgroundColor: c.color + '15' }]}>
              <Text style={styles.redIcon}>{c.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.redTopRow}>
                <Text style={[styles.redNombre, { color: c.color }]}>{c.nombre}</Text>
                <View style={[styles.redChip, { backgroundColor: c.color + '20', borderColor: c.color + '40' }]}>
                  <Text style={[styles.redChipTxt, { color: c.color }]}>{c.badge} {c.prioridad}</Text>
                </View>
              </View>
              <Text style={styles.redDesc}>{c.desc}</Text>
              <Text style={[styles.redAccion, { color: c.color }]}>{c.accion} →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* CIERRE */}
        <View style={styles.cierreCard}>
          <Text style={styles.cierreTxt}>No estás solo en este camino.</Text>
          <Text style={styles.cierreTxt}>Miles de personas están eligiéndose todos los días, igual que vos.</Text>
          <Text style={styles.cierreHighlight}>Conectate. Compartí. Transformate junto a tu tribu. 🔥</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0a0a0c' },
  header:      { backgroundColor: '#1a1508', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn:     { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#2a2010', marginBottom: 20 },
  backTxt:     { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerSobre: { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo:{ fontSize: 36, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub:   { fontSize: 13, color: '#6a5a40' },
  body:        { padding: 16, gap: 14 },

  heroCard:    { backgroundColor: '#13120f', borderRadius: 20, padding: 22, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center' },
  heroChip:    { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  heroTitle:   { fontSize: 22, fontWeight: '900', color: '#f0e6c8', textAlign: 'center', lineHeight: 30, marginBottom: 12 },
  heroDesc:    { fontSize: 13, color: '#8a7a60', textAlign: 'center', lineHeight: 22 },

  fraseCard:   { backgroundColor: '#13120f', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  fraseLabel:  { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  fraseTxt:    { fontSize: 15, color: '#e8e0d0', lineHeight: 26, fontStyle: 'italic', marginBottom: 12 },
  fraseAutor:  { fontSize: 12, color: '#6a5a40' },

  statsRow:    { flexDirection: 'row', backgroundColor: '#13120f', borderRadius: 18, borderWidth: 1, borderColor: '#2a2010', padding: 18, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: '900', color: '#c9a84c', marginBottom: 4 },
  statLabel:   { fontSize: 10, color: '#6a5a40', letterSpacing: 0.5, textAlign: 'center' },
  statDiv:     { width: 1, height: 42, backgroundColor: '#2a2010' },

  waBanner:    { backgroundColor: '#0a1a0a', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(37,211,102,0.4)', padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  waBannerLeft:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  waDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#25d366' },
  waTitulo:    { fontSize: 15, fontWeight: '900', color: '#f0e6c8', marginBottom: 3 },
  waSub:       { fontSize: 12, color: '#4a6a4a' },
  waArrow:     { fontSize: 20, color: '#25d366', fontWeight: '900' },

  seccionLabel:{ fontSize: 10, color: '#6a5a40', fontWeight: '900', letterSpacing: 2, marginTop: 4 },

  redCard:     { backgroundColor: '#13120f', borderRadius: 18, borderWidth: 1.5, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  redIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  redIcon:     { fontSize: 26 },
  redTopRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  redNombre:   { fontSize: 17, fontWeight: '900' },
  redChip:     { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  redChipTxt:  { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  redDesc:     { fontSize: 13, color: '#8a7a60', lineHeight: 20, marginBottom: 8 },
  redAccion:   { fontSize: 13, fontWeight: '900' },

  cierreCard:      { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', alignItems: 'center', gap: 6 },
  cierreTxt:       { fontSize: 14, color: '#8a7a60', textAlign: 'center', lineHeight: 22 },
  cierreHighlight: { marginTop: 8, fontSize: 14, color: '#f0e6c8', textAlign: 'center', fontWeight: '900' },
});

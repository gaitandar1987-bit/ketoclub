import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const WHATSAPP_URL = 'https://chat.whatsapp.com/L6jw1L8HOKFB0GCwEBfm0G';

async function abrirWhatsApp() {
  try {
    await Linking.openURL(WHATSAPP_URL);
  } catch (e) {
    Alert.alert('Error', 'No se pudo abrir WhatsApp. Verificá que esté instalado.');
  }
}

const REGLAS = [
  { num: '1', txt: 'Entrá para sumar, no para mirar pasivamente.' },
  { num: '2', txt: 'Respetá el proceso de los demás y compartí con verdad.' },
  { num: '3', txt: 'Si estás acá, comprometete con tu cambio.' },
];

const PILARES = [
  'Alimentación consciente (keto simple y real)',
  'Orden mental y emocional',
  'Respiración para bajar ansiedad y estrés',
  'Journaling guiado',
  'Hábitos diarios que sostienen el cambio',
  'Acompañamiento y comunidad activa',
];

export default function CommunityIntroScreen({ onBack }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Identidad Atómica</Text>
        <Text style={styles.subTitle}>Antes de entrar a la comunidad</Text>
      </View>

      <View style={styles.body}>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>🔥 INGRESO A LA TRIBU</Text>
          <Text style={styles.heroText}>Esta no es una comunidad más.</Text>
          <Text style={styles.heroText}>Es un espacio de transformación real.</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Acá trabajamos</Text>
          {PILARES.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Reglas de la tribu</Text>
          {REGLAS.map((r) => (
            <View key={r.num} style={styles.ruleCard}>
              <View style={styles.ruleNumWrap}>
                <Text style={styles.ruleNum}>{r.num}</Text>
              </View>
              <Text style={styles.ruleTxt}>{r.txt}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>✨ RECORDATORIO</Text>
          <Text style={styles.quoteText}>No es para mirar.</Text>
          <Text style={styles.quoteText}>Es para comprometerse.</Text>
          <Text style={styles.quoteFooter}>
            Si estás acá, es porque algo dentro tuyo decidió cambiar.
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryBtn} activeOpacity={0.9}>
            <Text style={styles.secondaryBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={abrirWhatsApp} style={styles.primaryBtn} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Entrar a la tribu →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: { backgroundColor: '#1a1508', padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 12, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: '#2a2010', alignSelf: 'flex-start' },
  backText: { color: '#c9a84c', fontWeight: '800', fontSize: 12 },
  title: { fontSize: 30, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  subTitle: { fontSize: 13, color: '#6a5a40' },
  body: { padding: 16 },
  heroCard: { backgroundColor: '#13120f', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: 'rgba(201,168,76,0.28)', marginBottom: 16 },
  heroLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 14 },
  heroText: { fontSize: 17, color: '#f0e6c8', lineHeight: 28, fontWeight: '700' },
  block: { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#2a2010', marginBottom: 16 },
  blockTitle: { fontSize: 16, fontWeight: '900', color: '#f0e6c8', marginBottom: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingRight: 8 },
  bullet: { color: '#c9a84c', fontSize: 18, lineHeight: 22, marginRight: 8, fontWeight: '900' },
  bulletText: { flex: 1, color: '#e8e0d0', fontSize: 14, lineHeight: 22 },
  ruleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0c', borderWidth: 1, borderColor: '#2a2010', borderRadius: 14, padding: 14, marginBottom: 10 },
  ruleNumWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  ruleNum: { color: '#c9a84c', fontWeight: '900', fontSize: 13 },
  ruleTxt: { flex: 1, color: '#e8e0d0', fontSize: 14, lineHeight: 22 },
  quoteCard: { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 20 },
  quoteLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 12 },
  quoteText: { fontSize: 18, color: '#f0e6c8', lineHeight: 30, fontWeight: '700' },
  quoteFooter: { marginTop: 14, fontSize: 14, color: '#6a5a40', lineHeight: 22 },
  btnRow: { gap: 12 },
  secondaryBtn: { backgroundColor: '#0a0a0c', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2010' },
  secondaryBtnText: { color: '#6a5a40', fontWeight: '900', fontSize: 15 },
  primaryBtn: { backgroundColor: '#c9a84c', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#c9a84c', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  primaryBtnText: { color: '#0a0a0c', fontWeight: '900', fontSize: 15 },
});
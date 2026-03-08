import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CHALLENGE_DAYS = 30;
const CHALLENGE_NAME = 'Identidad Atómica';

const TIPS = [
  "El ayuno no es privarte, es darle a tu cuerpo el descanso que merece.",
  "Cada vez que elegís proteína sobre azúcar, estás eligiéndote a vos misma.",
  "La constancia supera siempre al talento.",
  "Hoy es un buen día para tomar agua, moverse y respirar profundo.",
  "Tu cuerpo sana cuando lo tratás bien. Confiá en el proceso.",
  "No se trata de perfección, se trata de progreso.",
  "Una decisión saludable a la vez. Eso es todo.",
];

export default function HomeScreen({ member, onLogout }) {
  const [refreshing, setRefreshing] = useState(false);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  const firstName = member?.name?.split(' ')[0] || 'Bienvenida';
  const expiresAt = new Date(member?.expires_at);
  const now = new Date();
  const daysLeft = Math.round((expiresAt - now) / 86400000);

  // Días en la comunidad
  const joinedAt = new Date(member?.joined_at || member?.payment_date);
  const daysIn = Math.max(1, Math.round((now - joinedAt) / 86400000));
  const challengeDay = Math.min(daysIn, CHALLENGE_DAYS);
  const progress = challengeDay / CHALLENGE_DAYS;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const statusColor = daysLeft <= 3 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#4ade80';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c9a84c" />}
      >
        {/* Header */}
        <LinearGradient colors={['#1a1508', '#0f0f12']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
              <Text style={styles.subGreeting}>Comunidad Ketoclub</Text>
            </View>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>

          {/* Membresía status */}
          <View style={styles.memberBadge}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.memberStatus, { color: statusColor }]}>
              {daysLeft <= 0 ? 'Membresía vencida' : `Membresía activa · ${daysLeft} días restantes`}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>

          {/* Desafío del mes */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>DESAFÍO DEL MES</Text>
            <Text style={styles.cardTitle}>{CHALLENGE_NAME}</Text>
            <Text style={styles.challengeDay}>Día {challengeDay} de {CHALLENGE_DAYS}</Text>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% completado</Text>
          </View>

          {/* Tip del día */}
          <LinearGradient colors={['#1a1508', '#13120f']} style={styles.tipCard}>
            <Text style={styles.tipLabel}>✨ REFLEXIÓN DEL DÍA</Text>
            <Text style={styles.tipText}>"{tip}"</Text>
            <Text style={styles.tipAuthor}>— Diego Gaitán</Text>
          </LinearGradient>

          {/* Accesos rápidos */}
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>🥑</Text>
              <Text style={styles.gridLabel}>Recetas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>📚</Text>
              <Text style={styles.gridLabel}>Ebooks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>🎥</Text>
              <Text style={styles.gridLabel}>Lives</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>💬</Text>
              <Text style={styles.gridLabel}>Comunidad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>📊</Text>
              <Text style={styles.gridLabel}>Mi progreso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <Text style={styles.gridIcon}>🎯</Text>
              <Text style={styles.gridLabel}>Desafíos</Text>
            </TouchableOpacity>
          </View>

          {/* Info miembro */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tu membresía</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoVal}>{member?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoVal}>{member?.is_first ? 'Ingreso' : 'Renovación'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vence</Text>
              <Text style={[styles.infoVal, { color: statusColor }]}>
                {expiresAt.toLocaleDateString('es-AR')}
              </Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: { padding: 24, paddingTop: 56 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#f0e6c8' },
  subGreeting: { fontSize: 13, color: '#6a5a40', marginTop: 3 },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#4a3a20', fontSize: 13 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  memberStatus: { fontSize: 13, fontWeight: '600' },
  body: { padding: 16 },
  card: {
    backgroundColor: '#13120f',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2010',
    marginBottom: 14,
  },
  cardLabel: { fontSize: 10, letterSpacing: 3, color: '#8a7a60', marginBottom: 6 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#f0e6c8', marginBottom: 4 },
  challengeDay: { fontSize: 13, color: '#c9a84c', marginBottom: 14 },
  progressBg: { backgroundColor: '#1e1e18', borderRadius: 8, height: 10, marginBottom: 6 },
  progressFill: { backgroundColor: '#c9a84c', borderRadius: 8, height: 10 },
  progressText: { fontSize: 12, color: '#6a5a40' },
  tipCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    marginBottom: 24,
  },
  tipLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 12 },
  tipText: { fontSize: 16, color: '#e8e0d0', lineHeight: 26, fontStyle: 'italic', marginBottom: 10 },
  tipAuthor: { fontSize: 12, color: '#6a5a40' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#8a7a60', marginBottom: 12, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gridItem: {
    backgroundColor: '#13120f',
    borderWidth: 1,
    borderColor: '#2a2010',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '30.5%',
  },
  gridIcon: { fontSize: 26, marginBottom: 8 },
  gridLabel: { fontSize: 12, color: '#8a7a60', textAlign: 'center' },
  infoCard: {
    backgroundColor: '#13120f',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2010',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#f0e6c8', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a14' },
  infoLabel: { fontSize: 13, color: '#6a5a40' },
  infoVal: { fontSize: 13, color: '#f0e6c8', fontWeight: '600' },
});

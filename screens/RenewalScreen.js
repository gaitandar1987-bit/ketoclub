import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';

const PLANES = [
  {
    icon: '⚡',
    nombre: 'Mensual',
    badge: null,
    precioOriginal: null,
    precio: '$18.888',
    periodo: '/ mes',
    ahorro: null,
    desc: 'Acceso completo por 30 días. Para empezar tu transformación.',
    features: ['Acceso completo a Ketoclub', 'Reto Identidad Atómica', 'Recetas y entrenamientos'],
    color: '#c9a84c',
    destacado: false,
  },
  {
    icon: '🔥',
    nombre: 'Trimestral',
    badge: '⭐ MÁS ELEGIDO',
    precioOriginal: '$56.664',
    precio: '$48.888',
    periodo: 'x 3 meses',
    ahorro: 'Ahorrás $7.776',
    desc: 'La opción más inteligente. Te comprometés y los resultados llegan.',
    features: ['Todo lo del plan Mensual', 'Comunidad exclusiva', 'Clases en vivo', 'Reto Identidad Atómica'],
    color: '#4ade80',
    destacado: true,
  },
  {
    icon: '👑',
    nombre: 'Anual',
    badge: '💥 MEJOR PRECIO',
    precioOriginal: '$226.656',
    precio: '$88.888',
    periodo: '/ año',
    ahorro: 'Ahorrás más del 60%',
    desc: 'Para los que van en serio. El mayor ahorro, los mejores resultados.',
    features: ['Todo lo del plan Trimestral', 'Todos los retos del año', 'Actualizaciones incluidas', 'Acceso prioritario'],
    color: '#a78bfa',
    destacado: false,
  },
];

function PlanCard({ plan, onPress, index }) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay: index * 120, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.planCard, plan.destacado && styles.planCardDestacado]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {plan.badge && (
          <View style={[styles.planBadge, { backgroundColor: plan.color + '20', borderColor: plan.color + '50' }]}>
            <Text style={[styles.planBadgeText, { color: plan.color }]}>{plan.badge}</Text>
          </View>
        )}

        <View style={styles.planTop}>
          <Text style={styles.planIcon}>{plan.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.planNombre, { color: plan.color }]}>{plan.nombre}</Text>
            {plan.precioOriginal && (
              <Text style={styles.planPrecioTachado}>{plan.precioOriginal}</Text>
            )}
            <View style={styles.planPrecioRow}>
              <Text style={[styles.planPrecio, plan.destacado && { fontSize: 28 }]}>{plan.precio}</Text>
              <Text style={styles.planPeriodo}> {plan.periodo}</Text>
            </View>
            {plan.ahorro && (
              <View style={[styles.planAhorroBadge, { backgroundColor: plan.color + '20' }]}>
                <Text style={[styles.planAhorroText, { color: plan.color }]}>✓ {plan.ahorro}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.planDesc}>{plan.desc}</Text>

        <View style={styles.planFeatures}>
          {plan.features.map((f, i) => (
            <View key={i} style={styles.planFeatureRow}>
              <Text style={[styles.planFeatureCheck, { color: plan.color }]}>✓</Text>
              <Text style={styles.planFeatureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.planBtn, { backgroundColor: plan.destacado ? plan.color : 'transparent', borderWidth: plan.destacado ? 0 : 1.5, borderColor: plan.color }]}>
          <Text style={[styles.planBtnText, { color: plan.destacado ? '#0a0a0c' : plan.color }]}>
            Quiero el plan {plan.nombre} →
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RenewalScreen({ member, onBack }) {
  const expiresAt = new Date(member?.expires_at);
  const daysLeft = Math.floor((expiresAt - new Date()) / 86400000);
  const statusColor = daysLeft <= 3 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#4ade80';

  async function contactarWhatsApp(plan) {
    const msg = `Hola! Quiero renovar mi membresía Ketoclub — Plan ${plan}. Mi número es ${member?.phone}.`;
    const url = `https://wa.me/5491168446832?text=${encodeURIComponent(msg)}`;
    await Linking.openURL(url);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · MEMBRESÍA</Text>
        <Text style={styles.headerTitle}>Renovar Acceso</Text>
        <Text style={styles.headerSub}>Seguí transformándote sin pausas</Text>
      </View>

      <View style={styles.body}>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>📋 ESTADO ACTUAL</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {daysLeft <= 0
                ? 'Membresía vencida'
                : daysLeft <= 7
                ? `⚠️ Vence en ${daysLeft} días`
                : `Activa · ${daysLeft} días restantes`}
            </Text>
          </View>
          <Text style={styles.statusSub}>Vence el {expiresAt.toLocaleDateString('es-AR')}</Text>
        </View>

        {/* SOCIAL PROOF */}
        <View style={styles.socialCard}>
          <Text style={styles.socialNum}>+10.000</Text>
          <Text style={styles.socialText}>personas ya transformaron su vida con Ketoclub</Text>
          <View style={styles.socialChips}>
            <View style={styles.chip}><Text style={styles.chipText}>✓ Sin contratos</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>✓ Cancelá cuando quieras</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>✓ Resultados reales</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Elegí tu plan</Text>

        {PLANES.map((p, i) => (
          <PlanCard
            key={p.nombre}
            plan={p}
            index={i}
            onPress={() => contactarWhatsApp(p.nombre)}
          />
        ))}

        {/* FRASE */}
        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>💬 RECORDÁ</Text>
          <Text style={styles.fraseTexto}>
            "Cada mes que invertís en vos misma es un mes más cerca de la persona que querés ser."
          </Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Al tocar "Quiero el plan" te conectamos por WhatsApp con el equipo de Ketoclub para coordinar tu pago y activación.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: { backgroundColor: '#1a1508', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn: { marginBottom: 14, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#2a2010', alignSelf: 'flex-start' },
  backText: { color: '#c9a84c', fontWeight: '800', fontSize: 12 },
  headerSobre: { fontSize: 10, color: '#3a2a10', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#6a5a40' },
  body: { padding: 16 },

  statusCard: { backgroundColor: '#13120f', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', marginBottom: 14 },
  statusLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 10, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: '700' },
  statusSub: { fontSize: 12, color: '#6a5a40' },

  socialCard: { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 20, alignItems: 'center' },
  socialNum: { fontSize: 40, fontWeight: '900', color: '#c9a84c', marginBottom: 4 },
  socialText: { fontSize: 13, color: '#8a7a60', textAlign: 'center', marginBottom: 14 },
  socialChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  chipText: { fontSize: 11, color: '#c9a84c', fontWeight: '700' },

  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#6a5a40', marginBottom: 14, letterSpacing: 2 },

  planCard: { backgroundColor: '#13120f', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#2a2010', marginBottom: 14 },
  planCardDestacado: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.04)', shadowColor: '#4ade80', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  planBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14 },
  planBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  planTop: { flexDirection: 'row', gap: 14, marginBottom: 12, alignItems: 'flex-start' },
  planIcon: { fontSize: 32, marginTop: 4 },
  planNombre: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  planPrecioTachado: { fontSize: 13, color: '#4a3a20', textDecorationLine: 'line-through', marginBottom: 2 },
  planPrecioRow: { flexDirection: 'row', alignItems: 'baseline' },
  planPrecio: { fontSize: 24, fontWeight: '900', color: '#f0e6c8' },
  planPeriodo: { fontSize: 13, color: '#6a5a40', fontWeight: '600' },
  planAhorroBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  planAhorroText: { fontSize: 11, fontWeight: '900' },
  planDesc: { fontSize: 13, color: '#6a5a40', lineHeight: 20, marginBottom: 14 },
  planFeatures: { gap: 8, marginBottom: 18 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planFeatureCheck: { fontSize: 13, fontWeight: '900' },
  planFeatureText: { fontSize: 13, color: '#8a7a60' },
  planBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  planBtnText: { fontWeight: '900', fontSize: 14 },

  fraseCard: { backgroundColor: '#13120f', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 14 },
  fraseLabel: { fontSize: 10, letterSpacing: 3, color: '#c9a84c', marginBottom: 10, fontWeight: '900' },
  fraseTexto: { fontSize: 14, color: '#e8e0d0', lineHeight: 24, fontStyle: 'italic', marginBottom: 10 },
  fraseAuthor: { fontSize: 12, color: '#6a5a40' },

  infoCard: { backgroundColor: '#13120f', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2010' },
  infoText: { fontSize: 12, color: '#4a3a20', lineHeight: 20, textAlign: 'center' },
});
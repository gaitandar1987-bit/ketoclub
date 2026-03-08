import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const CATEGORIAS = [
  {
    id: 'fuerza',
    nombre: 'En Casa — Reto 21 Días',
    icono: '🏠',
    color: '#f97316',
    desc: 'Reto 21 días de entrenamiento en casa sin equipo',
    items: [
      { titulo: 'Día 1 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 1 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=JnDu110SBN0' },
      { titulo: 'Día 2 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 2 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=UappDafansA' },
      { titulo: 'Día 3 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 3 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=ChPxeh54ARI' },
      { titulo: 'Día 4 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 4 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=xudx2gRxj_E' },
      { titulo: 'Día 5 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 5 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=Q39R7snFrvo' },
      { titulo: 'Día 6 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 6 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=S2r3Zp_fMNw' },
      { titulo: 'Día 7 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 7 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=SEDrH19SclU' },
      { titulo: 'Día 8 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 8 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=8Yyd4fIUG38' },
      { titulo: 'Día 9 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 9 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=3HqdDuq1OS4' },
      { titulo: 'Día 10 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 10 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=EnPBnM4_6gg' },
      { titulo: 'Día 11 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 11 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=yDtPqGEU-Ak' },
      { titulo: 'Día 12 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 12 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=62JfD3OH2vo' },
      { titulo: 'Día 13 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 13 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=kzoSM4ZBzP4' },
      { titulo: 'Día 14 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 14 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=A7ljTU_h9VI' },
      { titulo: 'Día 15 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 15 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=MythPbjCmZU' },
      { titulo: 'Día 16 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 16 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=re2_MPUGW3I' },
      { titulo: 'Día 17 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 17 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=BMFqUu-uP0o' },
      { titulo: 'Día 18 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 18 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=fdy9e58i5o0' },
      { titulo: 'Día 19 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 19 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=4VAsjK8DU5g' },
      { titulo: 'Día 20 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 20 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=30poe3f-0B0' },
      { titulo: 'Día 21 — Entrenamiento en Casa', desc: 'Reto 21 días en casa. Día 21 de 21. Sin equipo, máxima intensidad.', url: 'https://www.youtube.com/watch?v=PwaHgx3vjaY' },
    ],
  },
  {
    id: 'boxeo',
    nombre: 'Mecha Box — Desafío 7 Días',
    icono: '🥊',
    color: '#f43f5e',
    desc: 'Desafío completo de 7 días de box para quemar grasa',
    items: [
      { titulo: 'Día 1 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 1 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=aZOrrX4LYU0' },
      { titulo: 'Día 2 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 2 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=g7yCXosid60' },
      { titulo: 'Día 3 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 3 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=9chbsqNuQnQ' },
      { titulo: 'Día 4 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 4 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=hndqA2WA5nc' },
      { titulo: 'Día 5 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 5 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=Vi8x7NojVsE' },
      { titulo: 'Día 6 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 6 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=mF2luXNHgvE' },
      { titulo: 'Día 7 — Mecha Box Desafío', desc: 'Desafío 7 días de box. Día 7 de 7. Cardio, técnica y quema de grasa.', url: 'https://www.youtube.com/watch?v=1QDF6lrelbE' },
    ],
  },
  {
    id: 'hiit',
    nombre: 'HIIT & Quema Grasa',
    icono: '🔥',
    color: '#fbbf24',
    desc: 'Alta intensidad para quemar grasa en cetosis',
    items: [
      { titulo: 'HIIT 15 min — Sin Equipo', desc: 'El entrenamiento más eficiente para quemar grasa en estado cetogénico.', url: 'https://www.youtube.com/results?search_query=hiit+15+minutos+sin+equipo+espanol' },
      { titulo: 'Tabata Quema Grasa Total', desc: '20 segundos de trabajo, 10 de descanso. El protocolo que resetea tu metabolismo.', url: 'https://www.youtube.com/results?search_query=tabata+quema+grasa+espanol' },
      { titulo: 'Cardio Keto — Zona 2', desc: 'Cardio de baja intensidad para maximizar la oxidación de grasa en cetosis.', url: 'https://www.youtube.com/results?search_query=zona+2+cardio+quema+grasa+keto' },
      { titulo: 'HIIT en Ayunas — Protocolo', desc: 'Cómo entrenar en ayunas para maximizar el estado cetogénico y la quema de grasa.', url: 'https://www.youtube.com/results?search_query=hiit+en+ayunas+protocolo+keto' },
      { titulo: 'Jump Rope — Saltar la Soga', desc: 'El ejercicio más barato y efectivo del mundo. 10 minutos = 30 minutos de cardio.', url: 'https://www.youtube.com/results?search_query=saltar+la+soga+entrenamiento+quema+grasa' },
      { titulo: 'Cardio sin Correr — 30 min', desc: 'Para los que no quieren o no pueden correr. Efectivo y articulaciones agradecidas.', url: 'https://www.youtube.com/results?search_query=cardio+sin+correr+30+minutos' },
    ],
  },
  {
    id: 'movilidad',
    nombre: 'Movilidad & Yoga',
    icono: '🧘',
    color: '#a78bfa',
    desc: 'Recuperación, flexibilidad y consciencia corporal',
    items: [
      { titulo: 'Movilidad Matinal — 10 min', desc: 'Despertá el cuerpo con movilidad articular antes de arrancar el día.', url: 'https://www.youtube.com/watch?v=9a7dBf1i17I' },
      { titulo: 'Yoga para Atletas', desc: 'Flexibilidad y recuperación para quienes entrenan fuerte. Estiramientos profundos.', url: 'https://www.youtube.com/watch?v=HZn7SwU-lN8' },
      { titulo: 'Stretching Post-Entreno', desc: 'La rutina de estiramiento que todos salteamos y todos deberíamos hacer.', url: 'https://www.youtube.com/watch?v=kNavJY0EBbU' },
      { titulo: 'Fascia Release — Rodillo', desc: 'Liberá la fascia y reducí la inflamación con automasaje activo.', url: 'https://www.youtube.com/watch?v=65nIwLaMsWQ' },
      { titulo: 'Yoga Restaurativo', desc: 'Para los días de descanso activo. Recuperación profunda y silencio interior.', url: 'https://www.youtube.com/watch?v=PQ6HISfby9c' },
      { titulo: 'Respiración + Movimiento', desc: 'La combinación perfecta: técnica de respiración coordinada con movimiento consciente.', url: 'https://www.youtube.com/watch?v=4xOKSJhBF5g' },
      { titulo: 'Yoga Keto — Flexibilidad Total', desc: 'Rutina de yoga adaptada al protocolo keto. Movilidad y calma mental.', url: 'https://www.youtube.com/watch?v=QSzouTQvF-A' },
      { titulo: 'Movilidad Avanzada — Rutina Completa', desc: 'Flexibilidad avanzada para mejorar rendimiento y prevenir lesiones.', url: 'https://www.youtube.com/watch?v=gNdneasmNJE' },
    ],
  },
  {
    id: 'casa',
    nombre: 'Sin Equipo en Casa',
    icono: '🏠',
    color: '#4ade80',
    desc: 'Sin gym, sin excusas. Tu casa es tu gimnasio',
    items: [
      { titulo: 'Full Body en Casa — 30 min', desc: 'Rutina completa de cuerpo entero sin ningún equipo. Progresión real.', url: 'https://www.youtube.com/results?search_query=full+body+en+casa+30+minutos+sin+equipo' },
      { titulo: 'Calistenia para Principiantes', desc: 'La disciplina más honesta. Tu cuerpo contra la gravedad. Sin excusas.', url: 'https://www.youtube.com/results?search_query=calistenia+principiantes+espanol' },
      { titulo: 'Sentadillas — 100 Variaciones', desc: 'El ejercicio más completo que existe. Aprendé todas las variaciones.', url: 'https://www.youtube.com/results?search_query=variaciones+sentadillas+sin+equipo' },
      { titulo: 'Flexiones — Progresión Total', desc: 'De 0 a 50 flexiones. El programa de progresión más honesto.', url: 'https://www.youtube.com/results?search_query=progresion+flexiones+principiantes' },
      { titulo: 'Dominadas — Sistema desde Cero', desc: 'La barra que separa a los que se comprometieron de los que no.', url: 'https://www.youtube.com/results?search_query=aprender+dominadas+desde+cero' },
      { titulo: 'Rutina Nocturna — Bajar Cortisol', desc: 'Movimiento suave para reducir cortisol, mejorar el sueño y recuperar el cuerpo.', url: 'https://www.youtube.com/results?search_query=rutina+nocturna+bajar+cortisol+espanol' },
    ],
  },
];

export default function EntrenamientosScreen({ onBack }) {
  const [categoriaActiva, setCategoriaActiva] = useState('fuerza');
  const [expandido, setExpandido] = useState(null);
  const categoria = CATEGORIAS.find(c => c.id === categoriaActiva);

  async function abrirLink(url, titulo) {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', `No se pudo abrir "${titulo}". Verificá tu conexión.`);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💪 Entrenamientos</Text>
        <Text style={styles.headerSub}>Fausto Murillo · Mecha Box · HIIT · Movilidad</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {CATEGORIAS.map(cat => {
          const activa = categoriaActiva === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => { setCategoriaActiva(cat.id); setExpandido(null); }}
              style={[styles.tab, activa && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.tabIcon}>{cat.icono}</Text>
              <Text style={[styles.tabLabel, activa && { color: cat.color }]}>{cat.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.catBanner, { borderColor: categoria.color + '40', backgroundColor: categoria.color + '10' }]}>
          <Text style={styles.catBannerIcon}>{categoria.icono}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.catBannerNombre, { color: categoria.color }]}>{categoria.nombre}</Text>
            <Text style={styles.catBannerDesc}>{categoria.desc}</Text>
          </View>
          <View style={[styles.catCount, { backgroundColor: categoria.color + '20', borderColor: categoria.color + '40' }]}>
            <Text style={[styles.catCountNum, { color: categoria.color }]}>{categoria.items.length}</Text>
            <Text style={[styles.catCountLabel, { color: categoria.color + '80' }]}>videos</Text>
          </View>
        </View>

        {categoria.items.map((item, i) => {
          const abierto = expandido === i;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setExpandido(abierto ? null : i)}
              activeOpacity={0.9}
              style={[styles.itemCard, abierto && { borderColor: categoria.color + '60', backgroundColor: categoria.color + '08' }]}
            >
              <View style={styles.itemTop}>
                <View style={[styles.itemNumBox, { backgroundColor: categoria.color + '18', borderColor: categoria.color + '30' }]}>
                  <Text style={[styles.itemNum, { color: categoria.color }]}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitulo}>{item.titulo}</Text>
                  <View style={styles.itemPlatRow}>
                    <Text style={styles.itemPlatIcon}>▶️</Text>
                    <Text style={styles.itemPlatLabel}>YouTube</Text>
                  </View>
                </View>
                <View style={[styles.chevronBox, abierto && { backgroundColor: categoria.color + '20', borderColor: categoria.color + '40' }]}>
                  <Text style={[styles.chevron, { color: abierto ? categoria.color : '#4a3a20' }]}>{abierto ? '▲' : '▼'}</Text>
                </View>
              </View>
              {abierto && (
                <View style={styles.itemBody}>
                  <View style={[styles.itemDescBox, { borderLeftColor: categoria.color }]}>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.itemBtn, { backgroundColor: categoria.color }]}
                    onPress={() => abrirLink(item.url, item.titulo)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.itemBtnIcon}>▶️</Text>
                    <Text style={styles.itemBtnText}>Ver en YouTube</Text>
                    <Text style={styles.itemBtnArrow}>→</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>💪 Ketoclub · Diego Gaitán</Text>
          <View style={styles.footerLine} />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: { backgroundColor: '#1a1508', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  backBtn: { marginBottom: 14, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#2a2010', alignSelf: 'flex-start' },
  backText: { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub: { fontSize: 12, color: '#6a5a40' },
  tabsScroll: { backgroundColor: '#0f0f0a', borderBottomWidth: 1, borderBottomColor: '#1a1a14', maxHeight: 64 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#13120f', borderWidth: 1.5, borderColor: '#2a2010' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontWeight: '800', color: '#4a3a20' },
  body: { flex: 1, padding: 16 },
  catBanner: { borderRadius: 18, borderWidth: 1.5, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  catBannerIcon: { fontSize: 34 },
  catBannerNombre: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
  catBannerDesc: { fontSize: 12, color: '#6a5a40', lineHeight: 18 },
  catCount: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 52 },
  catCountNum: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  catCountLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  itemCard: { backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, borderColor: '#2a2010', padding: 16, marginBottom: 10 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemNumBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemNum: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  itemTitulo: { fontSize: 14, fontWeight: '800', color: '#f0e6c8', marginBottom: 5, lineHeight: 20 },
  itemPlatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemPlatIcon: { fontSize: 11 },
  itemPlatLabel: { fontSize: 11, fontWeight: '700', color: '#f97316' },
  chevronBox: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#2a2010', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chevron: { fontSize: 10, fontWeight: '900' },
  itemBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1e1e18' },
  itemDescBox: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 14 },
  itemDesc: { fontSize: 13, color: '#c8bfa8', lineHeight: 21 },
  itemBtn: { borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  itemBtnIcon: { fontSize: 14 },
  itemBtnText: { color: '#0a0a0c', fontWeight: '900', fontSize: 14 },
  itemBtnArrow: { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, marginTop: 8 },
  footerLine: { flex: 1, height: 1, backgroundColor: '#1a1a14' },
  footerText: { fontSize: 11, color: '#2a2010', letterSpacing: 1, fontWeight: '700' },
});
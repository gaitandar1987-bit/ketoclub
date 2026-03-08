import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { getEntrenamientos } from '../supabase';

const TABS = [
  { id: 'Sin Equipo en Casa', nombre: 'En Casa — 21 Días', icono: '🏠', color: '#4ade80', desc: 'Reto 21 días. Sin equipo, máxima intensidad.' },
  { id: 'Mecha Box',          nombre: 'Mecha Box — 7 Días', icono: '🥊', color: '#f87171', desc: 'Desafío 7 días de box. Cardio y técnica.' },
  { id: 'Movilidad y Flexibilidad', nombre: 'Movilidad & Yoga', icono: '🧘', color: '#a78bfa', desc: 'Flexibilidad, yoga y recuperación activa.' },
];

export default function EntrenamientosScreen({ onBack }) {
  const [tabActiva, setTabActiva]   = useState('Sin Equipo en Casa');
  const [expandido, setExpandido]   = useState(null);
  const [todos, setTodos]           = useState([]);
  const [cargando, setCargando]     = useState(true);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const data = await getEntrenamientos();
    if (data) setTodos(data);
    setCargando(false);
  }

  async function abrirLink(ytId, titulo) {
    try {
      await Linking.openURL(`https://www.youtube.com/watch?v=${ytId}`);
    } catch(e) {
      Alert.alert('Error', `No se pudo abrir "${titulo}".`);
    }
  }

  const tab = TABS.find(t => t.id === tabActiva);
  const items = todos.filter(e => e.categoria === tabActiva);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💪 Entrenamientos</Text>
        <Text style={styles.headerSub}>En Casa · Mecha Box · Movilidad</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {TABS.map(t => {
          const activa = tabActiva === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => { setTabActiva(t.id); setExpandido(null); }}
              style={[styles.tab, activa && { borderColor: t.color, backgroundColor: t.color + '15' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.tabIcon}>{t.icono}</Text>
              <Text style={[styles.tabLabel, activa && { color: t.color }]}>{t.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <View style={{ alignItems:'center', paddingVertical:40 }}>
            <ActivityIndicator color="#c9a84c" size="large" />
            <Text style={{ color:'#6a5a40', marginTop:12, fontSize:13 }}>Cargando entrenamientos...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.catBanner, { borderColor: tab.color + '40', backgroundColor: tab.color + '10' }]}>
              <Text style={styles.catBannerIcon}>{tab.icono}</Text>
              <View style={{ flex:1 }}>
                <Text style={[styles.catBannerNombre, { color: tab.color }]}>{tab.nombre}</Text>
                <Text style={styles.catBannerDesc}>{tab.desc}</Text>
              </View>
              <View style={[styles.catCount, { backgroundColor: tab.color + '20', borderColor: tab.color + '40' }]}>
                <Text style={[styles.catCountNum, { color: tab.color }]}>{items.length}</Text>
                <Text style={[styles.catCountLabel, { color: tab.color + '80' }]}>videos</Text>
              </View>
            </View>

            {items.map((item, i) => {
              const abierto = expandido === i;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setExpandido(abierto ? null : i)}
                  activeOpacity={0.9}
                  style={[styles.itemCard, abierto && { borderColor: tab.color + '60', backgroundColor: tab.color + '08' }]}
                >
                  <View style={styles.itemTop}>
                    <View style={[styles.itemNumBox, { backgroundColor: tab.color + '18', borderColor: tab.color + '30' }]}>
                      <Text style={[styles.itemNum, { color: tab.color }]}>{String(i+1).padStart(2,'0')}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={styles.itemTitulo}>{item.titulo}</Text>
                      <View style={styles.itemPlatRow}>
                        <Text style={styles.itemPlatIcon}>▶️</Text>
                        <Text style={styles.itemPlatLabel}>YouTube</Text>
                      </View>
                    </View>
                    <View style={[styles.chevronBox, abierto && { backgroundColor: tab.color + '20', borderColor: tab.color + '40' }]}>
                      <Text style={[styles.chevron, { color: abierto ? tab.color : '#4a3a20' }]}>{abierto ? '▲' : '▼'}</Text>
                    </View>
                  </View>
                  {abierto && (
                    <View style={styles.itemBody}>
                      <View style={[styles.itemDescBox, { borderLeftColor: tab.color }]}>
                        <Text style={styles.itemDesc}>{item.descripcion}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.itemBtn, { backgroundColor: tab.color }]}
                        onPress={() => abrirLink(item.youtube_id, item.titulo)}
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
          </>
        )}
        <View style={{ height:50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', paddingHorizontal:24, paddingTop:56, paddingBottom:20 },
  backBtn: { marginBottom:14, paddingVertical:8, paddingHorizontal:12, borderRadius:10, backgroundColor:'rgba(0,0,0,0.3)', borderWidth:1, borderColor:'#2a2010', alignSelf:'flex-start' },
  backText: { color:'#c9a84c', fontWeight:'900', fontSize:12 },
  headerTitle: { fontSize:26, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:12, color:'#6a5a40' },
  tabsScroll: { backgroundColor:'#0f0f0a', borderBottomWidth:1, borderBottomColor:'#1a1a14', maxHeight:64 },
  tabsContent: { paddingHorizontal:16, paddingVertical:12, gap:8, alignItems:'center' },
  tab: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor:'#13120f', borderWidth:1.5, borderColor:'#2a2010' },
  tabIcon: { fontSize:14 },
  tabLabel: { fontSize:12, fontWeight:'800', color:'#4a3a20' },
  body: { flex:1, padding:16 },
  catBanner: { borderRadius:18, borderWidth:1.5, padding:18, flexDirection:'row', alignItems:'center', gap:14, marginBottom:16 },
  catBannerIcon: { fontSize:34 },
  catBannerNombre: { fontSize:17, fontWeight:'900', marginBottom:3 },
  catBannerDesc: { fontSize:12, color:'#6a5a40', lineHeight:18 },
  catCount: { borderWidth:1, borderRadius:14, paddingHorizontal:12, paddingVertical:8, alignItems:'center', minWidth:52 },
  catCountNum: { fontSize:20, fontWeight:'900', lineHeight:24 },
  catCountLabel: { fontSize:9, fontWeight:'700', letterSpacing:1 },
  itemCard: { backgroundColor:'#13120f', borderRadius:16, borderWidth:1.5, borderColor:'#2a2010', padding:16, marginBottom:10 },
  itemTop: { flexDirection:'row', alignItems:'center', gap:12 },
  itemNumBox: { width:36, height:36, borderRadius:10, borderWidth:1, alignItems:'center', justifyContent:'center', flexShrink:0 },
  itemNum: { fontSize:13, fontWeight:'900' },
  itemTitulo: { fontSize:14, fontWeight:'800', color:'#f0e6c8', flex:1, lineHeight:20 },
  itemPlatRow: { flexDirection:'row', alignItems:'center', gap:4, marginTop:3 },
  itemPlatIcon: { fontSize:10 },
  itemPlatLabel: { fontSize:10, color:'#4a3a20', fontWeight:'700' },
  chevronBox: { width:28, height:28, borderRadius:8, borderWidth:1, borderColor:'#2a2010', alignItems:'center', justifyContent:'center' },
  chevron: { fontSize:11, fontWeight:'900' },
  itemBody: { marginTop:14, paddingTop:14, borderTopWidth:1, borderTopColor:'#1a1a14' },
  itemDescBox: { borderLeftWidth:2, paddingLeft:12, marginBottom:14 },
  itemDesc: { fontSize:13, color:'#8a7a60', lineHeight:20 },
  itemBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderRadius:12, paddingVertical:14 },
  itemBtnIcon: { fontSize:14 },
  itemBtnText: { fontSize:14, fontWeight:'900', color:'#0a0a0c' },
  itemBtnArrow: { fontSize:16, fontWeight:'900', color:'#0a0a0c' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { getBiblioteca } from '../supabase';

const TABS = [
  { id:'peliculas',    nombre:'Películas',    icono:'🎬', color:'#f87171' },
  { id:'documentales', nombre:'Documentales', icono:'📽️', color:'#fb923c' },
  { id:'podcasts',     nombre:'Podcasts',     icono:'🎙️', color:'#4ade80' },
  { id:'frecuencias',  nombre:'Frecuencias',  icono:'🎵', color:'#a78bfa' },
  { id:'libros',       nombre:'Libros',       icono:'📖', color:'#c9a84c' },
];

async function abrirLink(ytId, titulo) {
  try {
    await Linking.openURL(`https://www.youtube.com/watch?v=${ytId}`);
  } catch(e) {
    Alert.alert('Error', `No se pudo abrir "${titulo}".`);
  }
}

export default function BibliotecaScreen({ onBack }) {
  const [tabActiva, setTabActiva]   = useState('peliculas');
  const [todos, setTodos]           = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [abierto, setAbierto]       = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const data = await getBiblioteca();
    if (data) setTodos(data);
    setCargando(false);
  }

  const tab = TABS.find(t => t.id === tabActiva);
  const items = todos.filter(i => i.categoria === tabActiva);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📚 Biblioteca Keto</Text>
        <Text style={styles.headerSub}>Películas · Documentales · Podcasts · Frecuencias · Libros</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {TABS.map(t => {
          const activa = tabActiva === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => { setTabActiva(t.id); setAbierto(null); }}
              style={[styles.tab, activa && { borderColor: t.color, backgroundColor: t.color + '15' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.tabIcon}>{t.icono}</Text>
              <Text style={[styles.tabLabel, activa && { color: t.color }]}>{t.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.body}>
        {cargando ? (
          <View style={{ alignItems:'center', paddingVertical:40 }}>
            <ActivityIndicator color="#c9a84c" size="large" />
            <Text style={{ color:'#6a5a40', marginTop:12, fontSize:13 }}>Cargando biblioteca...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.catBanner, { borderColor: tab.color + '40', backgroundColor: tab.color + '10' }]}>
              <Text style={styles.catBannerIcon}>{tab.icono}</Text>
              <View style={{ flex:1 }}>
                <Text style={[styles.catBannerNombre, { color: tab.color }]}>{tab.nombre}</Text>
              </View>
              <View style={[styles.catCount, { backgroundColor: tab.color + '20', borderColor: tab.color + '40' }]}>
                <Text style={[styles.catCountNum, { color: tab.color }]}>{items.length}</Text>
                <Text style={[styles.catCountLabel, { color: tab.color + '99' }]}>items</Text>
              </View>
            </View>

            {items.map((item, i) => {
              const isAbierto = abierto === i;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setAbierto(isAbierto ? null : i)}
                  activeOpacity={0.9}
                  style={[styles.itemCard, isAbierto && { borderColor: tab.color + '60', backgroundColor: tab.color + '08' }]}
                >
                  <View style={styles.itemTop}>
                    <View style={[styles.itemNumBox, { backgroundColor: tab.color + '18', borderColor: tab.color + '30' }]}>
                      <Text style={[styles.itemNum, { color: tab.color }]}>{String(i+1).padStart(2,'0')}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={styles.itemTitulo}>{item.titulo}</Text>
                    </View>
                    <View style={[styles.chevronBox, isAbierto && { backgroundColor: tab.color + '20', borderColor: tab.color + '40' }]}>
                      <Text style={[styles.chevron, { color: isAbierto ? tab.color : '#4a3a20' }]}>{isAbierto ? '▲' : '▼'}</Text>
                    </View>
                  </View>
                  {isAbierto && (
                    <View style={styles.itemBody}>
                      <View style={[styles.itemDescBox, { borderLeftColor: tab.color }]}>
                        <Text style={styles.itemDesc}>{item.descripcion}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.itemBtn, { backgroundColor: tab.color }]}
                        onPress={() => abrirLink(item.imagen_url, item.titulo)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.itemBtnText}>▶ Ver en YouTube →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height:40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', paddingHorizontal:24, paddingTop:56, paddingBottom:20 },
  backBtn: { marginBottom:14, paddingVertical:8, paddingHorizontal:12, borderRadius:10, backgroundColor:'rgba(0,0,0,0.3)', borderWidth:1, borderColor:'#2a2010', alignSelf:'flex-start' },
  backText: { color:'#c9a84c', fontWeight:'900', fontSize:12 },
  headerTitle: { fontSize:26, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:11, color:'#6a5a40' },
  tabsScroll: { backgroundColor:'#0f0f0a', borderBottomWidth:1, borderBottomColor:'#1a1a14', maxHeight:64 },
  tabsContent: { paddingHorizontal:16, paddingVertical:12, gap:8, alignItems:'center' },
  tab: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor:'#13120f', borderWidth:1.5, borderColor:'#2a2010' },
  tabIcon: { fontSize:14 },
  tabLabel: { fontSize:12, fontWeight:'800', color:'#4a3a20' },
  body: { padding:16 },
  catBanner: { borderRadius:18, borderWidth:1.5, padding:18, flexDirection:'row', alignItems:'center', gap:14, marginBottom:16 },
  catBannerIcon: { fontSize:34 },
  catBannerNombre: { fontSize:17, fontWeight:'900' },
  catCount: { borderWidth:1, borderRadius:14, paddingHorizontal:12, paddingVertical:8, alignItems:'center', minWidth:52 },
  catCountNum: { fontSize:20, fontWeight:'900', lineHeight:24 },
  catCountLabel: { fontSize:9, fontWeight:'700', letterSpacing:1 },
  itemCard: { backgroundColor:'#13120f', borderRadius:16, borderWidth:1.5, borderColor:'#2a2010', padding:16, marginBottom:10 },
  itemTop: { flexDirection:'row', alignItems:'center', gap:12 },
  itemNumBox: { width:36, height:36, borderRadius:10, borderWidth:1, alignItems:'center', justifyContent:'center', flexShrink:0 },
  itemNum: { fontSize:13, fontWeight:'900' },
  itemTitulo: { fontSize:14, fontWeight:'800', color:'#f0e6c8', lineHeight:20 },
  chevronBox: { width:28, height:28, borderRadius:8, borderWidth:1, borderColor:'#2a2010', alignItems:'center', justifyContent:'center' },
  chevron: { fontSize:11, fontWeight:'900' },
  itemBody: { marginTop:14, paddingTop:14, borderTopWidth:1, borderTopColor:'#1a1a14' },
  itemDescBox: { borderLeftWidth:2, paddingLeft:12, marginBottom:14 },
  itemDesc: { fontSize:13, color:'#8a7a60', lineHeight:20 },
  itemBtn: { borderRadius:12, paddingVertical:14, alignItems:'center' },
  itemBtnText: { fontSize:14, fontWeight:'900', color:'#0a0a0c' },
});

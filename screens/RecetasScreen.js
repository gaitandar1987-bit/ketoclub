import React, { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getRecetas } from '../supabase';

const CATEGORIAS = ['Todas', 'Desayunos', 'Almuerzos', 'Cenas', 'Snacks', 'Postres', 'Bebidas'];

export default function RecetasScreen({ onBack }) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [recetaAbierta, setRecetaAbierta]     = useState(null);
  const [busqueda, setBusqueda]               = useState('');
  const [recetas, setRecetas]                 = useState([]);
  const [cargando, setCargando]               = useState(true);

  useEffect(() => {
    cargarRecetas();
  }, []);

  async function cargarRecetas() {
    setCargando(true);
    const data = await getRecetas();
    if (data) setRecetas(data);
    setCargando(false);
  }

  const recetasFiltradas = recetas.filter(r => {
    const matchCat  = categoriaActiva === 'Todas' || r.categoria === categoriaActiva;
    const matchBusq = (r.titulo || '').toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · NUTRICIÓN</Text>
        <Text style={styles.headerTitle}>Recetas Keto</Text>
        <Text style={styles.headerSub}>Comida real · Sin culpa · Con sabor</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>🥑 FILOSOFÍA</Text>
          <Text style={styles.fraseTexto}>"Comer bien no es privarse. Es elegir alimentos que le dan energía real a tu cuerpo y claridad a tu mente."</Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll} contentContainerStyle={{ gap:8, paddingRight:16 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, categoriaActiva === cat && styles.catBtnActivo]}
              onPress={() => { Haptics.selectionAsync(); setCategoriaActiva(cat); setRecetaAbierta(null); }}
            >
              <Text style={[styles.catText, categoriaActiva === cat && styles.catTextActivo]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {cargando ? (
          <View style={{ alignItems:'center', paddingVertical:40 }}>
            <ActivityIndicator color="#c9a84c" size="large" />
            <Text style={{ color:'#6a5a40', marginTop:12, fontSize:13 }}>Cargando recetas...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>{recetasFiltradas.length} recetas</Text>

            {recetasFiltradas.map((r) => (
              <View key={r.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRecetaAbierta(recetaAbierta === r.id ? null : r.id); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.cardIconWrap}>
                      <Text style={styles.cardIcon}>{r.emoji}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={styles.cardNombre}>{r.titulo}</Text>
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardMetaText}>⏱ {r.tiempo}</Text>
                        <Text style={styles.cardMetaDot}>·</Text>
                        <Text style={styles.cardMetaText}>{r.calorias}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.cardArrow}>{recetaAbierta === r.id ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {recetaAbierta === r.id && (
                  <View style={styles.cardBody}>
                    <Text style={styles.seccion}>🛒 Ingredientes</Text>
                    {(r.ingredientes || '').split(' | ').map((ing, i) => (
                      <View key={i} style={styles.ingRow}>
                        <Text style={styles.ingBullet}>•</Text>
                        <Text style={styles.ingText}>{ing}</Text>
                      </View>
                    ))}
                    <Text style={styles.seccion}>👩‍🍳 Preparación</Text>
                    {(r.instrucciones || '').split(' | ').map((paso, i) => (
                      <View key={i} style={styles.pasoRow}>
                        <View style={styles.pasoNum}>
                          <Text style={styles.pasoNumText}>{i+1}</Text>
                        </View>
                        <Text style={styles.pasoText}>{paso}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={{ height:40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', padding:24, paddingTop:56, borderBottomWidth:1, borderBottomColor:'rgba(201,168,76,0.15)' },
  backBtn: { alignSelf:'flex-start', paddingVertical:8, paddingHorizontal:14, borderRadius:10, backgroundColor:'rgba(0,0,0,0.3)', borderWidth:1, borderColor:'#2a2010', marginBottom:20 },
  backText: { color:'#c9a84c', fontWeight:'900', fontSize:12 },
  headerSobre: { fontSize:10, color:'#4a3a20', fontWeight:'900', letterSpacing:3, marginBottom:6 },
  headerTitle: { fontSize:36, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:13, color:'#6a5a40' },
  body: { padding:16 },
  fraseCard: { backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1, borderColor:'rgba(201,168,76,0.3)', marginBottom:16 },
  fraseLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', marginBottom:10 },
  fraseTexto: { fontSize:14, color:'#e8e0d0', lineHeight:24, fontStyle:'italic', marginBottom:8 },
  fraseAuthor: { fontSize:12, color:'#6a5a40' },
  catsScroll: { marginBottom:8 },
  catBtn: { paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor:'#13120f', borderWidth:1, borderColor:'#2a2010' },
  catBtnActivo: { backgroundColor:'rgba(201,168,76,0.15)', borderColor:'#c9a84c' },
  catText: { fontSize:13, color:'#6a5a40', fontWeight:'700' },
  catTextActivo: { color:'#c9a84c' },
  countText: { fontSize:12, color:'#4a3a20', marginBottom:12, marginTop:4 },
  card: { backgroundColor:'#13120f', borderRadius:18, borderWidth:1.5, borderColor:'#2a2010', marginBottom:10, overflow:'hidden' },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 },
  cardLeft: { flexDirection:'row', alignItems:'center', gap:12, flex:1 },
  cardIconWrap: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(201,168,76,0.1)', borderWidth:1, borderColor:'rgba(201,168,76,0.25)', alignItems:'center', justifyContent:'center' },
  cardIcon: { fontSize:20 },
  cardNombre: { fontSize:14, fontWeight:'800', color:'#f0e6c8', marginBottom:4, lineHeight:18 },
  cardMeta: { flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap' },
  cardMetaText: { fontSize:11, color:'#6a5a40' },
  cardMetaDot: { color:'#2a2010', fontSize:11 },
  cardArrow: { fontSize:11, color:'#c9a84c', fontWeight:'900' },
  cardBody: { padding:16, paddingTop:4, borderTopWidth:1, borderTopColor:'#1a1a14' },
  seccion: { fontSize:12, fontWeight:'900', color:'#8a7a60', letterSpacing:1, marginBottom:10, marginTop:4 },
  ingRow: { flexDirection:'row', alignItems:'flex-start', gap:8, marginBottom:6 },
  ingBullet: { color:'#c9a84c', fontSize:16, lineHeight:20 },
  ingText: { flex:1, fontSize:13, color:'#e8e0d0', lineHeight:20 },
  pasoRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  pasoNum: { width:24, height:24, borderRadius:12, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1, borderColor:'rgba(201,168,76,0.35)', alignItems:'center', justifyContent:'center', flexShrink:0 },
  pasoNumText: { fontSize:11, fontWeight:'900', color:'#c9a84c' },
  pasoText: { flex:1, fontSize:13, color:'#e8e0d0', lineHeight:20 },
});

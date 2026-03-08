import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { getMeditaciones } from '../supabase';

const MEDITACIONES_GUIADAS = [
  { icon:'🌬️', titulo:'Respiración 4-7-8', duracion:'5 min', nivel:'Principiante', desc:'Inhalá 4 seg, retené 7, exhalá 8. Calma el sistema nervioso al instante.', color:'#4ade80',
    pasos:['Sentate con la espalda recta y cerrá los ojos.','Exhalá completamente por la boca.','Inhalá por la nariz contando 4 segundos.','Retené el aire contando 7 segundos.','Exhalá lentamente por la boca contando 8 segundos.','Repetí 4 ciclos completos.'] },
  { icon:'🌊', titulo:'Meditación de grounding', duracion:'10 min', nivel:'Intermedio', desc:'Conectá con el presente usando tus 5 sentidos. Ideal para la ansiedad.', color:'#60a5fa',
    pasos:['Pará lo que estás haciendo y respirá profundo.','Nombrá 5 cosas que podés VER a tu alrededor.','Nombrá 4 cosas que podés TOCAR.','Nombrá 3 cosas que podés ESCUCHAR.','Nombrá 2 cosas que podés OLER.','Nombrá 1 cosa que podés SABOREAR.'] },
  { icon:'🔥', titulo:'Meditación de intención', duracion:'7 min', nivel:'Principiante', desc:'Empezá el día con claridad. Definí quién sos hoy y qué vas a crear.', color:'#f97316',
    pasos:['Sentate en silencio y cerrá los ojos.','Respirá profundo 3 veces.','Preguntate: ¿Quién elijo ser hoy?','Visualizá cómo querés que sea tu día.','Repetite en voz baja tu intención del día.','Abrí los ojos y actuá desde ese lugar.'] },
  { icon:'🌙', titulo:'Relajación nocturna', duracion:'8 min', nivel:'Principiante', desc:'Soltá el día y preparate para un descanso profundo y reparador.', color:'#a78bfa',
    pasos:['Acostarte cómodamente y cerrá los ojos.','Tensá y relajá cada grupo muscular de pies a cabeza.','Respirá lento: 4 segundos adentro, 6 afuera.','Visualizá un lugar donde te sentís completamente seguro.','Dejá ir cada pensamiento sin retenerlos.','Permití que el cuerpo se hunda en el descanso.'] },
  { icon:'💛', titulo:'Amor propio', duracion:'10 min', nivel:'Intermedio', desc:'Cultivá compasión y amor hacia vos mismo. Transforma tu diálogo interno.', color:'#f43f5e',
    pasos:['Cerrá los ojos y llevá las manos al corazón.','Respirá suavemente y sentí el calor de tus manos.','Repetite: "Me acepto tal como soy en este momento."','Pensá en algo que te guste de vos mismo.','Enviá amor a las partes que más te cuestan.','Terminá con 3 respiraciones de gratitud.'] },
];

const COLORS = ['#4ade80','#a78bfa','#f97316','#fbbf24'];

export default function MeditacionesScreen({ onBack }) {
  const [abierta, setAbierta]   = useState(null);
  const [videos, setVideos]     = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const data = await getMeditaciones();
    if (data) setVideos(data);
    setCargando(false);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meditaciones</Text>
        <Text style={styles.headerSub}>Silenciá el ruido. Conectá con vos.</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>✨ ANTES DE EMPEZAR</Text>
          <Text style={styles.fraseTexto}>"La meditación no es escapar de la vida. Es aprender a estar en ella completamente."</Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        <Text style={styles.sectionTitle}>Prácticas guiadas</Text>
        {MEDITACIONES_GUIADAS.map((m, i) => (
          <View key={i} style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => setAbierta(abierta === i ? null : i)} activeOpacity={0.85}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconWrap, { backgroundColor: m.color + '18', borderColor: m.color + '40' }]}>
                  <Text style={styles.cardIcon}>{m.icon}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[styles.cardTitulo, { color: m.color }]}>{m.titulo}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>⏱ {m.duracion}</Text>
                    <Text style={styles.cardMetaDot}>·</Text>
                    <Text style={styles.cardMetaText}>{m.nivel}</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.cardArrow, { color: m.color }]}>{abierta === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {abierta === i && (
              <View style={styles.cardBody}>
                <Text style={styles.cardDesc}>{m.desc}</Text>
                <Text style={styles.pasosTitle}>Pasos:</Text>
                {m.pasos.map((paso, j) => (
                  <View key={j} style={styles.pasoRow}>
                    <View style={[styles.pasoNum, { backgroundColor: m.color + '20', borderColor: m.color + '40' }]}>
                      <Text style={[styles.pasoNumText, { color: m.color }]}>{j+1}</Text>
                    </View>
                    <Text style={styles.pasoText}>{paso}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Videos guiados</Text>
        {cargando ? (
          <View style={{ alignItems:'center', paddingVertical:30 }}>
            <ActivityIndicator color="#c9a84c" />
            <Text style={{ color:'#6a5a40', marginTop:8, fontSize:12 }}>Cargando videos...</Text>
          </View>
        ) : videos.map((v, i) => {
          const color = COLORS[i % COLORS.length];
          const url = `https://www.youtube.com/watch?v=${v.youtube_id}`;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.videoCard, { borderColor: color + '40' }]}
              onPress={() => Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir el video.'))}
              activeOpacity={0.85}
            >
              <View style={[styles.videoIconWrap, { backgroundColor: color + '15' }]}>
                <Text style={styles.videoIcon}>{v.emoji}</Text>
              </View>
              <View style={{ flex:1 }}>
                <View style={styles.videoTopRow}>
                  <Text style={[styles.videoTitulo, { color }]}>{v.titulo}</Text>
                  <View style={[styles.videoChip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                    <Text style={[styles.videoChipTxt, { color }]}>{v.duracion}</Text>
                  </View>
                </View>
                <Text style={styles.videoMomento}>{v.descripcion}</Text>
                <View style={styles.videoBtn}>
                  <Text style={styles.videoBtnTxt}>▶ Ver en YouTube</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Practicá al menos una meditación por día. La constancia transforma el cerebro y el cuerpo. 🧠✨</Text>
        </View>
        <View style={{ height:40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', padding:24, paddingTop:56 },
  backBtn: { marginBottom:12, paddingVertical:8, paddingHorizontal:10, borderRadius:10, backgroundColor:'rgba(0,0,0,0.25)', borderWidth:1, borderColor:'#2a2010', alignSelf:'flex-start' },
  backText: { color:'#c9a84c', fontWeight:'800', fontSize:12 },
  headerTitle: { fontSize:28, fontWeight:'700', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:13, color:'#6a5a40' },
  body: { padding:16 },
  fraseCard: { backgroundColor:'#13120f', borderRadius:18, padding:22, borderWidth:1, borderColor:'rgba(201,168,76,0.3)', marginBottom:20 },
  fraseLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', marginBottom:12 },
  fraseTexto: { fontSize:15, color:'#e8e0d0', lineHeight:26, fontStyle:'italic', marginBottom:10 },
  fraseAuthor: { fontSize:12, color:'#6a5a40' },
  sectionTitle: { fontSize:14, fontWeight:'700', color:'#8a7a60', marginBottom:12, letterSpacing:1 },
  card: { backgroundColor:'#13120f', borderRadius:18, borderWidth:1, borderColor:'#2a2010', marginBottom:12, overflow:'hidden' },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
  cardLeft: { flexDirection:'row', alignItems:'center', gap:12, flex:1 },
  cardIconWrap: { width:48, height:48, borderRadius:24, borderWidth:1, alignItems:'center', justifyContent:'center' },
  cardIcon: { fontSize:22 },
  cardTitulo: { fontSize:15, fontWeight:'900', marginBottom:4 },
  cardMeta: { flexDirection:'row', alignItems:'center', gap:6 },
  cardMetaText: { fontSize:11, color:'#6a5a40' },
  cardMetaDot: { color:'#4a3a20', fontSize:11 },
  cardArrow: { fontSize:12, fontWeight:'900' },
  cardBody: { padding:16, paddingTop:0, borderTopWidth:1, borderTopColor:'#1a1a14' },
  cardDesc: { fontSize:13, color:'#e8e0d0', lineHeight:22, marginBottom:16 },
  pasosTitle: { fontSize:12, fontWeight:'900', color:'#8a7a60', letterSpacing:1, marginBottom:10 },
  pasoRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  pasoNum: { width:24, height:24, borderRadius:12, borderWidth:1, alignItems:'center', justifyContent:'center', flexShrink:0 },
  pasoNumText: { fontSize:11, fontWeight:'900' },
  pasoText: { flex:1, fontSize:13, color:'#e8e0d0', lineHeight:20 },
  videoCard: { flexDirection:'row', backgroundColor:'#13120f', borderRadius:20, borderWidth:1.5, padding:16, marginBottom:12, gap:14, alignItems:'flex-start' },
  videoIconWrap: { width:52, height:52, borderRadius:14, alignItems:'center', justifyContent:'center', flexShrink:0 },
  videoIcon: { fontSize:26 },
  videoTopRow: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' },
  videoTitulo: { fontSize:14, fontWeight:'900', flex:1 },
  videoChip: { borderWidth:1, borderRadius:999, paddingHorizontal:8, paddingVertical:3 },
  videoChipTxt: { fontSize:10, fontWeight:'900' },
  videoMomento: { fontSize:11, color:'#c9a84c', fontWeight:'700', marginBottom:10 },
  videoBtn: { backgroundColor:'rgba(255,255,255,0.05)', borderRadius:8, paddingVertical:8, paddingHorizontal:12, alignSelf:'flex-start' },
  videoBtnTxt: { fontSize:11, fontWeight:'900', color:'#f0e6c8' },
  infoCard: { backgroundColor:'#13120f', borderRadius:14, padding:16, borderWidth:1, borderColor:'#2a2010', marginTop:4 },
  infoText: { fontSize:12, color:'#6a5a40', lineHeight:20, textAlign:'center' },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const MEDITACIONES = [
  { icon:'🌬️', titulo:'Respiración 4-7-8', duracion:'5 min', nivel:'Principiante', desc:'Inhalá 4 seg, retené 7, exhalá 8. Calma el sistema nervioso al instante.', pasos:['Sentate con la espalda recta y cerrá los ojos.','Exhalá completamente por la boca.','Inhalá por la nariz contando 4 segundos.','Retené el aire contando 7 segundos.','Exhalá lentamente por la boca contando 8 segundos.','Repetí 4 ciclos completos.'], color:'#4ade80' },
  { icon:'🌊', titulo:'Meditación de grounding', duracion:'10 min', nivel:'Intermedio', desc:'Conectá con el presente usando tus 5 sentidos. Ideal para la ansiedad.', pasos:['Pará lo que estás haciendo y respirá profundo.','Nombrá 5 cosas que podés VER a tu alrededor.','Nombrá 4 cosas que podés TOCAR.','Nombrá 3 cosas que podés ESCUCHAR.','Nombrá 2 cosas que podés OLER.','Nombrá 1 cosa que podés SABOREAR.'], color:'#60a5fa' },
  { icon:'🔥', titulo:'Meditación de intención', duracion:'7 min', nivel:'Principiante', desc:'Empezá el día con claridad. Definí quién sos hoy y qué vas a crear.', pasos:['Sentate en silencio y cerrá los ojos.','Respirá profundo 3 veces.','Preguntate: ¿Quién elijo ser hoy?','Visualizá cómo querés que sea tu día.','Repetite en voz baja tu intención del día.','Abrí los ojos y actuá desde ese lugar.'], color:'#f97316' },
  { icon:'🌙', titulo:'Relajación nocturna', duracion:'8 min', nivel:'Principiante', desc:'Soltá el día y preparate para un descanso profundo y reparador.', pasos:['Acostarte cómodamente y cerrá los ojos.','Tensá y relajá cada grupo muscular de pies a cabeza.','Respirá lento: 4 segundos adentro, 6 afuera.','Visualizá un lugar donde te sentís completamente segura.','Dejá ir cada pensamiento sin retenerlos.','Permití que el cuerpo se hunda en el descanso.'], color:'#a78bfa' },
  { icon:'💛', titulo:'Amor propio', duracion:'10 min', nivel:'Intermedio', desc:'Cultivá compasión y amor hacia vos misma. Transforma tu diálogo interno.', pasos:['Cerrá los ojos y llevá las manos al corazón.','Respirá suavemente y sentí el calor de tus manos.','Repetite: "Me acepto tal como soy en este momento."','Pensá en algo que te guste de vos misma.','Enviá amor a las partes que más te cuestan.','Terminá con 3 respiraciones de gratitud.'], color:'#f43f5e' },
];


const VIDEOS = [
  {
    icon: '🌬️',
    titulo: 'Wim Hof — Respiración 10 min',
    duracion: '10 min',
    momento: '🌅 Ideal para la mañana o antes de entrenar',
    desc: 'El método Wim Hof activa el sistema nervioso, aumenta la energía y fortalece el sistema inmune. Respiraciones profundas seguidas de retención. Sentirás un rush de energía inmediato.',
    color: '#4ade80',
    url: 'https://www.youtube.com/watch?v=hqJZR4d80Do',
  },
  {
    icon: '🌙',
    titulo: 'Weightless — Para dormir',
    duracion: '8 min',
    momento: '😴 Antes de dormir',
    desc: 'Weightless de Marconi Union fue diseñada científicamente para reducir la ansiedad un 65%. Combinada con respiración lenta, es la herramienta más potente para un sueño profundo.',
    color: '#a78bfa',
    url: 'https://www.youtube.com/watch?v=pEcNrr_iKJ8',
  },
  {
    icon: '⚡',
    titulo: 'Psychedelic — Activación matinal',
    duracion: '10 min',
    momento: '🌅 Al despertar, antes del café',
    desc: 'Meditación visual de alta energía para activar la mente y el cuerpo al inicio del día. Estimula la creatividad, el enfoque y la motivación desde los primeros minutos.',
    color: '#f97316',
    url: 'https://www.youtube.com/watch?v=QS98QyiShWQ',
  },
  {
    icon: '💛',
    titulo: 'Afirmaciones positivas',
    duracion: '15 min',
    momento: '🧠 Cualquier momento del día',
    desc: 'Reprogramá tu mente con afirmaciones poderosas. La repetición consciente transforma el diálogo interno y construye una identidad alineada con tus metas.',
    color: '#fbbf24',
    url: 'https://www.youtube.com/watch?v=6QdEv6U75ro',
  },
];

export default function MeditacionesScreen({ onBack }) {
  const [abierta, setAbierta] = useState(null);

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
          <Text style={styles.fraseTexto}>
            "La meditación no es escapar de la vida. Es aprender a estar en ella completamente."
          </Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        <Text style={styles.sectionTitle}>Prácticas guiadas</Text>

        {MEDITACIONES.map((m, i) => (
          <View key={i} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setAbierta(abierta === i ? null : i)}
              activeOpacity={0.85}
            >
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
                <TouchableOpacity style={[styles.startBtn, { backgroundColor: m.color }]} activeOpacity={0.85}
                  onPress={() => Alert.alert(`${m.icon} ${m.titulo}`, `Duracion: ${m.duracion}\n\nCerrá los ojos, respirá profundo y seguí los pasos con calma. ¡Éxito!`)}>
                  <Text style={styles.startBtnText}>Iniciar meditación →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}


        <Text style={styles.sectionTitle}>Videos guiados</Text>

        {VIDEOS.map((v, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.videoCard, { borderColor: v.color + '40' }]}
            onPress={() => Linking.openURL(v.url).catch(() => Alert.alert('Error', 'No se pudo abrir el video.'))}
            activeOpacity={0.85}
          >
            <View style={[styles.videoIconWrap, { backgroundColor: v.color + '15' }]}>
              <Text style={styles.videoIcon}>{v.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.videoTopRow}>
                <Text style={[styles.videoTitulo, { color: v.color }]}>{v.titulo}</Text>
                <View style={[styles.videoChip, { backgroundColor: v.color + '20', borderColor: v.color + '40' }]}>
                  <Text style={[styles.videoChipTxt, { color: v.color }]}>{v.duracion}</Text>
                </View>
              </View>
              <Text style={styles.videoMomento}>{v.momento}</Text>
              <Text style={styles.videoDesc}>{v.desc}</Text>
              <View style={styles.videoBtn}>
                <Text style={styles.videoBtnTxt}>▶ Ver en YouTube</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Practicá al menos una meditación por día. La constancia transforma el cerebro y el cuerpo. 🧠✨
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
  startBtn: { borderRadius:12, paddingVertical:14, alignItems:'center', marginTop:12 },
  startBtnText: { color:'#0a0a0c', fontWeight:'900', fontSize:14 },

  // ── Videos ──
  videoCard:     { flexDirection: 'row', backgroundColor: '#13120f', borderRadius: 20, borderWidth: 1.5, padding: 16, marginBottom: 12, gap: 14, alignItems: 'flex-start' },
  videoIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  videoIcon:     { fontSize: 26 },
  videoTopRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  videoTitulo:   { fontSize: 14, fontWeight: '900', flex: 1 },
  videoChip:     { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  videoChipTxt:  { fontSize: 10, fontWeight: '900' },
  videoMomento:  { fontSize: 11, color: '#c9a84c', fontWeight: '700', marginBottom: 6 },
  videoDesc:     { fontSize: 12, color: '#8a7a60', lineHeight: 18, marginBottom: 10 },
  videoBtn:      { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  videoBtnTxt:   { fontSize: 11, fontWeight: '900', color: '#f0e6c8' },
  infoCard: { backgroundColor:'#13120f', borderRadius:14, padding:16, borderWidth:1, borderColor:'#2a2010', marginTop:4 },
  infoText: { fontSize:12, color:'#6a5a40', lineHeight:20, textAlign:'center' },
});
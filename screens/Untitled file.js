import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const SEMANAS = [
  { nombre:'DESPERTAR', dias:[1,2,3,4,5,6,7],   color:'#a78bfa', desc:'Reconocé quién sos realmente' },
  { nombre:'SOLTAR',    dias:[8,9,10,11,12,13,14], color:'#60a5fa', desc:'Liberá lo que ya no te sirve' },
  { nombre:'CONSTRUIR', dias:[15,16,17,18,19,20,21], color:'#4ade80', desc:'Creá tu nueva versión' },
  { nombre:'EXPANDIR',  dias:[22,23,24,25,26,27,28,29,30], color:'#fbbf24', desc:'Viví desde el despertar' },
];

export default function DespertarDaysScreen({ startedAtISO, completedDays = [], onBack, onOpenDay }) {
  const diasCompletados = Array.isArray(completedDays) ? completedDays : [];

  function getDiaStatus(dia) {
    if (diasCompletados.includes(dia)) return 'completado';
    if (!startedAtISO) return dia === 1 ? 'disponible' : 'bloqueado';
    const elapsed = Math.floor((Date.now() - new Date(startedAtISO)) / 86400000);
    if (dia <= elapsed + 1) return 'disponible';
    return 'bloqueado';
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>El Despertar</Text>
        <Text style={styles.headerSub}>30 días · 4 semanas de transformación profunda</Text>
        <View style={styles.progressGlobal}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(diasCompletados.length / 30) * 100}%` }]} />
          </View>
          <Text style={styles.progressTxt}>{diasCompletados.length}/30 días completados</Text>
        </View>
      </View>

      <View style={styles.body}>
        {SEMANAS.map((semana, si) => (
          <View key={si} style={styles.semanaBlock}>
            <View style={[styles.semanaHeader, { borderColor: semana.color + '40', backgroundColor: semana.color + '10' }]}>
              <View>
                <Text style={[styles.semanaNombre, { color: semana.color }]}>SEMANA {si+1} — {semana.nombre}</Text>
                <Text style={styles.semanaDesc}>{semana.desc}</Text>
              </View>
              <Text style={[styles.semanaCount, { color: semana.color }]}>
                {semana.dias.filter(d => diasCompletados.includes(d)).length}/{semana.dias.length}
              </Text>
            </View>
            <View style={styles.diasGrid}>
              {semana.dias.map(dia => {
                const status = getDiaStatus(dia);
                return (
                  <TouchableOpacity
                    key={dia}
                    onPress={() => status !== 'bloqueado' && onOpenDay(dia, startedAtISO)}
                    activeOpacity={status === 'bloqueado' ? 1 : 0.85}
                    style={[
                      styles.diaBtn,
                      status === 'completado' && { backgroundColor: semana.color + '25', borderColor: semana.color },
                      status === 'disponible' && { borderColor: semana.color + '60' },
                      status === 'bloqueado' && { opacity:0.35 },
                    ]}
                  >
                    {status === 'completado'
                      ? <Text style={{ fontSize:18 }}>✅</Text>
                      : status === 'bloqueado'
                        ? <Text style={{ fontSize:16 }}>🔒</Text>
                        : <Text style={[styles.diaBtnNum, { color: semana.color }]}>{dia}</Text>
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height:40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', padding:24, paddingTop:56 },
  backBtn: { marginBottom:14, paddingVertical:8, paddingHorizontal:12, borderRadius:10, backgroundColor:'rgba(0,0,0,0.3)', borderWidth:1, borderColor:'#2a2010', alignSelf:'flex-start' },
  backText: { color:'#c9a84c', fontWeight:'900', fontSize:12 },
  headerTitle: { fontSize:28, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:13, color:'#6a5a40', marginBottom:16 },
  progressGlobal: {},
  progressBg: { backgroundColor:'#1e1e18', borderRadius:8, height:8, marginBottom:6 },
  progressFill: { backgroundColor:'#a78bfa', borderRadius:8, height:8, shadowColor:'#a78bfa', shadowOpacity:0.5, shadowRadius:4 },
  progressTxt: { fontSize:12, color:'#6a5a40' },
  body: { padding:16 },
  semanaBlock: { marginBottom:20 },
  semanaHeader: { borderRadius:14, borderWidth:1, padding:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  semanaNombre: { fontSize:11, fontWeight:'900', letterSpacing:1.5, marginBottom:3 },
  semanaDesc: { fontSize:12, color:'#6a5a40' },
  semanaCount: { fontSize:18, fontWeight:'900' },
  diasGrid: { flexDirection:'row', flexWrap:'wrap', gap:10 },
  diaBtn: { width:52, height:52, borderRadius:14, borderWidth:1.5, borderColor:'#2a2010', backgroundColor:'#13120f', alignItems:'center', justifyContent:'center' },
  diaBtnNum: { fontSize:16, fontWeight:'900' },
});
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function hoyKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function keyDia(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function diasDelMes(year, month) {
  return new Array(new Date(year, month+1, 0).getDate()).fill(null).map((_, i) => {
    return keyDia(new Date(year, month, i+1));
  });
}

function ultimosDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n-1-i));
    return keyDia(d);
  });
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_CORTOS = ['D','L','M','X','J','V','S'];

const LOGROS_DEF = [
  { id:'sueno_7',     emoji:'🌙', titulo:'Noche de Guerrero',    desc:'7 noches ≥7h seguidas',        categoria:'Sueño',    color:'#a78bfa', check:(d) => d.rachaSueno >= 7   },
  { id:'sueno_14',    emoji:'🌙', titulo:'El Restaurador',       desc:'14 noches ≥7h seguidas',       categoria:'Sueño',    color:'#a78bfa', check:(d) => d.rachaSueno >= 14  },
  { id:'sueno_30',    emoji:'🌙', titulo:'Maestro del Sueño',    desc:'30 noches ≥7h seguidas',       categoria:'Sueño',    color:'#a78bfa', check:(d) => d.rachaSueno >= 30  },
  { id:'habitos_7',   emoji:'⚡', titulo:'Semana de Fuego',      desc:'7 días de hábitos seguidos',   categoria:'Hábitos',  color:'#c9a84c', check:(d) => d.rachaHabitos >= 7  },
  { id:'habitos_14',  emoji:'⚡', titulo:'Imparable',            desc:'14 días de hábitos seguidos',  categoria:'Hábitos',  color:'#c9a84c', check:(d) => d.rachaHabitos >= 14 },
  { id:'habitos_30',  emoji:'⚡', titulo:'Identidad Forjada',    desc:'30 días de hábitos seguidos',  categoria:'Hábitos',  color:'#c9a84c', check:(d) => d.rachaHabitos >= 30 },
  { id:'ayuno_7',     emoji:'⏱️', titulo:'Mente Clara',          desc:'7 ayunos completados',         categoria:'Ayuno',    color:'#fb923c', check:(d) => d.totalAyunos >= 7   },
  { id:'ayuno_14',    emoji:'⏱️', titulo:'Cetosis Profunda',     desc:'14 ayunos completados',        categoria:'Ayuno',    color:'#fb923c', check:(d) => d.totalAyunos >= 14  },
  { id:'ayuno_30',    emoji:'⏱️', titulo:'El Ayunador',          desc:'30 ayunos completados',        categoria:'Ayuno',    color:'#fb923c', check:(d) => d.totalAyunos >= 30  },
  { id:'pasos_7',     emoji:'👣', titulo:'Caminador Keto',       desc:'7 días con ≥5.000 pasos',      categoria:'Pasos',    color:'#4ade80', check:(d) => d.rachapasos >= 7    },
  { id:'pasos_14',    emoji:'👣', titulo:'Máquina Andante',      desc:'14 días con ≥5.000 pasos',     categoria:'Pasos',    color:'#4ade80', check:(d) => d.rachapasos >= 14   },
  { id:'pasos_30',    emoji:'👣', titulo:'Atleta Keto Élite',    desc:'30 días con ≥5.000 pasos',     categoria:'Pasos',    color:'#4ade80', check:(d) => d.rachapasos >= 30   },
  { id:'triple_7',    emoji:'🔱', titulo:'Triple Protocolo',     desc:'7 días: sueño+hábitos+ayuno',  categoria:'Combo',    color:'#60a5fa', check:(d) => d.rachaTriple >= 7   },
  { id:'triple_14',   emoji:'🔱', titulo:'El Completo',          desc:'14 días triple protocolo',     categoria:'Combo',    color:'#60a5fa', check:(d) => d.rachaTriple >= 14  },
  { id:'cuadruple_7', emoji:'💎', titulo:'Modo Legendario',      desc:'7 días score 4/4 perfecto',    categoria:'Combo',    color:'#e879f9', check:(d) => d.rachaCuadruple >= 7 },
  { id:'programa_30', emoji:'🏆', titulo:'El Mes Completo',      desc:'30 días del programa',         categoria:'Programa', color:'#fbbf24', check:(d) => d.diasPrograma >= 30  },
];

function calcularScore(suenoData, habitosData, ayunoData, pasosData, key) {
  let score = 0;
  if (suenoData[key]?.horas >= 7)           score++;
  if ((habitosData[key]?.percent || 0) > 0) score++;
  if (ayunoData[key])                        score++;
  if ((pasosData[key] || 0) >= 5000)         score++;
  return score;
}


const { width: SW } = Dimensions.get('window');

// ─── Gráfico barras 30 días ───────────────────────────────────
function GraficoRacha({ suenoData, habitosData, ayunoData, pasosData }) {
  const dias = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return keyDia(d);
  });

  const BAR_W  = Math.floor((SW - 64) / 30);
  const MAX_H  = 80;

  return (
    <View style={graficoStyles.card}>
      <Text style={graficoStyles.titulo}>📊 ÚLTIMOS 30 DÍAS</Text>
      <Text style={graficoStyles.subtitulo}>Score diario — altura = pilares completados</Text>

      {/* Líneas de referencia */}
      <View style={graficoStyles.chartWrap}>
        {[4,3,2,1].map(n => (
          <View key={n} style={[graficoStyles.refLine, { bottom: (n / 4) * MAX_H }]}>
            <Text style={graficoStyles.refLabel}>{n}</Text>
          </View>
        ))}

        {/* Barras */}
        <View style={graficoStyles.barsRow}>
          {dias.map((k, i) => {
            const score  = calcularScore(suenoData, habitosData, ayunoData, pasosData, k);
            const esHoy  = k === hoyKey();
            const color  = score === 4 ? '#e879f9'
                         : score === 3 ? '#a78bfa'
                         : score === 2 ? '#4ade80'
                         : score === 1 ? '#c9a84c'
                         : '#1e1e18';
            const altura = score > 0 ? Math.max(6, (score / 4) * MAX_H) : 4;
            const fecha  = new Date(k.replace(/-/g, '/'));
            const esDom  = fecha.getDay() === 0;

            return (
              <View key={i} style={[graficoStyles.barWrap, { width: BAR_W }]}>
                <View style={[
                  graficoStyles.bar,
                  {
                    height: altura,
                    backgroundColor: color,
                    width: Math.max(BAR_W - 2, 2),
                    shadowColor: score > 0 ? color : 'transparent',
                    shadowOpacity: score > 0 ? 0.6 : 0,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 0 },
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  },
                  esHoy && { borderWidth: 1, borderColor: '#fff', borderBottomWidth: 0 },
                ]} />
                {esDom && <View style={graficoStyles.domMark} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* Leyenda inferior */}
      <View style={graficoStyles.leyendaRow}>
        {[
          { color:'#e879f9', label:'4 💎' },
          { color:'#a78bfa', label:'3 🔱' },
          { color:'#4ade80', label:'2 ✅' },
          { color:'#c9a84c', label:'1 ⚡' },
        ].map((l, i) => (
          <View key={i} style={graficoStyles.leyendaItem}>
            <View style={[graficoStyles.leyendaDot, { backgroundColor: l.color }]} />
            <Text style={graficoStyles.leyendaTxt}>{l.label}</Text>
          </View>
        ))}
        <Text style={graficoStyles.hoyLabel}>▏= hoy</Text>
      </View>

      {/* Stats rápidos del gráfico */}
      {(() => {
        const scores = dias.map(k => calcularScore(suenoData, habitosData, ayunoData, pasosData, k));
        const activos = scores.filter(s => s > 0).length;
        const perfectos = scores.filter(s => s === 4).length;
        const promedio = activos > 0 ? (scores.reduce((a,b) => a+b, 0) / 30).toFixed(1) : '0.0';
        return (
          <View style={graficoStyles.statsRow}>
            <View style={graficoStyles.statItem}>
              <Text style={[graficoStyles.statNum, { color: '#c9a84c' }]}>{activos}</Text>
              <Text style={graficoStyles.statLabel}>días activos</Text>
            </View>
            <View style={graficoStyles.statDivider} />
            <View style={graficoStyles.statItem}>
              <Text style={[graficoStyles.statNum, { color: '#e879f9' }]}>{perfectos}</Text>
              <Text style={graficoStyles.statLabel}>días 💎</Text>
            </View>
            <View style={graficoStyles.statDivider} />
            <View style={graficoStyles.statItem}>
              <Text style={[graficoStyles.statNum, { color: '#a78bfa' }]}>{promedio}</Text>
              <Text style={graficoStyles.statLabel}>promedio</Text>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const graficoStyles = StyleSheet.create({
  card:        { backgroundColor: '#13120f', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', padding: 18, marginBottom: 14 },
  titulo:      { fontSize: 10, color: '#c9a84c', fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  subtitulo:   { fontSize: 11, color: '#4a3a20', marginBottom: 16 },
  chartWrap:   { height: 100, position: 'relative', marginBottom: 8 },
  refLine:     { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  refLabel:    { fontSize: 8, color: '#2a2010', fontWeight: '700', width: 8, marginRight: 2 },
  barsRow:     { position: 'absolute', bottom: 0, left: 10, right: 0, flexDirection: 'row', alignItems: 'flex-end', height: 80 },
  barWrap:     { alignItems: 'center', justifyContent: 'flex-end', height: 80 },
  bar:         { minHeight: 4 },
  domMark:     { width: 2, height: 2, borderRadius: 1, backgroundColor: '#4a3a20', marginTop: 2 },
  leyendaRow:  { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyendaDot:  { width: 8, height: 8, borderRadius: 2 },
  leyendaTxt:  { fontSize: 10, color: '#6a5a40' },
  hoyLabel:    { fontSize: 10, color: '#4a3a20', marginLeft: 'auto' },
  statsRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: '#0a0a0c', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2a2010' },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel:   { fontSize: 10, color: '#4a3a20', fontWeight: '700' },
  statDivider: { width: 1, height: 30, backgroundColor: '#2a2010' },
});

export default function StatsScreen({ member, umbralCompletedDays = [], despertarCompletedDays = [], selectedProgram, onBack }) {
  const memberKey = member?.phone || member?.id || 'guest';
  const [suenoData,   setSuenoData]   = useState({});
  const [habitosData, setHabitosData] = useState({});
  const [ayunoData,   setAyunoData]   = useState({});
  const [pasosData,   setPasosData]   = useState({});
  const [loading,     setLoading]     = useState(true);
  const [mesOffset,   setMesOffset]   = useState(0);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const [s, h, a, p] = await Promise.all([
        AsyncStorage.getItem(`sueno_${memberKey}`),
        AsyncStorage.getItem(`progress_${memberKey}`),
        AsyncStorage.getItem(`ayuno_historial_${memberKey}`),
        AsyncStorage.getItem(`pasos_${memberKey}`),
      ]);
      setSuenoData(s ? JSON.parse(s) : {});
      setHabitosData(h ? JSON.parse(h) : {});
      setAyunoData(a ? JSON.parse(a) : {});
      setPasosData(p ? JSON.parse(p) : {});
    } catch(e) {}
    setLoading(false);
  }

  // Mes
  const hoy = new Date();
  const mesDate = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
  const mesActual = mesDate.getMonth();
  const anioActual = mesDate.getFullYear();
  const diasMes = diasDelMes(anioActual, mesActual);
  const primerDia = new Date(anioActual, mesActual, 1).getDay();

  // Rachas
  let rachaSueno = 0, rachaHabitos = 0, rachaTriple = 0, rachapasos = 0, rachaCuadruple = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = keyDia(d);
    const s = suenoData[k]?.horas >= 7;
    const h = (habitosData[k]?.percent || 0) > 0;
    const a = !!ayunoData[k];
    const p = (pasosData[k] || 0) >= 5000;
    if (s && rachaSueno === i)           rachaSueno = i + 1;
    if (h && rachaHabitos === i)         rachaHabitos = i + 1;
    if (p && rachapasos === i)           rachapasos = i + 1;
    if (s && h && a && rachaTriple === i) rachaTriple = i + 1;
    if (s && h && a && p && rachaCuadruple === i) rachaCuadruple = i + 1;
  }

  const totalAyunos   = Object.keys(ayunoData).length;
  const diasPrograma  = selectedProgram === 'umbral' ? umbralCompletedDays.length : despertarCompletedDays.length;
  const datosLogros   = { rachaSueno, rachaHabitos, rachaTriple, rachapasos, rachaCuadruple, totalAyunos, diasPrograma };
  const logrosDesbloqueados = LOGROS_DEF.filter(l => l.check(datosLogros));
  const scoreHoy = calcularScore(suenoData, habitosData, ayunoData, pasosData, hoyKey());

  // Totales del mes
  let diasConSueno = 0, diasConHabitos = 0, diasConAyuno = 0, diasConPasos = 0, diasTriple = 0, diasPerfectos = 0;
  diasMes.forEach(k => {
    const s = suenoData[k]?.horas >= 7;
    const h = (habitosData[k]?.percent || 0) > 0;
    const a = !!ayunoData[k];
    const p = (pasosData[k] || 0) >= 5000;
    if (s) diasConSueno++;
    if (h) diasConHabitos++;
    if (a) diasConAyuno++;
    if (p) diasConPasos++;
    if (s && h && a) diasTriple++;
    if (s && h && a && p) diasPerfectos++;
  });

  function colorDia(key) {
    const score = calcularScore(suenoData, habitosData, ayunoData, pasosData, key);
    if (score === 4) return '#e879f9'; // 💎 legendario
    if (score === 3) return '#a78bfa';
    if (score === 2) return '#4ade80';
    if (score === 1) return '#c9a84c';
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingTxt}>Cargando tu progreso...</Text>
      </View>
    );
  }

  const scoreColor = scoreHoy === 4 ? '#e879f9' : scoreHoy === 3 ? '#a78bfa' : scoreHoy === 2 ? '#4ade80' : scoreHoy === 1 ? '#c9a84c' : '#2a2010';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · MÉTRICAS</Text>
        <Text style={styles.headerTitulo}>Mi Dashboard</Text>
        <Text style={styles.headerSub}>Sueño · Hábitos · Ayuno · Pasos · Logros</Text>
      </View>

      <View style={styles.body}>

        {/* SCORE HOY */}
        <View style={[styles.scoreCard, { borderColor: scoreColor + '50' }]}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>📅 HOY</Text>
            <Text style={styles.scoreFecha}>
              {new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
            </Text>
            <View style={styles.scorePuntos}>
              {[0,1,2,3].map(i => (
                <View key={i} style={[styles.scorePunto, { backgroundColor: i < scoreHoy ? scoreColor : '#2a2010' }]} />
              ))}
            </View>
            <Text style={styles.scoreTxt}>
              {scoreHoy === 4 ? '💎 Día Legendario' : scoreHoy === 3 ? '🔱 Día Perfecto' : scoreHoy === 2 ? '✅ Buen día' : scoreHoy === 1 ? '⚡ Empezaste' : '⭕ Sin registros aún'}
            </Text>
          </View>
          <View style={styles.scoreRight}>
            <View style={styles.scorePilares}>
              {[
                { emoji:'🌙', label:'Sueño',   ok: suenoData[hoyKey()]?.horas >= 7 },
                { emoji:'⚡', label:'Hábitos', ok: (habitosData[hoyKey()]?.percent || 0) > 0 },
                { emoji:'⏱️', label:'Ayuno',   ok: !!ayunoData[hoyKey()] },
                { emoji:'👣', label:'Pasos',   ok: (pasosData[hoyKey()] || 0) >= 5000 },
              ].map((p, i) => (
                <View key={i} style={[styles.scorePilar, p.ok && { borderColor:'rgba(201,168,76,0.3)', backgroundColor:'rgba(201,168,76,0.06)' }]}>
                  <Text style={styles.scorePilarEmoji}>{p.emoji}</Text>
                  <Text style={[styles.scorePilarLabel, p.ok && { color:'#f0e6c8' }]}>{p.label}</Text>
                  <Text style={[styles.scorePilarCheck, { color: p.ok ? '#c9a84c' : '#2a2010' }]}>{p.ok ? '✓' : '·'}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* RACHAS */}
        <View style={styles.rachasRow}>
          {[
            { emoji:'🌙', label:'Sueño',    val: rachaSueno,      color:'#a78bfa' },
            { emoji:'⚡', label:'Hábitos',  val: rachaHabitos,    color:'#c9a84c' },
            { emoji:'⏱️', label:'Ayuno',    val: totalAyunos,     color:'#fb923c' },
            { emoji:'👣', label:'Pasos',    val: rachapasos,      color:'#4ade80' },
            { emoji:'💎', label:'Legendario',val: rachaCuadruple, color:'#e879f9' },
          ].map((r, i) => (
            <View key={i} style={[styles.rachaItem, { borderColor: r.color + '30' }]}>
              <Text style={styles.rachaEmoji}>{r.emoji}</Text>
              <Text style={[styles.rachaNum, { color: r.val > 0 ? r.color : '#2a2010' }]}>{r.val}</Text>
              <Text style={styles.rachaLabel}>{r.label}</Text>
            </View>
          ))}
        </View>

        {/* CALENDARIO */}
        <View style={styles.calendarioCard}>
          <View style={styles.calendarioNav}>
            <TouchableOpacity onPress={() => setMesOffset(mesOffset - 1)} style={styles.navBtn} activeOpacity={0.8}>
              <Text style={styles.navBtnTxt}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarioTitulo}>{MESES[mesActual]} {anioActual}</Text>
            <TouchableOpacity
              onPress={() => mesOffset < 0 && setMesOffset(mesOffset + 1)}
              style={[styles.navBtn, mesOffset >= 0 && { opacity: 0.3 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.navBtnTxt}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calDiasHeader}>
            {DIAS_CORTOS.map(d => (
              <Text key={d} style={styles.calDiaHeader}>{d}</Text>
            ))}
          </View>

          <View style={styles.calGrid}>
            {Array.from({ length: primerDia }, (_, i) => (
              <View key={`e${i}`} style={styles.calDia} />
            ))}
            {diasMes.map((key, i) => {
              const color = colorDia(key);
              const esHoy = key === hoyKey();
              return (
                <View key={key} style={[styles.calDia, esHoy && styles.calDiaHoy]}>
                  <Text style={[styles.calDiaTxt, esHoy && { color:'#f0e6c8', fontWeight:'900' }]}>{i+1}</Text>
                  {color && <View style={[styles.calDiaDot, { backgroundColor: color }]} />}
                </View>
              );
            })}
          </View>

          <View style={styles.calLeyenda}>
            {[
              { color:'#e879f9', label:'4/4 💎' },
              { color:'#a78bfa', label:'3/4 🔱' },
              { color:'#4ade80', label:'2/4 ✅' },
              { color:'#c9a84c', label:'1/4 ⚡' },
            ].map((l, i) => (
              <View key={i} style={styles.calLeyendaItem}>
                <View style={[styles.calLeyendaDot, { backgroundColor: l.color }]} />
                <Text style={styles.calLeyendaTxt}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TOTALES DEL MES */}
        <View style={styles.totalesCard}>
          <Text style={styles.seccionLabel}>📈 TOTALES DE {MESES[mesActual].toUpperCase()}</Text>
          <View style={styles.totalesGrid}>
            {[
              { emoji:'🌙', label:'Noches ≥7h',   val: diasConSueno,   color:'#a78bfa' },
              { emoji:'⚡', label:'Días hábitos',  val: diasConHabitos, color:'#c9a84c' },
              { emoji:'⏱️', label:'Días ayuno',    val: diasConAyuno,   color:'#fb923c' },
              { emoji:'👣', label:'Días ≥5k pasos',val: diasConPasos,   color:'#4ade80' },
              { emoji:'🔱', label:'Triple combo',  val: diasTriple,     color:'#60a5fa' },
              { emoji:'💎', label:'Días perfectos',val: diasPerfectos,  color:'#e879f9' },
            ].map((t, i) => {
              const pct = diasMes.length > 0 ? Math.round((t.val / diasMes.length) * 100) : 0;
              return (
                <View key={i} style={[styles.totalItem, { borderColor: t.color + '25' }]}>
                  <Text style={styles.totalEmoji}>{t.emoji}</Text>
                  <Text style={[styles.totalValor, { color: t.val > 0 ? t.color : '#2a2010' }]}>{t.val}</Text>
                  <Text style={styles.totalDe}>/{diasMes.length}</Text>
                  <View style={styles.totalBarraWrap}>
                    <View style={[styles.totalBarra, { width:`${pct}%`, backgroundColor: t.color }]} />
                  </View>
                  <Text style={[styles.totalPct, { color: t.color }]}>{pct}%</Text>
                  <Text style={styles.totalLabel}>{t.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* BARRAS SEMANALES */}
        <View style={styles.semanalCard}>
          <Text style={styles.seccionLabel}>📊 ÚLTIMOS 7 DÍAS</Text>
          {ultimosDias(7).map((k, i) => {
            const score = calcularScore(suenoData, habitosData, ayunoData, pasosData, k);
            const fecha = new Date(k.replace(/-/g, '/'));
            const esHoy = k === hoyKey();
            const sColor = score === 4 ? '#e879f9' : score === 3 ? '#a78bfa' : score >= 1 ? '#c9a84c' : '#2a2010';
            return (
              <View key={i} style={styles.semanalRow}>
                <Text style={[styles.semanalDia, esHoy && { color:'#f0e6c8', fontWeight:'900' }]}>
                  {DIAS_CORTOS[fecha.getDay()]} {fecha.getDate()}
                </Text>
                <View style={styles.semanalBarras}>
                  {[
                    { ok: suenoData[k]?.horas >= 7,                color:'#a78bfa' },
                    { ok: (habitosData[k]?.percent || 0) > 0,      color:'#c9a84c' },
                    { ok: !!ayunoData[k],                           color:'#fb923c' },
                    { ok: (pasosData[k] || 0) >= 5000,             color:'#4ade80' },
                  ].map((b, j) => (
                    <View key={j} style={[styles.semanalBarra, { backgroundColor: b.ok ? b.color : '#1e1e18' }]} />
                  ))}
                </View>
                <View style={[styles.semanalScore, {
                  backgroundColor: score > 0 ? sColor + '18' : 'transparent',
                  borderColor: score > 0 ? sColor + '50' : '#2a2010',
                }]}>
                  <Text style={[styles.semanalScoreTxt, { color: sColor }]}>{score}/4</Text>
                </View>
              </View>
            );
          })}
          <View style={styles.semanalLeyenda}>
            {[
              { color:'#a78bfa', l:'🌙' },
              { color:'#c9a84c', l:'⚡' },
              { color:'#fb923c', l:'⏱️' },
              { color:'#4ade80', l:'👣' },
            ].map((x, i) => (
              <View key={i} style={styles.semanalLeyendaItem}>
                <View style={[styles.semanalLeyendaDot, { backgroundColor: x.color }]} />
                <Text style={styles.semanalLeyendaTxt}>{x.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GRÁFICO 30 DÍAS */}
        <GraficoRacha
          suenoData={suenoData}
          habitosData={habitosData}
          ayunoData={ayunoData}
          pasosData={pasosData}
        />

        {/* LOGROS */}
        <View style={styles.logrosCard}>
          <Text style={styles.seccionLabel}>🏆 LOGROS — {logrosDesbloqueados.length}/{LOGROS_DEF.length}</Text>
          <View style={styles.logrosPBg}>
            <View style={[styles.logrosPFill, { width:`${(logrosDesbloqueados.length / LOGROS_DEF.length) * 100}%` }]} />
          </View>
          <Text style={styles.logrosPTxt}>{logrosDesbloqueados.length} de {LOGROS_DEF.length} desbloqueados</Text>

          {['Sueño','Hábitos','Ayuno','Pasos','Combo','Programa'].map(cat => {
            const logros = LOGROS_DEF.filter(l => l.categoria === cat);
            if (!logros.length) return null;
            const catColor = logros[0]?.color || '#c9a84c';
            return (
              <View key={cat} style={styles.logrosCat}>
                <Text style={[styles.logrosCatTitulo, { color: catColor }]}>{cat}</Text>
                <View style={styles.logrosGrid}>
                  {logros.map(l => {
                    const desbloqueado = l.check(datosLogros);
                    return (
                      <View key={l.id} style={[styles.logroBadge,
                        desbloqueado
                          ? { borderColor: l.color + '60', backgroundColor: l.color + '12' }
                          : { borderColor:'#2a2010', backgroundColor:'#0a0a0c', opacity:0.5 }
                      ]}>
                        <Text style={[styles.logroEmoji, !desbloqueado && { opacity:0.3 }]}>
                          {desbloqueado ? l.emoji : '🔒'}
                        </Text>
                        <Text style={[styles.logroTitulo, { color: desbloqueado ? l.color : '#3a2a10' }]}>
                          {l.titulo}
                        </Text>
                        <Text style={styles.logroDesc}>{l.desc}</Text>
                        {desbloqueado && (
                          <View style={[styles.logroCheck, { backgroundColor: l.color }]}>
                            <Text style={styles.logroCheckTxt}>✓</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  loadingWrap: { flex: 1, backgroundColor: '#0a0a0c', alignItems:'center', justifyContent:'center' },
  loadingTxt: { color: '#4a3a20', fontSize: 14 },

  header: {
    backgroundColor: '#130f0a', padding: 24, paddingTop: 56,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)',
  },
  backBtn: {
    alignSelf:'flex-start', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10, backgroundColor:'rgba(201,168,76,0.08)',
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)', marginBottom: 20,
  },
  backTxt: { color:'#c9a84c', fontWeight:'900', fontSize: 12 },
  headerSobre: { fontSize: 10, color:'#3a2a10', fontWeight:'900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo: { fontSize: 38, fontWeight:'900', color:'#c9a84c', marginBottom: 6 },
  headerSub: { fontSize: 13, color:'#6a5a40' },

  body: { padding: 16 },
  seccionLabel: { fontSize: 10, color:'#c9a84c', fontWeight:'900', letterSpacing: 2, marginBottom: 14 },

  scoreCard: {
    backgroundColor:'#13120f', borderRadius: 20, borderWidth: 1.5,
    padding: 18, flexDirection:'row', gap: 14, marginBottom: 14,
  },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 10, color:'#6a5a40', fontWeight:'900', letterSpacing: 2, marginBottom: 4 },
  scoreFecha: { fontSize: 12, color:'#8a7a60', marginBottom: 12, textTransform:'capitalize' },
  scorePuntos: { flexDirection:'row', gap: 6, marginBottom: 10 },
  scorePunto: { width: 14, height: 14, borderRadius: 7 },
  scoreTxt: { fontSize: 13, color:'#f0e6c8', fontWeight:'700' },
  scoreRight: { justifyContent:'center' },
  scorePilares: { gap: 6 },
  scorePilar: {
    flexDirection:'row', alignItems:'center', gap: 8,
    backgroundColor:'#0a0a0c', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor:'#2a2010',
  },
  scorePilarEmoji: { fontSize: 13 },
  scorePilarLabel: { fontSize: 11, color:'#4a3a20', fontWeight:'700', flex: 1 },
  scorePilarCheck: { fontSize: 13, fontWeight:'900' },

  rachasRow: { flexDirection:'row', gap: 6, marginBottom: 14 },
  rachaItem: {
    flex: 1, backgroundColor:'#13120f', borderRadius: 12,
    borderWidth: 1.5, padding: 10, alignItems:'center', gap: 3,
  },
  rachaEmoji: { fontSize: 16 },
  rachaNum: { fontSize: 18, fontWeight:'900' },
  rachaLabel: { fontSize: 8, color:'#4a3a20', fontWeight:'700', letterSpacing: 0.3, textAlign:'center' },

  calendarioCard: {
    backgroundColor:'#13120f', borderRadius: 20,
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)',
    padding: 18, marginBottom: 14,
  },
  calendarioNav: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 16 },
  calendarioTitulo: { fontSize: 16, fontWeight:'900', color:'#f0e6c8' },
  navBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor:'rgba(201,168,76,0.1)', alignItems:'center', justifyContent:'center',
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)',
  },
  navBtnTxt: { fontSize: 18, color:'#c9a84c', fontWeight:'900' },
  calDiasHeader: { flexDirection:'row', marginBottom: 8 },
  calDiaHeader: { flex: 1, textAlign:'center', fontSize: 10, color:'#4a3a20', fontWeight:'900' },
  calGrid: { flexDirection:'row', flexWrap:'wrap' },
  calDia: { width:`${100/7}%`, aspectRatio: 1, alignItems:'center', justifyContent:'center', paddingVertical: 2 },
  calDiaHoy: { backgroundColor:'rgba(201,168,76,0.1)', borderRadius: 8, borderWidth: 1, borderColor:'rgba(201,168,76,0.3)' },
  calDiaTxt: { fontSize: 11, color:'#6a5a40', fontWeight:'600' },
  calDiaDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  calLeyenda: { flexDirection:'row', gap: 10, marginTop: 12, flexWrap:'wrap' },
  calLeyendaItem: { flexDirection:'row', alignItems:'center', gap: 5 },
  calLeyendaDot: { width: 8, height: 8, borderRadius: 4 },
  calLeyendaTxt: { fontSize: 10, color:'#6a5a40' },

  totalesCard: {
    backgroundColor:'#13120f', borderRadius: 20,
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)',
    padding: 18, marginBottom: 14,
  },
  totalesGrid: { flexDirection:'row', flexWrap:'wrap', gap: 10 },
  totalItem: {
    width:'47%', backgroundColor:'#0a0a0c',
    borderRadius: 16, borderWidth: 1.5,
    padding: 14, alignItems:'center', gap: 3,
  },
  totalEmoji: { fontSize: 20, marginBottom: 4 },
  totalValor: { fontSize: 28, fontWeight:'900', lineHeight: 32 },
  totalDe: { fontSize: 11, color:'#4a3a20' },
  totalBarraWrap: { width:'100%', height: 5, backgroundColor:'#1e1e18', borderRadius: 3, overflow:'hidden', marginVertical: 6 },
  totalBarra: { height:'100%', borderRadius: 3 },
  totalPct: { fontSize: 12, fontWeight:'900' },
  totalLabel: { fontSize: 10, color:'#4a3a20', textAlign:'center' },

  semanalCard: {
    backgroundColor:'#13120f', borderRadius: 20,
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)',
    padding: 18, marginBottom: 14,
  },
  semanalRow: { flexDirection:'row', alignItems:'center', gap: 12, marginBottom: 10 },
  semanalDia: { width: 32, fontSize: 11, color:'#6a5a40', fontWeight:'700' },
  semanalBarras: { flex: 1, flexDirection:'row', gap: 4 },
  semanalBarra: { flex: 1, height: 12, borderRadius: 4 },
  semanalScore: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  semanalScoreTxt: { fontSize: 11, fontWeight:'900' },
  semanalLeyenda: { flexDirection:'row', gap: 16, marginTop: 8 },
  semanalLeyendaItem: { flexDirection:'row', alignItems:'center', gap: 5 },
  semanalLeyendaDot: { width: 10, height: 10, borderRadius: 3 },
  semanalLeyendaTxt: { fontSize: 11, color:'#6a5a40' },

  logrosCard: {
    backgroundColor:'#13120f', borderRadius: 20,
    borderWidth: 1, borderColor:'rgba(201,168,76,0.2)',
    padding: 18,
  },
  logrosPBg: { backgroundColor:'#1e1e18', borderRadius: 6, height: 8, marginBottom: 6 },
  logrosPFill: { backgroundColor:'#c9a84c', height: 8, borderRadius: 6 },
  logrosPTxt: { fontSize: 11, color:'#6a5a40', marginBottom: 16 },
  logrosCat: { marginBottom: 16 },
  logrosCatTitulo: { fontSize: 11, fontWeight:'900', letterSpacing: 2, marginBottom: 10 },
  logrosGrid: { flexDirection:'row', flexWrap:'wrap', gap: 8 },
  logroBadge: {
    width:'31%', borderRadius: 14, borderWidth: 1.5,
    padding: 12, alignItems:'center', gap: 4, position:'relative',
  },
  logroEmoji: { fontSize: 24, marginBottom: 4 },
  logroTitulo: { fontSize: 11, fontWeight:'900', textAlign:'center', lineHeight: 14 },
  logroDesc: { fontSize: 9, color:'#4a3a20', textAlign:'center', lineHeight: 12 },
  logroCheck: {
    position:'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    alignItems:'center', justifyContent:'center',
  },
  logroCheckTxt: { fontSize: 10, color:'#0a0a0c', fontWeight:'900' },
});
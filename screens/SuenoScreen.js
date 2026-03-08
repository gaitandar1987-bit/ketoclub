import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sumarXP } from '../xp';

const HORA_META = 7;
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function horasEntre(dormir, despertar) {
  if (!dormir || !despertar) return 0;
  let [dh, dm] = dormir.split(':').map(Number);
  let [wh, wm] = despertar.split(':').map(Number);
  let minutos = (wh * 60 + wm) - (dh * 60 + dm);
  if (minutos < 0) minutos += 24 * 60;
  return Math.round((minutos / 60) * 10) / 10;
}

function hoyKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ultimosDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  });
}

const HORAS_DORMIR = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const HORAS_DESPERTAR = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export default function SuenoScreen({ member, onBack }) {
  const memberKey = member?.phone || member?.id || 'guest';
  const [registros, setRegistros] = useState({});
  const [dormir, setDormir] = useState('22:00');
  const [despertar, setDespertar] = useState('06:00');
  const [guardado, setGuardado] = useState(false);
  const [pickerActivo, setPickerActivo] = useState(null); // 'dormir' | 'despertar' | null

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const raw = await AsyncStorage.getItem(`sueno_${memberKey}`);
      if (raw) {
        const data = JSON.parse(raw);
        setRegistros(data);
        const hoy = data[hoyKey()];
        if (hoy) {
          setDormir(hoy.dormir);
          setDespertar(hoy.despertar);
          setGuardado(true);
        }
      }
    } catch (e) {}
  }

  async function guardar() {
    try {
      const horas = horasEntre(dormir, despertar);
      if (horas < 1 || horas > 16) {
        Alert.alert('Revisá los horarios', 'Las horas parecen incorrectas. Verificá que despertar sea después de dormir.');
        return;
      }
      const yaTeniaDatos = !!registros[hoyKey()];
      const nuevo = { ...registros, [hoyKey()]: { dormir, despertar, horas } };
      await AsyncStorage.setItem(`sueno_${memberKey}`, JSON.stringify(nuevo));
      setRegistros(nuevo);
      setGuardado(true);
      // XP: solo sumar si es el primer registro del día y cumple meta
      if (!yaTeniaDatos && horas >= HORA_META) {
        await sumarXP(memberKey, 'sueno_7h', `Sueño ${horas}h`);
      }
      Alert.alert('✅ Registrado', `Dormiste ${horas}h esta noche. ${horas >= HORA_META ? '¡Excelente recuperación! 🌙 +20 XP' : 'Intentá llegar a las 7h mañana 💪'}`);
    } catch (e) {}
  }

  // Stats
  const dias7 = ultimosDias(7);
  const registros7 = dias7.map(k => registros[k] || null);
  const horasTotales = registros7.filter(Boolean).map(r => r.horas);
  const promedio = horasTotales.length
    ? Math.round((horasTotales.reduce((a, b) => a + b, 0) / horasTotales.length) * 10) / 10
    : 0;

  // Racha
  let racha = 0;
  const todasLasKeys = Object.keys(registros).sort().reverse();
  for (let k of todasLasKeys) {
    if (registros[k]?.horas >= HORA_META) racha++;
    else break;
  }

  const horasHoy = registros[hoyKey()]?.horas || 0;
  const maxHoras = Math.max(...registros7.map(r => r?.horas || 0), HORA_META);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · RECUPERACIÓN</Text>
        <Text style={styles.headerTitulo}>Sueño</Text>
        <Text style={styles.headerSub}>El descanso es parte del protocolo</Text>
      </View>

      <View style={styles.body}>

        {/* STATS ARRIBA */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{horasHoy > 0 ? `${horasHoy}h` : '—'}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{promedio > 0 ? `${promedio}h` : '—'}</Text>
            <Text style={styles.statLabel}>Promedio 7d</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: racha > 0 ? '#a78bfa' : '#4a3a20' }]}>
              {racha > 0 ? `${racha}🔥` : '0'}
            </Text>
            <Text style={styles.statLabel}>Racha ≥7h</Text>
          </View>
        </View>

        {/* GRÁFICO SEMANAL */}
        <View style={styles.graficoCard}>
          <Text style={styles.seccionLabel}>📊 ESTA SEMANA</Text>
          <View style={styles.grafico}>
            {dias7.map((k, i) => {
              const reg = registros[k];
              const h = reg?.horas || 0;
              const porcentaje = maxHoras > 0 ? h / maxHoras : 0;
              const esMeta = h >= HORA_META;
              const esHoy = k === hoyKey();
              return (
                <View key={i} style={styles.barraCol}>
                  <Text style={styles.barraHoras}>{h > 0 ? `${h}h` : ''}</Text>
                  <View style={styles.barraWrap}>
                    <View style={[
                      styles.barra,
                      {
                        height: Math.max(porcentaje * 80, h > 0 ? 8 : 0),
                        backgroundColor: esMeta ? '#a78bfa' : h > 0 ? '#c9a84c' : '#2a2010',
                      }
                    ]} />
                  </View>
                  <View style={[styles.metaLinea, { bottom: (HORA_META / maxHoras) * 80 }]} />
                  <Text style={[styles.barraDia, esHoy && { color: '#a78bfa', fontWeight: '900' }]}>
                    {DIAS_SEMANA[new Date(k.replace(/-/g, '/')).getDay() === 0 ? 6 : new Date(k.replace(/-/g, '/')).getDay() - 1]}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.leyendaRow}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: '#a78bfa' }]} />
              <Text style={styles.leyendaTxt}>≥ 7h (meta)</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: '#c9a84c' }]} />
              <Text style={styles.leyendaTxt}>{'< 7h'}</Text>
            </View>
          </View>
        </View>

        {/* REGISTRAR */}
        <View style={styles.registrarCard}>
          <Text style={styles.seccionLabel}>🌙 REGISTRAR HOY</Text>

          {/* Hora dormir */}
          <Text style={styles.inputLabel}>¿A qué hora te dormiste?</Text>
          <TouchableOpacity
            style={styles.horaBtn}
            onPress={() => setPickerActivo(pickerActivo === 'dormir' ? null : 'dormir')}
            activeOpacity={0.85}
          >
            <Text style={styles.horaEmoji}>🌙</Text>
            <Text style={styles.horaTxt}>{dormir}</Text>
            <Text style={styles.horaChevron}>{pickerActivo === 'dormir' ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {pickerActivo === 'dormir' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
              {HORAS_DORMIR.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.pickerItem, dormir === h && styles.pickerItemActivo]}
                  onPress={() => { setDormir(h); setPickerActivo(null); setGuardado(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerTxt, dormir === h && styles.pickerTxtActivo]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Hora despertar */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>¿A qué hora te despertaste?</Text>
          <TouchableOpacity
            style={styles.horaBtn}
            onPress={() => setPickerActivo(pickerActivo === 'despertar' ? null : 'despertar')}
            activeOpacity={0.85}
          >
            <Text style={styles.horaEmoji}>☀️</Text>
            <Text style={styles.horaTxt}>{despertar}</Text>
            <Text style={styles.horaChevron}>{pickerActivo === 'despertar' ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {pickerActivo === 'despertar' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
              {HORAS_DESPERTAR.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.pickerItem, despertar === h && styles.pickerItemActivo]}
                  onPress={() => { setDespertar(h); setPickerActivo(null); setGuardado(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerTxt, despertar === h && styles.pickerTxtActivo]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Preview horas */}
          {dormir && despertar && (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Horas calculadas:</Text>
              <Text style={[
                styles.previewHoras,
                { color: horasEntre(dormir, despertar) >= HORA_META ? '#a78bfa' : '#c9a84c' }
              ]}>
                {horasEntre(dormir, despertar)}h
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.guardarBtn, guardado && styles.guardarBtnOk]}
            onPress={guardar}
            activeOpacity={0.88}
          >
            <Text style={styles.guardarTxt}>
              {guardado ? '✅ Registrado — Actualizar' : '💾 Guardar registro de hoy'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONSEJO */}
        <View style={styles.consejoCard}>
          <Text style={styles.seccionLabel}>💡 PROTOCOLO DE SUEÑO KETO</Text>
          <Text style={styles.consejoTxt}>
            Durante el sueño profundo tu cuerpo produce hormona de crecimiento, regula el cortisol
            y consolida la cetosis nocturna. Dormir menos de 7h eleva el giselin (hormona del hambre)
            y sabotea tu protocolo.
          </Text>
          <View style={styles.tipsWrap}>
            {[
              { emoji: '🕐', tip: 'Apuntá a dormir antes de las 23:00' },
              { emoji: '📵', tip: 'Sin pantallas 30min antes de dormir' },
              { emoji: '🌡️', tip: 'Cuarto frío: 18-20°C es ideal' },
              { emoji: '🌿', tip: 'Magnesio glicato antes de dormir' },
            ].map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>{t.emoji}</Text>
                <Text style={styles.tipTxt}>{t.tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: {
    backgroundColor: '#0d0a1a',
    padding: 24, paddingTop: 56,
    borderBottomWidth: 1, borderBottomColor: 'rgba(167,139,250,0.2)',
  },
  backBtn: {
    alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.08)',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', marginBottom: 20,
  },
  backTxt: { color: '#a78bfa', fontWeight: '900', fontSize: 12 },
  headerSobre: { fontSize: 10, color: '#3a2a5a', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitulo: { fontSize: 40, fontWeight: '900', color: '#a78bfa', marginBottom: 6 },
  headerSub: { fontSize: 13, color: '#5a4a7a' },
  body: { padding: 16 },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#13120f',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    padding: 18, marginBottom: 16, alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#a78bfa', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#5a4a7a', letterSpacing: 0.5, textAlign: 'center' },
  statDivider: { width: 1, height: 42, backgroundColor: '#2a2010' },

  graficoCard: {
    backgroundColor: '#13120f', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    padding: 20, marginBottom: 16,
  },
  seccionLabel: { fontSize: 10, color: '#a78bfa', fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  grafico: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', height: 100, marginBottom: 12,
  },
  barraCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barraHoras: { fontSize: 9, color: '#6a5a40', marginBottom: 4, fontWeight: '700' },
  barraWrap: { width: '70%', justifyContent: 'flex-end' },
  barra: { width: '100%', borderRadius: 6, minHeight: 0 },
  metaLinea: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(167,139,250,0.3)' },
  barraDia: { fontSize: 10, color: '#4a3a20', marginTop: 6, fontWeight: '700' },
  leyendaRow: { flexDirection: 'row', gap: 16 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 8, height: 8, borderRadius: 4 },
  leyendaTxt: { fontSize: 11, color: '#6a5a40' },

  registrarCard: {
    backgroundColor: '#13120f', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    padding: 20, marginBottom: 16,
  },
  inputLabel: { fontSize: 12, color: '#8a7a9a', marginBottom: 8, fontWeight: '700' },
  horaBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d0a1a', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.3)',
    padding: 16, gap: 12,
  },
  horaEmoji: { fontSize: 20 },
  horaTxt: { flex: 1, fontSize: 22, fontWeight: '900', color: '#f0e6c8' },
  horaChevron: { fontSize: 12, color: '#a78bfa', fontWeight: '900' },
  pickerScroll: { marginTop: 10, marginBottom: 4 },
  pickerItem: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#0a0a0c',
    borderWidth: 1, borderColor: '#2a2010', marginRight: 8,
  },
  pickerItemActivo: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderColor: '#a78bfa',
  },
  pickerTxt: { fontSize: 14, color: '#6a5a40', fontWeight: '700' },
  pickerTxtActivo: { color: '#a78bfa', fontWeight: '900' },
  previewRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d0a1a', borderRadius: 12,
    padding: 14, marginTop: 14,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },
  previewLabel: { fontSize: 13, color: '#6a5a40' },
  previewHoras: { fontSize: 28, fontWeight: '900' },
  guardarBtn: {
    backgroundColor: '#a78bfa', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
    shadowColor: '#a78bfa', shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  guardarBtnOk: { backgroundColor: '#7c6fd4' },
  guardarTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 14 },

  consejoCard: {
    backgroundColor: '#13120f', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)',
    padding: 20,
  },
  consejoTxt: { fontSize: 13, color: '#8a7a9a', lineHeight: 22, marginBottom: 16 },
  tipsWrap: { gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipEmoji: { fontSize: 16, flexShrink: 0 },
  tipTxt: { fontSize: 13, color: '#c8bfa8', lineHeight: 20, flex: 1 },
});
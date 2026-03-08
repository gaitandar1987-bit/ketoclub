import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NOTIFICACIONES = [
  { key: 'agua', hora: '09:00', icon: '💧', titulo: 'Hidratación', body: 'Tomá agua y activá tu cuerpo.' },
  { key: 'grounding', hora: '11:00', icon: '🌞', titulo: 'Grounding', body: 'Salí unos minutos al sol y conectá con la tierra.' },
  { key: 'journaling', hora: '16:00', icon: '✍️', titulo: 'Journaling', body: 'Es momento de escribir y ordenar tu mente.' },
  { key: 'respiracion', hora: '19:00', icon: '🧘', titulo: 'Respiración', body: 'Hacé 5 minutos de respiración consciente.' },
  { key: 'dormir', hora: '22:00', icon: '😴', titulo: 'Hora de dormir', body: 'Desconectá y prepará tu cuerpo para descansar.' },
];

const STORAGE_KEY = 'notifications_settings';

export default function NotificationsScreen({ onBack }) {
  const [activas, setActivas] = useState({
    agua: true, grounding: true, journaling: true, respiracion: true, dormir: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setActivas(parsed.activas || activas);
          setNotificationsEnabled(parsed.enabled !== false);
        }
      } catch(e) {}
      setLoaded(true);
    }
    cargar();
  }, []);

  async function guardarSettings(newActivas, newEnabled) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        activas: newActivas,
        enabled: newEnabled,
      }));
    } catch(e) {}
  }

  async function toggleGeneral(val) {
    setNotificationsEnabled(val);
    await guardarSettings(activas, val);
    if (val) {
      await reprogramar(activas);
      Alert.alert('✅ Activadas', 'Las notificaciones diarias están activas.');
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('🔕 Desactivadas', 'No recibirás más recordatorios.');
    }
  }

  async function toggleIndividual(key, val) {
    const newActivas = { ...activas, [key]: val };
    setActivas(newActivas);
    await guardarSettings(newActivas, notificationsEnabled);
    if (notificationsEnabled) await reprogramar(newActivas);
  }

  async function reprogramar(config) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const n of NOTIFICACIONES) {
      if (!config[n.key]) continue;
      const [hour, minute] = n.hora.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: { title: `${n.icon} ${n.titulo}`, body: n.body, sound: true },
        trigger: { type: 'daily', hour, minute },
      });
    }
  }

  async function testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Ketoclub',
          body: 'Las notificaciones están funcionando perfectamente.',
          sound: true,
        },
        trigger: { type: 'timeInterval', seconds: 3, repeats: false },
      });
      Alert.alert('✅ Prueba enviada', 'Vas a recibir una notificación en 3 segundos. Cerrá la app para verla mejor.');
    } catch(e) {
      Alert.alert('Error', 'No se pudo enviar: ' + e.message);
    }
  }

  if (!loaded) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <Text style={styles.headerSub}>Tu disciplina no descansa</Text>
      </View>

      <View style={styles.body}>

        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>🔥 MENTALIDAD</Text>
          <Text style={styles.fraseTexto}>
            "La persona disciplinada no espera tener ganas. Actúa igual. Y esa acción, repetida cada día, construye una identidad que nadie le puede quitar."
          </Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        <View style={styles.generalCard}>
          <View style={styles.generalLeft}>
            <Text style={styles.generalIcon}>🔔</Text>
            <View>
              <Text style={styles.generalTitle}>Recordatorios diarios</Text>
              <Text style={styles.generalSub}>
                {notificationsEnabled ? 'Activos — recibís recordatorios' : 'Desactivados'}
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleGeneral}
            trackColor={{ false: '#2a2010', true: 'rgba(201,168,76,0.5)' }}
            thumbColor={notificationsEnabled ? '#c9a84c' : '#4a3a20'}
          />
        </View>

        <Text style={styles.sectionTitle}>Personalizá tus recordatorios</Text>
        {NOTIFICACIONES.map((n) => (
          <View key={n.key} style={[styles.row, !notificationsEnabled && styles.rowDisabled]}>
            <Text style={styles.rowIcon}>{n.icon}</Text>
            <View style={styles.rowCenter}>
              <Text style={styles.rowTitle}>{n.titulo}</Text>
              <Text style={styles.rowHora}>{n.hora} hs · {n.body}</Text>
            </View>
            <Switch
              value={activas[n.key] && notificationsEnabled}
              onValueChange={(val) => toggleIndividual(n.key, val)}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#2a2010', true: 'rgba(201,168,76,0.5)' }}
              thumbColor={activas[n.key] && notificationsEnabled ? '#c9a84c' : '#4a3a20'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.testBtn} onPress={testNotification} activeOpacity={0.85}>
          <Text style={styles.testBtnText}>🧪 Probar notificación ahora</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Las notificaciones funcionan aunque la app esté cerrada. Asegurate de haber dado permiso en tu celular.
          </Text>
        </View>

        <View style={{height:40}} />
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
  fraseCard: { backgroundColor:'#13120f', borderRadius:18, padding:22, borderWidth:1, borderColor:'rgba(201,168,76,0.3)', marginBottom:16 },
  fraseLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', marginBottom:12 },
  fraseTexto: { fontSize:15, color:'#e8e0d0', lineHeight:26, fontStyle:'italic', marginBottom:12 },
  fraseAuthor: { fontSize:12, color:'#6a5a40' },
  generalCard: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#13120f', borderRadius:16, padding:18, borderWidth:1, borderColor:'rgba(201,168,76,0.25)', marginBottom:24 },
  generalLeft: { flexDirection:'row', alignItems:'center', gap:12, flex:1 },
  generalIcon: { fontSize:28 },
  generalTitle: { fontSize:15, fontWeight:'900', color:'#f0e6c8', marginBottom:2 },
  generalSub: { fontSize:12, color:'#6a5a40' },
  sectionTitle: { fontSize:14, fontWeight:'700', color:'#8a7a60', marginBottom:12, letterSpacing:1 },
  row: { flexDirection:'row', alignItems:'center', backgroundColor:'#13120f', borderRadius:14, padding:14, borderWidth:1, borderColor:'#2a2010', marginBottom:10 },
  rowDisabled: { opacity:0.4 },
  rowIcon: { fontSize:22, marginRight:12 },
  rowCenter: { flex:1 },
  rowTitle: { fontSize:14, fontWeight:'700', color:'#f0e6c8', marginBottom:2 },
  rowHora: { fontSize:11, color:'#6a5a40', lineHeight:16 },
  testBtn: { backgroundColor:'rgba(201,168,76,0.12)', borderWidth:1, borderColor:'rgba(201,168,76,0.3)', borderRadius:14, padding:16, alignItems:'center', marginTop:8, marginBottom:16 },
  testBtnText: { color:'#c9a84c', fontWeight:'900', fontSize:14 },
  infoCard: { backgroundColor:'#13120f', borderRadius:14, padding:16, borderWidth:1, borderColor:'#2a2010' },
  infoText: { fontSize:12, color:'#6a5a40', lineHeight:20, textAlign:'center' },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SB_URL = 'https://jwidrpwfccjqylymxhcv.supabase.co';
const SB_KEY = 'sb_publishable_T9O10---KeKob14NKLk5yA_MMuGFXdO';

export default function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const clean = phone.replace(/\D/g, '');
    if (!clean || clean.length < 8) { Alert.alert('Error', 'Ingresá tu número de WhatsApp'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SB_URL}/rest/v1/members?phone=ilike.%25${clean}%25&select=*`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        Alert.alert('Acceso denegado', 'No encontramos tu número.\nContactá a Diego.');
        setLoading(false); return;
      }
      const m = data[0];
      if (new Date(m.expires_at) < new Date()) {
        Alert.alert('Membresía vencida', 'Tu acceso venció. Transferí $18.888 al alias ketoclub y contactá a Diego.');
        setLoading(false); return;
      }
      // ✅ Guardar sesión persistente
      await AsyncStorage.setItem('session_member', JSON.stringify(m));
      onLogin(m);
    } catch(e) {
      Alert.alert('Error', 'Algo salió mal. Intentá de nuevo.');
    }
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logoSub}>COMUNIDAD EXCLUSIVA</Text>
        <Text style={styles.logoTitle}>Ketoclub</Text>
        <Text style={styles.logoDesc}>Salud · Disciplina · Transformación</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingresar</Text>
        <Text style={styles.cardSub}>Usá el mismo número de WhatsApp con el que te registraste</Text>
        <Text style={styles.inputLabel}>Número de WhatsApp</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5491155556666"
          placeholderTextColor="#4a3a20"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity:0.6 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#0a0a0c" /> : <Text style={styles.btnText}>Entrar a la comunidad →</Text>}
        </TouchableOpacity>
        <Text style={styles.hint}>¿No tenés acceso? Escribile a Diego por WhatsApp</Text>
      </View>
      <Text style={styles.footer}>identidadatomica.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, backgroundColor:'#0a0a0c', justifyContent:'center', padding:24 },
  logoArea: { alignItems:'center', marginBottom:40 },
  logoSub: { fontSize:10, letterSpacing:4, color:'#c9a84c', marginBottom:8 },
  logoTitle: { fontSize:38, fontWeight:'700', color:'#f0e6c8', marginBottom:6 },
  logoDesc: { fontSize:13, color:'#6a5a40', letterSpacing:1 },
  card: { backgroundColor:'#13120f', borderRadius:20, padding:28, borderWidth:1, borderColor:'#2a2010' },
  cardTitle: { fontSize:22, fontWeight:'700', color:'#f0e6c8', marginBottom:8 },
  cardSub: { fontSize:13, color:'#6a5a40', marginBottom:24, lineHeight:19 },
  inputLabel: { fontSize:12, color:'#8a7a60', marginBottom:8 },
  input: { backgroundColor:'#0a0a0c', borderWidth:1, borderColor:'#2a2010', borderRadius:12, padding:14, color:'#e8e0d0', fontSize:16, marginBottom:20 },
  btn: { backgroundColor:'#c9a84c', borderRadius:12, padding:16, alignItems:'center', marginBottom:16 },
  btnText: { color:'#0a0a0c', fontWeight:'700', fontSize:15 },
  hint: { textAlign:'center', color:'#4a3a20', fontSize:12 },
  footer: { textAlign:'center', color:'#2a2010', fontSize:11, marginTop:32 },
});
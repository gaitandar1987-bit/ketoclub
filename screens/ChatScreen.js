import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';

const GPT_URL = 'https://chatgpt.com/g/g-69821efad49481918b4689f3e659efcf-identidad-atomica-de-diego-gaitan';

export default function ChatScreen({ member, onBack }) {
  const firstName = member?.name?.split(' ')[0] || '';

  async function abrirChat() {
    try {
      await Linking.openURL(GPT_URL);
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir el chat. Verificá tu conexión.');
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.onlineDot} />
          <View>
            <Text style={styles.headerTitle}>🤖 Keto Coach IA</Text>
            <Text style={styles.headerSub}>Identidad Atómica · Diego Gaitán</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>

        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🤖</Text>
          <Text style={styles.cardTitle}>Tu Coach Personal</Text>
          <Text style={styles.cardDesc}>
            Hola{firstName ? `, ${firstName}` : ''}. Soy el asistente de IA de Diego Gaitán,
            entrenado con todo el contenido de Identidad Atómica.{'\n\n'}
            Puedo ayudarte con nutrición keto, ayuno intermitente,
            hábitos, disciplina y espiritualidad práctica.
          </Text>
        </View>

        {[
          '¿Cómo arranco con keto desde cero?',
          '¿Qué como si tengo hambre en el ayuno?',
          '¿Cómo mantengo la motivación en el proceso?',
          '¿Qué suplementos necesito en keto?',
        ].map((q, i) => (
          <TouchableOpacity
            key={i}
            style={styles.suggestionBtn}
            onPress={abrirChat}
            activeOpacity={0.85}
          >
            <Text style={styles.suggestionTxt}>💬 {q}</Text>
            <Text style={styles.suggestionArrow}>→</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.ctaBtn} onPress={abrirChat} activeOpacity={0.88}>
          <View style={styles.ctaDot} />
          <Text style={styles.ctaTxt}>Abrir Keto Coach IA →</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Se abre en ChatGPT · Disponible 24/7</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: {
    backgroundColor: '#0a1a0a',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomWidth: 2, borderBottomColor: 'rgba(74,222,128,0.3)',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backBtn: {
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
  },
  backTxt: { color: '#4ade80', fontWeight: '900', fontSize: 12 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ade80',
    shadowColor: '#4ade80', shadowOpacity: 0.8, shadowRadius: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#f0e6c8' },
  headerSub: { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  body: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#0a1a0a',
    borderRadius: 24, borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.3)',
    padding: 28, alignItems: 'center',
    marginBottom: 20,
  },
  cardEmoji: { fontSize: 52, marginBottom: 14 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#f0e6c8', marginBottom: 12 },
  cardDesc: { fontSize: 14, color: '#6a8a6a', lineHeight: 24, textAlign: 'center' },
  suggestionBtn: {
    backgroundColor: '#13120f',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  suggestionTxt: { fontSize: 13, color: '#c8bfa8', flex: 1 },
  suggestionArrow: { fontSize: 14, color: '#4ade80', fontWeight: '900' },
  ctaBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 18, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    marginTop: 12, marginBottom: 12,
    shadowColor: '#4ade80', shadowOpacity: 0.4,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  ctaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0a0a0c' },
  ctaTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
  note: { textAlign: 'center', fontSize: 12, color: '#2a4a2a' },
});
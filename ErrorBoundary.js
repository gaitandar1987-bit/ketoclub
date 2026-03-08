import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción acá se podría enviar a Sentry/Crashlytics
    console.error('🔴 ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.titulo}>Algo salió mal</Text>
        <Text style={styles.sub}>
          La app encontró un error inesperado. Podés intentar recargar o volver al inicio.
        </Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>DETALLE DEL ERROR</Text>
          <Text style={styles.errorTxt}>
            {this.state.error?.message || 'Error desconocido'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => this.setState({ hasError: false, error: null })}
        >
          <Text style={styles.btnTxt}>↩ Intentar de nuevo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.85}
          onPress={() => {
            this.setState({ hasError: false, error: null });
            this.props.onReset?.();
          }}
        >
          <Text style={styles.btnSecondaryTxt}>🏠 Volver al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: '#0a0a0c', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:          { fontSize: 64, marginBottom: 20 },
  titulo:         { fontSize: 24, fontWeight: '900', color: '#f0e6c8', marginBottom: 12, textAlign: 'center' },
  sub:            { fontSize: 14, color: '#6a5a40', lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  errorBox:       { backgroundColor: '#13120f', borderRadius: 14, borderWidth: 1, borderColor: '#2a2010', padding: 16, width: '100%', marginBottom: 28 },
  errorLabel:     { fontSize: 9, color: '#4a3a20', fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  errorTxt:       { fontSize: 12, color: '#8a7a60', lineHeight: 18 },
  btn:            { backgroundColor: '#c9a84c', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnTxt:         { color: '#0a0a0c', fontWeight: '900', fontSize: 15 },
  btnSecondary:   { backgroundColor: '#13120f', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a2010' },
  btnSecondaryTxt:{ color: '#6a5a40', fontWeight: '900', fontSize: 15 },
});

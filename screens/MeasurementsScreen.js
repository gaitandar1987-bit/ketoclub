import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Image, Modal, Animated, Dimensions, PanResponder, Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheGet, cacheSet, cacheGetJSON, cacheSetJSON } from '../cache';

const { width: SW, height: SH } = Dimensions.get('window');
const MEDIDAS = ['Peso (kg)','Cintura (cm)','Cadera (cm)','Brazo (cm)','Pierna (cm)','Pecho (cm)','Energía (1-10)','Disciplina (1-10)','Confianza (1-10)'];
const SEMANAS = ['Sem 1','Sem 2','Sem 3','Sem 4'];

// ─── Modal comparativa fullscreen con slider ──────────────────
function ComparativaModal({ visible, fotoInicial, foto30, onClose }) {
  const sliderX    = useRef(new Animated.Value(SW / 2)).current;
  const [posX, setPosX] = useState(SW / 2);

  useEffect(() => {
    if (visible) {
      sliderX.setValue(SW / 2);
      setPosX(SW / 2);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderMove: (_, gs) => {
        const nx = Math.max(40, Math.min(SW - 40, gs.moveX));
        sliderX.setValue(nx);
        setPosX(nx);
      },
    })
  ).current;

  if (!fotoInicial || !foto30) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={compStyles.overlay}>

        {/* Foto DESPUÉS (fondo completo) */}
        <Image source={{ uri: foto30 }} style={compStyles.fotoFondo} resizeMode="cover" />

        {/* Foto ANTES (clip izquierdo según slider) */}
        <View style={[compStyles.fotoClip, { width: posX }]}>
          <Image source={{ uri: fotoInicial }} style={[compStyles.fotoFondo, { width: SW }]} resizeMode="cover" />
        </View>

        {/* Línea divisoria */}
        <Animated.View style={[compStyles.linea, { left: sliderX }]} />

        {/* Handle del slider */}
        <Animated.View style={[compStyles.handle, { left: Animated.subtract(sliderX, 22) }]} {...panResponder.panHandlers}>
          <View style={compStyles.handleInner}>
            <Text style={compStyles.handleArrows}>◀  ▶</Text>
          </View>
        </Animated.View>

        {/* Labels */}
        <View style={compStyles.labelAntes}>
          <Text style={compStyles.labelTxt}>DÍA 1</Text>
        </View>
        <View style={compStyles.labelDespues}>
          <Text style={compStyles.labelTxt}>DÍA 30</Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity style={compStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={compStyles.closeTxt}>✕ Cerrar</Text>
        </TouchableOpacity>

        {/* Instrucción */}
        <View style={compStyles.instruccion}>
          <Text style={compStyles.instruccionTxt}>Deslizá para comparar</Text>
        </View>

      </View>
    </Modal>
  );
}

const compStyles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: '#000', position: 'relative' },
  fotoFondo:     { position: 'absolute', top: 0, left: 0, width: SW, height: SH },
  fotoClip:      { position: 'absolute', top: 0, left: 0, height: SH, overflow: 'hidden' },
  linea:         { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#fff', shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  handle:        { position: 'absolute', top: SH / 2 - 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  handleInner:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  handleArrows:  { fontSize: 11, color: '#0a0a0c', fontWeight: '900' },
  labelAntes:    { position: 'absolute', top: 60, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  labelDespues:  { position: 'absolute', top: 60, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)' },
  labelTxt:      { color: '#f0e6c8', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  closeBtn:      { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  closeTxt:      { color: '#f0e6c8', fontWeight: '900', fontSize: 14 },
  instruccion:   { position: 'absolute', bottom: 110, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  instruccionTxt:{ color: 'rgba(255,255,255,0.6)', fontSize: 12 },
});

// ─── Componente principal ─────────────────────────────────────
export default function MeasurementsScreen({ member, onBack }) {
  const memberKey      = member?.phone || member?.id || 'guest';
  const storageKey     = `measurements_${memberKey}`;
  const fotoInicialKey = `foto_inicial_${memberKey}`;
  const foto30Key      = `foto_30_${memberKey}`;

  const pesoHistorialKey = `peso_historial_${memberKey}`;

  const [datos,          setDatos]          = useState({});
  const [guardado,       setGuardado]       = useState(false);
  const [fotoInicial,    setFotoInicial]    = useState(null);
  const [foto30,         setFoto30]         = useState(null);
  const [comparativaVis, setComparativaVis] = useState(false);
  const [historialPeso,  setHistorialPeso]  = useState([]); // [{ fecha, peso, nota }]
  const [pesoInput,      setPesoInput]      = useState('');
  const [pesoNota,       setPesoNota]       = useState('');
  const [loading,        setLoading]        = useState(true);
  const [errorMsg,       setErrorMsg]       = useState('');
  const errorAnim = useRef(new Animated.Value(0)).current;

  function showError(msg) {
    setErrorMsg(msg);
    Animated.sequence([
      Animated.timing(errorAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(errorAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setErrorMsg(''));
  }

  useEffect(() => {
    async function cargar() {
      try {
        const [savedDatos, savedFotoInicial, savedFoto30, savedPeso] = await Promise.all([
          cacheGet(AsyncStorage, storageKey),
          cacheGet(AsyncStorage, fotoInicialKey),
          cacheGet(AsyncStorage, foto30Key),
          cacheGetJSON(AsyncStorage, pesoHistorialKey),
        ]);
        if (savedDatos)       setDatos(JSON.parse(savedDatos));
        if (savedFotoInicial) setFotoInicial(savedFotoInicial);
        if (savedFoto30)      setFoto30(savedFoto30);
        if (savedPeso)        setHistorialPeso(savedPeso);
      } catch(e) {
        showError('Error al cargar tus datos. Intentá de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  async function subirFoto(tipo) {
    Alert.alert('Elegir foto', '¿De dónde querés subir la foto?', [
      { text: '📷 Cámara',  onPress: () => abrirFoto(tipo, 'camera')  },
      { text: '🖼 Galería', onPress: () => abrirFoto(tipo, 'library') },
      { text: 'Cancelar',   style: 'cancel' },
    ]);
  }

  async function abrirFoto(tipo, fuente) {
    try {
      const options = { allowsEditing: true, aspect: [3, 4], quality: 0.8 };
      let result;
      if (fuente === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permiso necesario'); return; }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permiso necesario'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ ...options, mediaTypes: ImagePicker.MediaTypeOptions.Images });
      }
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (tipo === 'inicial') {
          setFotoInicial(uri);
          await AsyncStorage.setItem(fotoInicialKey, uri);
        } else {
          setFoto30(uri);
          await AsyncStorage.setItem(foto30Key, uri);
        }
      }
    } catch(e) {}
  }

  async function eliminarFoto(tipo) {
    if (tipo === 'inicial') {
      setFotoInicial(null);
      await AsyncStorage.removeItem(fotoInicialKey);
    } else {
      setFoto30(null);
      await AsyncStorage.removeItem(foto30Key);
    }
  }

  async function guardar() {
    try {
      await cacheSetJSON(AsyncStorage, storageKey, datos);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch(e) {
      showError('No se pudieron guardar tus medidas. Verificá el espacio disponible.');
    }
  }

  async function agregarPeso() {
    const val = parseFloat(pesoInput.replace(',', '.'));
    if (!val || val < 20 || val > 300) {
      showError('Ingresá un peso válido entre 20 y 300 kg.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const nuevo = {
      fecha: new Date().toISOString(),
      peso: val,
      nota: pesoNota.trim(),
    };
    const actualizado = [nuevo, ...historialPeso].slice(0, 180);
    try {
      await cacheSetJSON(AsyncStorage, pesoHistorialKey, actualizado);
      setHistorialPeso(actualizado);
      setPesoInput('');
      setPesoNota('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch(e) {
      showError('No se pudo guardar el peso.');
    }
  }

  async function eliminarPesoEntrada(idx) {
    Alert.alert('Eliminar entrada', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const actualizado = historialPeso.filter((_, i) => i !== idx);
          await cacheSetJSON(AsyncStorage, pesoHistorialKey, actualizado);
          setHistorialPeso(actualizado);
        }
      },
    ]);
  }

  async function exportarDatos() {
    try {
      const nombre     = member?.name || 'Usuario';
      const hoy        = new Date().toLocaleDateString('es-AR');
      const pesoActual = historialPeso[0]?.peso;
      const pesoInicio = historialPeso.length > 1 ? historialPeso[historialPeso.length - 1]?.peso : null;
      const diferencia = pesoActual && pesoInicio ? (pesoActual - pesoInicio).toFixed(1) : null;

      const lineasPeso = historialPeso.slice(0, 10).map(p => {
        const d = new Date(p.fecha).toLocaleDateString('es-AR');
        return `  ${d}: ${p.peso} kg${p.nota ? ' — ' + p.nota : ''}`;
      }).join('\n');

      // datos es { "Peso (kg)_Sem 1": "105", "Cintura (cm)_Sem 1": "95", ... }
      // Reagrupar por medida para mostrar bien
      const agrupado = {};
      Object.entries(datos).forEach(([key, val]) => {
        if (!val && val !== 0) return;
        const lastUnderscore = key.lastIndexOf('_');
        const medida = key.substring(0, lastUnderscore);
        const semana = key.substring(lastUnderscore + 1);
        if (!agrupado[medida]) agrupado[medida] = {};
        agrupado[medida][semana] = val;
      });
      const lineasMedidas = MEDIDAS
        .filter(m => agrupado[m])
        .map(m => {
          const vals = SEMANAS
            .filter(s => agrupado[m][s] !== undefined && agrupado[m][s] !== '')
            .map(s => s + ': ' + agrupado[m][s])
            .join(' | ');
          return vals ? '  ' + m + ': ' + vals : null;
        })
        .filter(Boolean)
        .join('\n');

      const texto = [
        '📊 PROGRESO DE ' + nombre.toUpperCase(),
        'Exportado el ' + hoy + ' · Ketoclub',
        '',
        '⚖️ PESO',
        pesoActual ? '  Actual: ' + pesoActual + ' kg' : '  Sin registros',
        diferencia ? '  Diferencia: ' + (diferencia > 0 ? '+' : '') + diferencia + ' kg desde el inicio' : '',
        lineasPeso ? '\n  Últimos registros:\n' + lineasPeso : '',
        '',
        '📏 MEDIDAS SEMANALES',
        lineasMedidas || '  Sin datos',
        '',
        '💪 Seguí eligiéndote todos los días.',
        '— Ketoclub · Diego Gaitán',
      ].filter(l => l !== undefined).join('\n');

      await Share.share({
        message: texto,
        title:   'Progreso de ' + nombre + ' — Ketoclub',
      });
    } catch(e) {
      if (e.message !== 'User did not share') {
        showError('No se pudo exportar. Intentá de nuevo.');
      }
    }
  }

  function setValue(medida, semana, val) {
    setDatos(prev => ({ ...prev, [`${medida}_${semana}`]: val }));
    setGuardado(false);
  }

  function getValue(medida, semana) {
    return datos[`${medida}_${semana}`] || '';
  }

  function FotoSlot({ label, foto, tipo, emoji }) {
    return (
      <View style={styles.fotoSlot}>
        <Text style={styles.fotoSlotLabel}>{label}</Text>
        {foto ? (
          <View>
            <Image source={{ uri: foto }} style={styles.fotoImagen} />
            <View style={styles.fotoBtns}>
              <TouchableOpacity style={styles.fotoBtnSec} onPress={() => subirFoto(tipo)}>
                <Text style={styles.fotoBtnSecText}>✏️ Cambiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fotoBtnSec} onPress={() => eliminarFoto(tipo)}>
                <Text style={[styles.fotoBtnSecText, { color: '#f87171' }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.fotoVacia} onPress={() => subirFoto(tipo)}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</Text>
            <Text style={styles.fotoVaciaText}>Agregar foto</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }


// ── Skeleton Medidas ─────────────────────────────────────────
function SkeletonMedidas() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  const Box = ({ w, h, r = 10, mt = 0 }) => (
    <Animated.View style={{ width: w, height: h, borderRadius: r, backgroundColor: '#1e1e18', opacity: anim, marginTop: mt }} />
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0c' }} scrollEnabled={false}>
      <View style={{ backgroundColor: '#1a1508', padding: 24, paddingTop: 56 }}>
        <Box w={80} h={14} r={6} />
        <Box w={220} h={30} r={8} mt={12} />
        <Box w={160} h={14} r={6} mt={8} />
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <Box w={'100%'} h={200} r={18} />
        <Box w={'100%'} h={100} r={16} />
        <Box w={'100%'} h={280} r={18} />
        <Box w={'100%'} h={200} r={16} />
      </View>
    </ScrollView>
  );
}

  if (loading) return <SkeletonMedidas />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Modal comparativa */}
      <ComparativaModal
        visible={comparativaVis}
        fotoInicial={fotoInicial}
        foto30={foto30}
        onClose={() => setComparativaVis(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Medidas</Text>
        <Text style={styles.headerSub}>Identidad Atómica · Seguimiento semanal</Text>
      </View>

      <View style={styles.body}>

        {/* ── ANTES Y DESPUÉS ── */}
        <Text style={styles.sectionTitle}>Antes y después</Text>
        <View style={styles.comparacionCard}>
          <FotoSlot label="DÍA 1"  foto={fotoInicial} tipo="inicial" emoji="🌱" />
          <View style={styles.comparacionDivider} />
          <FotoSlot label="DÍA 30" foto={foto30}      tipo="30"      emoji="🔥" />
        </View>

        {/* Botón comparativa — solo cuando hay las dos fotos */}
        {fotoInicial && foto30 && (
          <TouchableOpacity
            style={styles.comparativaBtn}
            onPress={() => setComparativaVis(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.comparativaBtnTxt}>⚡ Ver comparativa completa</Text>
            <Text style={styles.comparativaBtnSub}>Deslizá para comparar lado a lado</Text>
          </TouchableOpacity>
        )}

        {(!fotoInicial && !foto30) && (
          <View style={styles.fraseCard}>
            <Text style={styles.fraseTexto}>Tu transformación merece ser documentada.</Text>
            <Text style={styles.fraseTexto}>Una foto al inicio y una al final dicen más que mil palabras.</Text>
          </View>
        )}

        {/* Solo una foto — motivar a subir la segunda */}
        {(fotoInicial && !foto30) && (
          <View style={[styles.fraseCard, { borderColor: 'rgba(201,168,76,0.3)' }]}>
            <Text style={styles.fraseTexto}>✅ Foto inicial guardada.</Text>
            <Text style={styles.fraseTexto}>Agregá la foto del Día 30 para ver tu transformación completa.</Text>
          </View>
        )}

        {/* ── GUÍA ── */}
        <View style={styles.guiaCard}>
          <Text style={styles.fraseTexto}>Medirte es un acto de honestidad.</Text>
          <Text style={styles.fraseTexto}>Sin datos, la mente inventa progreso.</Text>
          <Text style={styles.fraseTexto}>Con datos, la transformación se vuelve tangible.</Text>
          <View style={styles.fraseDivider} />
          <Text style={styles.fraseGuia}>Registrá cada semana:</Text>
          <Text style={styles.frasePunto}>• Semana 1: tu verdad inicial.</Text>
          <Text style={styles.frasePunto}>• Semana 2: los primeros cambios.</Text>
          <Text style={styles.frasePunto}>• Semana 3: ajuste de rumbo.</Text>
          <Text style={styles.frasePunto}>• Semana 4: confirmación de evolución.</Text>
        </View>

        {/* ── TABLA ── */}
        <Text style={styles.sectionTitle}>Tus medidas semanales</Text>
        <View style={styles.tabla}>
          <View style={styles.tablaHeader}>
            <Text style={[styles.tablaCellHeader, { flex: 2 }]}>Medida</Text>
            {SEMANAS.map(s => (
              <Text key={s} style={[styles.tablaCellHeader, { flex: 1, textAlign: 'center' }]}>{s}</Text>
            ))}
          </View>
          {MEDIDAS.map((medida, i) => (
            <View key={medida} style={[styles.tablaFila, i % 2 === 0 && styles.tablaFilaPar]}>
              <Text style={[styles.tablaCellLabel, { flex: 2 }]}>{medida}</Text>
              {SEMANAS.map(semana => (
                <View key={semana} style={{ flex: 1, alignItems: 'center' }}>
                  <TextInput
                    style={styles.tablaInput}
                    keyboardType="numeric"
                    value={getValue(medida, semana)}
                    onChangeText={val => setValue(medida, semana, val)}
                    placeholder="—"
                    placeholderTextColor="#2a2010"
                    maxLength={5}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btnGuardar, guardado && styles.btnGuardado]}
          onPress={guardar}
          activeOpacity={0.88}
        >
          <Text style={styles.btnGuardarText}>
            {guardado ? '✅ Guardado' : 'Guardar mis medidas'}
          </Text>
        </TouchableOpacity>

        {/* ── HISTORIAL DE PESO ── */}
        <Text style={styles.sectionTitle}>Historial de peso</Text>
        <View style={styles.pesoCard}>
          {/* Gráfico de línea simple */}
          {historialPeso.length > 1 && (() => {
            const recientes = [...historialPeso].reverse().slice(0, 20);
            const vals = recientes.map(p => p.peso);
            const min = Math.min(...vals) - 1;
            const max = Math.max(...vals) + 1;
            const rng = max - min || 1;
            const GW  = SW - 64;
            const GH  = 80;
            return (
              <View style={styles.graficoWrap}>
                {recientes.map((p, i) => {
                  const x = (i / (recientes.length - 1)) * GW;
                  const y = GH - ((p.peso - min) / rng) * GH;
                  return (
                    <React.Fragment key={i}>
                      {i < recientes.length - 1 && (() => {
                        const x2 = ((i+1) / (recientes.length - 1)) * GW;
                        const y2 = GH - ((recientes[i+1].peso - min) / rng) * GH;
                        const len = Math.sqrt((x2-x)**2 + (y2-y)**2);
                        const ang = Math.atan2(y2-y, x2-x) * 180 / Math.PI;
                        return (
                          <View style={{
                            position:'absolute', left: x, top: y,
                            width: len, height: 2,
                            backgroundColor: recientes[i+1].peso <= recientes[i].peso ? '#4ade80' : '#f87171',
                            transform: [{ rotate: `${ang}deg` }], transformOrigin: '0 0',
                          }} />
                        );
                      })()}
                      <View style={[styles.graficoPunto, { left: x - 5, top: y - 5,
                        backgroundColor: i === recientes.length - 1 ? '#c9a84c' : '#1e1e18',
                        borderColor: '#c9a84c',
                      }]} />
                    </React.Fragment>
                  );
                })}
                {/* Labels primer y último */}
                <Text style={[styles.graficoLabel, { left: 0, top: GH + 6 }]}>
                  {new Date(recientes[0].fecha).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' })}
                </Text>
                <Text style={[styles.graficoLabel, { right: 0, top: GH + 6 }]}>
                  {new Date(recientes[recientes.length-1].fecha).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' })}
                </Text>
                {/* Min/Max */}
                <Text style={[styles.graficoLabelVal, { left: 0, top: -16 }]}>{max.toFixed(1)}</Text>
                <Text style={[styles.graficoLabelVal, { left: 0, top: GH - 4 }]}>{min.toFixed(1)}</Text>
              </View>
            );
          })()}

          {/* Input nuevo registro */}
          <View style={styles.pesoInputRow}>
            <TextInput
              style={styles.pesoInput}
              placeholder="Peso (kg)"
              placeholderTextColor="#4a3a20"
              keyboardType="numeric"
              value={pesoInput}
              onChangeText={setPesoInput}
              maxLength={6}
            />
            <TextInput
              style={[styles.pesoInput, { flex: 1 }]}
              placeholder="Nota opcional"
              placeholderTextColor="#4a3a20"
              value={pesoNota}
              onChangeText={setPesoNota}
              maxLength={40}
            />
            <TouchableOpacity style={styles.pesoBtn} onPress={agregarPeso} activeOpacity={0.88}>
              <Text style={styles.pesoBtnTxt}>+ Registrar</Text>
            </TouchableOpacity>
          </View>

          {/* Listado historial */}
          {historialPeso.length === 0 && (
            <Text style={styles.pesoVacioTxt}>Todavía no registraste ningún peso. ¡Empezá hoy!</Text>
          )}
          {historialPeso.slice(0, 15).map((p, i) => {
            const anterior = historialPeso[i + 1]?.peso;
            const diff = anterior ? (p.peso - anterior).toFixed(1) : null;
            const color = diff < 0 ? '#4ade80' : diff > 0 ? '#f87171' : '#6a5a40';
            return (
              <TouchableOpacity
                key={i}
                style={styles.pesoFila}
                onLongPress={() => eliminarPesoEntrada(i)}
                delayLongPress={600}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pesoFilaFecha}>
                    {new Date(p.fecha).toLocaleDateString('es-AR', { weekday:'short', day:'2-digit', month:'2-digit', year:'2-digit' })}
                  </Text>
                  {p.nota ? <Text style={styles.pesoFilaNota}>{p.nota}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pesoFilaVal}>{p.peso} kg</Text>
                  {diff !== null && <Text style={[styles.pesoFilaDiff, { color }]}>{diff > 0 ? '+' : ''}{diff} kg</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
          {historialPeso.length > 15 && (
            <Text style={styles.pesoMasTxt}>+ {historialPeso.length - 15} registros más</Text>
          )}
        </View>

        {/* ── EXPORTAR ── */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportarDatos} activeOpacity={0.88}>
          <Text style={styles.exportBtnTxt}>📤 Exportar mis datos</Text>
          <Text style={styles.exportBtnSub}>Compartir por WhatsApp, email o copiar</Text>
        </TouchableOpacity>

        <View style={styles.motivCard}>
          <Text style={styles.motivText}>Cada número que registrás es evidencia de que estás eligiéndote.</Text>
          <Text style={styles.motivAuthor}>— Diego Gaitán</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0c' },
  header:             { backgroundColor: '#1a1508', padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn:            { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#2a2010', marginBottom: 20 },
  backText:           { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  headerSobre:        { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitle:        { fontSize: 36, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub:          { fontSize: 13, color: '#6a5a40' },
  body:               { padding: 16 },
  sectionTitle:       { fontSize: 14, fontWeight: '700', color: '#8a7a60', marginBottom: 12, letterSpacing: 1 },

  // Fotos
  comparacionCard:    { flexDirection: 'row', backgroundColor: '#13120f', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', overflow: 'hidden', marginBottom: 12 },
  fotoSlot:           { flex: 1, padding: 12 },
  fotoSlotLabel:      { fontSize: 11, fontWeight: '900', color: '#c9a84c', letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
  fotoImagen:         { width: '100%', height: 160, borderRadius: 12, resizeMode: 'cover' },
  fotoVacia:          { height: 160, backgroundColor: '#0a0a0c', borderRadius: 12, borderWidth: 1, borderColor: '#2a2010', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  fotoVaciaText:      { color: '#4a3a20', fontSize: 12 },
  fotoBtns:           { flexDirection: 'row', gap: 6, marginTop: 8 },
  fotoBtnSec:         { flex: 1, backgroundColor: '#0a0a0c', borderWidth: 1, borderColor: '#2a2010', borderRadius: 8, padding: 8, alignItems: 'center' },
  fotoBtnSecText:     { color: '#c9a84c', fontSize: 11, fontWeight: '700' },
  comparacionDivider: { width: 1, backgroundColor: '#2a2010' },

  // Botón comparativa
  comparativaBtn:     { backgroundColor: '#13120f', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)', padding: 16, alignItems: 'center', marginBottom: 16, shadowColor: '#c9a84c', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  comparativaBtnTxt:  { color: '#c9a84c', fontWeight: '900', fontSize: 15, marginBottom: 4 },
  comparativaBtnSub:  { color: '#6a5a40', fontSize: 11 },

  fraseCard:          { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', marginBottom: 16 },
  guiaCard:           { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2a2010', marginBottom: 24 },
  fraseTexto:         { fontSize: 14, color: '#e8e0d0', lineHeight: 24, marginBottom: 4 },
  fraseDivider:       { height: 1, backgroundColor: '#2a2010', marginVertical: 14 },
  fraseGuia:          { fontSize: 13, color: '#8a7a60', marginBottom: 8 },
  frasePunto:         { fontSize: 13, color: '#c9a84c', lineHeight: 24 },

  tabla:              { backgroundColor: '#13120f', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2010', marginBottom: 20 },
  tablaHeader:        { flexDirection: 'row', backgroundColor: '#1a1508', paddingVertical: 12, paddingHorizontal: 12 },
  tablaFila:          { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  tablaFilaPar:       { backgroundColor: 'rgba(255,255,255,0.02)' },
  tablaCellHeader:    { color: '#c9a84c', fontWeight: '700', fontSize: 10, letterSpacing: 1 },
  tablaCellLabel:     { color: '#8a7a60', fontSize: 11 },
  tablaInput:         { backgroundColor: '#0a0a0c', borderWidth: 1, borderColor: '#2a2010', borderRadius: 8, padding: 5, color: '#f0e6c8', fontSize: 12, textAlign: 'center', width: 46 },

  btnGuardar:         { backgroundColor: '#c9a84c', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  btnGuardado:        { backgroundColor: '#1a3a1a', borderWidth: 1, borderColor: '#4ade80' },
  btnGuardarText:     { color: '#0a0a0c', fontWeight: '900', fontSize: 15 },

  motivCard:          { backgroundColor: '#13120f', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', alignItems: 'center' },

  // Error toast
  errorToast:         { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, backgroundColor: '#3a0a0a', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f87171' },
  errorToastTxt:      { color: '#f87171', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Historial peso
  pesoCard:           { backgroundColor: '#13120f', borderRadius: 18, borderWidth: 1.5, borderColor: '#2a2010', padding: 16, marginBottom: 20, gap: 12 },
  graficoWrap:        { height: 100, width: '100%', position: 'relative', marginBottom: 16 },
  graficoPunto:       { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  graficoLabel:       { position: 'absolute', fontSize: 9, color: '#4a3a20', fontWeight: '700' },
  graficoLabelVal:    { position: 'absolute', fontSize: 9, color: '#6a5a40', fontWeight: '700' },
  pesoInputRow:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pesoInput:          { backgroundColor: '#0a0a0c', borderWidth: 1, borderColor: '#2a2010', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#f0e6c8', fontSize: 14, width: 90 },
  pesoBtn:            { backgroundColor: '#c9a84c', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  pesoBtnTxt:         { color: '#0a0a0c', fontWeight: '900', fontSize: 13 },
  pesoVacioTxt:       { fontSize: 13, color: '#4a3a20', textAlign: 'center', paddingVertical: 12 },
  pesoFila:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1a1a14' },
  pesoFilaFecha:      { fontSize: 12, color: '#8a7a60', marginBottom: 2 },
  pesoFilaNota:       { fontSize: 11, color: '#4a3a20', fontStyle: 'italic' },
  pesoFilaVal:        { fontSize: 16, fontWeight: '900', color: '#f0e6c8' },
  pesoFilaDiff:       { fontSize: 11, fontWeight: '700', marginTop: 2 },
  pesoMasTxt:         { fontSize: 12, color: '#4a3a20', textAlign: 'center', paddingVertical: 8 },

  // Exportar
  exportBtn:          { backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.35)', padding: 18, alignItems: 'center', marginBottom: 16 },
  exportBtnTxt:       { color: '#c9a84c', fontWeight: '900', fontSize: 15, marginBottom: 4 },
  exportBtnSub:       { color: '#6a5a40', fontSize: 12 },
  motivText:          { fontSize: 14, color: '#e8e0d0', lineHeight: 22, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 },
  motivAuthor:        { fontSize: 12, color: '#6a5a40' },
});

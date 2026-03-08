import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sumarXP } from '../xp';

const PROTOCOLOS = [
  { id:'12h', nombre:'12 hs', horas:12, icono:'🌙', desc:'El mínimo efectivo. Ideal para empezar o días de descanso.', color:'#94a3b8', nivel:'Iniciación' },
  { id:'16_8', nombre:'16:8', horas:16, icono:'⚡', desc:'El más popular. Quema grasa y mejora la insulina.', color:'#c9a84c', nivel:'Principiante' },
  { id:'18_6', nombre:'18:6', horas:18, icono:'🔥', desc:'Más profundo. Activa la autofagia temprana.', color:'#f97316', nivel:'Intermedio' },
  { id:'20_4', nombre:'20:4', horas:20, icono:'💎', desc:'Warrior Diet. Alta quema de grasa.', color:'#a78bfa', nivel:'Avanzado' },
  { id:'24h', nombre:'24 hs', horas:24, icono:'👑', desc:'Ayuno completo. Máxima autofagia.', color:'#4ade80', nivel:'Experto' },
  { id:'36h', nombre:'36 hs', horas:36, icono:'🦁', desc:'Reseteo metabólico profundo.', color:'#f43f5e', nivel:'Elite' },
  { id:'48h', nombre:'48 hs', horas:48, icono:'🌌', desc:'Regeneración celular masiva.', color:'#60a5fa', nivel:'Legendario' },
  { id:'72h', nombre:'72 hs', horas:72, icono:'🔱', desc:'Transformación celular total.', color:'#e879f9', nivel:'Mítico' },
  { id:'120h', nombre:'120 hs', horas:120, icono:'☀️', desc:'5 días. El ayuno de longevidad extrema. Solo para expertos absolutos.', color:'#fde68a', nivel:'Supremo' },
];

const ETAPAS = [
  {
    hora:0, icono:'🍽️', titulo:'Inicio del ayuno', color:'#6a5a40',
    info:'Tu cuerpo empieza a usar el glucógeno almacenado en el hígado y músculos. La glucosa en sangre es tu combustible principal ahora mismo. Es el comienzo de todo — cada gran transformación empieza con el primer paso.',
    beneficios:['Comienzo del proceso metabólico','Nivel de insulina empieza a bajar','Tu cuerpo se prepara para el cambio'],
  },
  {
    hora:4, icono:'📉', titulo:'Glucosa bajando', color:'#fbbf24',
    info:'Los niveles de insulina caen de manera significativa. Tu páncreas deja de secretar insulina activamente. El cuerpo comienza a buscar combustibles alternativos. Este es el momento donde la magia empieza a ocurrir silenciosamente.',
    beneficios:['Insulina en descenso','Glucagón empieza a subir','Inicio de movilización de grasa'],
  },
  {
    hora:8, icono:'🔥', titulo:'Quema de grasa activa', color:'#f97316',
    info:'¡El cuerpo está oficialmente quemando grasa como combustible! Los ácidos grasos son liberados del tejido adiposo hacia el torrente sanguíneo. Tu cuerpo se convierte en una máquina de quemar grasa. Este es el momento que buscás.',
    beneficios:['Beta-oxidación de grasas activa','Energía estable y prolongada','Reducción de grasa visceral'],
  },
  {
    hora:12, icono:'⚡', titulo:'Cetosis leve', color:'#c9a84c',
    info:'Las primeras cetonas aparecen en sangre. Tu cerebro empieza a recibir cetonas como combustible — y le ENCANTA. La claridad mental que sentís no es placebo: es tu cerebro funcionando con su combustible ideal. Sos una máquina metabólica.',
    beneficios:['Cetonas detectables en sangre','Claridad mental notoria','Reducción del hambre','Estado de alerta aumentado'],
  },
  {
    hora:16, icono:'💎', titulo:'Cetosis activa', color:'#a78bfa',
    info:'¡Autofagia iniciada! Tu cuerpo activa el proceso de limpieza celular más poderoso que existe. Las células dañadas son literalmente recicladas. Yoshinori Ohsumi ganó el Premio Nobel en 2016 por descubrir este proceso. Estás experimentando algo extraordinario.',
    beneficios:['Autofagia confirmada','Limpieza celular profunda','Reducción de inflamación sistémica','Cetosis plena establecida'],
  },
  {
    hora:18, icono:'🧬', titulo:'Autofagia profunda', color:'#4ade80',
    info:'La autofagia está en su punto máximo de eficiencia. Tu cuerpo elimina proteínas mal plegadas, mitocondrias dañadas y patógenos intracelulares. Es como un reset a nivel molecular. Los científicos creen que este proceso está directamente relacionado con la longevidad y prevención del cáncer.',
    beneficios:['Eliminación de células dañadas','Regeneración mitocondrial','Reducción de marcadores inflamatorios','Potencial anti-envejecimiento activo'],
  },
  {
    hora:24, icono:'👑', titulo:'Regeneración celular', color:'#60a5fa',
    info:'La hormona del crecimiento (HGH) se dispara hasta 2000% por encima de los niveles normales. Tus músculos están siendo protegidos activamente. El sistema inmune se resetea parcialmente. Los niveles de BDNF (factor de crecimiento cerebral) aumentan — tu cerebro está literalmente creciendo.',
    beneficios:['HGH aumentada hasta 2000%','Protección muscular activa','Reset parcial del sistema inmune','BDNF elevado — neuronas nuevas'],
  },
  {
    hora:36, icono:'🦁', titulo:'Reseteo metabólico', color:'#f43f5e',
    info:'Sensibilidad a la insulina en niveles óptimos — lo opuesto a la diabetes tipo 2. El microbioma intestinal se está reorganizando. Los niveles de inflamación están en mínimos históricos para tu cuerpo. Estás en territorio de transformación profunda que muy poca gente experimenta.',
    beneficios:['Sensibilidad insulínica máxima','Microbioma intestinal en reset','Inflamación sistémica mínima','Claridad mental y espiritual intensa'],
  },
  {
    hora:48, icono:'🌌', titulo:'Regeneración masiva', color:'#a78bfa',
    info:'A las 48 horas, el sistema inmune está en plena regeneración. Estudios muestran que células madre se activan para producir nuevas células inmunes. La autofagia está en su nivel más profundo posible. Tu cuerpo ha recorrido un camino metabólico que el 99% de las personas nunca experimenta.',
    beneficios:['Activación de células madre','Sistema inmune renovado','Autofagia en nivel máximo','Transformación metabólica profunda'],
  },
  {
    hora:72, icono:'🔱', titulo:'Transformación total', color:'#e879f9',
    info:'72 horas. Sos parte del 0.1% de personas que alguna vez llegó hasta acá. Tu sistema inmune se ha regenerado casi por completo. La producción de células madre está en su pico máximo. Los estudios en longevidad muestran que los ayunos prolongados están asociados con una vida más larga y más saludable.',
    beneficios:['Regeneración inmune completa','Células madre en pico máximo','Reset metabólico total','Asociado a mayor longevidad'],
  },
  {
    hora:120, icono:'☀️', titulo:'Renacimiento supremo', color:'#fde68a',
    info:'120 horas — 5 días completos. Esto es lo que la ciencia llama "ayuno de longevidad". El Dr. Valter Longo demostró que este tipo de ayuno regenera el sistema inmune desde cero, activa genes de longevidad y puede revertir daño celular acumulado por años. Sos una leyenda absoluta.',
    beneficios:['Regeneración inmune total desde cero','Activación de genes de longevidad','Reversión de daño celular profundo','Nivel de autofagia sin precedentes'],
  },
];

const STORAGE_KEY = 'ayuno_estado';

function formatTiempo(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatHorasMin(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getInicioSemana() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diff));
  lunes.setHours(0,0,0,0);
  return lunes.getTime();
}

function hoyKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function AyunoScreen({ member, onBack }) {
  const memberKey = member?.phone || member?.id || 'guest';

  const [protocolo, setProtocolo] = useState(PROTOCOLOS[1]);
  const [ayunoActivo, setAyunoActivo] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [etapaModal, setEtapaModal] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (ayunoActivo) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue:1.03, duration:1500, useNativeDriver:true }),
        Animated.timing(pulseAnim, { toValue:1, duration:1500, useNativeDriver:true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue:1, duration:2000, useNativeDriver:true }),
        Animated.timing(glowAnim, { toValue:0, duration:2000, useNativeDriver:true }),
      ])).start();
      intervalRef.current = setInterval(() => setSegundos(p => p+1), 1000);
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      glowAnim.stopAnimation(); glowAnim.setValue(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ayunoActivo]);

  async function cargar() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.ayunoActivo && data.startTime) {
          const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
          setAyunoActivo(true);
          setStartTime(data.startTime);
          setSegundos(elapsed);
          setProtocolo(PROTOCOLOS.find(p => p.id === data.protocoloId) || PROTOCOLOS[1]);
        }
        setHistorial(data.historial || []);
      }
    } catch(e) {}
    setLoaded(true);
  }

  async function guardar(activo, start, protId, hist) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        ayunoActivo: activo, startTime: start, protocoloId: protId, historial: hist,
      }));
    } catch(e) {}
  }

  // ✅ NUEVO: guarda en historial del Dashboard
  async function guardarEnHistorialStats(horasReales) {
    try {
      const key = hoyKey();
      const raw = await AsyncStorage.getItem(`ayuno_historial_${memberKey}`);
      const hist = raw ? JSON.parse(raw) : {};
      hist[key] = { completado: true, horas: horasReales };
      await AsyncStorage.setItem(`ayuno_historial_${memberKey}`, JSON.stringify(hist));
    } catch(e) {}
  }

  async function iniciarAyuno() {
    const now = Date.now();
    setAyunoActivo(true); setStartTime(now); setSegundos(0);
    await guardar(true, now, protocolo.id, historial);
  }

  async function detenerAyuno() {
    Alert.alert('¿Terminar ayuno?', `Llevas ${formatHorasMin(segundos)} de ayuno.`, [
      { text:'Seguir 💪', style:'cancel' },
      { text:'Terminar', style:'destructive', onPress: async () => {
        const horasReales = Math.round((segundos / 3600) * 10) / 10;

        const registro = {
          fecha: new Date().toLocaleDateString('es-AR'),
          fechaMs: Date.now(),
          protocolo: protocolo.nombre,
          duracion: formatHorasMin(segundos),
          segundos: segundos,
          completado: segundos >= protocolo.horas * 3600,
          color: protocolo.color,
          icono: protocolo.icono,
        };
        const newHist = [registro, ...historial].slice(0, 50);
        setHistorial(newHist);
        setAyunoActivo(false); setStartTime(null); setSegundos(0);
        await guardar(false, null, protocolo.id, newHist);

        // ✅ Guarda en historial del Dashboard/Stats
        await guardarEnHistorialStats(horasReales);
        // XP: solo si completó el protocolo
        if (segundos >= protocolo.horas * 3600) {
          await sumarXP(memberKey, 'ayuno', `Ayuno ${protocolo.nombre} completado`);
        }
      }},
    ]);
  }

  async function eliminarRegistro(index) {
    Alert.alert('¿Eliminar registro?', 'Este ayuno se borrará del historial.', [
      { text:'Cancelar', style:'cancel' },
      { text:'Eliminar', style:'destructive', onPress: async () => {
        const newHist = historial.filter((_, i) => i !== index);
        setHistorial(newHist);
        await guardar(ayunoActivo, startTime, protocolo.id, newHist);
      }},
    ]);
  }

  // STATS
  const inicioSemana = getInicioSemana();
  const segundosSemana = historial
    .filter(h => h.fechaMs && h.fechaMs >= inicioSemana)
    .reduce((acc, h) => acc + (h.segundos || 0), 0)
    + (ayunoActivo ? segundos : 0);

  const totalSegundosTodos = historial.reduce((acc, h) => acc + (h.segundos || 0), 0)
    + (ayunoActivo ? segundos : 0);

  const horasTranscurridas = segundos / 3600;
  const metaSegundos = protocolo.horas * 3600;
  const progresoMeta = Math.min(segundos / metaSegundos, 1);
  const superaMeta = segundos > metaSegundos;
  const etapaActual = [...ETAPAS].reverse().find(e => horasTranscurridas >= e.hora) || ETAPAS[0];
  const proximaEtapa = ETAPAS.find(e => e.hora > horasTranscurridas);
  const glowOpacity = glowAnim.interpolate({ inputRange:[0,1], outputRange:[0.2, 0.6] });

  if (!loaded) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuno Intermitente</Text>
        <Text style={styles.headerSub}>Silenciá el hambre. Despertá el poder.</Text>
      </View>

      <View style={styles.body}>

        <View style={[styles.bannerSemana, { borderColor: (ayunoActivo ? protocolo.color : '#c9a84c') + '50' }]}>
          <View style={styles.bannerSemanaCols}>
            <View style={styles.bannerSemanaItem}>
              <Text style={styles.bannerSemanaLabel}>⏱ ESTA SEMANA</Text>
              <Text style={[styles.bannerSemanaNum, { color: ayunoActivo ? protocolo.color : '#c9a84c' }]}>
                {formatHorasMin(segundosSemana) === '0m' ? '0h' : formatHorasMin(segundosSemana)}
              </Text>
              <Text style={styles.bannerSemanaSub}>sin comer</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerSemanaItem}>
              <Text style={styles.bannerSemanaLabel}>🏆 TOTAL HISTÓRICO</Text>
              <Text style={[styles.bannerSemanaNum, { color:'#a78bfa' }]}>
                {formatHorasMin(totalSegundosTodos) === '0m' ? '0h' : formatHorasMin(totalSegundosTodos)}
              </Text>
              <Text style={styles.bannerSemanaSub}>acumuladas</Text>
            </View>
          </View>
          {ayunoActivo && (
            <View style={[styles.bannerActivo, { backgroundColor: protocolo.color + '15', borderColor: protocolo.color + '40' }]}>
              <Text style={[styles.bannerActivoText, { color: protocolo.color }]}>
                🔥 Ayuno activo · Llevas {formatHorasMin(segundos)} sin comer ahora mismo
              </Text>
            </View>
          )}
        </View>

        <Animated.View style={[styles.clockCard, {
          transform:[{ scale: ayunoActivo ? pulseAnim : 1 }],
          borderColor: ayunoActivo ? protocolo.color + '50' : '#2a2010',
        }]}>
          {ayunoActivo && (
            <Animated.View style={[styles.clockGlow, { backgroundColor: protocolo.color, opacity: glowOpacity }]} />
          )}

          <View style={styles.clockWrap}>
            <View style={[styles.clockRingOuter, { borderColor: ayunoActivo ? protocolo.color + '25' : '#1a1a14' }]}>
              <View style={[styles.clockRingMid, { borderColor: ayunoActivo ? protocolo.color + '50' : '#2a2010' }]}>
                <View style={[styles.clockRingInner, { borderColor: ayunoActivo ? protocolo.color : '#2a2010' }]}>
                  {ayunoActivo ? (
                    <>
                      <Text style={styles.clockEmoji}>{etapaActual.icono}</Text>
                      <Text style={[styles.clockTime, { color: protocolo.color }]}>{formatTiempo(segundos)}</Text>
                      <Text style={styles.clockEtapa}>{etapaActual.titulo}</Text>
                      {superaMeta && (
                        <View style={[styles.superadoBadge, { backgroundColor: protocolo.color + '25', borderColor: protocolo.color }]}>
                          <Text style={[styles.superadoText, { color: protocolo.color }]}>✅ META SUPERADA</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize:44 }}>{protocolo.icono}</Text>
                      <Text style={[styles.clockProtocolo, { color: protocolo.color }]}>{protocolo.nombre}</Text>
                      <Text style={styles.clockNivel}>{protocolo.nivel}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {ayunoActivo && (
            <View style={styles.progressSection}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width:`${progresoMeta*100}%`, backgroundColor: superaMeta ? '#4ade80' : protocolo.color }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0h</Text>
                <Text style={[styles.progressCenter, { color: superaMeta ? '#4ade80' : protocolo.color }]}>
                  {superaMeta ? '🏆 Meta superada' : `${Math.round(progresoMeta*100)}%`}
                </Text>
                <Text style={styles.progressLabel}>{protocolo.horas}h</Text>
              </View>
            </View>
          )}

          {ayunoActivo && (
            <TouchableOpacity
              style={[styles.etapaCard, { borderColor: etapaActual.color + '50', backgroundColor: etapaActual.color + '10' }]}
              onPress={() => setEtapaModal(etapaActual)}
              activeOpacity={0.85}
            >
              <View style={styles.etapaCardTop}>
                <Text style={[styles.etapaCardTitulo, { color: etapaActual.color }]}>{etapaActual.icono} {etapaActual.titulo}</Text>
                <Text style={[styles.etapaCardVer, { color: etapaActual.color }]}>Ver más →</Text>
              </View>
              {proximaEtapa && (
                <Text style={styles.etapaProxima}>
                  Próxima: {proximaEtapa.icono} {proximaEtapa.titulo} en {formatHorasMin((proximaEtapa.hora*3600) - segundos)}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.mainBtn, {
              backgroundColor: ayunoActivo ? 'transparent' : protocolo.color,
              borderColor: ayunoActivo ? '#f87171' : protocolo.color,
              borderWidth: ayunoActivo ? 1.5 : 0,
            }]}
            onPress={ayunoActivo ? detenerAyuno : iniciarAyuno}
            activeOpacity={0.85}
          >
            <Text style={[styles.mainBtnText, { color: ayunoActivo ? '#f87171' : '#0a0a0c' }]}>
              {ayunoActivo ? '⏹ Terminar ayuno' : `▶ Iniciar ${protocolo.nombre}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sectionTitle}>Etapas · Tocá para info científica</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:20 }} contentContainerStyle={{ gap:10, paddingRight:16 }}>
          {ETAPAS.map((e, i) => {
            const alcanzada = horasTranscurridas >= e.hora && ayunoActivo;
            const esActual = etapaActual.hora === e.hora && ayunoActivo;
            return (
              <TouchableOpacity key={i} onPress={() => setEtapaModal(e)} activeOpacity={0.85}
                style={[styles.etapaChip, {
                  borderColor: esActual ? e.color : alcanzada ? e.color+'60' : '#2a2010',
                  backgroundColor: esActual ? e.color+'25' : alcanzada ? e.color+'12' : '#13120f',
                }]}>
                <Text style={styles.etapaChipIcon}>{e.icono}</Text>
                <Text style={[styles.etapaChipHora, { color: esActual ? e.color : alcanzada ? e.color : '#4a3a20' }]}>{e.hora}h</Text>
                <Text style={[styles.etapaChipNombre, { color: esActual ? e.color : '#6a5a40' }]} numberOfLines={2}>{e.titulo}</Text>
                {esActual && <View style={[styles.etapaChipDot, { backgroundColor: e.color }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!ayunoActivo && (
          <>
            <Text style={styles.sectionTitle}>Elegí tu protocolo</Text>
            <View style={styles.protocolosGrid}>
              {PROTOCOLOS.map(p => (
                <TouchableOpacity key={p.id}
                  style={[styles.protocoloCard, protocolo.id === p.id && { borderColor: p.color, backgroundColor: p.color+'12' }]}
                  onPress={() => setProtocolo(p)} activeOpacity={0.85}>
                  <Text style={styles.protocoloIcon}>{p.icono}</Text>
                  <Text style={[styles.protocoloNombre, { color: protocolo.id === p.id ? p.color : '#f0e6c8' }]}>{p.nombre}</Text>
                  <Text style={[styles.protocoloNivel, { color: protocolo.id === p.id ? p.color+'aa' : '#4a3a20' }]}>{p.nivel}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.protocoloDescCard, { borderColor: protocolo.color+'40', backgroundColor: protocolo.color+'08' }]}>
              <Text style={{ fontSize:28 }}>{protocolo.icono}</Text>
              <View style={{ flex:1 }}>
                <Text style={[styles.protocoloDescNombre, { color: protocolo.color }]}>{protocolo.nombre} — {protocolo.nivel}</Text>
                <Text style={styles.protocoloDescTexto}>{protocolo.desc}</Text>
              </View>
            </View>
          </>
        )}

        {historial.length > 0 && (
          <>
            <View style={styles.historialHeader}>
              <Text style={styles.sectionTitle}>Historial de ayunos</Text>
              <Text style={styles.historialCount}>{historial.length} registros</Text>
            </View>
            {historial.map((h, i) => (
              <View key={i} style={[styles.historialRow, { borderLeftColor: h.color, borderLeftWidth:3 }]}>
                <Text style={styles.historialIcon}>{h.icono}</Text>
                <View style={{ flex:1 }}>
                  <View style={styles.historialTop}>
                    <Text style={[styles.historialProtocolo, { color: h.color }]}>{h.protocolo}</Text>
                    <Text style={styles.historialDuracion}>{h.duracion}</Text>
                  </View>
                  <Text style={styles.historialFecha}>{h.fecha}</Text>
                </View>
                <View style={{ alignItems:'flex-end', gap:6 }}>
                  <View style={[styles.historialBadge, {
                    backgroundColor: h.completado ? '#4ade8018' : '#f8711318',
                    borderColor: h.completado ? '#4ade8050' : '#f8711350',
                  }]}>
                    <Text style={[styles.historialBadgeText, { color: h.completado ? '#4ade80' : '#f87171' }]}>
                      {h.completado ? '✓' : '⏸'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => eliminarRegistro(i)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsLabel}>💡 CONSEJOS</Text>
          {[
            '💧 Tomá agua, té negro o café negro durante el ayuno.',
            '🧂 Si sentís mareos, agregá una pizca de sal al agua.',
            '🛌 Los ayunos largos son más fáciles si incluyen horas de sueño.',
            '⚡ La primera hora de hambre siempre pasa. Respirá y esperá.',
            '🧠 El hambre dura minutos — tu determinación dura para siempre.',
          ].map((tip, i) => (
            <Text key={i} style={styles.tipItem}>{tip}</Text>
          ))}
        </View>

        <View style={{ height:40 }} />
      </View>

      <Modal visible={!!etapaModal} transparent animationType="fade" onRequestClose={() => setEtapaModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: etapaModal?.color+'50' }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: etapaModal?.color+'20', borderColor: etapaModal?.color+'40' }]}>
              <Text style={styles.modalIcon}>{etapaModal?.icono}</Text>
            </View>
            <Text style={styles.modalHora}>A las {etapaModal?.hora} horas</Text>
            <Text style={[styles.modalTitulo, { color: etapaModal?.color }]}>{etapaModal?.titulo}</Text>
            <Text style={styles.modalInfo}>{etapaModal?.info}</Text>
            <View style={styles.modalBeneficios}>
              <Text style={styles.modalBeneficiosLabel}>✅ BENEFICIOS</Text>
              {etapaModal?.beneficios?.map((b, i) => (
                <View key={i} style={styles.modalBeneficioRow}>
                  <View style={[styles.modalBeneficioDot, { backgroundColor: etapaModal?.color }]} />
                  <Text style={styles.modalBeneficioText}>{b}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: etapaModal?.color }]}
              onPress={() => setEtapaModal(null)} activeOpacity={0.85}>
              <Text style={styles.modalBtnText}>💪 ¡Vamos por eso!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  bannerSemana: { backgroundColor:'#13120f', borderRadius:20, borderWidth:1.5, padding:20, marginBottom:16 },
  bannerSemanaCols: { flexDirection:'row', alignItems:'center' },
  bannerSemanaItem: { flex:1, alignItems:'center' },
  bannerSemanaLabel: { fontSize:9, letterSpacing:2, color:'#6a5a40', fontWeight:'900', marginBottom:8 },
  bannerSemanaNum: { fontSize:36, fontWeight:'900', letterSpacing:1, marginBottom:4 },
  bannerSemanaSub: { fontSize:11, color:'#4a3a20' },
  bannerDivider: { width:1, height:60, backgroundColor:'#2a2010', marginHorizontal:16 },
  bannerActivo: { borderRadius:10, borderWidth:1, padding:10, marginTop:14, alignItems:'center' },
  bannerActivoText: { fontSize:12, fontWeight:'700', textAlign:'center' },
  clockCard: { backgroundColor:'#13120f', borderRadius:24, padding:24, borderWidth:1.5, marginBottom:20, alignItems:'center', overflow:'hidden' },
  clockGlow: { position:'absolute', top:-80, width:240, height:240, borderRadius:120, alignSelf:'center' },
  clockWrap: { alignItems:'center', marginBottom:20 },
  clockRingOuter: { width:230, height:230, borderRadius:115, borderWidth:1, alignItems:'center', justifyContent:'center' },
  clockRingMid: { width:206, height:206, borderRadius:103, borderWidth:2, alignItems:'center', justifyContent:'center' },
  clockRingInner: { width:180, height:180, borderRadius:90, borderWidth:3, backgroundColor:'#0a0a0c', alignItems:'center', justifyContent:'center' },
  clockEmoji: { fontSize:30, marginBottom:4 },
  clockTime: { fontSize:34, fontWeight:'900', letterSpacing:2 },
  clockEtapa: { fontSize:11, color:'#8a7a60', textAlign:'center', marginTop:4, paddingHorizontal:8 },
  superadoBadge: { marginTop:6, borderWidth:1, borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  superadoText: { fontSize:9, fontWeight:'900', letterSpacing:1 },
  clockProtocolo: { fontSize:34, fontWeight:'900', marginTop:8 },
  clockNivel: { fontSize:12, color:'#6a5a40', marginTop:4, letterSpacing:1 },
  progressSection: { width:'100%', marginBottom:16 },
  progressBg: { backgroundColor:'#1e1e18', borderRadius:8, height:10, marginBottom:6 },
  progressFill: { borderRadius:8, height:10 },
  progressLabels: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  progressLabel: { fontSize:11, color:'#6a5a40' },
  progressCenter: { fontSize:12, fontWeight:'900' },
  etapaCard: { width:'100%', borderRadius:14, borderWidth:1, padding:14, marginBottom:16 },
  etapaCardTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  etapaCardTitulo: { fontSize:14, fontWeight:'900' },
  etapaCardVer: { fontSize:12, fontWeight:'700' },
  etapaProxima: { fontSize:11, color:'#4a3a20', fontStyle:'italic' },
  mainBtn: { width:'100%', borderRadius:14, paddingVertical:16, alignItems:'center' },
  mainBtnText: { fontWeight:'900', fontSize:15 },
  sectionTitle: { fontSize:14, fontWeight:'700', color:'#8a7a60', marginBottom:12, letterSpacing:1 },
  etapaChip: { borderRadius:16, borderWidth:1.5, padding:12, alignItems:'center', width:96 },
  etapaChipIcon: { fontSize:22, marginBottom:4 },
  etapaChipHora: { fontSize:14, fontWeight:'900', marginBottom:2 },
  etapaChipNombre: { fontSize:10, textAlign:'center', lineHeight:14 },
  etapaChipDot: { width:6, height:6, borderRadius:3, marginTop:6 },
  protocolosGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14 },
  protocoloCard: { backgroundColor:'#13120f', borderRadius:16, borderWidth:1, borderColor:'#2a2010', padding:14, alignItems:'center', width:'30.5%' },
  protocoloIcon: { fontSize:24, marginBottom:6 },
  protocoloNombre: { fontSize:16, fontWeight:'900', marginBottom:2 },
  protocoloNivel: { fontSize:9, letterSpacing:0.5, textAlign:'center' },
  protocoloDescCard: { borderRadius:16, borderWidth:1, padding:16, flexDirection:'row', alignItems:'center', gap:12, marginBottom:20 },
  protocoloDescNombre: { fontSize:14, fontWeight:'900', marginBottom:4 },
  protocoloDescTexto: { fontSize:13, color:'#e8e0d0', lineHeight:20 },
  historialHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  historialCount: { fontSize:12, color:'#4a3a20' },
  historialRow: { backgroundColor:'#13120f', borderRadius:14, padding:14, marginBottom:10, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:'#2a2010' },
  historialIcon: { fontSize:22 },
  historialTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  historialProtocolo: { fontSize:14, fontWeight:'900' },
  historialDuracion: { fontSize:13, color:'#f0e6c8', fontWeight:'700' },
  historialFecha: { fontSize:11, color:'#6a5a40' },
  historialBadge: { borderWidth:1, borderRadius:8, paddingHorizontal:8, paddingVertical:4 },
  historialBadgeText: { fontSize:12, fontWeight:'900' },
  deleteBtn: { padding:4 },
  deleteBtnText: { fontSize:16 },
  tipsCard: { backgroundColor:'#13120f', borderRadius:16, padding:18, borderWidth:1, borderColor:'rgba(201,168,76,0.2)', marginTop:4 },
  tipsLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', marginBottom:12 },
  tipItem: { fontSize:13, color:'#e8e0d0', lineHeight:24, marginBottom:4 },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.88)', alignItems:'center', justifyContent:'center', padding:20 },
  modalCard: { backgroundColor:'#13120f', borderRadius:24, padding:24, borderWidth:1.5, width:'100%', maxWidth:380 },
  modalIconWrap: { width:80, height:80, borderRadius:40, borderWidth:1.5, alignItems:'center', justifyContent:'center', alignSelf:'center', marginBottom:16 },
  modalIcon: { fontSize:36 },
  modalHora: { fontSize:12, color:'#6a5a40', textAlign:'center', letterSpacing:2, marginBottom:6 },
  modalTitulo: { fontSize:22, fontWeight:'900', textAlign:'center', marginBottom:14 },
  modalInfo: { fontSize:14, color:'#e8e0d0', lineHeight:24, textAlign:'center', marginBottom:20 },
  modalBeneficios: { backgroundColor:'#0a0a0c', borderRadius:14, padding:16, marginBottom:20 },
  modalBeneficiosLabel: { fontSize:10, letterSpacing:3, color:'#6a5a40', marginBottom:12, fontWeight:'900' },
  modalBeneficioRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 },
  modalBeneficioDot: { width:6, height:6, borderRadius:3, flexShrink:0 },
  modalBeneficioText: { fontSize:13, color:'#e8e0d0', lineHeight:20 },
  modalBtn: { borderRadius:14, paddingVertical:16, alignItems:'center' },
  modalBtnText: { color:'#0a0a0c', fontWeight:'900', fontSize:15 },
});
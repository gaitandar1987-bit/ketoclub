import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Modal, Dimensions } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO OFICIAL - EL DESPERTAR · IDENTIDAD ATÓMICA · DIEGO GAITÁN
// ─────────────────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');

// ─── Partícula de confetti ────────────────────────────────────
function Particula({ color, startX, delay }) {
  const y    = useRef(new Animated.Value(-20)).current;
  const x    = useRef(new Animated.Value(0)).current;
  const op   = useRef(new Animated.Value(1)).current;
  const rot  = useRef(new Animated.Value(0)).current;
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 120;
    Animated.parallel([
      Animated.timing(y,   { toValue: SH * 0.75, duration: 1800, delay, useNativeDriver: true }),
      Animated.timing(x,   { toValue: drift,      duration: 1800, delay, useNativeDriver: true }),
      Animated.timing(op,  { toValue: 0,          duration: 1800, delay: delay + 900, useNativeDriver: true }),
      Animated.timing(rot, { toValue: 6.28,       duration: 1200, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rot.interpolate({ inputRange: [0, 6.28], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: startX,
      top: 0,
      width: size,
      height: size,
      borderRadius: Math.random() > 0.5 ? size / 2 : 2,
      backgroundColor: color,
      opacity: op,
      transform: [{ translateY: y }, { translateX: x }, { rotate: spin }],
    }} />
  );
}

const CONFETTI_COLORS = ['#a78bfa','#f0e6c8','#4ade80','#60a5fa','#fbbf24','#c9a84c','#f43f5e','#e879f9'];

function ConfettiLayer() {
  const particulas = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    startX: (SW / 40) * i,
    delay: Math.random() * 600,
  }));
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {particulas.map(p => <Particula key={p.id} {...p} />)}
    </View>
  );
}

// ─── Modal de celebración ─────────────────────────────────────
function CelebracionModal({ visible, diaNro, color, onContinuar }) {
  const scale  = useRef(new Animated.Value(0.5)).current;
  const fade   = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.5);
      fade.setValue(0);
      bounce.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        Animated.sequence([
          Animated.timing(bounce, { toValue: -10, duration: 200, useNativeDriver: true }),
          Animated.spring(bounce, { toValue: 0, friction: 4, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={celebStyles.overlay}>
        <ConfettiLayer />
        <Animated.View style={[celebStyles.card, { borderColor: color + '60', opacity: fade, transform: [{ scale }, { translateY: bounce }] }]}>
          <View style={[celebStyles.iconCircle, { backgroundColor: color + '20', borderColor: color + '50' }]}>
            <Text style={celebStyles.iconTxt}>🌅</Text>
          </View>
          <Text style={celebStyles.titulo}>¡DÍA {diaNro} COMPLETADO!</Text>
          <Text style={[celebStyles.subtitulo, { color }]}>Seguís despertando.</Text>
          <Text style={celebStyles.mensaje}>
            {'El Despertar no es un evento.\nEs lo que pasa cuando aparecés cada día.\nVos seguís apareciendo.'}
          </Text>
          <Text style={celebStyles.firma}>— Diego Gaitán · El Despertar</Text>
          <TouchableOpacity
            style={[celebStyles.btn, { backgroundColor: color, shadowColor: color }]}
            onPress={onContinuar}
            activeOpacity={0.88}
          >
            <Text style={celebStyles.btnTxt}>Continuar →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const celebStyles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:       { backgroundColor: '#13120f', borderRadius: 28, borderWidth: 2, padding: 32, alignItems: 'center', width: '100%', maxWidth: 360 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconTxt:    { fontSize: 38 },
  titulo:     { fontSize: 26, fontWeight: '900', color: '#f0e6c8', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
  subtitulo:  { fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginBottom: 20, textAlign: 'center' },
  mensaje:    { fontSize: 15, color: '#c8bfa8', lineHeight: 24, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 },
  firma:      { fontSize: 12, color: '#6a5a40', marginBottom: 28, fontWeight: '600' },
  btn:        { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  btnTxt:     { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
});

const DIAS_DESPERTAR = [

  // ══════════════════════════════════════════════════════════════
  // SEMANA 1 — EL RENACER (Días 1–7)
  // Arrancar desde lo que construiste, no desde cero.
  // ══════════════════════════════════════════════════════════════

  {
    dia: 1,
    semana: 'EL RENACER',
    titulo: 'Consciencia',
    mantra: 'Arranco desde lo que construí, no desde cero.',
    protocolo: '4 comidas · Día completo de nutrición',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Café negro + huevos con ghee + palta',
        detalle: '3 huevos fritos en ghee + rodajas de palta con sal marina. Café negro sin azúcar. Así empieza El Despertar.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Caldo de huesos + bife fino + ensalada',
        detalle: 'Caldo de huesos casero con sal + bife fino a la plancha + ensalada de rúcula, pepino y oliva.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Nueces + chocolate 85%',
        detalle: '30g de nueces + 2 cuadraditos de chocolate 85% cacao. Grasa y energía real.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Pollo al horno con espárragos',
        detalle: 'Pechuga de pollo al horno con limón y hierbas + espárragos asados con oliva.',
      },
    ],
    respiracion: {
      nombre: '🫁 COHERENCIA CARDÍACA',
      descripcion: 'Inhalá 5 seg / exhalá 5 seg durante 10 minutos. Sentado, ojos cerrados, manos en el pecho. Activa la sincronización entre corazón y cerebro.',
    },
    habitos: [
      '10 min de sol directo antes de las 9 AM',
      '10 min de grounding descalzo sobre tierra o pasto',
      '3L de agua con pizca de sal marina durante el día',
      '30 min de caminata lenta y consciente sin música ni teléfono',
      'Magnesio glicinato antes de dormir',
      'Dormir antes de las 23 hs',
    ],
    preguntas: [
      '¿Qué versión de mí construyó el Umbral, y en qué soy irreversiblemente diferente al que empezó?',
      '¿Qué creencia sobre mí mismo cambió de forma silenciosa sin que yo lo decidiera conscientemente?',
      '¿Si mi cuerpo pudiera hablarme hoy con total honestidad, qué me diría?',
    ],
    mensaje: 'El Umbral te mostró que podés. El Despertar te muestra quién sos.',
  },

  {
    dia: 2,
    semana: 'EL RENACER',
    titulo: 'Profundidad',
    mantra: 'No busco motivación para arrancar. Busco profundidad para seguir.',
    protocolo: '4 comidas · Día completo de nutrición',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Omelette relleno con champiñones + queso',
        detalle: '3 huevos en omelette con champiñones salteados en ghee + queso. Rico y nutritivo.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Pollo al curry con coliflor en arroz',
        detalle: 'Pollo en trozos con curry y leche de coco + coliflor procesada en arroz. Con cilantro fresco.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Almendras tostadas + chocolate 85%',
        detalle: '30g de almendras sin sal + 1 cuadradito de chocolate 85%. Simple y saciante.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Pollo al limón y orégano con vegetales',
        detalle: 'Pollo al limón y orégano + salteado de espárragos y morrón en oliva.',
      },
    ],
    respiracion: {
      nombre: '🫁 4-7-8 PROFUNDA',
      descripcion: '4 inhalá por nariz — 7 retenés — 8 exhalás por boca. 8 rondas completas. Regula el sistema nervioso autónomo a nivel profundo.',
    },
    habitos: [
      '15 min de sol caminando',
      'Colágeno en el primer vaso de agua del día',
      'Escribir 3 intenciones del día al despertar antes de tocar el teléfono',
      'Sin pantallas 1 hora antes de dormir',
      'Temperatura fresca en el cuarto al dormir',
    ],
    preguntas: [
      '¿Qué emoción me mueve más frecuentemente, el miedo o el propósito, y cómo lo noto físicamente en el cuerpo?',
      '¿Qué creencia heredé de mi familia que aún dirige mis decisiones sin que yo le haya dado permiso?',
      '¿Si mi mejor versión pudiera observarme hoy desde afuera, qué me diría en voz baja?',
    ],
    mensaje: 'Las preguntas que evitás son exactamente las que más te necesitan.',
  },

  {
    dia: 3,
    semana: 'EL RENACER',
    titulo: 'Fuerza',
    mantra: 'Soy honesto conmigo mismo sobre lo que evito mirar.',
    protocolo: '4 comidas · Día de fuerza y nutrición',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Huevos duros + panceta de cerdo + aceitunas',
        detalle: '3 huevos duros + panceta de cerdo natural a la plancha + aceitunas verdes y negras.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Costillitas de cerdo al horno con repollo',
        detalle: 'Costillitas de cerdo al horno con especias + repollo colorado salteado en ghee.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Almendras + queso duro',
        detalle: '25g de almendras + porción de queso manchego. Grasa y proteína perfecta.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Carne picada con vegetales grillados',
        detalle: 'Carne picada de res con ajo y cebolla + zapallitos grillados con oliva y limón.',
      },
    ],
    respiracion: {
      nombre: '🫁 EXHALACIÓN LARGA',
      descripcion: '4 seg inhalá — 8 seg exhalá por nariz. 10 minutos continuos. Activa el nervio vago y reduce el cortisol crónicamente elevado.',
    },
    habitos: [
      'Movilidad articular 15 min: rodillas, caderas, hombros y columna',
      '10 min de sol',
      '10 min de grounding',
      'Caminata 35-45 min a ritmo conversacional',
      '3L de agua con electrolitos',
    ],
    preguntas: [
      '¿Cuándo fue la última vez que fui completamente honesto conmigo sobre algo que sistemáticamente evito mirar?',
      '¿Qué parte de mi cuerpo lleva tiempo pidiendo atención real y yo lo traduzco como una molestia menor?',
      '¿De qué me estoy protegiendo cuando uso la falta de tiempo como excusa para no cuidarme?',
    ],
    mensaje: 'La fuerza real no está en el músculo. Está en la honestidad con uno mismo.',
  },

  {
    dia: 4,
    semana: 'EL RENACER',
    titulo: 'Silencio',
    mantra: 'En el silencio encuentro lo que el ruido me oculta.',
    protocolo: '4 comidas · Día de descanso activo',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Caldo de huesos + palta entera',
        detalle: 'Caldo de huesos caliente con sal marina + palta entera con sal y limón.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Pollo salteado con ajo y ensalada verde',
        detalle: 'Pollo en trozos salteado con ajo + ensalada verde abundante con oliva.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Palta entera con sal marina',
        detalle: 'Una palta entera con sal marina y unas gotas de limón. Pura grasa limpia.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Cerdo al vapor con coliflor asada',
        detalle: 'Lomo de cerdo a la plancha + coliflor asada con manteca y ajo.',
      },
    ],
    respiracion: {
      nombre: '🫁 MEDITACIÓN RESPIRADA',
      descripcion: '5 min respiración caja (4-4-4-4) + 10 min de silencio total. Sin objetivo, sin música, sin guía. Solo presencia pura.',
    },
    habitos: [
      '1 hora sin pantallas al despertar antes de mirar ningún dispositivo',
      '20 min de sol si el día lo permite',
      'Escritura antes del mediodía',
      'Estiramientos de 10 min antes de dormir',
    ],
    preguntas: [
      '¿Qué ocurre realmente dentro de mí cuando me quedo en silencio durante más de 5 minutos consecutivos?',
      '¿De qué huyo exactamente cuando busco ruido, pantallas o cualquier distracción?',
      '¿Qué necesita mi mente con urgencia real que no le estoy dando porque me da miedo lo que podría aparecer?',
    ],
    mensaje: 'El silencio no está vacío. Está lleno de respuestas que el ruido te roba.',
  },

  {
    dia: 5,
    semana: 'EL RENACER',
    titulo: 'Vitalidad',
    mantra: 'Vivo mi propia vida, no la que otros esperan de mí.',
    protocolo: '4 comidas · Día de movimiento funcional',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Huevos revueltos con panceta y alcaparras',
        detalle: '3 huevos revueltos con panceta natural + alcaparras. Con ghee. Contundente.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Bife de chorizo a la plancha con palta',
        detalle: 'Bife de chorizo a la plancha + ensalada de tomate con oliva, sal y orégano + palta.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Nueces + chocolate 85%',
        detalle: '4 nueces de brasil + 1 cuadradito de chocolate 85%. Para el cerebro.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Cerdo a la plancha con ensalada de rúcula',
        detalle: 'Lomo de cerdo a la plancha + ensalada de rúcula con parmesano y aceite crudo.',
      },
    ],
    respiracion: {
      nombre: '🫁 WIM HOF SUAVE',
      descripcion: '30 respiraciones profundas lentas + exhalá y retenés afuera 15-20 seg. 3 rondas. Activa el sistema nervioso simpático de forma controlada y consciente.',
    },
    habitos: [
      'Ejercicio funcional 30 min: sentadillas, plancha, remo, estocadas',
      '10 min de sol temprano',
      'Colágeno + vitamina D al mediodía',
      'Omega 3 con la comida más grasa del día',
    ],
    preguntas: [
      '¿Qué me da energía vital genuina y qué me la roba silenciosamente sin que yo lo haya cuestionado?',
      '¿Estoy viviendo mi propia vida o administrando la vida que otros esperan de mí?',
      '¿Si tuviera la mitad de energía que tengo ahora mismo, qué elegiría con certeza conservar?',
    ],
    mensaje: 'La vitalidad no se busca. Se construye con cada elección del día.',
  },

  {
    dia: 6,
    semana: 'EL RENACER',
    titulo: 'Presencia',
    mantra: 'Le doy presencia real a las personas que digo que amo.',
    protocolo: '4 comidas · Día de conexión real',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Tortilla española keto con queso',
        detalle: 'Tortilla con cebolla, morrón y queso (sin papa) + aceitunas. Clásico y nutritivo.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Pollo entero al horno con vegetales asados',
        detalle: 'Pollo entero al horno con hierbas + berenjena, morrón y zapallito asados.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Queso natural + tomate cherry',
        detalle: '50g de queso natural + tomate cherry con oliva y sal. Simple y real.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Bondiola al horno con brócoli',
        detalle: 'Bondiola de cerdo al horno con especias + brócoli y coliflor al vapor con ghee.',
      },
    ],
    respiracion: {
      nombre: '🫁 GRATITUD RESPIRADA',
      descripcion: 'Inhalá pensando en algo por lo que sos genuinamente agradecido, exhalá soltando una tensión concreta. 10 ciclos lentos. Recalibra el sistema límbico.',
    },
    habitos: [
      'Llamar o escribir a alguien importante sin ningún motivo aparente hoy',
      '15 min de sol',
      'Preparar el entorno de sueño: oscuridad completa, frescura, sin pantallas',
      'Cena liviana y temprana',
    ],
    preguntas: [
      '¿Con quién quiero estar genuinamente más presente y por qué lo sigo postergando?',
      '¿Qué conversación necesito tener con alguien y llevo tiempo evitando con distintas excusas?',
      '¿Qué tipo de presencia real le doy a las personas que digo que amo: estoy físicamente o también estoy emocionalmente?',
    ],
    mensaje: 'La presencia es el regalo más caro que podés dar. Y no cuesta nada.',
  },

  {
    dia: 7,
    semana: 'EL RENACER',
    titulo: 'Integración',
    mantra: 'Lo que cambió en mí esta semana nadie me lo puede quitar.',
    protocolo: '4 comidas · Celebración y reflexión de cierre',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Huevos con colágeno y manteca',
        detalle: '3 huevos + colágeno hidrolizado en el café + manteca real. Ritual de cierre semanal.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Asado completo keto',
        detalle: 'Costilla de res, chorizos naturales (sin pan) + ensalada grande. El asado del domingo.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Queso duro + nueces + coco rallado',
        detalle: 'Queso de pasta dura + nueces + coco rallado sin azúcar. Snack del campeón.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Caldo de huesos + huevos pochados',
        detalle: 'Caldo de huesos caliente + 2 huevos pochados. Reconfortante y nutritivo.',
      },
    ],
    respiracion: {
      nombre: '🫁 CIERRE SEMANAL',
      descripcion: 'Coherencia cardíaca 10 min + 5 min de intenciones escritas para la semana siguiente. Consolida lo aprendido en el sistema nervioso.',
    },
    habitos: [
      '20 min al sol en movimiento',
      '10 min de grounding',
      'Reflexión escrita extensa antes de dormir',
      'Preparar alimentos para la próxima semana',
      'Dormir antes de las 22:30 hs',
    ],
    preguntas: [
      '¿Qué cambió en mí esta semana que nadie más puede ver pero yo siento con total claridad?',
      '¿Qué hábito ya no requiere esfuerzo consciente y simplemente ocurre como parte de quien soy?',
      '¿Estoy haciendo este proceso para demostrarle algo a alguien o para construirme genuinamente a mí mismo?',
    ],
    mensaje: 'Una semana de El Despertar. Tu cuerpo ya sabe adaptarse. Tu mente ya sabe sostener.',
  },

  // ══════════════════════════════════════════════════════════════
  // SEMANA 2 — LA EXPANSIÓN (Días 8–14)
  // El cuerpo está adaptado. Ahora el trabajo es completamente interior.
  // ══════════════════════════════════════════════════════════════

  {
    dia: 8,
    semana: 'LA EXPANSIÓN',
    titulo: 'Propósito',
    mantra: 'Me levanto por propósito, no por motivación.',
    protocolo: '4 comidas · Semana de trabajo interior',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Café negro + 4 huevos revueltos con ghee + palta',
        detalle: '4 huevos revueltos en ghee + palta. Café negro. La semana más importante empieza bien.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Caldo de huesos + bife ancho + espárragos',
        detalle: 'Caldo de huesos + bife ancho a la plancha con manteca de ajo + espárragos grillados.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Kefir natural + nueces',
        detalle: 'Kefir natural sin azúcar + nueces. Microbioma y energía real.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Pollo al horno con vegetales y hierbas',
        detalle: 'Pollo entero al horno con tomillo, romero y ajo + vegetales asados.',
      },
    ],
    respiracion: {
      nombre: '🫁 VISUALIZACIÓN GUIADA',
      descripcion: '5 min coherencia cardíaca + 10 min de imagen mental clara de tu vida ideal en 1 año. Ver, sentir, oler esa versión. Activa la corteza prefrontal.',
    },
    habitos: [
      'Escribir el propósito de vida en una sola oración concreta hoy',
      '10 min de sol',
      '10 min de grounding',
      'Movilidad articular 15 min',
      '3L agua + electrolitos',
    ],
    preguntas: [
      '¿Para qué me levanto cada mañana cuando la motivación no aparece y el cuerpo pide quedarse?',
      '¿Qué quiero haber construido dentro de 5 años que hoy todavía no existe y solo yo puedo hacer?',
      '¿Qué haría de forma completamente diferente si supiera con certeza que no voy a fallar ni a ser juzgado?',
    ],
    mensaje: 'La motivación es una visita. El propósito es un residente permanente.',
  },

  {
    dia: 9,
    semana: 'LA EXPANSIÓN',
    titulo: 'Anclar el Sueño',
    mantra: 'El sueño es la herramienta de rendimiento más subestimada.',
    protocolo: '4 comidas · Protocolo de recuperación nocturna',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Omelette con champiñones portobello',
        detalle: '3 huevos con champiñones portobello + aceite de oliva y tomillo fresco.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Cerdo en salsa con coliflor en arroz',
        detalle: 'Cerdo en trozos en salsa de tomate con ajo + coliflor procesada en arroz.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Almendras tostadas + chocolate 85%',
        detalle: 'Almendras tostadas sin sal (30g) + chocolate 85%. Merienda de alto rendimiento.',
      },
      {
        momento: '🌙 Cena (antes de las 20hs)',
        plato: 'Pollo a la plancha con pepino y aguacate',
        detalle: 'Pollo a la plancha + ensalada de pepino y aguacate. Cena liviana para dormir profundo.',
      },
    ],
    respiracion: {
      nombre: '🫁 PROTOCOLO PRE-SUEÑO',
      descripcion: '4-7-8 por 5 minutos + temperatura fresca + oscuridad total + magnesio glicinato. Sin luz azul 90 min antes. El sueño es el pilar invisible.',
    },
    habitos: [
      'Exposición a luz solar antes de las 9 AM para regular la melatonina nocturna',
      'Sin cafeína después de las 13:30 hs',
      'Cena liviana antes de las 20 hs',
      'Escribir 3 cosas positivas del día antes de apagar la luz',
    ],
    preguntas: [
      '¿Cuántas horas realmente duermo y qué costo concreto tiene eso en quién soy durante el día?',
      '¿Qué hábito nocturno sabotea mi sueño de forma sistemática y por qué sigo eligiéndolo?',
      '¿Qué pasa en mi mente cuando intento dormir y no puedo? ¿De qué temas no quiero quedarme solo en el silencio?',
    ],
    mensaje: 'Sin recuperación profunda no hay rendimiento sostenible. El sueño no es tiempo perdido.',
  },

  {
    dia: 10,
    semana: 'LA EXPANSIÓN',
    titulo: 'Fuerza Funcional',
    mantra: 'Me muevo desde el cuidado genuino que me merezco.',
    protocolo: '4 comidas · Día de entrenamiento funcional',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Huevos con mantequilla de almendras',
        detalle: '2 huevos + 1 cdita de mantequilla de almendras + ghee. Pre-entreno keto perfecto.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Carne deshilachada con aguacate',
        detalle: 'Res deshilachada con ajo, cebolla y morrón + aguacate. Proteína post-entreno real.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Queso crema con aceitunas negras',
        detalle: 'Queso crema + aceitunas negras con orégano. Grasa y saciedad.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Lomo de cerdo al horno con brócoli',
        detalle: 'Lomo de cerdo al horno con mostaza y hierbas + brócoli con ghee y ajo.',
      },
    ],
    respiracion: {
      nombre: '🫁 RESPIRACIÓN PRE-EJERCICIO',
      descripcion: '10 respiraciones profundas lentas + 5 rápidas activadoras. Prepara el sistema nervioso para el movimiento con intención.',
    },
    habitos: [
      'Entrenamiento 35 min: sentadillas profundas, plancha con variaciones, remo, estocadas',
      'Caminata 30 min separado del entrenamiento como recuperación activa',
      'Colágeno con vitamina C post-ejercicio',
      'Hidratación constante',
    ],
    preguntas: [
      '¿Me muevo desde el castigo que me impongo o desde el cuidado genuino que me merezco?',
      '¿Qué limitación física llevo tiempo ignorando activamente que necesita atención real y no más postergación?',
      '¿Cuándo fue la última vez que me moví por pura alegría, sin ningún objetivo ni resultado esperado?',
    ],
    mensaje: 'El ejercicio no es castigo. Es gratitud por el cuerpo que tenés.',
  },

  {
    dia: 11,
    semana: 'LA EXPANSIÓN',
    titulo: 'Lo Espiritual',
    mantra: 'Tengo una práctica espiritual auténtica, no solo hablo de ella.',
    protocolo: '4 comidas · Día de práctica espiritual profunda',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Yogur griego con crema de almendras + arándanos',
        detalle: 'Yogur griego natural + crema de almendras + arándanos + 1 cdita de miel cruda (opcional).',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Bife de res a la plancha con ensalada verde',
        detalle: 'Bife de res a la parrilla + pimientos asados + ensalada verde con oliva.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Atún en agua sobre hoja de lechuga',
        detalle: 'Atún en agua escurrido sobre hojas de lechuga con limón. Simple y limpio.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Sopa keto de pollo con espinaca',
        detalle: 'Caldo de huesos + pollo desmenuzado + espinaca + queso rallado.',
      },
    ],
    respiracion: {
      nombre: '🫁 MEDITACIÓN CONTEMPLATIVA',
      descripcion: '15 min de silencio total. Sin técnica, sin guía, sin objetivo. Solo respiración libre y pura observación. Activa la red neuronal de modo por defecto.',
    },
    habitos: [
      'Lectura de desarrollo personal 20 min, no redes sociales',
      'Caminar en silencio en naturaleza si es posible',
      'Escribir antes de la meditación',
      'Dormir antes de las 22 hs',
    ],
    preguntas: [
      '¿En qué creo que es genuinamente más grande que yo, y cuánto espacio real le doy en mi vida cotidiana?',
      '¿Tengo una práctica espiritual auténtica o solo hablo de ella? ¿Qué diferencia real existe entre ambas cosas?',
      '¿Qué necesito perdonarme con compasión genuina, sin usar eso como excusa para no cambiar?',
    ],
    mensaje: 'La persona que cuida su cuerpo también cuida su alma. No son mundos separados.',
  },

  {
    dia: 12,
    semana: 'LA EXPANSIÓN',
    titulo: 'Relaciones',
    mantra: 'Mis vínculos más cercanos me nutren genuinamente.',
    protocolo: '4 comidas · Día de conexión y vínculos',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Huevos pochados con panceta',
        detalle: '3 huevos pochados + panceta natural a la plancha. Desayuno que merece un día de conexión.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Pollo en salsa verde con calabacín',
        detalle: 'Pollo en salsa verde con cilantro y ajo + calabacín salteado. Sabroso y liviano.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Nueces + queso manchego',
        detalle: '4 nueces de brasil + queso manchego en cuadraditos. Clásico y perfecto.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Cerdo con ensalada abundante',
        detalle: 'Cerdo a la plancha + ensalada verde grande con aguacate y oliva.',
      },
    ],
    respiracion: {
      nombre: '🫁 RESPIRACIÓN COMPARTIDA',
      descripcion: 'Coherencia cardíaca 5 min enviando intencionalmente aprecio a alguien que lo necesite. Con o sin esa persona presente. Activa oxitocina y conexión real.',
    },
    habitos: [
      'Tiempo de calidad sin pantallas con alguien que amás hoy',
      'Escribir sobre una relación que querés mejorar y el primer paso concreto posible',
      'Sol 15 min',
      'Ejercicio suave 20 min',
    ],
    preguntas: [
      '¿Mis vínculos más cercanos me nutren genuinamente o me drenan, y qué responsabilidad real tengo yo en ese resultado?',
      '¿Qué tipo de presencia real le doy a las personas que digo que amo, o solo aparezco físicamente?',
      '¿Qué relación importante llevo tiempo deteriorando con mi silencio, mi ausencia o mi falta de intención?',
    ],
    mensaje: 'Cuando cambiás vos, cambia todo lo que te rodea. Es inevitable.',
  },

  {
    dia: 13,
    semana: 'LA EXPANSIÓN',
    titulo: 'Dominio Interno',
    mantra: 'La historia falsa que me cuento sobre mí mismo ya no tiene poder.',
    protocolo: '4 comidas · Día de metacognición',
    comidas: [
      {
        momento: '☀️ Desayuno',
        plato: 'Frittata italiana con vegetales y queso',
        detalle: '4 huevos al horno con vegetales, queso y hierbas + aceitunas. Italiano y keto.',
      },
      {
        momento: '🕐 Almuerzo',
        plato: 'Milanesa de res al horno con ensalada',
        detalle: 'Milanesa de res horneada (con huevo y queso, sin pan rallado) + ensalada mixta.',
      },
      {
        momento: '🕓 Merienda',
        plato: 'Queso crema + pepinos en rodajas',
        detalle: 'Queso crema + pepinos en rodajas + sal marina. Refrescante y nutritivo.',
      },
      {
        momento: '🌙 Cena',
        plato: 'Atún en agua con vegetales asados',
        detalle: 'Atún en agua (bien escurrido) + vegetales asados con ajo y oliva. Liviano y limpio.',
      },
    ],
    respiracion: {
      nombre: '🫁 AUTOOBSERVACIÓN',
      descripcion: '10 min respiración + escribir en tiempo real los pensamientos que aparecen sin juzgarlos. Pura observación sin edición. Desarrolla metacognición real.',
    },
    habitos: [
      'Identificar 1 patrón mental que se repite de forma automática esta semana',
      '10 min de sol',
      'Movilidad articular 15 min',
      'Cena temprana y sueño prioritario',
    ],
    preguntas: [
      '¿Qué historia me cuento sobre mí mismo que ya demostró ser falsa pero sigo creyendo como si fuera un hecho?',
      '¿A qué emociones le tengo miedo real, no las que reconozco fácilmente sino las que niego que existen?',
      '¿Cómo reacciono exactamente cuando las cosas no salen como quiero? ¿Qué me dice eso sobre una herida que no miré?',
    ],
    mensaje: 'El dominio interno no es control. Es la capacidad de observarte sin juzgarte.',
  },

  {
    dia: 14,
    semana: 'LA EXPANSIÓN',
    titulo: 'Consolidación',
    mantra: 'Mido mi crecimiento interior, no solo los números.',
    protocolo: '🔄 NUEVO PROTOCOLO · Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Pollo al horno con ajo y limón + ensalada grande',
        detalle: 'Primera comida del día: prioridad proteína + grasa. Pollo al horno con ajo, limón y oliva + ensalada grande.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Carne de res guisada con vegetales + aguacate',
        detalle: 'La comida más abundante del día. Res guisada con vegetales keto + aguacate.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Caldo de huesos + 2 huevos pochados',
        detalle: 'Cena liviana para facilidad digestiva. Caldo reconfortante + huevos pochados.',
      },
    ],
    respiracion: {
      nombre: '🫁 REVISIÓN SEMANAL',
      descripcion: '10 min coherencia cardíaca + revisión escrita completa de la semana. ¿Qué expandí? ¿Qué necesito soltar para seguir avanzando?',
    },
    habitos: [
      'Medición estratégica del día 14: peso, cintura, energía y calidad de sueño',
      '20 min al sol',
      'Reflexión extensa antes de dormir',
      'Preparar el plan alimenticio de la semana 3',
    ],
    preguntas: [
      '¿En qué crecí internamente esta semana que no tiene absolutamente nada que ver con el cuerpo ni los números?',
      '¿Cuál de los 5 pilares me cuesta más y qué me dice eso sobre lo que más necesito desarrollar?',
      '¿Estoy siendo completamente honesto conmigo mismo en este proceso o sigo negociando en silencio con alguna excusa?',
    ],
    mensaje: 'Día 14. La mitad. Lo que construiste adentro ya no necesita permiso de afuera.',
  },

  // ══════════════════════════════════════════════════════════════
  // SEMANA 3 — LA INTEGRACIÓN (Días 15–21)
  // Lo que practicaste comienza a ser quién sos.
  // A partir del día 14: Ayuno 16:8 — Ventana 12:00 a 20:00 hs
  // ══════════════════════════════════════════════════════════════

  {
    dia: 15,
    semana: 'LA INTEGRACIÓN',
    titulo: 'Identidad Integrada',
    mantra: 'Soy quien soy cuando nadie me mira y no hay recompensa externa.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos escalfados con espinaca y ajo',
        detalle: 'Huevos escalfados + espinaca salteada en ajo + aceite de oliva y pimentón ahumado.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Pollo con zoodles y carne bolognesa',
        detalle: 'Fettuccini de calabacín con bolognesa de pollo y res + queso parmesano rallado.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Bife al queso roquefort + espárragos',
        detalle: 'Bife a la plancha con salsa de queso + espárragos al vapor. Lujoso y keto.',
      },
    ],
    respiracion: {
      nombre: '🫁 AFIRMACIONES DE IDENTIDAD',
      descripcion: '5 min respiración + decir en voz alta 5 afirmaciones en presente desde el ser: "Soy alguien que..." Activa identidad a nivel neurológico real.',
    },
    habitos: [
      'Escribir quién sos hoy comparado con quien eras antes del Umbral en términos concretos',
      '15 min de sol',
      'Ejercicio de fuerza 35 min',
      'Grounding 10 min',
      'Magnesio + vitamina D',
    ],
    preguntas: [
      '¿Quién soy cuando nadie me mira, nadie me aprueba y no hay recompensa externa posible?',
      '¿Qué valores dicen guiar mi vida y cuáles realmente lo hacen cuando hay un conflicto real de intereses?',
      '¿Mi vida exterior refleja honestamente mi mundo interior, o hay una brecha que elijo ignorar porque me incomoda verla?',
    ],
    mensaje: 'Lo que practicaste comienza a ser quién sos. No lo que hacés: lo que sos.',
  },

  {
    dia: 16,
    semana: 'LA INTEGRACIÓN',
    titulo: 'El Cuerpo Habla',
    mantra: 'Mi cuerpo es un aliado inteligente, no un enemigo que hay que someter.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Leche de coco caliente + colágeno + nueces tostadas',
        detalle: 'Bowl de desayuno keto: leche de coco caliente con colágeno + canela + nueces tostadas.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Carne asada en tiras con chimichurri',
        detalle: 'Tiras de res asada con chimichurri de hierbas + vegetales asados al horno.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pollo a la plancha con vegetales suaves',
        detalle: 'Pollo a la plancha liviano + vegetales al vapor. Facilidad digestiva nocturna.',
      },
    ],
    respiracion: {
      nombre: '🫁 ESCANEO CORPORAL',
      descripcion: '15 min tumbado en silencio recorriendo cada parte del cuerpo conscientemente. De los pies hasta la cabeza. Sin juzgar. Solo sentir con atención real.',
    },
    habitos: [
      'Automasaje de pies y manos con aceite de coco o lavanda',
      'Caminata suave 40 min',
      'Baño caliente antes de dormir',
      'Sin pantallas 2 horas antes de apagar la luz',
    ],
    preguntas: [
      '¿Dónde guarda mi cuerpo el estrés que no proceso a través de las palabras ni de la razón?',
      '¿Qué mensaje lleva tiempo mandando mi cuerpo que yo traduzco como un problema físico pero podría ser una señal de algo más profundo?',
      '¿Me relaciono con mi cuerpo como a un aliado inteligente o como a un enemigo que hay que someter?',
    ],
    mensaje: 'Tu cuerpo no es obstáculo. Es el vehículo de toda tu transformación.',
  },

  {
    dia: 17,
    semana: 'LA INTEGRACIÓN',
    titulo: 'El Legado',
    mantra: 'Lo que construyo hoy va a importar dentro de 20 años.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Bife de res al plato + pimentón y tomate',
        detalle: 'Bife de res a la plancha + tomate asado + pimentón. Contundente para arrancar la ventana.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Pollo con verduras y rúcula',
        detalle: 'Pollo al horno con especias + rúcula con oliva virgen. Limpio y nutritivo.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Cerdo en salsa verde con espárragos',
        detalle: 'Cerdo en salsa verde con ajo y perejil + espárragos. Liviano para cerrar el día.',
      },
    ],
    respiracion: {
      nombre: '🫁 ESCRITURA DE LEGADO',
      descripcion: '10 min respiración + escribir durante 20 min sobre qué querés dejar. Sin límite, sin correcciones, sin estructura. Solo verdad en bruto.',
    },
    habitos: [
      'Escribir una carta a tu yo de dentro de 10 años sobre lo que estás construyendo hoy',
      '15 min de sol en movimiento',
      'Movilidad articular 15 min',
      'Dormir antes de las 22:30 hs',
    ],
    preguntas: [
      '¿Qué quiero que digan de mí cuando ya no esté, más allá de los logros, los títulos y los bienes materiales?',
      '¿Qué estoy construyendo hoy de forma concreta que va a importar y a perdurar dentro de 20 años?',
      '¿Le estoy dejando algo realmente valioso a las personas que amo, o solo cosas que no van a recordar?',
    ],
    mensaje: 'El legado no se construye al final. Se construye hoy, con cada elección.',
  },

  {
    dia: 18,
    semana: 'LA INTEGRACIÓN',
    titulo: 'Gratitud Activa',
    mantra: 'La gratitud no es pasividad. Es el combustible más poderoso que existe.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Bowl proteico con colágeno y frutos secos',
        detalle: 'Yogur kefir + colágeno hidrolizado + frutos secos + cacao puro. Poderoso.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Churrasco de res con pimientos y ajo confitado',
        detalle: 'Churrasco de ternera a la plancha + pimientos asados + oliva + ajo confitado.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pechuga de pollo con berenjenas asadas',
        detalle: 'Pechuga de pollo al horno con hierbas provenzales + berenjenas asadas con ajo.',
      },
    ],
    respiracion: {
      nombre: '🫁 GRATITUD RESPIRADA PROFUNDA',
      descripcion: 'Por cada exhalación, nombrá mentalmente 1 cosa concreta por la que sos genuinamente agradecido. 10 minutos. Transforma la química real del sistema nervioso.',
    },
    habitos: [
      'Escribir 10 cosas concretas por las que sos genuinamente agradecido hoy, no las de siempre',
      'Hacer algo concreto por alguien sin esperar absolutamente ningún retorno',
      '20 min de sol',
      'Ejercicio suave 20 min de movilidad y estiramiento',
    ],
    preguntas: [
      '¿Me cuesta genuinamente sentir gratitud o la ejecuto como un ejercicio mecánico que no siento realmente?',
      '¿Cuánto tiempo real paso quejándome mentalmente versus valorando lo que tengo frente a mí?',
      '¿Qué tengo hoy que una vez pedí con desesperación y ahora ignoro por completo como si siempre hubiera estado ahí?',
    ],
    mensaje: 'Tenés hoy lo que alguna vez pediste con desesperación. ¿Lo estás viendo?',
  },

  {
    dia: 19,
    semana: 'LA INTEGRACIÓN',
    titulo: 'El Dolor como Maestro',
    mantra: 'Mi sufrimiento me hizo más profundo, no más duro.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Revuelto de huevos con pimentón ahumado y panceta',
        detalle: 'Huevos revueltos con pimentón ahumado + panceta crujiente + germinados frescos.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Cerdo al horno con pepino y menta',
        detalle: 'Cerdo al horno con romero y ajo + ensalada de pepino con menta fresca.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pollo a la plancha con salsa de aguacate',
        detalle: 'Pollo a la plancha + salsa de aguacate y cilantro + brócoli con ajo. Suave para cerrar.',
      },
    ],
    respiracion: {
      nombre: '🫁 RESPIRACIÓN LIBERADORA',
      descripcion: '20 respiraciones profundas rápidas + exhalá completamente + retenés afuera 30 seg + 2 min respiración normal. 3 rondas. Libera emociones físicamente atrapadas en el cuerpo.',
    },
    habitos: [
      'Escribir sobre algo doloroso del pasado visto exclusivamente como enseñanza y no como victimización',
      'Caminar en silencio 30-40 min',
      'Sueño absolutamente prioritario esta noche',
      'Sin alcohol ni procesados',
    ],
    preguntas: [
      '¿Qué dolor concreto cargo todavía que no he procesado porque me da miedo mirarlo directamente a los ojos?',
      '¿Qué aprendí de mis momentos más oscuros que jamás podría haber aprendido en la comodidad y la seguridad?',
      '¿El sufrimiento que viví me hizo más profundo y más humano, o me endurecí como mecanismo de defensa para no volver a sentir?',
    ],
    mensaje: 'El dolor que no procesaste no desapareció. Vive en tus decisiones.',
  },

  {
    dia: 20,
    semana: 'LA INTEGRACIÓN',
    titulo: 'El Guerrero Tranquilo',
    mantra: 'Puedo estar en calma total y ser completamente fuerte al mismo tiempo.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos rancheros keto con aguacate',
        detalle: 'Huevos pochados + salsa roja casera + aguacate + queso fresco. Sabroso y potente.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Bife de res con espinaca a la crema',
        detalle: 'Bife de res al carbón con mantequilla de hierbas + espinaca a la crema con queso.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pollo al horno con aceitunas y tomate cherry',
        detalle: 'Pollo al horno con oliva, tomate cherry y aceitunas negras. Mediterráneo y liviano.',
      },
    ],
    respiracion: {
      nombre: '🫁 COHERENCIA CARDÍACA EXTENDIDA',
      descripcion: '15 min de coherencia: inhalá 5 seg / exhalá 5 seg con foco en el corazón y emoción de aprecio genuino. Estado óptimo de rendimiento mental.',
    },
    habitos: [
      'Entrenamiento de fuerza completo con 4 series por ejercicio',
      '10 min de sol temprano',
      'Colágeno + omega 3 + vitamina D',
      'Lectura de desarrollo personal 20 min antes de dormir',
    ],
    preguntas: [
      '¿Puedo estar en calma total y ser completamente fuerte al mismo tiempo, o creo que una condición anula necesariamente a la otra?',
      '¿Qué situación me saca de eje de forma repetitiva y qué me dice eso sobre una herida que todavía no he cerrado realmente?',
      '¿Qué significa para mí ser un guerrero tranquilo en un mundo que confunde la agresividad con la fortaleza real?',
    ],
    mensaje: 'La calma no es ausencia de fuerza. Es fuerza sin necesidad de demostrarlo.',
  },

  {
    dia: 21,
    semana: 'LA INTEGRACIÓN',
    titulo: 'La Mitad del Despertar',
    mantra: 'Ya no soy el mismo que entró al Umbral. Lo siento con total claridad.',
    protocolo: 'Ayuno 16:8 · Día libre dentro del protocolo · Celebración',
    comidas: [
      {
        momento: '🕐 12:00 — Festejo (Romper ayuno)',
        plato: 'El desayuno que más disfrutaste del proceso',
        detalle: 'Hoy elegís vos. Cualquier combinación del programa que más hayas disfrutado. Te lo ganaste.',
      },
      {
        momento: '🕓 16:00 — Festín del día 21',
        plato: 'Tu corte o plato favorito del proceso',
        detalle: 'El favorito. Con ensalada grande. Disfrutalo con presencia real.',
      },
      {
        momento: '🕖 19:00 — Cena consciente',
        plato: 'Lo que el cuerpo pida dentro del protocolo',
        detalle: 'La celebración real es la coherencia mantenida. Comé lo que querás dentro del protocolo.',
      },
    ],
    respiracion: {
      nombre: '🫁 RITUAL DEL DÍA 21',
      descripcion: '20 min de respiración libre + lectura del Manifiesto del Despertar en voz alta + escritura de compromiso renovado con tu propia voz y tus propias palabras.',
    },
    habitos: [
      'Tiempo de reflexión completo sin interrupciones ni dispositivos',
      'Compartir el proceso con alguien de confianza que realmente lo merezca escuchar',
      'Celebrar sin abandonar el protocolo: la celebración real es la coherencia mantenida',
    ],
    preguntas: [
      '¿Soy la misma persona que empezó el Umbral hace más de 50 días, o hay algo que ya no volvió a ser igual de forma permanente?',
      '¿Qué le diría con total honestidad a alguien que está dudando si este proceso vale la pena?',
      '¿Qué parte de mí todavía resiste este despertar, y a qué tiene miedo exactamente esa parte?',
    ],
    mensaje: '21 días de El Despertar. La disciplina no es un esfuerzo: es una expresión de quién sos.',
  },

  // ══════════════════════════════════════════════════════════════
  // SEMANA 4 — EL MAESTRO (Días 22–30)
  // El maestro no busca perfección. Busca coherencia.
  // ══════════════════════════════════════════════════════════════

  {
    dia: 22,
    semana: 'EL MAESTRO',
    titulo: 'Autoridad Personal',
    mantra: 'Cumplo mis compromisos cuando absolutamente nadie me ve.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Bife de res + 2 huevos fritos en ghee',
        detalle: 'Bife de res a la plancha + 2 huevos fritos en ghee. La comida del maestro.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Costillar de cerdo con mostaza y ensalada verde',
        detalle: 'Costillar de cerdo glaseado con mostaza y hierbas + ensalada verde abundante.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pollo ahumado con queso crema',
        detalle: 'Pollo ahumado natural + queso crema y hierbas. Cena del maestro que descansa.',
      },
    ],
    respiracion: {
      nombre: '🫁 DECLARACIÓN EN VOZ ALTA',
      descripcion: '10 min coherencia cardíaca + decir en voz alta frente al espejo 3 compromisos concretos para los últimos 8 días. La voz activa el compromiso en otro nivel neurológico.',
    },
    habitos: [
      'Releer el Contrato de Identidad firmado el día 1 del Umbral y el del Despertar',
      '15 min de sol',
      'Ejercicio funcional 35 min',
      'Grounding 10 min',
    ],
    preguntas: [
      '¿Cumplo mis compromisos cuando absolutamente nadie me ve y nadie me va a aplaudir por hacerlo?',
      '¿Dónde estoy cediendo autoridad real sobre mi vida a opiniones externas que no merecen ese nivel de poder?',
      '¿Qué decisión importante llevo tiempo postergando que solo puedo tomar yo y nadie más puede tomar por mí?',
    ],
    mensaje: 'El maestro no busca perfección. Busca coherencia. Día tras día. Sin testigos.',
  },

  {
    dia: 23,
    semana: 'EL MAESTRO',
    titulo: 'Simpleza Poderosa',
    mantra: 'La consistencia de lo simple supera la intensidad de lo complejo.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos duros + aguacate con pimienta cayena',
        detalle: 'Huevos duros + aguacate con sal y pimienta cayena + café negro. Minimalista y perfecto.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Muslo de pollo confitado con escarola',
        detalle: 'Muslo de pollo confitado en su propia grasa + escarola con vinagreta de mostaza y oliva.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Caldo de huesos + huevo pochado + espinaca',
        detalle: 'Caldo de huesos denso + huevo pochado + espinaca fresca + sal marina.',
      },
    ],
    respiracion: {
      nombre: '🫁 RESPIRACIÓN MINIMALISTA',
      descripcion: 'Solo 5 minutos de 4-4-6 al despertar. La consistencia de lo simple supera siempre la intensidad de lo complejo que no se puede sostener.',
    },
    habitos: [
      'Simplificar un aspecto concreto de la vida hoy: compromisos, contactos, aplicaciones, objetos',
      'Eliminar una cosa concreta que ocupa espacio físico o mental sin aportar valor real',
      'Caminata 40 min',
      'Dormir antes de las 22:30 hs',
    ],
    preguntas: [
      '¿Dónde estoy complicando lo que en realidad debería ser simple, y por qué necesito esa complejidad?',
      '¿Qué tengo en mi vida, en mis compromisos o en mi cabeza que ya no necesito pero no me animo a soltar?',
      '¿Dónde pongo energía de forma sistemática y constante que no me retorna nada que realmente valga?',
    ],
    mensaje: 'La simplicidad no es pobreza. Es la elegancia de saber exactamente qué importa.',
  },

  {
    dia: 24,
    semana: 'EL MAESTRO',
    titulo: 'El Don',
    mantra: 'Mis dones naturales están al servicio del mundo, no escondidos por miedo al juicio.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos con queso crema y canela + ghee',
        detalle: 'Crepes keto: huevos + queso crema + canela + relleno de nueces y cacao + ghee.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Chuletas de cerdo con berenjena ahumada',
        detalle: 'Chuletas de cerdo a la parrilla con romero + puré de berenjena ahumada con ajo.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Atún en agua con tomate, pepino y oliva',
        detalle: 'Atún en agua bien escurrido + tomate, pepino y oliva con vinagre.',
      },
    ],
    respiracion: {
      nombre: '🫁 MEDITACIÓN DE DONES',
      descripcion: '15 min de silencio + visualizar con claridad máxima qué dones naturales tenés y cómo los usás activamente para contribuir al mundo. Los reales, no los que creés que deberían ser.',
    },
    habitos: [
      'Hacer algo concreto con el talento natural más auténtico que tenés hoy',
      '10 min de sol',
      'Movilidad articular 15 min',
      'Escribir sobre cómo podrías servir a otros de forma concreta con lo que sabés y sos',
    ],
    preguntas: [
      '¿Cuáles son mis dones naturales reales, no los que otros esperan que tenga ni los que yo aspiro a tener?',
      '¿Los estoy usando activamente en el mundo o los tengo protegidos y escondidos detrás del miedo al juicio?',
      '¿Cómo podría mi presencia en el mundo ser genuinamente más generosa con lo que auténtica y naturalmente soy?',
    ],
    mensaje: 'El talento guardado no le sirve a nadie. Tampoco te sirve a vos.',
  },

  {
    dia: 25,
    semana: 'EL MAESTRO',
    titulo: 'Resistencia Mental',
    mantra: 'Elijo la incomodidad como herramienta consciente de crecimiento.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Bife de res + huevo frito + tomate asado',
        detalle: 'Bistec de res a la plancha + huevo frito en ghee + tomate asado + pimentón.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Res estofada con puré de coliflor',
        detalle: 'Osobuco de res estofado con vegetales keto + puré de coliflor untuoso con ghee.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Pollo con coliflor y especias suaves',
        detalle: 'Pollo con especias suaves + coliflor en trozos. Liviano y digestivo.',
      },
    ],
    respiracion: {
      nombre: '🫁 BAJO PRESIÓN — WIM HOF',
      descripcion: '4 rondas Wim Hof suave + retención en exhala 20-25 seg. Entrena a la mente para tolerar incomodidad sin colapsar y sin negociar.',
    },
    habitos: [
      'Hacer algo que incomode hoy y hacerlo de todas formas sin negociar ni postergar',
      'Ducha fría 30 seg al final como práctica de tolerancia voluntaria a la incomodidad',
      'Ejercicio de fuerza 35 min',
      'Escribir sobre cómo se siente elegir la incomodidad',
    ],
    preguntas: [
      '¿Huyo de la incomodidad como mecanismo de supervivencia automático o la busco como herramienta consciente de crecimiento?',
      '¿Qué evito de forma sistemática que en el fondo sé exactamente que me haría crecer si lo enfrentara?',
      '¿Cuál es la diferencia real y concreta entre sufrir de forma inútil y crecer a través del esfuerzo voluntario?',
    ],
    mensaje: 'El confort es el enemigo del crecimiento. Tu zona de confort es el techo de tu identidad actual.',
  },

  {
    dia: 26,
    semana: 'EL MAESTRO',
    titulo: 'Gratitud por el Cuerpo',
    mantra: 'Mi cuerpo es el vehículo de absolutamente todo lo que soy y hago.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos al plato con germinados y oliva crudo',
        detalle: 'Huevos al plato + germinados frescos + aceite de oliva crudo en hilo.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Res guisada con vegetales keto',
        detalle: 'Carne de res guisada con cebolla, ajo, morrón y tomate + oliva. Reconfortante.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Cerdo a la plancha con ensalada fresca',
        detalle: 'Cerdo a la plancha + ensalada verde fresca. Cena liviana de agradecimiento.',
      },
    ],
    respiracion: {
      nombre: '🫁 ESCANEO DE GRATITUD CORPORAL',
      descripcion: '15 min recorriendo el cuerpo con aprecio genuino. Cada órgano, cada músculo, cada sistema que trabaja sin que le pidamos permiso ni lo agradezcamos.',
    },
    habitos: [
      'Agradecer al cuerpo en voz alta y en privado, sin ironía ni condiciones',
      'Masaje o automasaje consciente con aceite natural',
      'Caminata 30 min en silencio total',
      'Sueño absolutamente prioritario esta noche',
    ],
    preguntas: [
      '¿Qué le exijo a mi cuerpo constantemente sin nunca agradecerle lo que hace por mí sin condiciones?',
      '¿Cuánto tiempo he pasado en guerra con mi cuerpo cuando en realidad es el vehículo de absolutamente todo lo que soy y hago?',
      '¿Qué cambio real e irreversible noto en mi relación con el cuerpo en estos 26 días que ya no puedo pretender que no ocurrió?',
    ],
    mensaje: 'Llevás 26 días cuidando el vehículo de tu alma. Eso merece gratitud sin condiciones.',
  },

  {
    dia: 27,
    semana: 'EL MAESTRO',
    titulo: 'El Maestro Enseña',
    mantra: 'Estoy listo para ser un ejemplo vivo y coherente de lo que predico.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos en salsa especiada con queso fresco',
        detalle: 'Shakshuka keto: huevos pochados en salsa de tomate especiada + queso fresco.',
      },
      {
        momento: '🕓 16:00 — Comida abundante',
        plato: 'Pollo al ajillo con calabacín',
        detalle: 'Pollo al ajillo con vino blanco seco, ajo y perejil + calabacín a la plancha.',
      },
      {
        momento: '🕖 19:00 — Cena liviana',
        plato: 'Atún en agua con aceitunas y hierbas',
        detalle: 'Atún en agua + aceitunas con hierbas provenzales + queso duro.',
      },
    ],
    respiracion: {
      nombre: '🫁 COHERENCIA CARDÍACA 15 MIN',
      descripcion: 'El maestro entrena especialmente cuando no tiene ganas. La disciplina del maestro no depende del estado emocional del momento ni de las circunstancias externas.',
    },
    habitos: [
      'Compartir algo genuinamente valioso de este proceso con alguien que lo necesite escuchar hoy',
      '15 min de sol',
      'Entrenamiento funcional completo',
      'Escribir qué aprendiste que podrías enseñar a otros de forma concreta',
    ],
    preguntas: [
      '¿Qué aprendí en estos 27 días que es tan valioso y transformador que sería un error imperdonable no compartirlo?',
      '¿A quién podría ayudar de forma concreta con lo que soy y lo que sé, que todavía no estoy haciendo?',
      '¿Estoy listo para ser un ejemplo vivo y coherente de lo que predico, o todavía hay una brecha entre mis palabras y mi vida real?',
    ],
    mensaje: 'El maestro no enseña con palabras. Enseña con coherencia.',
  },

  {
    dia: 28,
    semana: 'EL MAESTRO',
    titulo: 'La Víspera',
    mantra: 'Lo que empieza en mi vida ahora que este proceso está terminando.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs · Día ceremonial',
    comidas: [
      {
        momento: '🕐 12:00 — Desayuno ceremonial',
        plato: 'Lo mejor del protocolo preparado con tiempo, atención y presencia',
        detalle: 'Elegilo y cocinalo con intención. No es lo que comés hoy. Es cómo lo comés.',
      },
      {
        momento: '🕓 16:00 — Almuerzo elegido conscientemente',
        plato: 'El almuerzo favorito de las 4 semanas',
        detalle: 'Almuerzo elegido como acto de honor al proceso completo. Con presencia total.',
      },
      {
        momento: '🕖 19:00 — Cena sin dispositivos',
        plato: 'Caldo de huesos + 2 huevos + reflexión a la mesa',
        detalle: 'Caldo de huesos + 2 huevos. Sin ningún dispositivo. Solo vos y el cierre.',
      },
    ],
    respiracion: {
      nombre: '🫁 SILENCIO PURO',
      descripcion: '20 min de silencio total. Sin técnica, sin guía, sin objetivo medible. Solo estar completamente presente. Dejar que el proceso se asiente en el cuerpo.',
    },
    habitos: [
      'Leer el Manifiesto del Despertar completo en voz alta',
      '20 min al sol',
      'Ordenar el espacio físico como acto simbólico de cierre y comienzo',
      'Escribir sin límite de tiempo ni estructura preestablecida',
    ],
    preguntas: [
      '¿Qué pasa cuando dejo de controlar, optimizar y medir, y simplemente soy sin justificarme?',
      '¿Qué siento al acercarme al final de este proceso: alivio, miedo, tristeza, orgullo, vacío o plenitud?',
      '¿Qué empieza realmente en mi vida ahora que este proceso está a punto de terminar formalmente?',
    ],
    mensaje: 'La víspera de algo grande tiene su propio silencio. Honralo.',
  },

  {
    dia: 29,
    semana: 'EL MAESTRO',
    titulo: 'El Último Esfuerzo',
    mantra: 'Me hago una promesa desde este nuevo nivel que jamás me habría hecho antes.',
    protocolo: 'Ayuno 16:8 · Ventana 12:00–20:00 hs · Penúltimo día',
    comidas: [
      {
        momento: '🕐 12:00 — Romper ayuno',
        plato: 'Huevos al plato con páprika y panceta',
        detalle: 'Huevos al plato con páprika ahumada + panceta crocante + germinados + aceite crudo.',
      },
      {
        momento: '🕓 16:00 — Comida de cierre de ciclo',
        plato: 'La cena que más disfrutaste en este proceso',
        detalle: 'Preparada con intención real de cierre. Con presencia total. Saboreando cada bocado.',
      },
      {
        momento: '🕖 19:00 — Cena liviana de vigilia',
        plato: 'Caldo de huesos y queso',
        detalle: 'Simple y nutritivo. Tu cuerpo ya sabe lo que necesita para mañana.',
      },
    ],
    respiracion: {
      nombre: '🫁 LA TUYA',
      descripcion: 'La respiración que más transformación genuina te generó en estas 4 semanas. Elegirla vos. Ese es el aprendizaje más profundo: saber exactamente qué funciona para uno mismo.',
    },
    habitos: [
      'Entrenamiento de fuerza definitivo de este ciclo: dar el máximo real',
      'Medición completa previa al día 30',
      'Escribir una carta extensa a tu yo del día 1 del Umbral',
      'Dormir temprano con ritual de cierre consciente',
    ],
    preguntas: [
      '¿Qué le diría a esa persona que empezó el Umbral sobre lo que realmente significa este camino y lo que viene después?',
      '¿Qué orgullo genuino siento que ya no puedo negar aunque intente ser humilde o restarle importancia?',
      '¿Qué promesa me hago a mí mismo desde este nuevo nivel que jamás me habría hecho antes porque no me creía capaz?',
    ],
    mensaje: 'Mañana es el día 30. Pero ya sos el que termina. Eso no cambia durmiendo.',
  },

  {
    dia: 30,
    semana: 'EL MAESTRO',
    titulo: 'El Despertar',
    mantra: 'Este no es el final. Es quien soy ahora.',
    protocolo: 'Día libre · Celebrá con consciencia total',
    comidas: [
      {
        momento: '🏆 Desayuno con plena consciencia',
        plato: 'Elegido con total agradecimiento',
        detalle: 'Comé lo que quieras. Ya sabés elegir. Esa es la diferencia entre quien entró al Umbral y quien terminó El Despertar.',
      },
      {
        momento: '🏆 Almuerzo de celebración',
        plato: 'Dentro del protocolo, lo que más disfrutás',
        detalle: 'La celebración real es la coherencia mantenida. 60 días de trabajo merecen una celebración real.',
      },
      {
        momento: '🏆 Cena de cierre',
        plato: 'Con las personas que merecen estar en este momento exacto',
        detalle: 'La última cena del proceso. Con quienes merecen estar. Con presencia absoluta. Sin teléfono.',
      },
    ],
    respiracion: {
      nombre: '🫁 RITUAL DEL DÍA 30',
      descripcion: '20 min de coherencia cardíaca + lectura del Contrato de Identidad + firma del cierre + 10 min de silencio absoluto. Sin apuros. Este momento merece todo el tiempo del mundo.',
    },
    habitos: [
      'Medición final del día 30: todas las variables físicas y emocionales',
      'Fotografía de comparación desde el día 1 del Umbral',
      'Escribir el cierre completo del Despertar sin apuro y sin interrupciones',
      'Compartir el logro solo con quien realmente lo merece y lo va a honrar de verdad',
    ],
    preguntas: [
      '¿Quién soy hoy que no existía ni remotamente el día que empezó el Umbral?',
      '¿Qué sigue? ¿Cuál es el siguiente nivel que ya no puedo ignorar porque lo veo con total claridad?',
      '¿Qué promesa me hago ahora desde este nuevo yo, sabiendo con certeza que ya no puedo pretender que no soy capaz?',
    ],
    mensaje: 'Completaste El Despertar. Ya no sos el que buscaba motivación para arrancar. Sos el que busca profundidad para seguir. Este no es el final. Empieza acá.',
  },
];

const COLORES_SEMANA = {
  'EL RENACER':     '#a78bfa',
  'LA EXPANSIÓN':   '#60a5fa',
  'LA INTEGRACIÓN': '#4ade80',
  'EL MAESTRO':     '#fbbf24',
};

const SEMANA_NUMERO = {
  'EL RENACER': 1,
  'LA EXPANSIÓN': 2,
  'LA INTEGRACIÓN': 3,
  'EL MAESTRO': 4,
};

export default function DespertarDayScreen({ dayNumber, onBack, onMarkComplete }) {
  const dia = DIAS_DESPERTAR.find(d => d.dia === dayNumber) || DIAS_DESPERTAR[0];
  const color = COLORES_SEMANA[dia.semana] || '#a78bfa';
  const [completando, setCompletando] = useState(false);
  const [celebrando,  setCelebrando]  = useState(false);
  const semanaNum = SEMANA_NUMERO[dia.semana] || 1;
  const esNuevoProtocolo = dayNumber >= 14;

  function handleCompletar() {
    setCompletando(true);
    setCelebrando(true);
  }

  function handleContinuar() {
    setCelebrando(false);
    setTimeout(() => onMarkComplete(dayNumber), 300);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: color + '35' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerBadgeRow}>
          <View style={[styles.semanaChip, { backgroundColor: color + '18', borderColor: color + '45' }]}>
            <Text style={[styles.semanaChipTxt, { color }]}>SEMANA {semanaNum} · {dia.semana}</Text>
          </View>
          <View style={[styles.diaChip, { backgroundColor: color + '12', borderColor: color + '30' }]}>
            <Text style={[styles.diaChipTxt, { color }]}>DÍA {dia.dia} / 30</Text>
          </View>
        </View>

        <Text style={styles.titulo}>{dia.titulo.toUpperCase()}</Text>

        <View style={styles.mantraRow}>
          <Text style={[styles.mantraLine, { backgroundColor: color }]} />
          <Text style={styles.mantra}>"{dia.mantra}"</Text>
        </View>
      </View>

      <View style={styles.body}>

        {/* ── PROTOCOLO ─────────────────────────────────────── */}
        <View style={[styles.protocoloBadge, { borderColor: color + '40', backgroundColor: color + '0C' }]}>
          <Text style={styles.protocoloEmoji}>{esNuevoProtocolo ? '⏱️' : '🍽️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.protocoloLabel, { color }]}>PROTOCOLO DEL DÍA</Text>
            <Text style={styles.protocoloTxt}>{dia.protocolo}</Text>
          </View>
          {esNuevoProtocolo && (
            <View style={[styles.ayunoBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
              <Text style={[styles.ayunoBadgeTxt, { color }]}>16:8</Text>
            </View>
          )}
        </View>

        {/* ── ALIMENTACIÓN ──────────────────────────────────── */}
        <View style={styles.seccionCard}>
          <View style={styles.seccionHeaderRow}>
            <Text style={styles.seccionEmoji}>🥩</Text>
            <Text style={[styles.seccionLabel, { color: '#4ade80' }]}>ALIMENTACIÓN</Text>
            <View style={styles.seccionLinea} />
          </View>
          {dia.comidas.map((c, i) => (
            <View key={i} style={[styles.comidaItem, i < dia.comidas.length - 1 && styles.comidaItemBorder]}>
              <Text style={styles.comidaMomento}>{c.momento}</Text>
              <Text style={styles.comidaPlato}>{c.plato}</Text>
              <Text style={styles.comidaDetalle}>{c.detalle}</Text>
            </View>
          ))}
        </View>

        {/* ── RESPIRACIÓN ───────────────────────────────────── */}
        <View style={[styles.practicaCard, { borderLeftColor: '#60a5fa', borderColor: 'rgba(96,165,250,0.15)' }]}>
          <View style={styles.practicaHeaderRow}>
            <Text style={styles.practicaEmoji}>🫁</Text>
            <Text style={[styles.practicaLabel, { color: '#60a5fa' }]}>{dia.respiracion.nombre}</Text>
          </View>
          <Text style={styles.practicaContent}>{dia.respiracion.descripcion}</Text>
        </View>

        {/* ── HÁBITOS ───────────────────────────────────────── */}
        <View style={[styles.practicaCard, { borderLeftColor: '#fbbf24', borderColor: 'rgba(251,191,36,0.15)' }]}>
          <View style={styles.practicaHeaderRow}>
            <Text style={styles.practicaEmoji}>✅</Text>
            <Text style={[styles.practicaLabel, { color: '#fbbf24' }]}>HÁBITOS ESENCIALES</Text>
          </View>
          {dia.habitos.map((h, i) => (
            <View key={i} style={styles.habitoRow}>
              <View style={styles.habitoDot} />
              <Text style={styles.habitoTxt}>{h}</Text>
            </View>
          ))}
        </View>

        {/* ── PREGUNTAS DE PROFUNDIDAD ──────────────────────── */}
        <View style={[styles.preguntasCard, { borderColor: color + '30', backgroundColor: color + '06' }]}>
          <View style={styles.practicaHeaderRow}>
            <Text style={styles.practicaEmoji}>📓</Text>
            <Text style={[styles.practicaLabel, { color }]}>PREGUNTAS DE PROFUNDIDAD</Text>
          </View>
          <Text style={styles.preguntasIntro}>Escribí sin filtros. La respuesta honesta es la que duele un poco.</Text>
          {dia.preguntas.map((p, i) => (
            <View key={i} style={[styles.preguntaItem, { borderLeftColor: color + '60' }]}>
              <Text style={styles.preguntaNumero}>{i + 1}.</Text>
              <Text style={styles.preguntaTxt}>{p}</Text>
            </View>
          ))}
        </View>

        {/* ── MENSAJE ───────────────────────────────────────── */}
        <View style={[styles.mensajeCard, { borderColor: color + '50', backgroundColor: color + '08' }]}>
          <View style={styles.mensajeDeco}>
            <Text style={[styles.mensajeDecoLine, { backgroundColor: color }]} />
            <Text style={[styles.mensajeDecoLine, { backgroundColor: color, opacity: 0.5 }]} />
            <Text style={[styles.mensajeDecoLine, { backgroundColor: color, opacity: 0.25 }]} />
          </View>
          <Text style={[styles.mensajeLabel, { color }]}>💬 MENSAJE DEL DÍA</Text>
          <Text style={styles.mensajeTxt}>"{dia.mensaje}"</Text>
          <Text style={styles.mensajeAutor}>— Diego Gaitán · El Despertar</Text>
        </View>

        {/* ── BOTÓN COMPLETAR ───────────────────────────────── */}
        <TouchableOpacity
          style={[styles.completarBtn, { backgroundColor: color, shadowColor: color }]}
          onPress={handleCompletar}
          activeOpacity={0.88}
          disabled={completando}
        >
          <Text style={styles.completarBtnTxt}>
            {completando ? '✅ Día completado' : `✅ Completar Día ${dia.dia}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerTxt}>Ketoclub · Identidad Atómica · El Despertar</Text>
        <View style={{ height: 48 }} />

      </View>

      <CelebracionModal
        visible={celebrando}
        diaNro={dia.dia}
        color={color}
        onContinuar={handleContinuar}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },

  // Header
  header: {
    backgroundColor: '#130f0a',
    padding: 24,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    marginBottom: 20,
  },
  backText: { color: '#c9a84c', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  headerBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  semanaChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  semanaChipTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  diaChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  diaChipTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  titulo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#f0e6c8',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: 1,
  },
  mantraRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mantraLine: { width: 3, borderRadius: 2, minHeight: 44, marginTop: 2 },
  mantra: { fontSize: 14, color: '#c8bfa8', fontStyle: 'italic', flex: 1, lineHeight: 24 },

  body: { padding: 16 },

  // Protocolo
  protocoloBadge: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  protocoloEmoji: { fontSize: 24 },
  protocoloLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 3 },
  protocoloTxt: { fontSize: 13, color: '#e8e0d0', fontWeight: '600', lineHeight: 20 },
  ayunoBadge: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ayunoBadgeTxt: { fontSize: 11, fontWeight: '900' },

  // Alimentación
  seccionCard: {
    backgroundColor: '#0c160c',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(74,222,128,0.25)',
    padding: 18,
    marginBottom: 12,
  },
  seccionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  seccionEmoji: { fontSize: 20 },
  seccionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  seccionLinea: { flex: 1, height: 1, backgroundColor: 'rgba(74,222,128,0.2)' },
  comidaItem: { paddingVertical: 14 },
  comidaItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(74,222,128,0.12)' },
  comidaMomento: { fontSize: 11, color: '#4ade80', fontWeight: '900', letterSpacing: 0.5, marginBottom: 5 },
  comidaPlato: { fontSize: 16, color: '#f0e6c8', fontWeight: '800', marginBottom: 5 },
  comidaDetalle: { fontSize: 13, color: '#6a8a6a', lineHeight: 20 },

  // Prácticas
  practicaCard: {
    backgroundColor: '#13120f',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  practicaHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  practicaEmoji: { fontSize: 20 },
  practicaLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, flex: 1 },
  practicaContent: { fontSize: 14, color: '#e8e0d0', lineHeight: 24 },

  // Hábitos
  habitoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  habitoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24', marginTop: 7, flexShrink: 0 },
  habitoTxt: { fontSize: 13, color: '#e8e0d0', lineHeight: 20, flex: 1 },

  // Preguntas
  preguntasCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 12,
  },
  preguntasIntro: { fontSize: 12, color: '#6a5a40', fontStyle: 'italic', marginBottom: 16, lineHeight: 18 },
  preguntaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  preguntaNumero: { fontSize: 12, color: '#6a5a40', fontWeight: '900', marginTop: 1, flexShrink: 0 },
  preguntaTxt: { fontSize: 14, color: '#f0e6c8', lineHeight: 22, flex: 1 },

  // Mensaje
  mensajeCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 22,
    marginBottom: 20,
    marginTop: 4,
  },
  mensajeDeco: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  mensajeDecoLine: { width: 24, height: 3, borderRadius: 2 },
  mensajeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  mensajeTxt: { fontSize: 17, color: '#f0e6c8', fontStyle: 'italic', lineHeight: 28, marginBottom: 12 },
  mensajeAutor: { fontSize: 12, color: '#6a5a40', fontWeight: '600' },

  // Completar
  completarBtn: {
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 16,
  },
  completarBtnTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 },

  footerTxt: { textAlign: 'center', fontSize: 11, color: '#2a2218', fontWeight: '700', letterSpacing: 1 },
});
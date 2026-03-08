import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Modal, Dimensions } from 'react-native';

const SEMANAS_COLOR = {
  'EL ARRANQUE':      '#c9a84c',
  'LA ADAPTACIÓN':    '#f97316',
  'LA CONSOLIDACIÓN': '#4ade80',
  'EL CRUCE':         '#60a5fa',
};

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

const CONFETTI_COLORS = ['#c9a84c','#f0e6c8','#4ade80','#60a5fa','#f97316','#fbbf24','#a78bfa','#f43f5e'];

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
            <Text style={celebStyles.iconTxt}>🏆</Text>
          </View>
          <Text style={celebStyles.titulo}>¡DÍA {diaNro} COMPLETADO!</Text>
          <Text style={[celebStyles.subtitulo, { color }]}>Seguís construyendo identidad.</Text>
          <Text style={celebStyles.mensaje}>
            {'Cada día que cumplís tu palabra con vos mismo\nte convierte en alguien diferente.\nEso no te lo saca nadie.'}
          </Text>
          <Text style={celebStyles.firma}>— Diego Gaitán · El Umbral</Text>
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


const DIAS_UMBRAL = [

  // ══════════════════════════════════════════════════════════
  // SEMANA 1 — EL ARRANQUE (Días 1–7)
  // ══════════════════════════════════════════════════════════

  {
    dia: 1, semana: 'EL ARRANQUE', titulo: 'La decisión',
    mantra: 'Hoy no empiezo a hacer. Hoy decido ser.',
    protocolo: '4 comidas · Día de inicio · Keto base',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Café negro + 3 huevos con ghee + palta', detalle: '3 huevos fritos en ghee + palta en rodajas con sal marina. Café negro sin azúcar. Así empieza todo.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo al horno con ensalada verde', detalle: 'Pechuga de pollo al horno con ajo y limón + ensalada verde con oliva. Simple, limpio, efectivo.' },
      { momento: '🕓 Merienda', plato: 'Nueces + 2 cuadraditos de chocolate 85%', detalle: '30g de nueces + 2 cuadraditos de chocolate 85% cacao. Tu primera merienda keto real.' },
      { momento: '🌙 Cena', plato: 'Cerdo a la plancha con zapallitos', detalle: 'Lomo de cerdo a la plancha + zapallitos salteados en ghee con ajo. Liviano y nutritivo.' },
    ],
    respiracion: { nombre: '🫁 COHERENCIA CARDÍACA', descripcion: 'Inhalá 5 seg / exhalá 5 seg durante 5 minutos. Ojos cerrados, manos en el pecho. El primer paso hacia adentro.' },
    habitos: [
      '3L de agua con pizca de sal marina durante el día',
      '10 min de caminata consciente sin teléfono',
      'Escribir en papel por qué empezaste este proceso',
      'Dormir antes de las 23 hs',
    ],
    preguntas: [
      '¿Por qué empiezo hoy y no mañana? ¿Qué cambió?',
      '¿Qué versión de mí quiero ser al final de estos 30 días?',
      '¿Qué excusa usé en el pasado para no empezar y cómo la voy a romper esta vez?',
    ],
    mensaje: 'El día 1 no es el más difícil. El más difícil es el día 2. Y vos ya sabés eso.',
  },

  {
    dia: 2, semana: 'EL ARRANQUE', titulo: 'El hambre real',
    mantra: 'No todo lo que siento como hambre es hambre.',
    protocolo: '4 comidas · Adaptación inicial',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos revueltos con panceta', detalle: '3 huevos revueltos + panceta natural crocante en sartén. En manteca. Contundente desde el arranque.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo con coliflor en arroz', detalle: 'Pollo en trozos salteado con ajo + coliflor procesada tipo arroz. Con oliva. Sin papa, sin arroz real.' },
      { momento: '🕓 Merienda', plato: 'Queso + aceitunas', detalle: 'Queso duro (50g) + aceitunas verdes o negras. Grasa real que sacia.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos + 2 huevos pochados', detalle: 'Caldo de huesos casero + 2 huevos pochados. Reconfortante, nutritivo y liviano.' },
    ],
    respiracion: { nombre: '🫁 4-7-8 BÁSICA', descripcion: 'Inhalá 4 seg por nariz — retenés 7 — exhalás 8 por boca. 5 rondas. Cuando sientas ansiedad por comida, hacé esto primero.' },
    habitos: [
      '10 min de sol temprano',
      'Identificar el momento del día en que más querés comer sin hambre real',
      '3L de agua + sal marina',
      'Sin azúcar, sin harinas, sin excusas',
    ],
    preguntas: [
      '¿Qué emociones estoy confundiendo con hambre?',
      '¿En qué momento del día como por costumbre y no por necesidad real?',
      '¿Qué estoy evitando sentir cuando busco comida fuera de las horas de comida?',
    ],
    mensaje: 'El primer día sin azúcar es una declaración de guerra a los hábitos viejos. Ganaste.',
  },

  {
    dia: 3, semana: 'EL ARRANQUE', titulo: 'El cuerpo se queja',
    mantra: 'Los síntomas de adaptación son señales de que el cambio está ocurriendo.',
    protocolo: '4 comidas · Electrolitos importantes hoy',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos duros + palta + sal marina', detalle: '3 huevos duros + palta entera con sal marina y limón. Simple. El electrolito que más necesitás hoy.' },
      { momento: '🕐 Almuerzo', plato: 'Res a la plancha con ensalada de espinaca', detalle: 'Bife de res a la plancha + ensalada de espinaca con aceite y vinagre. Hierro y grasa en un plato.' },
      { momento: '🕓 Merienda', plato: 'Caldo con sal + nueces', detalle: 'Taza de caldo salado (o agua con sal + limón) + 20g de nueces. Electrolitos urgentes.' },
      { momento: '🌙 Cena', plato: 'Cerdo al horno con brócoli', detalle: 'Chuleta de cerdo al horno + brócoli al vapor con ghee y sal gruesa.' },
    ],
    respiracion: { nombre: '🫁 EXHALACIÓN LARGA', descripcion: '4 seg inhalá — 8 seg exhalá por nariz. 10 minutos continuos. Activa el nervio vago. El cuerpo en adaptación lo necesita.' },
    habitos: [
      'Sal marina en todas las comidas',
      'Extra agua: mínimo 3.5L hoy',
      'Caminata suave 20 min — nada de intensidad',
      'Dormir temprano: el sueño acelera la adaptación',
    ],
    preguntas: [
      '¿Estoy dispuesto a sentirme mal unos días para sentirme bien el resto de mi vida?',
      '¿Qué me dice mi cuerpo con estos síntomas que no me estaba diciendo antes?',
      '¿Cuántas veces en el pasado abandoné algo justo antes de que se pusiera bueno?',
    ],
    mensaje: 'El keto flu no es debilidad. Es tu cuerpo aprendiendo un idioma nuevo.',
  },

  {
    dia: 4, semana: 'EL ARRANQUE', titulo: 'La claridad llega',
    mantra: 'Sin glucosa el cerebro no se apaga. Se enciende.',
    protocolo: '4 comidas · Primer momento de claridad mental',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Tortilla española keto con queso', detalle: 'Tortilla de 3 huevos con cebolla y morrón (sin papa) + queso. En oliva. Clásico y keto.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo entero al horno con vegetales', detalle: 'Pollo al horno con tomillo, ajo y ghee + zapallo y morrón asado. El almuerzo del guerrero.' },
      { momento: '🕓 Merienda', plato: 'Almendras + queso manchego', detalle: '25g de almendras + queso manchego. La merienda que te sostiene hasta la cena.' },
      { momento: '🌙 Cena', plato: 'Huevos revueltos con espinaca', detalle: '3 huevos revueltos con espinaca salteada en ajo y ghee. Liviano y nutritivo para cerrar.' },
    ],
    respiracion: { nombre: '🫁 RESPIRACIÓN CAJA', descripcion: 'Inhalá 4 — retenés 4 — exhalás 4 — retenés 4. 10 ciclos. Usada por fuerzas especiales para mantener calma bajo presión.' },
    habitos: [
      '10 min de sol directo al despertar',
      '10 min de grounding descalzo',
      '30 min de caminata sin teléfono',
      'Magnesio glicinato antes de dormir',
    ],
    preguntas: [
      '¿Noto algún cambio en mi energía o claridad mental hoy comparado al día 1?',
      '¿Qué alimento del que eliminé extraño más y qué emoción está asociada a ese alimento?',
      '¿Qué pasaría en mi vida si tuviera esta claridad mental todos los días?',
    ],
    mensaje: 'Día 4. Si llegaste hasta acá, ya sos diferente al que empezó.',
  },

  {
    dia: 5, semana: 'EL ARRANQUE', titulo: 'La energía diferente',
    mantra: 'Esta no es energía prestada. Es mía.',
    protocolo: '4 comidas · Primer entrenamiento opcional',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos con chorizo colorado y palta', detalle: '3 huevos fritos + chorizo colorado a la plancha + palta. La energía real de la mañana.' },
      { momento: '🕐 Almuerzo', plato: 'Bife de res con ensalada completa', detalle: 'Bife de res a la plancha + ensalada verde completa con oliva y limón. Proteína y grasa.' },
      { momento: '🕓 Merienda', plato: 'Nueces de brasil + chocolate 85%', detalle: '4 nueces de brasil + 2 cuadraditos de chocolate 85%. El snack más inteligente del día.' },
      { momento: '🌙 Cena', plato: 'Pollo a la plancha con coliflor', detalle: 'Pechuga de pollo a la plancha + coliflor al vapor con manteca y sal. Simple y eficiente.' },
    ],
    respiracion: { nombre: '🫁 WIM HOF SUAVE', descripcion: '20 respiraciones profundas lentas + exhalás y retenés afuera 15 seg. 2 rondas. Activa energía real sin necesitar cafeína extra.' },
    habitos: [
      'Ejercicio suave 20-30 min si el cuerpo lo pide',
      '10 min sol',
      'Omega 3 con la comida más grasa del día',
      'Sin pantallas 1 hora antes de dormir',
    ],
    preguntas: [
      '¿Cómo se siente esta energía comparada con la de antes?',
      '¿Qué haría diferente en mi día si tuviera esta energía consistentemente?',
      '¿Estoy haciendo este proceso para verme bien o para ser diferente por dentro?',
    ],
    mensaje: 'Cinco días sin azúcar. Tu páncreas te lo agradece aunque no puedas escucharlo.',
  },

  {
    dia: 6, semana: 'EL ARRANQUE', titulo: 'El primer fin de semana',
    mantra: 'El entorno no decide por mí. Yo decido en cualquier entorno.',
    protocolo: '4 comidas · Estrategia social keto',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Omelette con champiñones y queso', detalle: '3 huevos en omelette + champiñones salteados en ghee + queso. El desayuno del fin de semana sin culpa.' },
      { momento: '🕐 Almuerzo', plato: 'Asado keto: costilla y chorizo sin pan', detalle: 'Costilla de res + chorizos naturales (sin pan). Con ensalada grande. El asado de los que saben.' },
      { momento: '🕓 Merienda', plato: 'Queso + aceitunas + frutos secos', detalle: 'Tabla keto: queso duro + aceitunas + nueces. Para el momento social sin salir del protocolo.' },
      { momento: '🌙 Cena', plato: 'Cerdo al horno con zapallitos y queso', detalle: 'Bondiola al horno + zapallitos con queso derretido encima. Reconfortante.' },
    ],
    respiracion: { nombre: '🫁 GRATITUD RESPIRADA', descripcion: 'Inhalá pensando en algo concreto por lo que sos agradecido, exhalá soltando una preocupación. 8 ciclos lentos.' },
    habitos: [
      'Planear con anticipación qué vas a comer si salís',
      '15 min de sol',
      'Grounding 10 min',
      'Dormir antes de las 23 hs aunque sea fin de semana',
    ],
    preguntas: [
      '¿Cómo manejo la presión social cuando alguien me ofrece algo que no está en el protocolo?',
      '¿Qué dice de mí el hecho de que necesite (o no) la aprobación de otros para cuidarme?',
      '¿Qué estrategia concreta tengo para el próximo evento social?',
    ],
    mensaje: 'El fin de semana es donde la mayoría rompe. Vos no sos la mayoría.',
  },

  {
    dia: 7, semana: 'EL ARRANQUE', titulo: 'Primera semana completada',
    mantra: 'Una semana sin azúcar es más de lo que el 90% hace en un año.',
    protocolo: '4 comidas · Celebración sin salir del protocolo',
    comidas: [
      { momento: '☀️ Desayuno especial', plato: 'Huevos benedictinos keto', detalle: 'Huevos pochados + panceta crocante + salsa de manteca con limón. El desayuno de la victoria.' },
      { momento: '🕐 Almuerzo festivo', plato: 'Tu corte de res favorito a la parrilla', detalle: 'El mejor corte que tengas. A la parrilla. Con chimichurri keto. Celebrá con proteína real.' },
      { momento: '🕓 Merienda', plato: 'Chocolate 85% + café negro', detalle: '3 cuadraditos de chocolate + café negro. El regalo de los 7 días.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos con pollo desmenuzado', detalle: 'Caldo casero + pollo desmenuzado + sal marina. Cierra la semana con calma.' },
    ],
    respiracion: { nombre: '🫁 CIERRE SEMANAL', descripcion: 'Coherencia cardíaca 10 min + 5 min de intenciones escritas para la próxima semana. Consolida lo aprendido.' },
    habitos: [
      'Medición del día 7: peso y cintura',
      '20 min al sol en movimiento',
      '10 min de grounding',
      'Reflexión escrita extensa antes de dormir',
      'Preparar alimentos para la semana siguiente',
    ],
    preguntas: [
      '¿Qué cambió en mí esta semana que nadie más puede ver pero yo siento con claridad?',
      '¿Qué hábito ya no me cuesta tanto y simplemente ocurre como parte de mi día?',
      '¿Estoy haciendo este proceso para demostrarle algo a alguien o genuinamente para mí?',
    ],
    mensaje: 'Semana 1 completada. Tu cuerpo ya usa grasa como combustible. Eso es irreversible.',
  },

  // ══════════════════════════════════════════════════════════
  // SEMANA 2 — LA ADAPTACIÓN (Días 8–14)
  // ══════════════════════════════════════════════════════════

  {
    dia: 8, semana: 'LA ADAPTACIÓN', titulo: 'El cuerpo ya sabe',
    mantra: 'La adaptación no es sufrimiento. Es inteligencia biológica.',
    protocolo: '4 comidas · Cuerpo en cetosis plena',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Café negro + huevos con ghee + palta', detalle: 'La base que funciona. 3 huevos + palta + ghee. Tu cuerpo ya sabe qué hacer con esto.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo al curry con coliflor', detalle: 'Pollo en trozos con curry suave y leche de coco + coliflor. Diferente y delicioso.' },
      { momento: '🕓 Merienda', plato: 'Kefir natural + nueces', detalle: 'Kefir sin azúcar + 20g de nueces. Tu microbioma te lo agradece.' },
      { momento: '🌙 Cena', plato: 'Bife de res con espárragos', detalle: 'Bife a la plancha + espárragos grillados con manteca y ajo. Proteína completa.' },
    ],
    respiracion: { nombre: '🫁 VISUALIZACIÓN', descripcion: '5 min coherencia cardíaca + 10 min de imagen mental de tu cuerpo en su mejor versión. Velo, sentilo, olelo. Activás la corteza prefrontal.' },
    habitos: [
      'Movilidad articular 15 min: rodillas, caderas, hombros',
      '10 min sol al despertar',
      '3L agua + electrolitos',
      'Escribir 3 intenciones antes de tocar el teléfono',
    ],
    preguntas: [
      '¿Qué diferencia noto en mi cuerpo entre el día 1 y hoy?',
      '¿Cómo cambió mi relación con el hambre estas últimas semanas?',
      '¿Qué me dice eso sobre mi relación con la comida en general?',
    ],
    mensaje: 'Semana 2. Ya no sos un principiante. Sos alguien en proceso real.',
  },

  {
    dia: 9, semana: 'LA ADAPTACIÓN', titulo: 'La fuerza funcional',
    mantra: 'Me muevo porque me cuido. No porque me castigo.',
    protocolo: '4 comidas · Día de movimiento',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos con panceta y queso', detalle: '3 huevos + panceta crocante + queso fundido encima. Pre-movimiento con grasa y proteína.' },
      { momento: '🕐 Almuerzo', plato: 'Carne picada de res con vegetales', detalle: 'Carne picada de res con ajo, cebolla y morrón + zapallitos grillados. Post-entreno real.' },
      { momento: '🕓 Merienda', plato: 'Almendras tostadas + chocolate', detalle: '30g de almendras + chocolate 85%. La energía de la tarde sin picos de glucosa.' },
      { momento: '🌙 Cena', plato: 'Pollo a la plancha con brócoli', detalle: 'Pollo a la plancha + brócoli al vapor con ghee. Liviano para recuperación nocturna.' },
    ],
    respiracion: { nombre: '🫁 RESPIRACIÓN PRE-EJERCICIO', descripcion: '10 respiraciones profundas lentas + 5 rápidas activadoras. Prepara el sistema nervioso para moverse con intención.' },
    habitos: [
      'Entrenamiento 30-35 min: sentadillas, plancha, estocadas, remo',
      'Caminata 30 min separada del entrenamiento',
      'Colágeno + vitamina C post-ejercicio',
      'Hidratación constante',
    ],
    preguntas: [
      '¿Me muevo desde el castigo o desde el cuidado genuino?',
      '¿Qué limitación física llevo tiempo ignorando?',
      '¿Cuándo fue la última vez que me moví por pura alegría?',
    ],
    mensaje: 'El ejercicio en cetosis es diferente. La grasa es un combustible limpio y constante.',
  },

  {
    dia: 10, semana: 'LA ADAPTACIÓN', titulo: 'Los patrones mentales',
    mantra: 'No soy mis pensamientos. Soy quien los observa.',
    protocolo: '4 comidas · Día de observación interna',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Tortilla de huevos con cebolla y morrón', detalle: 'Tortilla de 4 huevos con cebolla y morrón en oliva. El desayuno que te piensa.' },
      { momento: '🕐 Almuerzo', plato: 'Cerdo deshilachado con aguacate', detalle: 'Cerdo cocido lento y deshilachado con especias + aguacate en rodajas. Abundante y saciante.' },
      { momento: '🕓 Merienda', plato: 'Queso crema + pepinos en rodajas', detalle: 'Queso crema + pepinos con sal marina. Refrescante y keto perfecto.' },
      { momento: '🌙 Cena', plato: 'Sopa de pollo casera', detalle: 'Caldo de pollo con apio, zanahoria y trozos de pollo. La sopa que sana desde adentro.' },
    ],
    respiracion: { nombre: '🫁 AUTOOBSERVACIÓN', descripcion: '10 min respiración + escribir en tiempo real los pensamientos que aparecen sin juzgarlos. Pura observación. Metacognición real.' },
    habitos: [
      'Identificar 1 patrón mental automático que se repite hoy',
      '10 min sol',
      'Lectura 20 min antes de dormir (no redes)',
      'Sin cafeína después de las 14 hs',
    ],
    preguntas: [
      '¿Qué historia me cuento sobre mí mismo que limita mi potencial real?',
      '¿Qué patrón de pensamiento se repite en mi vida sin que yo lo haya elegido conscientemente?',
      '¿De dónde viene ese patrón y a quién le pertenece realmente?',
    ],
    mensaje: 'Día 10. Dos semanas sin azúcar cambian más el cerebro que diez años de motivación.',
  },

  {
    dia: 11, semana: 'LA ADAPTACIÓN', titulo: 'El sueño como herramienta',
    mantra: 'El descanso no es pereza. Es parte del trabajo.',
    protocolo: '4 comidas · Protocolo de sueño profundo',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos revueltos con champiñones', detalle: '3 huevos + champiñones salteados en ghee con tomillo. Desayuno de alta densidad nutricional.' },
      { momento: '🕐 Almuerzo', plato: 'Bife de res con puré de coliflor', detalle: 'Bife de res a la plancha + puré de coliflor con ghee y sal. Reconfortante y completo.' },
      { momento: '🕓 Merienda', plato: 'Nueces + infusión sin azúcar', detalle: '30g de nueces + té verde o manzanilla. Sin cafeína si es después de las 14.' },
      { momento: '🌙 Cena temprana (antes 20hs)', plato: 'Pollo con vegetales suaves', detalle: 'Pollo a la plancha + vegetales al vapor. Cena liviana y temprana para dormir profundo.' },
    ],
    respiracion: { nombre: '🫁 PROTOCOLO PRE-SUEÑO', descripcion: '4-7-8 por 5 minutos + oscuridad total + temperatura fresca + magnesio glicinato. Sin luz azul 90 min antes. El sueño es el pilar invisible.' },
    habitos: [
      'Exposición a sol antes de las 9 AM (regula melatonina)',
      'Sin cafeína después de las 13:30 hs',
      'Cena antes de las 20 hs',
      'Escribir 3 cosas positivas antes de apagar la luz',
      'Temperatura fresca al dormir',
    ],
    preguntas: [
      '¿Cuántas horas realmente duermo y qué costo tiene eso en quién soy de día?',
      '¿Qué hábito nocturno sabotea mi sueño y por qué sigo eligiéndolo?',
      '¿Qué pensamiento me roba el sueño con más frecuencia?',
    ],
    mensaje: 'Sin recuperación profunda no hay transformación sostenible. El sueño no es tiempo perdido.',
  },

  {
    dia: 12, semana: 'LA ADAPTACIÓN', titulo: 'Las relaciones y la comida',
    mantra: 'Mi cuidado no depende de la aprobación de nadie.',
    protocolo: '4 comidas · Día de consciencia social',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos con palta y sal marina', detalle: '3 huevos + palta entera. La base de todos los días. Simple y perfecto.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo al horno para compartir', detalle: 'Pollo entero al horno con limón y hierbas. Si podés, cocinalo para alguien. La salud se comparte.' },
      { momento: '🕓 Merienda', plato: 'Queso manchego + aceitunas', detalle: 'Queso manchego + aceitunas con hierbas. La merienda que podés llevar a cualquier lado.' },
      { momento: '🌙 Cena', plato: 'Cerdo al horno con brócoli y queso', detalle: 'Lomo de cerdo al horno + brócoli gratinado con queso. Comfort food keto.' },
    ],
    respiracion: { nombre: '🫁 RESPIRACIÓN DE CONEXIÓN', descripcion: 'Coherencia cardíaca 5 min enviando intencionalmente aprecio a alguien. Activa oxitocina y conexión real. Con o sin esa persona presente.' },
    habitos: [
      'Llamar a alguien importante solo para preguntar cómo está',
      'Sol 15 min',
      'Ejercicio suave 20 min',
      'Escribir sobre una relación que querés mejorar',
    ],
    preguntas: [
      '¿Mis vínculos más cercanos apoyan mi proceso o me hacen más difícil sostenerlo?',
      '¿Uso la comida como forma de conectar con otros cuando no sé cómo conectar de otra manera?',
      '¿Qué pasaría en mis relaciones si me cuidara completamente sin disculparme?',
    ],
    mensaje: 'Cuidarte no es egoísmo. Es el requisito para cuidar a otros con algo real.',
  },

  {
    dia: 13, semana: 'LA ADAPTACIÓN', titulo: 'La disciplina sin esfuerzo',
    mantra: 'La disciplina que se siente como esfuerzo todavía no es identidad.',
    protocolo: '4 comidas · Día de observación de hábitos',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Revuelto de huevos con chorizo', detalle: '3 huevos revueltos + chorizo colorado desmenuzado en sartén. Sin cereales, sin pan.' },
      { momento: '🕐 Almuerzo', plato: 'Milanesa de res al horno con ensalada', detalle: 'Milanesa de res horneada (huevo + queso, sin pan rallado) + ensalada completa.' },
      { momento: '🕓 Merienda', plato: 'Palta entera con limón', detalle: 'Una palta entera. Con sal y limón. Sin más. Pura grasa antiinflamatoria.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos reconfortante', detalle: 'Caldo de huesos casero con sal marina y hierbas. Para cerrar el día con minerales reales.' },
    ],
    respiracion: { nombre: '🫁 COHERENCIA CARDÍACA PROFUNDA', descripcion: '10 min de 5-5 (inhalá 5 / exhalá 5) con foco en el corazón y una emoción de aprecio genuino. Estado óptimo de rendimiento.' },
    habitos: [
      'Identificar 1 hábito que ya no requiere esfuerzo consciente',
      '10 min grounding',
      'Movilidad articular 15 min',
      'Cena temprana',
    ],
    preguntas: [
      '¿Qué hábito de las últimas 2 semanas ya ocurre de forma automática?',
      '¿Qué me dice eso sobre cómo se forma la identidad real?',
      '¿Cuándo empecé a elegirme porque quiero y no porque debo?',
    ],
    mensaje: 'Cuando algo deja de costarte, ya es parte de quién sos.',
  },

  {
    dia: 14, semana: 'LA ADAPTACIÓN', titulo: 'Dos semanas. El punto de no retorno.',
    mantra: 'Ya no soy quien empezó. Soy quien llegó hasta acá.',
    protocolo: '4 comidas · Medición estratégica del día 14',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Desayuno especial del día 14', detalle: 'El desayuno que más te gustó de las últimas 2 semanas. Preparalo con atención.' },
      { momento: '🕐 Almuerzo', plato: 'Costillas de cerdo al horno con ensalada', detalle: 'Costillitas de cerdo al horno con especias + ensalada verde grande con oliva.' },
      { momento: '🕓 Merienda', plato: 'Nueces + queso duro', detalle: 'Nueces + queso. Los clásicos que funcionan.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos + huevos pochados', detalle: 'Caldo casero + 2 huevos pochados. Cierra las 2 semanas con minerales y proteína.' },
    ],
    respiracion: { nombre: '🫁 REVISIÓN DE 2 SEMANAS', descripcion: 'Coherencia cardíaca 10 min + revisión escrita completa de las 2 semanas. ¿Qué cambió? ¿Qué necesito ajustar?' },
    habitos: [
      'Medición del día 14: peso, cintura, cadera, energía y sueño',
      '20 min al sol',
      'Reflexión extensa antes de dormir',
      'Preparar plan alimenticio semana 3',
    ],
    preguntas: [
      '¿En qué crecí en estas 2 semanas que no tiene nada que ver con los números?',
      '¿Qué hábito nuevo me está costando más y por qué?',
      '¿Estoy siendo completamente honesto conmigo en este proceso?',
    ],
    mensaje: 'Día 14. La mitad. Ya sos cetoadaptado. Ya sos diferente. Ya no hay vuelta.',
  },

  // ══════════════════════════════════════════════════════════
  // SEMANA 3 — LA CONSOLIDACIÓN (Días 15–21)
  // ══════════════════════════════════════════════════════════

  {
    dia: 15, semana: 'LA CONSOLIDACIÓN', titulo: 'Los hábitos se consolidan',
    mantra: 'Lo que practico con consistencia se convierte en quien soy.',
    protocolo: '4 comidas · Semana de consolidación',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos escalfados con espinaca y ajo', detalle: 'Huevos escalfados + espinaca salteada en ajo + aceite de oliva. Elegante y nutritivo.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo con zoodles y salsa de tomate', detalle: 'Fettuccini de calabacín con pollo desmenuzado + salsa de tomate casera + parmesano.' },
      { momento: '🕓 Merienda', plato: 'Kefir + semillas de lino', detalle: 'Kefir natural + semillas de lino. Microbioma y omega 3 en un solo snack.' },
      { momento: '🌙 Cena', plato: 'Bife de res con ensalada de rúcula', detalle: 'Bife a la plancha + rúcula con parmesano y oliva cruda. El clásico que no falla.' },
    ],
    respiracion: { nombre: '🫁 AFIRMACIONES DE IDENTIDAD', descripcion: '5 min respiración + decir en voz alta 5 afirmaciones en presente desde el ser: "Soy alguien que..." Activa identidad a nivel neurológico.' },
    habitos: [
      'Escribir quién sos hoy comparado con el día 1 en términos concretos',
      '15 min sol',
      'Ejercicio de fuerza 35 min',
      'Grounding 10 min',
    ],
    preguntas: [
      '¿Quién soy cuando nadie me mira y no hay recompensa externa posible?',
      '¿Qué valores dicen guiar mi vida y cuáles realmente lo hacen?',
      '¿Mi vida exterior empieza a reflejar lo que estoy construyendo internamente?',
    ],
    mensaje: 'Semana 3. Lo que practicaste comienza a ser quién sos, no lo que hacés.',
  },

  {
    dia: 16, semana: 'LA CONSOLIDACIÓN', titulo: 'El cuerpo como aliado',
    mantra: 'Mi cuerpo no es mi enemigo. Es el vehículo de todo lo que soy.',
    protocolo: '4 comidas · Día de conexión corporal',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Leche de coco caliente + colágeno + nueces', detalle: 'Bowl keto: leche de coco caliente + colágeno hidrolizado + canela + nueces tostadas.' },
      { momento: '🕐 Almuerzo', plato: 'Res con chimichurri y vegetales asados', detalle: 'Tiras de res asada + chimichurri de hierbas + vegetales asados. El almuerzo del guerrero.' },
      { momento: '🕓 Merienda', plato: 'Té verde matcha + almendras', detalle: 'Té verde matcha (L-teanina + cafeína natural) + almendras. Enfoque sin ansiedad.' },
      { momento: '🌙 Cena', plato: 'Cerdo con champiñones y queso', detalle: 'Medallones de cerdo + champiñones salteados en manteca + queso derretido.' },
    ],
    respiracion: { nombre: '🫁 ESCANEO CORPORAL', descripcion: '15 min tumbado recorriendo cada parte del cuerpo conscientemente de pies a cabeza. Sin juzgar. Solo sentir con atención.' },
    habitos: [
      'Automasaje de pies y manos con aceite de coco',
      'Caminata suave 40 min',
      'Baño caliente antes de dormir',
      'Sin pantallas 2 horas antes de apagar la luz',
    ],
    preguntas: [
      '¿Dónde guarda mi cuerpo el estrés que no proceso con palabras?',
      '¿Me relaciono con mi cuerpo como aliado o como algo que hay que someter?',
      '¿Qué cambio físico noto que me sorprende?',
    ],
    mensaje: 'Tu cuerpo está cambiando desde adentro. Los números son solo el reflejo.',
  },

  {
    dia: 17, semana: 'LA CONSOLIDACIÓN', titulo: 'La gratitud activa',
    mantra: 'La gratitud no es pasividad. Es el combustible más poderoso.',
    protocolo: '4 comidas · Día de gratitud profunda',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos al plato con pimentón y ghee', detalle: '3 huevos al plato con pimentón ahumado + ghee. El desayuno que agradece el día.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo tikka keto con coliflor en arroz', detalle: 'Pollo con especias tikka + leche de coco + coliflor procesada. Diferente y memorable.' },
      { momento: '🕓 Merienda', plato: 'Palta + atún en agua', detalle: 'Palta abierta + atún en agua bien escurrido con limón. Omega 3 y grasa en un plato.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos + 2 huevos + espinaca', detalle: 'Caldo de huesos + 2 huevos + espinaca fresca + sal marina. Cena de recuperación.' },
    ],
    respiracion: { nombre: '🫁 GRATITUD RESPIRADA', descripcion: 'Por cada exhalación, nombrá mentalmente 1 cosa concreta por la que sos genuinamente agradecido. 10 minutos. Cambia la química del sistema nervioso.' },
    habitos: [
      'Escribir 10 cosas concretas de gratitud (no las de siempre)',
      'Hacer algo por alguien sin esperar retorno',
      '20 min sol',
      'Ejercicio suave 20 min',
    ],
    preguntas: [
      '¿Tengo hoy algo que una vez pedí con desesperación y ahora doy por sentado?',
      '¿Cuánto tiempo paso quejándome versus valorando lo que tengo?',
      '¿Estoy viendo los cambios reales o solo buscando los que faltan?',
    ],
    mensaje: 'Tenés 17 días de hábitos que antes no tenías. Eso es abundancia real.',
  },

  {
    dia: 18, semana: 'LA CONSOLIDACIÓN', titulo: 'El movimiento como meditación',
    mantra: 'Mi cuerpo en movimiento es mi mente en paz.',
    protocolo: '4 comidas · Día de movimiento consciente',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos rancheros keto', detalle: 'Huevos pochados + salsa roja casera + aguacate + queso fresco. El desayuno activo.' },
      { momento: '🕐 Almuerzo (post-entreno)', plato: 'Bife de res con espinaca a la crema', detalle: 'Bife de res + espinaca a la crema con queso. Post-entreno premium.' },
      { momento: '🕓 Merienda', plato: 'Nueces de brasil + chocolate 85%', detalle: '4 nueces de brasil + 2 cuadraditos de chocolate. El snack que cuida el cerebro.' },
      { momento: '🌙 Cena', plato: 'Caldo de pollo con vegetales', detalle: 'Caldo casero de pollo con apio, zanahoria y sal. Recuperación nocturna real.' },
    ],
    respiracion: { nombre: '🫁 COORDINACIÓN MOVIMIENTO-RESPIRACIÓN', descripcion: 'Coordiná cada respiración con cada movimiento del ejercicio. Inhalá en el esfuerzo, exhalá en la relajación. Movimiento como meditación.' },
    habitos: [
      'Entrenamiento de fuerza completo: 4 series por ejercicio',
      '10 min sol temprano',
      'Colágeno + omega 3 + vitamina D',
      'Caminar 30 min separado del entrenamiento',
    ],
    preguntas: [
      '¿Me muevo desde el castigo o desde la celebración de lo que mi cuerpo puede hacer?',
      '¿Cuándo fue la última vez que me moví simplemente por la alegría de moverme?',
      '¿Qué tipo de movimiento me da energía en lugar de quitármela?',
    ],
    mensaje: 'El ejercicio en cetosis es diferente. Tenés combustible infinito.',
  },

  {
    dia: 19, semana: 'LA CONSOLIDACIÓN', titulo: 'La mente entrenada',
    mantra: 'El cuerpo no va más allá de donde la mente lo permite.',
    protocolo: '4 comidas · Día de entrenamiento mental',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Revuelto de huevos con panceta y germinados', detalle: 'Huevos revueltos + panceta crocante + germinados frescos + oliva cruda.' },
      { momento: '🕐 Almuerzo', plato: 'Cerdo al horno con puré de coliflor', detalle: 'Lomo de cerdo al horno con mostaza + puré de coliflor con ghee. El clásico del proceso.' },
      { momento: '🕓 Merienda', plato: 'Queso de cabra + tomate cherry + oliva', detalle: 'Queso de cabra + tomate cherry + oliva virgen. Mediterráneo y keto.' },
      { momento: '🌙 Cena', plato: 'Pollo a la plancha con aguacate', detalle: 'Pollo a la plancha + aguacate en rodajas con limón. Liviano y completo.' },
    ],
    respiracion: { nombre: '🫁 COHERENCIA CARDÍACA EXTENDIDA', descripcion: '15 min de 5-5 con foco en el corazón y aprecio genuino. Estado óptimo de rendimiento mental y emocional.' },
    habitos: [
      'Aprendé algo completamente nuevo hoy',
      'Lectura de desarrollo personal 20 min',
      'Sin redes sociales por 3 horas',
      'Dormir antes de las 22:30 hs',
    ],
    preguntas: [
      '¿Cuánto tiempo dedico deliberadamente a entrenar mi mente como entreno mi cuerpo?',
      '¿Qué creencia limitante sobre mí mismo me gustaría reemplazar definitivamente?',
      '¿Si mi mente fuera un músculo, en qué nivel de condición estaría hoy?',
    ],
    mensaje: 'Día 19. Tu cerebro funciona diferente sin glucosa. Usalo.',
  },

  {
    dia: 20, semana: 'LA CONSOLIDACIÓN', titulo: 'El límite que creías tener',
    mantra: 'El límite de ayer es el punto de partida de hoy.',
    protocolo: '4 comidas · Día de reto personal',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Café negro + huevos + palta', detalle: 'La base sólida antes de ir a buscar el límite. 3 huevos + palta. Simple y efectivo.' },
      { momento: '🕐 Almuerzo', plato: 'Costillas de cerdo a la parrilla', detalle: 'Costillitas de cerdo a la parrilla con chimichurri + ensalada verde. El almuerzo del que no se rinde.' },
      { momento: '🕓 Merienda', plato: 'Nueces + 2 cuadraditos chocolate 85%', detalle: 'La merienda de los 20 días. Te la ganaste.' },
      { momento: '🌙 Cena', plato: 'Pollo desmenuzado con espinaca salteada', detalle: 'Pollo desmenuzado salteado + espinaca con ajo y ghee. Para recuperar el esfuerzo del día.' },
    ],
    respiracion: { nombre: '🫁 BAJO PRESIÓN', descripcion: '4 rondas Wim Hof suave + retención en exhala 20 seg. Entrena a la mente para tolerar incomodidad sin colapsar. Sin negociar.' },
    habitos: [
      'Hacé algo que te incomode y hacelo de todas formas',
      'Ducha fría 30 seg al final como práctica de tolerancia voluntaria',
      'Entrenamiento de fuerza al límite real',
      'Escribir cómo se siente elegir la incomodidad',
    ],
    preguntas: [
      '¿Cuál es el próximo límite que quiero cruzar y qué me frena?',
      '¿Qué huyo sistemáticamente que sé exactamente que me haría crecer?',
      '¿Cuándo fue la última vez que me sorprendí a mí mismo?',
    ],
    mensaje: 'Vinte días. Ya sos otro. El límite que tenías el día 1 ya no existe.',
  },

  {
    dia: 21, semana: 'LA CONSOLIDACIÓN', titulo: 'La mitad del Umbral',
    mantra: 'Ya no busco motivación para arrancar. Busco profundidad para seguir.',
    protocolo: '4 comidas · Día libre dentro del protocolo · Celebración',
    comidas: [
      { momento: '☀️ Desayuno festivo', plato: 'El desayuno que más disfrutaste del proceso', detalle: 'Elegilo vos. Cualquier combo del proceso. Te lo ganaste con 21 días de coherencia.' },
      { momento: '🕐 Festín del día 21', plato: 'Tu corte o plato favorito de estas 3 semanas', detalle: 'El favorito. Con ensalada grande. Disfrutalo con presencia total. Sin culpa.' },
      { momento: '🕓 Merienda', plato: 'Tu elección dentro del protocolo', detalle: 'Lo que quieras dentro del protocolo. Confiás en vos para elegir.' },
      { momento: '🌙 Cena consciente', plato: 'Lo que el cuerpo pida dentro del protocolo', detalle: 'Ya sabés escuchar tu cuerpo. La celebración real es la coherencia mantenida.' },
    ],
    respiracion: { nombre: '🫁 RITUAL DEL DÍA 21', descripcion: '20 min de respiración libre + reflexión escrita del proceso hasta acá. La ciencia dice que un hábito tarda 21 días. Hoy es ese día.' },
    habitos: [
      'Tiempo de reflexión sin interrupciones ni dispositivos',
      'Compartir el proceso con alguien que lo merece escuchar',
      'Medición del día 21',
      'Celebrar sin abandonar el protocolo',
    ],
    preguntas: [
      '¿Soy la misma persona que empezó el día 1?',
      '¿Qué le diría con honestidad a alguien que está dudando si este proceso vale la pena?',
      '¿Qué parte de mí todavía resiste y a qué tiene miedo esa parte?',
    ],
    mensaje: '21 días. La ciencia del hábito dice que ya sos otro. Y vos lo sabés.',
  },

  // ══════════════════════════════════════════════════════════
  // SEMANA 4 — EL CRUCE (Días 22–30)
  // ══════════════════════════════════════════════════════════

  {
    dia: 22, semana: 'EL CRUCE', titulo: 'La autoridad personal',
    mantra: 'Cumplo mis compromisos cuando nadie me ve.',
    protocolo: '4 comidas · Semana del cruce final',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Bife de res + 2 huevos + palta', detalle: 'Bife de res + 2 huevos fritos en ghee + palta. La comida del que ya cruzó.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo confitado con ensalada amarga', detalle: 'Muslo de pollo confitado en su propia grasa + escarola con vinagreta de mostaza.' },
      { momento: '🕓 Merienda', plato: 'Almendras + té verde matcha', detalle: 'Almendras crudas + té matcha. Enfoque para el sprint final.' },
      { momento: '🌙 Cena', plato: 'Caldo de huesos denso + espinaca', detalle: 'Caldo de huesos + espinaca fresca + sal marina. El ritual nocturno del maestro.' },
    ],
    respiracion: { nombre: '🫁 DECLARACIÓN EN VOZ ALTA', descripcion: '10 min coherencia cardíaca + decir frente al espejo 3 compromisos para los últimos 8 días. La voz activa el compromiso a otro nivel.' },
    habitos: [
      'Releer el compromiso que escribiste el día 1',
      '15 min sol',
      'Ejercicio funcional 35 min',
      'Grounding 10 min',
    ],
    preguntas: [
      '¿Cumplo mis compromisos cuando nadie me ve y nadie me va a aplaudir?',
      '¿Dónde estoy cediendo autoridad sobre mi vida a opiniones que no merecen ese poder?',
      '¿Qué decisión importante llevo tiempo postergando que solo yo puedo tomar?',
    ],
    mensaje: 'Semana 4. El maestro no busca perfección. Busca coherencia. Día tras día.',
  },

  {
    dia: 23, semana: 'EL CRUCE', titulo: 'La simpleza que funciona',
    mantra: 'La consistencia de lo simple supera la intensidad de lo complejo.',
    protocolo: '4 comidas · Día de minimalismo poderoso',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos duros + palta + sal marina', detalle: 'Huevos duros + palta. Lo más simple que funciona. Sin adornos. Sin complicaciones.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo a la plancha con vegetales al vapor', detalle: 'Pollo a la plancha + los vegetales que tengas al vapor. Keto sin receta.' },
      { momento: '🕓 Merienda', plato: 'Queso + aceitunas', detalle: 'Queso + aceitunas. Los dos ingredientes que nunca fallan.' },
      { momento: '🌙 Cena', plato: 'Caldo salado + huevo pochado', detalle: 'Caldo con sal marina + 1 huevo pochado. La cena más simple y más nutritiva.' },
    ],
    respiracion: { nombre: '🫁 MINIMALISTA', descripcion: '5 minutos de 4-4-6 al despertar. Nada más. La consistencia de lo simple supera la intensidad de lo complejo que no se sostiene.' },
    habitos: [
      'Simplificar un aspecto de tu vida hoy: compromisos, apps, objetos',
      'Eliminar algo que ocupa espacio sin aportar valor',
      'Caminata 40 min',
      'Dormir antes de las 22:30',
    ],
    preguntas: [
      '¿Dónde estoy complicando lo que debería ser simple?',
      '¿Qué tengo en mi vida que ya no necesito pero no me animo a soltar?',
      '¿Dónde pongo energía que no me retorna nada que valga?',
    ],
    mensaje: 'Los últimos 8 días. La recta final no pide más esfuerzo. Pide más presencia.',
  },

  {
    dia: 24, semana: 'EL CRUCE', titulo: 'El legado que construís',
    mantra: 'Lo que construyo hoy va a importar en 20 años.',
    protocolo: '4 comidas · Día de visión a largo plazo',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Omelette con queso y hierbas', detalle: 'Omelette de 3 huevos con queso + hierbas frescas. Preparado con calma y atención.' },
      { momento: '🕐 Almuerzo', plato: 'Cerdo con berenjena ahumada', detalle: 'Chuletas de cerdo a la parrilla + puré de berenjena ahumada con ajo. Memorable.' },
      { momento: '🕓 Merienda', plato: 'Nueces + queso brie', detalle: 'Nueces + queso brie o camembert + infusión. La merienda del que piensa a largo plazo.' },
      { momento: '🌙 Cena', plato: 'Atún en agua con tomate y oliva', detalle: 'Atún en agua escurrido + tomate en rodajas + oliva virgen. Omega 3 para cerrar el día.' },
    ],
    respiracion: { nombre: '🫁 MEDITACIÓN DE LEGADO', descripcion: '15 min de silencio + visualizar con claridad qué construís hoy que va a importar. Los hábitos de hoy son el legado de mañana.' },
    habitos: [
      'Escribir una carta a tu yo de dentro de 5 años',
      '10 min sol',
      'Movilidad articular 15 min',
      'Escribir qué aprendiste que podrías compartir',
    ],
    preguntas: [
      '¿Qué quiero que digan de mí más allá de los logros materiales?',
      '¿Qué estoy construyendo hoy que va a importar dentro de 20 años?',
      '¿Los hábitos que construí en estos 24 días son el tipo de base que deja legado?',
    ],
    mensaje: 'Los hábitos que construís en 30 días son los cimientos de quien serás en 10 años.',
  },

  {
    dia: 25, semana: 'EL CRUCE', titulo: 'La resistencia mental',
    mantra: 'Elijo la incomodidad como herramienta consciente.',
    protocolo: '4 comidas · Día de reto final de resistencia',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Bife de res + huevo frito + tomate asado', detalle: 'Bife de res + huevo en ghee + tomate asado. La comida de los últimos 5 días.' },
      { momento: '🕐 Almuerzo', plato: 'Cerdo estofado con vegetales keto', detalle: 'Cerdo estofado lento con cebolla, ajo y morrón + puré de coliflor. Reconfortante.' },
      { momento: '🕓 Merienda', plato: 'Queso duro + aceitunas + nueces', detalle: 'La tabla keto de los 25 días. Confianza total en lo que funciona.' },
      { momento: '🌙 Cena', plato: 'Pollo con coliflor y especias suaves', detalle: 'Pollo con especias suaves + coliflor en trozos. Liviano y digestivo.' },
    ],
    respiracion: { nombre: '🫁 WIM HOF COMPLETO', descripcion: '30 respiraciones profundas + exhalás y retenés afuera 30 seg. 3 rondas. La práctica más intensa hasta ahora. Hacela.' },
    habitos: [
      'Ducha fría completa hoy — no solo 30 seg',
      'Entrenamiento al máximo real',
      'Hacer algo que incomode y completarlo sin negociar',
      'Escribir cómo se siente el día 25',
    ],
    preguntas: [
      '¿Huyo de la incomodidad como supervivencia automática o la busco como herramienta?',
      '¿Qué evito sistemáticamente que sé que me haría crecer?',
      '¿Qué diferencia hay entre sufrir inútilmente y crecer a través del esfuerzo voluntario?',
    ],
    mensaje: 'Cinco días para cruzar el umbral definitivamente.',
  },

  {
    dia: 26, semana: 'EL CRUCE', titulo: 'La gratitud por el cuerpo',
    mantra: 'Mi cuerpo trabajó 26 días por mí. Le debo gratitud real.',
    protocolo: '4 comidas · Día de agradecimiento corporal',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos con germinados y oliva', detalle: 'Huevos al plato + germinados frescos + aceite de oliva crudo en hilo. Vivo y nutritivo.' },
      { momento: '🕐 Almuerzo', plato: 'Res guisada con vegetales keto', detalle: 'Carne de res guisada con cebolla, ajo y morrón. El guiso que no inflamá.' },
      { momento: '🕓 Merienda', plato: 'Kefir + frutos secos', detalle: 'Kefir sin azúcar + frutos secos variados. Microbioma y gratitud.' },
      { momento: '🌙 Cena', plato: 'Cerdo a la plancha con ensalada fresca', detalle: 'Cerdo liviano + ensalada verde. Cena de agradecimiento.' },
    ],
    respiracion: { nombre: '🫁 ESCANEO DE GRATITUD CORPORAL', descripcion: '15 min recorriendo el cuerpo con aprecio genuino. Cada órgano que trabaja sin pedirte permiso. La práctica más poderosa.' },
    habitos: [
      'Agradecer al cuerpo en voz alta y en privado',
      'Masaje o automasaje consciente',
      'Caminata 30 min en silencio total',
      'Sueño prioritario esta noche',
    ],
    preguntas: [
      '¿Qué le exigí a mi cuerpo sin agradecerle lo que hace?',
      '¿Cuánto tiempo pasé en guerra con mi cuerpo cuando es el vehículo de todo lo que soy?',
      '¿Qué cambio irreversible noto en mi relación con el cuerpo en estos 26 días?',
    ],
    mensaje: 'Tu cuerpo procesó 26 días de hábitos nuevos sin quejarse. Eso merece gratitud sin condiciones.',
  },

  {
    dia: 27, semana: 'EL CRUCE', titulo: 'El maestro enseña',
    mantra: 'Estoy listo para ser el ejemplo vivo de lo que predico.',
    protocolo: '4 comidas · Día de compartir y servir',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Shakshuka keto', detalle: 'Huevos pochados en salsa de tomate especiada + queso fresco. El desayuno del que enseña.' },
      { momento: '🕐 Almuerzo', plato: 'Pollo al ajillo con calabacín', detalle: 'Pollo al ajillo con vino blanco seco, ajo y perejil + calabacín a la plancha.' },
      { momento: '🕓 Merienda', plato: 'Queso duro + nueces + aceitunas', detalle: 'La tabla del maestro. Simple y poderosa.' },
      { momento: '🌙 Cena', plato: 'Caldo de pollo reconfortante', detalle: 'Caldo casero de pollo con hierbas. Para los últimos 3 días.' },
    ],
    respiracion: { nombre: '🫁 COHERENCIA CARDÍACA 15 MIN', descripcion: 'El maestro entrena especialmente cuando no tiene ganas. La disciplina no depende del estado emocional del momento.' },
    habitos: [
      'Compartir algo valioso del proceso con alguien que lo necesite',
      '15 min sol',
      'Entrenamiento funcional completo',
      'Escribir qué aprendiste que podrías enseñar',
    ],
    preguntas: [
      '¿Qué aprendí en estos 27 días que sería imperdonable no compartir?',
      '¿A quién podría ayudar con lo que ahora sé y soy?',
      '¿Hay brecha entre lo que digo que soy y lo que realmente hago?',
    ],
    mensaje: 'El maestro no enseña con palabras. Enseña con coherencia.',
  },

  {
    dia: 28, semana: 'EL CRUCE', titulo: 'La víspera del cruce',
    mantra: 'Estoy a 2 días de cruzar el umbral definitivamente.',
    protocolo: '4 comidas · Día ceremonial de cierre',
    comidas: [
      { momento: '🕐 Desayuno ceremonial', plato: 'Lo mejor del proceso preparado con atención', detalle: 'Elegilo y cocinalo con intención. No es lo que comés. Es cómo lo comés.' },
      { momento: '🕓 Almuerzo elegido', plato: 'El almuerzo favorito de las 4 semanas', detalle: 'Como acto de honor al proceso. Con presencia total.' },
      { momento: '🕕 Merienda', plato: 'La que más disfrutaste en estas 4 semanas', detalle: 'Un tributo a los 28 días de coherencia.' },
      { momento: '🌙 Cena sin dispositivos', plato: 'Caldo de huesos + 2 huevos', detalle: 'Sin ningún dispositivo. Solo vos, el caldo y la reflexión.' },
    ],
    respiracion: { nombre: '🫁 SILENCIO PURO', descripcion: '20 min de silencio total. Sin técnica, sin guía. Solo estar presente y dejar que el proceso se asiente en el cuerpo.' },
    habitos: [
      'Leer el compromiso del día 1 en voz alta',
      '20 min al sol',
      'Ordenar el espacio como acto simbólico de cierre',
      'Escribir sin límite de tiempo',
    ],
    preguntas: [
      '¿Qué pasa cuando dejo de controlar y simplemente soy?',
      '¿Qué siento al acercarme al final: alivio, orgullo, vacío o plenitud?',
      '¿Qué empieza en mi vida cuando este proceso termina?',
    ],
    mensaje: 'La víspera de algo grande tiene su propio silencio. Honralo.',
  },

  {
    dia: 29, semana: 'EL CRUCE', titulo: 'El último esfuerzo',
    mantra: 'Me hago una promesa desde este nuevo nivel que jamás me habría hecho antes.',
    protocolo: '4 comidas · Penúltimo día · Máximo esfuerzo',
    comidas: [
      { momento: '☀️ Desayuno', plato: 'Huevos al plato con páprika y panceta', detalle: 'Huevos al plato con páprika ahumada + panceta crocante + germinados + aceite crudo.' },
      { momento: '🕐 Almuerzo', plato: 'La comida más sabrosa del proceso', detalle: 'Preparada con intención de cierre. Saboreando cada bocado.' },
      { momento: '🕓 Merienda', plato: 'Nueces + chocolate 85%', detalle: 'Los mismos de siempre. La consistencia que genera resultados.' },
      { momento: '🌙 Cena', plato: 'Caldo simple y nutritivo', detalle: 'Liviano para los últimas horas antes del cruce definitivo.' },
    ],
    respiracion: { nombre: '🫁 LA TUYA', descripcion: 'La respiración que más transformación te generó en estas 4 semanas. Elegirla vos. Ese es el aprendizaje más profundo: saber qué funciona para uno mismo.' },
    habitos: [
      'Entrenamiento de fuerza definitivo: dar el máximo real',
      'Medición completa previa al día 30',
      'Escribir una carta a tu yo del día 1',
      'Dormir temprano con ritual de cierre',
    ],
    preguntas: [
      '¿Qué le diría a esa persona que empezó el día 1?',
      '¿Qué orgullo genuino siento que ya no puedo negar?',
      '¿Qué promesa me hago a mí mismo desde este nuevo nivel?',
    ],
    mensaje: 'Mañana cruzás el umbral. Pero ya sos el que cruza. Eso no cambia durmiendo.',
  },

  {
    dia: 30, semana: 'EL CRUCE', titulo: 'El cruce',
    mantra: 'Crucé el umbral. Ya no soy quien empezó.',
    protocolo: 'Día libre · Celebrá con consciencia total',
    comidas: [
      { momento: '🏆 Desayuno con plena consciencia', plato: 'Elegido con total agradecimiento', detalle: 'Comé lo que quieras. Ya sabés elegir. Esa es la diferencia entre quien empezó y quien cruzó.' },
      { momento: '🏆 Almuerzo de celebración', plato: 'Tu comida favorita de los 30 días', detalle: '30 días de trabajo merecen una celebración real. Sin culpa, con presencia.' },
      { momento: '🏆 Cena de cierre', plato: 'Con las personas que merecen este momento', detalle: 'La última cena del proceso. Con quienes lo merecen. Sin teléfono. Solo presencia.' },
    ],
    respiracion: { nombre: '🫁 RITUAL DEL DÍA 30', descripcion: '20 min de coherencia cardíaca + lectura del compromiso del día 1 + firma del cierre + 10 min de silencio absoluto. Este momento merece todo el tiempo del mundo.' },
    habitos: [
      'Medición final del día 30: todas las variables',
      'Fotografía de comparación desde el día 1',
      'Escribir el cierre completo sin apuro',
      'Compartir el logro con quien realmente lo honrará',
    ],
    preguntas: [
      '¿Quién soy hoy que no existía el día que empecé?',
      '¿Qué sigue? ¿Cuál es el siguiente nivel?',
      '¿Qué promesa me hago ahora sabiendo que soy capaz?',
    ],
    mensaje: 'Cruzaste el Umbral. Ya no sos quien buscaba motivación para arrancar. Sos quien sabe que puede. Esto no termina acá. Empieza acá.',
  },
];

export default function UmbralDayScreen({ dayNumber, onBack, onMarkComplete }) {
  const dia   = DIAS_UMBRAL.find(d => d.dia === dayNumber) || DIAS_UMBRAL[0];
  const color = SEMANAS_COLOR[dia.semana] || '#c9a84c';
  const [completando, setCompletando] = useState(false);
  const [celebrando,  setCelebrando]  = useState(false);

  const SEMANA_NUMERO = {
    'EL ARRANQUE': 1, 'LA ADAPTACIÓN': 2,
    'LA CONSOLIDACIÓN': 3, 'EL CRUCE': 4,
  };
  const semanaNum = SEMANA_NUMERO[dia.semana] || 1;

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

      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: color + '35' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.badgesRow}>
          <View style={[styles.semanaChip, { backgroundColor: color + '18', borderColor: color + '45' }]}>
            <Text style={[styles.semanaChipTxt, { color }]}>SEMANA {semanaNum} · {dia.semana}</Text>
          </View>
          <View style={[styles.diaChip, { backgroundColor: color + '12', borderColor: color + '30' }]}>
            <Text style={[styles.diaChipTxt, { color }]}>DÍA {dia.dia} / 30</Text>
          </View>
        </View>

        <Text style={styles.titulo}>{dia.titulo.toUpperCase()}</Text>

        <View style={styles.mantraRow}>
          <View style={[styles.mantraBar, { backgroundColor: color }]} />
          <Text style={styles.mantra}>"{dia.mantra}"</Text>
        </View>
      </View>

      <View style={styles.body}>

        {/* ── PROTOCOLO ── */}
        <View style={[styles.protocolo, { borderColor: color + '40', backgroundColor: color + '0C' }]}>
          <Text style={styles.protocoloEmoji}>🍽️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.protocoloLabel, { color }]}>PROTOCOLO DEL DÍA</Text>
            <Text style={styles.protocoloTxt}>{dia.protocolo}</Text>
          </View>
        </View>

        {/* ── ALIMENTACIÓN ── */}
        <View style={styles.alimentCard}>
          <View style={styles.seccionRow}>
            <Text style={styles.seccionEmoji}>🥩</Text>
            <Text style={[styles.seccionLabel, { color: '#4ade80' }]}>ALIMENTACIÓN</Text>
            <View style={styles.seccionLinea} />
          </View>
          {dia.comidas.map((c, i) => (
            <View key={i} style={[styles.comidaItem, i < dia.comidas.length - 1 && styles.comidaBorder]}>
              <Text style={styles.comidaMomento}>{c.momento}</Text>
              <Text style={styles.comidaPlato}>{c.plato}</Text>
              <Text style={styles.comidaDetalle}>{c.detalle}</Text>
            </View>
          ))}
        </View>

        {/* ── RESPIRACIÓN ── */}
        <View style={[styles.pracCard, { borderLeftColor: '#60a5fa', borderColor: 'rgba(96,165,250,0.15)' }]}>
          <View style={styles.pracRow}>
            <Text style={styles.pracEmoji}>🫁</Text>
            <Text style={[styles.pracLabel, { color: '#60a5fa' }]}>{dia.respiracion.nombre}</Text>
          </View>
          <Text style={styles.pracContent}>{dia.respiracion.descripcion}</Text>
        </View>

        {/* ── HÁBITOS ── */}
        <View style={[styles.pracCard, { borderLeftColor: '#fbbf24', borderColor: 'rgba(251,191,36,0.15)' }]}>
          <View style={styles.pracRow}>
            <Text style={styles.pracEmoji}>✅</Text>
            <Text style={[styles.pracLabel, { color: '#fbbf24' }]}>HÁBITOS ESENCIALES</Text>
          </View>
          {dia.habitos.map((h, i) => (
            <View key={i} style={styles.habitoRow}>
              <View style={styles.habitoDot} />
              <Text style={styles.habitoTxt}>{h}</Text>
            </View>
          ))}
        </View>

        {/* ── PREGUNTAS ── */}
        <View style={[styles.preguntasCard, { borderColor: color + '30', backgroundColor: color + '06' }]}>
          <View style={styles.pracRow}>
            <Text style={styles.pracEmoji}>📓</Text>
            <Text style={[styles.pracLabel, { color }]}>PREGUNTAS DE PROFUNDIDAD</Text>
          </View>
          <Text style={styles.preguntasIntro}>Escribí sin filtros. La respuesta honesta es la que duele un poco.</Text>
          {dia.preguntas.map((p, i) => (
            <View key={i} style={[styles.preguntaItem, { borderLeftColor: color + '60' }]}>
              <Text style={styles.preguntaNum}>{i + 1}.</Text>
              <Text style={styles.preguntaTxt}>{p}</Text>
            </View>
          ))}
        </View>

        {/* ── MENSAJE ── */}
        <View style={[styles.mensajeCard, { borderColor: color + '50', backgroundColor: color + '08' }]}>
          <View style={styles.mensajeDeco}>
            <View style={[styles.mensajeDecoBar, { backgroundColor: color }]} />
            <View style={[styles.mensajeDecoBar, { backgroundColor: color, opacity: 0.5 }]} />
            <View style={[styles.mensajeDecoBar, { backgroundColor: color, opacity: 0.25 }]} />
          </View>
          <Text style={[styles.mensajeLabel, { color }]}>💬 MENSAJE DEL DÍA</Text>
          <Text style={styles.mensajeTxt}>"{dia.mensaje}"</Text>
          <Text style={styles.mensajeAutor}>— Diego Gaitán · El Umbral</Text>
        </View>

        {/* ── BOTÓN COMPLETAR ── */}
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

        <Text style={styles.footer}>Ketoclub · Identidad Atómica · El Umbral</Text>
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
  header: {
    backgroundColor: '#130f0a', padding: 24, paddingTop: 56,
    borderBottomWidth: 1,
  },
  backBtn: {
    alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 20,
  },
  backTxt: { color: '#c9a84c', fontWeight: '900', fontSize: 12 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  semanaChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  semanaChipTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  diaChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  diaChipTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  titulo: { fontSize: 30, fontWeight: '900', color: '#f0e6c8', marginBottom: 16, letterSpacing: 1 },
  mantraRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mantraBar: { width: 3, borderRadius: 2, minHeight: 42, marginTop: 2 },
  mantra: { fontSize: 14, color: '#c8bfa8', fontStyle: 'italic', flex: 1, lineHeight: 24 },

  body: { padding: 16 },

  // Protocolo
  protocolo: {
    borderRadius: 16, borderWidth: 1.5, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  protocoloEmoji: { fontSize: 24 },
  protocoloLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 3 },
  protocoloTxt: { fontSize: 13, color: '#e8e0d0', fontWeight: '600', lineHeight: 20 },

  // Alimentación
  alimentCard: {
    backgroundColor: '#0c160c', borderRadius: 18,
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.25)',
    padding: 18, marginBottom: 12,
  },
  seccionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  seccionEmoji: { fontSize: 20 },
  seccionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  seccionLinea: { flex: 1, height: 1, backgroundColor: 'rgba(74,222,128,0.2)' },
  comidaItem: { paddingVertical: 14 },
  comidaBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(74,222,128,0.1)' },
  comidaMomento: { fontSize: 11, color: '#4ade80', fontWeight: '900', letterSpacing: 0.5, marginBottom: 5 },
  comidaPlato: { fontSize: 16, color: '#f0e6c8', fontWeight: '800', marginBottom: 5 },
  comidaDetalle: { fontSize: 13, color: '#6a8a6a', lineHeight: 20 },

  // Prácticas
  pracCard: {
    backgroundColor: '#13120f', borderRadius: 16,
    padding: 18, marginBottom: 12,
    borderWidth: 1, borderLeftWidth: 3,
  },
  pracRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  pracEmoji: { fontSize: 20 },
  pracLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, flex: 1 },
  pracContent: { fontSize: 14, color: '#e8e0d0', lineHeight: 24 },
  habitoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  habitoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24', marginTop: 7, flexShrink: 0 },
  habitoTxt: { fontSize: 13, color: '#e8e0d0', lineHeight: 20, flex: 1 },

  // Preguntas
  preguntasCard: { borderRadius: 18, borderWidth: 1.5, padding: 18, marginBottom: 12 },
  preguntasIntro: { fontSize: 12, color: '#6a5a40', fontStyle: 'italic', marginBottom: 16, lineHeight: 18 },
  preguntaItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 16, paddingLeft: 12, borderLeftWidth: 2,
  },
  preguntaNum: { fontSize: 12, color: '#6a5a40', fontWeight: '900', marginTop: 1, flexShrink: 0 },
  preguntaTxt: { fontSize: 14, color: '#f0e6c8', lineHeight: 22, flex: 1 },

  // Mensaje
  mensajeCard: { borderRadius: 18, borderWidth: 1.5, padding: 22, marginBottom: 20, marginTop: 4 },
  mensajeDeco: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  mensajeDecoBar: { width: 24, height: 3, borderRadius: 2 },
  mensajeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  mensajeTxt: { fontSize: 17, color: '#f0e6c8', fontStyle: 'italic', lineHeight: 28, marginBottom: 12 },
  mensajeAutor: { fontSize: 12, color: '#6a5a40', fontWeight: '600' },

  // Completar
  completarBtn: {
    borderRadius: 18, paddingVertical: 20, alignItems: 'center',
    shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 8, marginBottom: 16,
  },
  completarBtnTxt: { color: '#0a0a0c', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 },
  footer: { textAlign: 'center', fontSize: 11, color: '#2a2218', fontWeight: '700', letterSpacing: 1 },
});
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const CATEGORIAS = [
  {
    id: 'peliculas',
    nombre: 'Películas',
    icono: '🎬',
    color: '#f97316',
    desc: 'Documentales y films que expanden la consciencia',
    items: [
      { titulo: 'Heal — El poder de sanar', desc: 'Científicos y maestros espirituales revelan cómo la mente sana el cuerpo.', url: 'https://youtu.be/xAJkyA7cwxU?si=iIXJ7RW86Wrdoj70' },
      { titulo: 'The Game Changers', desc: 'Atletas de élite transforman su rendimiento con nutrición consciente.', url: 'https://youtu.be/gTUToI6fnuU?si=bGWBFbNJRrOl-yaY' },
      { titulo: 'Food, Inc.', desc: 'La verdad detrás de la industria alimentaria que nadie te contó.', url: 'https://youtu.be/SSa_rHYyjYQ?si=0bQhQAU0xTd1WXp2' },
      { titulo: 'Forks Over Knives', desc: 'La conexión entre lo que comés y las enfermedades crónicas.', url: 'https://youtu.be/2JF9LmQCS0w?si=Jggi55VCf6YxVw4T' },
      { titulo: 'Fat, Sick & Nearly Dead', desc: 'Un hombre recorre América transformando su salud a través del ayuno.', url: 'https://youtu.be/wVVdILEF_xU?si=uuI6knDQtlNOfZxC' },
    ],
  },
  {
    id: 'documentales',
    nombre: 'Documentales',
    icono: '📽️',
    color: '#a78bfa',
    desc: 'Ciencia, ayuno y longevidad al más alto nivel',
    items: [
      { titulo: 'La Píldora Mágica — Keto Documentary', desc: 'Cómo la dieta cetogénica está cambiando vidas en todo el mundo.', url: 'https://youtu.be/Pw00YS0Jkdc?si=VfBLHcToZBfKWlLn' },
      { titulo: 'The Science of Fasting', desc: 'Científicos europeos revelan el poder transformador del ayuno.', url: 'https://youtu.be/lP7iJf3Tgn8?si=EITOyPnKKeW-sjYO' },
      { titulo: 'Sugar: The Bitter Truth', desc: 'El Dr. Robert Lustig expone la verdad sobre el azúcar. Legendario.', url: 'https://youtu.be/4B8Q-v6L0hk?si=DmtaK-idBfjH3iNx' },
      { titulo: 'Stress: Portrait of a Killer', desc: 'National Geographic sobre cómo el estrés destruye el cuerpo.', url: 'https://youtu.be/eewIp4WXNnM?si=eBoqfe7CVUG4DcbV' },
      { titulo: 'Wim Hof — El Hombre de Hielo', desc: 'El método Wim Hof y el control del cuerpo con la mente.', url: 'https://youtu.be/Op4puiLZ3Fs?si=9jy8w0kDY0LVTE5t' },
      { titulo: 'Fantastic Fungi', desc: 'El reino de los hongos y su conexión con la consciencia humana.', url: 'https://youtu.be/afReSuL5X2U?si=8-j-piPtn3RwP5xS' },
    ],
  },
  {
    id: 'podcasts',
    nombre: 'Podcasts',
    icono: '🎙️',
    color: '#4ade80',
    desc: 'Las mentes más brillantes en salud y mentalidad',
    items: [
      { titulo: 'Huberman Lab — Ayuno y Metabolismo', desc: 'Andrew Huberman explica la neurociencia del ayuno intermitente.', url: 'https://youtu.be/ZL4d0FjvrAo?si=bby5jQcsfCcTU18_' },
      { titulo: 'Peter Attia — Longevidad y Keto', desc: 'El médico más influyente en longevidad habla de cetosis y vida larga.', url: 'https://youtu.be/P_Xa2oGm60M?si=y99Tgw7akPBomtdj' },
      { titulo: 'Dr. Jason Fung — El Código de la Obesidad', desc: 'Por qué el ayuno intermitente es la solución que nadie te dijo.', url: 'https://youtu.be/CtO2t1uUejA?si=AhLAaT8JrYOf_R45' },
      { titulo: 'Rhonda Patrick — Nutrición y Genes', desc: 'Bioquímica, nutrición y genética aplicada a tu vida cotidiana.', url: 'https://youtu.be/eJ5FtV1212o?si=HEToplHYG3-FuJjB' },
      { titulo: 'Carlos Jaramillo — Metabolismo TV', desc: 'El médico colombiano más influyente en nutrición funcional.', url: 'https://youtu.be/UNwvSkA4WRI?si=cKdY1jn1iJMgvzc1' },
      { titulo: 'David Goggins — No Pueden Lastimarte', desc: 'El ex Navy SEAL más duro del mundo. Te rompe y te reconstruye.', url: 'https://youtu.be/HdfHr4R186Y?si=GJCxDj61wj1povt7' },
      { titulo: 'Jay Shetty — Propósito y Mentalidad', desc: 'Propósito, identidad y vida consciente. Millones de oyentes.', url: 'https://youtu.be/xglk9-FYePI?si=QBppyu3elUwHlLCI' },
      { titulo: 'Jim Kwik — Cerebro Sin Límites', desc: 'Aprendizaje acelerado, memoria y rendimiento mental máximo.', url: 'https://youtu.be/lW8hssoDvq8?si=xd9mqP9bcLaCZ_Tp' },
      { titulo: 'Tom Bilyeu — Teoría del Impacto', desc: 'Mentalidad, identidad y transformación personal profunda.', url: 'https://youtu.be/JW1ctKADcV4?si=Yb5dJ935h_CoHrR9' },
      { titulo: 'Steven Bartlett — Diario de un CEO', desc: 'Las mentes más brillantes del mundo comparten su camino real.', url: 'https://youtu.be/ZFrm4ffI7NQ?si=OMeh2arkzvp-mt_S' },
    ],
  },
  {
    id: 'musica',
    nombre: 'Frecuencias',
    icono: '🎵',
    color: '#60a5fa',
    desc: 'Música medicina que sana el cuerpo y la mente',
    items: [
      { titulo: '432 Hz — Reparación del ADN', desc: 'La frecuencia de la naturaleza. Alivia el estrés y regenera a nivel celular.', url: 'https://youtu.be/Y2Y7n4v2kAA?si=Wte4h_YFN3PnVt_t' },
      { titulo: '528 Hz — Frecuencia del Amor', desc: 'Conocida como la frecuencia milagrosa. Transformación y regeneración.', url: 'https://youtu.be/pvIHbamz08g?si=9dTT54Ze5LRwayl3' },
      { titulo: '396 Hz — Liberar el Miedo y la Culpa', desc: 'Disuelve el miedo, la culpa y los bloqueos energéticos profundos.', url: 'https://youtu.be/Pclv31cDTTc?si=YK4kMliNcx6FqJgH' },
      { titulo: '417 Hz — Deshacer Situaciones Negativas', desc: 'Facilita el cambio profundo y elimina bloqueos del pasado.', url: 'https://youtu.be/UiEgt0-XAJ8?si=gbtl_IfiejX0ij2D' },
      { titulo: '639 Hz — Conexión y Relaciones', desc: 'Armoniza las relaciones interpersonales y abre el corazón.', url: 'https://youtu.be/h-XSA405U90?si=xfCAd16x7PGfXERl' },
      { titulo: '741 Hz — Limpieza y Despertar', desc: 'Desintoxica el cuerpo y despierta la intuición profunda.', url: 'https://youtu.be/W9jEfeYe7EU?si=mzax0H4v75gXqCMd' },
      { titulo: '852 Hz — Despertar Espiritual', desc: 'Eleva la frecuencia vibracional y expande la consciencia.', url: 'https://youtu.be/xjDfT0nWPVo?si=d2A4vKVYhnsuqSQz' },
      { titulo: '963 Hz — Conexión Divina', desc: 'La frecuencia de la iluminación. Conecta con la fuente universal.', url: 'https://youtu.be/4s3uheDMRl0?si=Ioo4_yQkk0pb5xe1' },
      { titulo: 'Ondas Theta — Meditación Profunda', desc: 'Estado mental de creatividad, intuición y sanación máxima.', url: 'https://youtu.be/JRE8M7__Szc?si=H_sk39g_G_f3oK5k' },
      { titulo: 'Ondas Delta — Sueño Regenerador', desc: 'Regeneración máxima durante el sueño. Ideal para dormir profundo.', url: 'https://youtu.be/TTJocSxM7jk?si=ypDNNKfM9VELFgUV' },
      { titulo: 'Ondas Alpha — Relajación y Foco', desc: 'Estado de calma y concentración. Perfecto para trabajar o journaling.', url: 'https://youtu.be/HvLNje4aC6c?si=5LLaha2ArThTzJgz' },
      { titulo: 'Binaural Beats — Claridad Mental', desc: 'Frecuencias diseñadas para optimizar el rendimiento cognitivo.', url: 'https://youtu.be/OzNk1C4C1f0?si=3DTNCgTnEnCEjllM' },
    ],
  },
  {
    id: 'audiolibros',
    nombre: 'Audiolibros',
    icono: '📖',
    color: '#fbbf24',
    desc: 'Los libros que cambian vidas — en audio',
    items: [
      { titulo: 'Hábitos Atómicos — James Clear', desc: 'La base de Ketoclub. Pequeños cambios, resultados extraordinarios.', url: 'https://youtu.be/TgT0lS6VdkQ?si=b8cQbaJ7FGpNGqeB' },
      { titulo: 'El Poder del Ahora — Eckhart Tolle', desc: 'La presencia como herramienta de transformación espiritual profunda.', url: 'https://youtu.be/uBAV1sxXonU?si=W98rRoSXX75DTD_o' },
      { titulo: 'No Pueden Lastimarte — David Goggins', desc: 'El hombre más duro del mundo te enseña a dominar tu mente.', url: 'https://youtu.be/-MKCNIeZ5RI?si=EYsubFFEFyxiwWEk' },
      { titulo: 'La Biología de la Creencia — Bruce Lipton', desc: 'Cómo tus pensamientos afectan tu ADN y tu salud a nivel celular.', url: 'https://youtu.be/1QsBeYUww_A?si=GbUQzb7n_Kw9KUeT' },
      { titulo: 'Ikigai — García & Miralles', desc: 'El propósito de vida japonés que te da razones para despertar cada día.', url: 'https://youtu.be/t_b61CKYS9Y?si=RLL-MiKxsanSMpHt' },
      { titulo: 'El Hombre en Busca de Sentido — Frankl', desc: 'Viktor Frankl sobrevive al Holocausto y descubre la fuerza del propósito.', url: 'https://youtu.be/WG6qq3RC44I?si=81r7GFAEebI1T6m6' },
      { titulo: 'Lifespan — David Sinclair', desc: 'El científico de Harvard que explica cómo revertir el envejecimiento.', url: 'https://youtu.be/0oKdmP1n5vI?si=0iDFjcDghPDWWvAL' },
    ],
  },
];

async function abrirLink(url, titulo) {
  try {
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Error', `No se pudo abrir "${titulo}". Verificá tu conexión.`);
  }
}

export default function BibliotecaScreen({ onBack }) {
  const [categoriaActiva, setCategoriaActiva] = useState('peliculas');
  const [expandido, setExpandido] = useState(null);

  const categoria = CATEGORIAS.find(c => c.id === categoriaActiva);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · CONOCIMIENTO</Text>
        <Text style={styles.headerTitle}>📚 Biblioteca</Text>
        <Text style={styles.headerSub}>Contenido que transforma · Curado por Diego Gaitán</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIAS.map(cat => {
          const activa = categoriaActiva === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => { setCategoriaActiva(cat.id); setExpandido(null); }}
              style={[styles.tab, activa && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.tabIcon}>{cat.icono}</Text>
              <Text style={[styles.tabLabel, activa && { color: cat.color }]}>{cat.nombre}</Text>
              {activa && <View style={[styles.tabDot, { backgroundColor: cat.color }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        <View style={[styles.catBanner, { borderColor: categoria.color + '40', backgroundColor: categoria.color + '10' }]}>
          <Text style={styles.catBannerIcon}>{categoria.icono}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.catBannerNombre, { color: categoria.color }]}>{categoria.nombre}</Text>
            <Text style={styles.catBannerDesc}>{categoria.desc}</Text>
          </View>
          <View style={[styles.catCount, { backgroundColor: categoria.color + '20', borderColor: categoria.color + '40' }]}>
            <Text style={[styles.catCountNum, { color: categoria.color }]}>{categoria.items.length}</Text>
            <Text style={[styles.catCountLabel, { color: categoria.color + '99' }]}>items</Text>
          </View>
        </View>

        {categoria.items.map((item, i) => {
          const abierto = expandido === i;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandido(abierto ? null : i); }}
              activeOpacity={0.9}
              style={[
                styles.itemCard,
                abierto && { borderColor: categoria.color + '60', backgroundColor: categoria.color + '08' },
              ]}
            >
              <View style={styles.itemTop}>
                <View style={[styles.itemNumBox, { backgroundColor: categoria.color + '18', borderColor: categoria.color + '30' }]}>
                  <Text style={[styles.itemNum, { color: categoria.color }]}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitulo}>{item.titulo}</Text>
                  <View style={styles.itemPlatRow}>
                    <Text style={styles.itemPlatIcon}>▶️</Text>
                    <Text style={[styles.itemPlatLabel, { color: '#f97316' }]}>YouTube</Text>
                  </View>
                </View>
                <View style={[styles.chevronBox, abierto && { backgroundColor: categoria.color + '20', borderColor: categoria.color + '40' }]}>
                  <Text style={[styles.chevron, { color: abierto ? categoria.color : '#4a3a20' }]}>
                    {abierto ? '▲' : '▼'}
                  </Text>
                </View>
              </View>

              {abierto && (
                <View style={styles.itemBody}>
                  <View style={[styles.itemDescBox, { borderLeftColor: categoria.color }]}>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.itemBtn, { backgroundColor: categoria.color }]}
                    onPress={() => abrirLink(item.url, item.titulo)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.itemBtnIcon}>▶️</Text>
                    <Text style={styles.itemBtnText}>Ver en YouTube</Text>
                    <Text style={styles.itemBtnArrow}>→</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>✨ Ketoclub · Diego Gaitán</Text>
          <View style={styles.footerLine} />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: { backgroundColor: '#1a1508', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)' },
  backBtn: { marginBottom: 14, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#2a2010', alignSelf: 'flex-start' },
  backText: { color: '#c9a84c', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  headerSobre: { fontSize: 10, color: '#4a3a20', fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
  headerTitle: { fontSize: 36, fontWeight: '900', color: '#f0e6c8', marginBottom: 4 },
  headerSub: { fontSize: 12, color: '#6a5a40' },
  tabsScroll: { backgroundColor: '#0f0f0a', borderBottomWidth: 1, borderBottomColor: '#1a1a14', maxHeight: 64 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#13120f', borderWidth: 1.5, borderColor: '#2a2010' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontWeight: '800', color: '#4a3a20' },
  tabDot: { position: 'absolute', bottom: -4, left: '50%', width: 4, height: 4, borderRadius: 2, marginLeft: -2 },
  body: { flex: 1, padding: 16 },
  catBanner: { borderRadius: 18, borderWidth: 1.5, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  catBannerIcon: { fontSize: 34 },
  catBannerNombre: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
  catBannerDesc: { fontSize: 12, color: '#6a5a40', lineHeight: 18 },
  catCount: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 52 },
  catCountNum: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  catCountLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  itemCard: { backgroundColor: '#13120f', borderRadius: 16, borderWidth: 1.5, borderColor: '#2a2010', padding: 16, marginBottom: 10 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemNumBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemNum: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  itemTitulo: { fontSize: 14, fontWeight: '800', color: '#f0e6c8', marginBottom: 5, lineHeight: 20 },
  itemPlatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemPlatIcon: { fontSize: 11 },
  itemPlatLabel: { fontSize: 11, fontWeight: '700' },
  chevronBox: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#2a2010', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chevron: { fontSize: 10, fontWeight: '900' },
  itemBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1e1e18' },
  itemDescBox: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 14 },
  itemDesc: { fontSize: 13, color: '#c8bfa8', lineHeight: 21 },
  itemBtn: { borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  itemBtnIcon: { fontSize: 14 },
  itemBtnText: { color: '#0a0a0c', fontWeight: '900', fontSize: 14 },
  itemBtnArrow: { color: '#0a0a0c', fontWeight: '900', fontSize: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, marginTop: 8 },
  footerLine: { flex: 1, height: 1, backgroundColor: '#1a1a14' },
  footerText: { fontSize: 11, color: '#2a2010', letterSpacing: 1, fontWeight: '700' },
});
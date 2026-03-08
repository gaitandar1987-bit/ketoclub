import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const CATEGORIAS = ['Todas', 'Desayunos', 'Almuerzos', 'Cenas', 'Snacks', 'Postres', 'Bebidas'];

const RECETAS = [
  // DESAYUNOS
  {
    id:1, categoria:'Desayunos', icon:'🥚', nombre:'Huevos revueltos con manteca y hierbas',
    tiempo:'10 min', dificultad:'Fácil', calorias:'320 kcal',
    macros:{ proteina:'18g', grasa:'26g', carbos:'1g' },
    ingredientes:['3 huevos', '1 cda ghee o manteca', 'Sal y pimienta', 'Cebollín o perejil fresco', 'Opcional: queso rallado'],
    pasos:['Batí los huevos con sal y pimienta.','Calentá el ghee en sartén a fuego medio-bajo.','Agregá los huevos y revolvé suavemente con espátula.','Retirá antes de que se sequen del todo.','Terminá con hierbas y queso si usás.'],
  },
  {
    id:2, categoria:'Desayunos', icon:'🥑', nombre:'Tostada de coliflor con palta',
    tiempo:'20 min', dificultad:'Media', calorias:'280 kcal',
    macros:{ proteina:'9g', grasa:'22g', carbos:'5g' },
    ingredientes:['1 taza coliflor rallada', '1 huevo', '2 cdas queso rallado', '½ palta', 'Sal, pimienta y limón'],
    pasos:['Rallá la coliflor y mezclá con huevo, queso, sal y pimienta.','Formá una "tostada" y cociná en sartén con aceite 5 min por lado.','Aplastá la palta con limón, sal y pimienta.','Esparcí la palta sobre la tostada y serví.'],
  },
  {
    id:3, categoria:'Desayunos', icon:'🍳', nombre:'Omelette de espinaca y queso',
    tiempo:'12 min', dificultad:'Fácil', calorias:'360 kcal',
    macros:{ proteina:'22g', grasa:'28g', carbos:'2g' },
    ingredientes:['3 huevos', '1 puñado espinaca', '2 cdas queso crema', 'Sal, pimienta', '1 cda ghee'],
    pasos:['Batí los huevos con sal y pimienta.','Calentá el ghee y volcá los huevos.','Cuando estén casi listos, agregá espinaca y queso crema.','Doblá el omelette al medio y serví.'],
  },
  {
    id:4, categoria:'Desayunos', icon:'🥛', nombre:'Yogur griego con nueces y canela',
    tiempo:'5 min', dificultad:'Fácil', calorias:'290 kcal',
    macros:{ proteina:'14g', grasa:'20g', carbos:'6g' },
    ingredientes:['200g yogur griego entero (sin azúcar)', '1 puñado nueces', '1 cda semillas de chía', 'Canela a gusto', 'Opcional: 1 cdita coco rallado'],
    pasos:['Serví el yogur en un bowl.','Agregá las nueces y semillas de chía.','Espolvoreá canela y coco rallado.','Comé inmediatamente o refrigerá hasta 1 hora.'],
  },
  // ALMUERZOS
  {
    id:5, categoria:'Almuerzos', icon:'🥗', nombre:'Bowl de atún con palta y huevo duro',
    tiempo:'15 min', dificultad:'Fácil', calorias:'420 kcal',
    macros:{ proteina:'38g', grasa:'26g', carbos:'3g' },
    ingredientes:['1 lata atún en agua', '1 palta', '2 huevos duros', 'Pepino', 'Aceite de oliva', 'Limón, sal y pimienta'],
    pasos:['Cociná los huevos duros 10 minutos.','Cortá la palta en cubos y el pepino en rodajas.','Mezclá el atún escurrido con aceite, limón y pimienta.','Armá el bowl con todos los ingredientes.'],
  },
  {
    id:6, categoria:'Almuerzos', icon:'🍗', nombre:'Pollo al horno con verduras keto',
    tiempo:'40 min', dificultad:'Media', calorias:'480 kcal',
    macros:{ proteina:'42g', grasa:'28g', carbos:'6g' },
    ingredientes:['2 muslos de pollo con piel', 'Zucchini, morrón, cebolla', 'Ajo, romero, tomillo', 'Aceite de oliva', 'Sal y pimienta'],
    pasos:['Precalentá el horno a 200°C.','Mariná el pollo con ajo, hierbas, aceite, sal y pimienta.','Cortá las verduras en trozos grandes.','Colocá todo en asadera y horneá 35-40 min.'],
  },
  {
    id:7, categoria:'Almuerzos', icon:'🥩', nombre:'Carne picada con calabacín',
    tiempo:'25 min', dificultad:'Fácil', calorias:'450 kcal',
    macros:{ proteina:'35g', grasa:'32g', carbos:'5g' },
    ingredientes:['300g carne picada', '2 zucchinis medianos', '1 cebolla', '2 dientes ajo', 'Tomate triturado (sin azúcar)', 'Aceite, sal, pimienta, orégano'],
    pasos:['Rehogá cebolla y ajo en aceite.','Agregá la carne y cocinala hasta dorar.','Sumá el tomate triturado y condimentá.','Cortá el zucchini en cubos y agregá los últimos 8 min.'],
  },
  {
    id:8, categoria:'Almuerzos', icon:'🐟', nombre:'Salmón con manteca de limón',
    tiempo:'20 min', dificultad:'Media', calorias:'520 kcal',
    macros:{ proteina:'40g', grasa:'38g', carbos:'1g' },
    ingredientes:['1 filete salmón', '2 cdas manteca o ghee', 'Jugo de 1 limón', 'Ajo en polvo', 'Eneldo fresco', 'Sal y pimienta'],
    pasos:['Secá el salmón y condimentá con sal, pimienta y ajo.','Calentá sartén con ghee a fuego alto.','Cociná el salmón 3-4 min por lado.','Terminá con jugo de limón y eneldo fresco.'],
  },
  {
    id:9, categoria:'Almuerzos', icon:'🥦', nombre:'Arroz de coliflor con pollo',
    tiempo:'30 min', dificultad:'Media', calorias:'380 kcal',
    macros:{ proteina:'36g', grasa:'22g', carbos:'7g' },
    ingredientes:['1 coliflor mediana', '2 pechugas pollo', 'Cebolla, morrón', 'Salsa de soja sin azúcar', 'Jengibre rallado', 'Aceite de coco'],
    pasos:['Rallá la coliflor para simular arroz.','Cocinala en sartén seca 5 min, reservá.','Saltea el pollo cortado en tiras con verduras.','Agregá la coliflor, salsa de soja y jengibre, mezclá todo.'],
  },
  // CENAS
  {
    id:10, categoria:'Cenas', icon:'🥚', nombre:'Tortilla española keto',
    tiempo:'25 min', dificultad:'Media', calorias:'380 kcal',
    macros:{ proteina:'20g', grasa:'30g', carbos:'4g' },
    ingredientes:['4 huevos', '1 zucchini en rodajas finas', '½ cebolla', '2 cdas aceite de oliva', 'Sal y pimienta'],
    pasos:['Saltea el zucchini y la cebolla en aceite hasta tiernos.','Batí los huevos con sal y pimienta.','Volcá sobre las verduras en sartén a fuego bajo.','Cociná tapado 8 min, deslizá y doblá.'],
  },
  {
    id:11, categoria:'Cenas', icon:'🍲', nombre:'Sopa de pollo con verduras',
    tiempo:'35 min', dificultad:'Fácil', calorias:'320 kcal',
    macros:{ proteina:'30g', grasa:'16g', carbos:'8g' },
    ingredientes:['2 pechugas pollo', 'Apio, zanahoria (poca), cebolla', 'Caldo de pollo casero', 'Ajo, perejil', 'Sal, pimienta, laurel'],
    pasos:['Herví el pollo en caldo con verduras y condimentos.','A los 20 min retirá el pollo y desmenuzalo.','Volvé a poner el pollo en la sopa.','Serví con perejil fresco.'],
  },
  {
    id:12, categoria:'Cenas', icon:'🥩', nombre:'Milanesa de ternera con parmesano',
    tiempo:'20 min', dificultad:'Fácil', calorias:'440 kcal',
    macros:{ proteina:'40g', grasa:'28g', carbos:'2g' },
    ingredientes:['2 bifes finos de ternera', '1 huevo batido', 'Queso parmesano rallado', 'Ajo en polvo, orégano', 'Ghee para cocinar'],
    pasos:['Pasá la carne por el huevo batido.','Empanizá en queso parmesano mezclado con condimentos.','Cociná en sartén con ghee caliente, 3 min por lado.','Serví con ensalada verde.'],
  },
  {
    id:13, categoria:'Cenas', icon:'🐄', nombre:'Hamburguesa sin pan con doble queso',
    tiempo:'15 min', dificultad:'Fácil', calorias:'520 kcal',
    macros:{ proteina:'38g', grasa:'40g', carbos:'2g' },
    ingredientes:['200g carne picada de calidad', '2 fetas queso cheddar', 'Lechuga, tomate', 'Mostaza sin azúcar', 'Sal, pimienta, ajo'],
    pasos:['Condimentá la carne y formá una hamburguesa gruesa.','Cocinala 4 min por lado en sartén caliente.','Poné el queso encima los últimos 2 min.','Serví sobre lechuga con tomate y mostaza.'],
  },
  // SNACKS
  {
    id:14, categoria:'Snacks', icon:'🥜', nombre:'Chips de queso parmesano',
    tiempo:'15 min', dificultad:'Fácil', calorias:'180 kcal',
    macros:{ proteina:'14g', grasa:'14g', carbos:'1g' },
    ingredientes:['100g queso parmesano rallado', 'Orégano o condimento a gusto', 'Papel manteca'],
    pasos:['Precalentá el horno a 200°C.','Hacé montoncitos de queso sobre papel manteca.','Aplastá levemente y condimentá.','Horneá 7-9 min hasta dorar. Dejá enfriar antes de despegar.'],
  },
  {
    id:15, categoria:'Snacks', icon:'🥚', nombre:'Huevos rellenos con palta',
    tiempo:'20 min', dificultad:'Fácil', calorias:'220 kcal',
    macros:{ proteina:'12g', grasa:'18g', carbos:'2g' },
    ingredientes:['4 huevos duros', '1 palta pequeña', 'Jugo de limón', 'Sal, pimienta', 'Pimentón ahumado'],
    pasos:['Cociná los huevos duros y cortá al medio.','Sacá las yemas y aplastá con la palta.','Condimentá con limón, sal y pimienta.','Rellená las claras y decorá con pimentón.'],
  },
  {
    id:16, categoria:'Snacks', icon:'🥓', nombre:'Rollitos de panceta con queso crema',
    tiempo:'10 min', dificultad:'Fácil', calorias:'240 kcal',
    macros:{ proteina:'14g', grasa:'20g', carbos:'1g' },
    ingredientes:['6 fetas de panceta fina', '3 cdas queso crema', 'Cebollín picado', 'Pimienta negra'],
    pasos:['Cociná la panceta en sartén hasta crocante. Dejá enfriar.','Mezclá el queso crema con cebollín y pimienta.','Extendé una cucharada sobre cada feta de panceta.','Enrollá y serví.'],
  },
  // POSTRES
  {
    id:17, categoria:'Postres', icon:'🍫', nombre:'Mousse de chocolate negro keto',
    tiempo:'15 min + 1h frío', dificultad:'Media', calorias:'280 kcal',
    macros:{ proteina:'5g', grasa:'26g', carbos:'4g' },
    ingredientes:['100g chocolate 85%+ cacao', '200ml crema de leche entera', '2 cdas eritritol o stevia', 'Esencia de vainilla', 'Pizca de sal'],
    pasos:['Derretí el chocolate a baño María.','Batí la crema hasta punto medio.','Mezclá el chocolate tibio con eritritol, vainilla y sal.','Integrá la crema con movimientos envolventes.','Refrigerá 1 hora antes de servir.'],
  },
  {
    id:18, categoria:'Postres', icon:'🥥', nombre:'Bolitas de coco y almendras',
    tiempo:'20 min + frío', dificultad:'Fácil', calorias:'160 kcal',
    macros:{ proteina:'4g', grasa:'14g', carbos:'3g' },
    ingredientes:['1 taza coco rallado sin azúcar', '½ taza harina de almendras', '3 cdas manteca de almendras', '2 cdas eritritol', 'Esencia de vainilla'],
    pasos:['Mezclá todos los ingredientes hasta formar masa.','Si queda seca, agregá una cda de aceite de coco.','Formá bolitas y pasalas por coco rallado.','Refrigerá 30 min antes de consumir.'],
  },
  {
    id:19, categoria:'Postres', icon:'🍮', nombre:'Flan de huevo sin azúcar',
    tiempo:'50 min', dificultad:'Media', calorias:'200 kcal',
    macros:{ proteina:'10g', grasa:'15g', carbos:'2g' },
    ingredientes:['3 huevos', '300ml leche entera o crema', '3 cdas eritritol', 'Esencia de vainilla', 'Caramelo: eritritol + agua'],
    pasos:['Hacé caramelo de eritritol y cubrí el molde.','Batí huevos con eritritol, vainilla y leche.','Volcá sobre el caramelo y cociná a baño María 35 min a 170°C.','Dejá enfriar y desmoldá frío.'],
  },
  // BEBIDAS
  {
    id:20, categoria:'Bebidas', icon:'☕', nombre:'Bulletproof coffee (café bala)',
    tiempo:'5 min', dificultad:'Fácil', calorias:'230 kcal',
    macros:{ proteina:'0g', grasa:'26g', carbos:'0g' },
    ingredientes:['1 taza café negro fuerte', '1 cda ghee o manteca', '1 cda aceite MCT o coco', 'Opcional: canela o stevia'],
    pasos:['Preparás tu café negro bien fuerte.','Volcá en la licuadora con el ghee y aceite MCT.','Licuá 20-30 segundos hasta que espume.','Tomá de inmediato en ayunas.'],
  },
  {
    id:21, categoria:'Bebidas', icon:'🍵', nombre:'Té verde con jengibre y limón',
    tiempo:'5 min', dificultad:'Fácil', calorias:'10 kcal',
    macros:{ proteina:'0g', grasa:'0g', carbos:'1g' },
    ingredientes:['1 saquito té verde', 'Rodajas jengibre fresco', 'Jugo de ½ limón', 'Agua caliente (no hirviendo)', 'Stevia al gusto'],
    pasos:['Calentá agua a 80°C (no hirviendo).','Poné el té y el jengibre a infusionar 3 min.','Sacá el saquito y agregá limón.','Endulzá con stevia si querés.'],
  },
  {
    id:22, categoria:'Bebidas', icon:'🥛', nombre:'Golden milk keto',
    tiempo:'8 min', dificultad:'Fácil', calorias:'190 kcal',
    macros:{ proteina:'3g', grasa:'18g', carbos:'3g' },
    ingredientes:['1 taza leche de coco sin azúcar', '1 cdita cúrcuma', '½ cdita canela', 'Pizca pimienta negra', '1 cda ghee', 'Stevia al gusto'],
    pasos:['Calentá la leche de coco en una ollita.','Agregá la cúrcuma, canela y pimienta.','Mezclá bien y añadí el ghee.','Endulzá con stevia y serví caliente.'],
  },
  {
    id:23, categoria:'Bebidas', icon:'🧉', nombre:'Agua de limón con menta y chía',
    tiempo:'5 min', dificultad:'Fácil', calorias:'30 kcal',
    macros:{ proteina:'1g', grasa:'1g', carbos:'3g' },
    ingredientes:['1 litro agua fría', 'Jugo de 2 limones', '1 cda semillas de chía', 'Hojas de menta fresca', 'Stevia al gusto'],
    pasos:['Mezclá el agua con el jugo de limón.','Agregá las semillas de chía y dejá hidratar 10 min.','Agregá menta fresca y stevia.','Serví con hielo.'],
  },
  {
    id:24, categoria:'Bebidas', icon:'🥤', nombre:'Smoothie verde keto',
    tiempo:'5 min', dificultad:'Fácil', calorias:'210 kcal',
    macros:{ proteina:'5g', grasa:'18g', carbos:'5g' },
    ingredientes:['1 taza leche de almendras sin azúcar', '½ palta', '1 puñado espinaca', '1 cdita spirulina (opcional)', 'Hielo y stevia'],
    pasos:['Poné todos los ingredientes en la licuadora.','Licuá hasta obtener una mezcla lisa.','Probá y ajustá dulzor con stevia.','Serví inmediatamente con hielo.'],
  },
  {
    id:25, categoria:'Snacks', icon:'🫒', nombre:'Mix de frutos secos especiados',
    tiempo:'10 min', dificultad:'Fácil', calorias:'200 kcal',
    macros:{ proteina:'6g', grasa:'18g', carbos:'4g' },
    ingredientes:['½ taza nueces', '½ taza almendras', '¼ taza semillas zapallo', '1 cda aceite coco', 'Sal, pimentón, comino'],
    pasos:['Mezcá los frutos secos con aceite de coco y condimentos.','Extendé en placa y horneá 8 min a 180°C.','Revolvé a mitad de cocción.','Dejá enfriar antes de guardar.'],
  },
];

export default function RecetasScreen({ onBack }) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [recetaAbierta, setRecetaAbierta] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const recetasFiltradas = RECETAS.filter(r => {
    const matchCat = categoriaActiva === 'Todas' || r.categoria === categoriaActiva;
    const matchBusq = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSobre}>KETOCLUB · NUTRICIÓN</Text>
        <Text style={styles.headerTitle}>Recetas Keto</Text>
        <Text style={styles.headerSub}>Comida real · Sin culpa · Con sabor</Text>
      </View>

      <View style={styles.body}>

        <View style={styles.fraseCard}>
          <Text style={styles.fraseLabel}>🥑 FILOSOFÍA</Text>
          <Text style={styles.fraseTexto}>"Comer bien no es privarse. Es elegir alimentos que le dan energía real a tu cuerpo y claridad a tu mente."</Text>
          <Text style={styles.fraseAuthor}>— Diego Gaitán</Text>
        </View>

        {/* CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll} contentContainerStyle={{ gap:8, paddingRight:16 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, categoriaActiva === cat && styles.catBtnActivo]}
              onPress={() => { Haptics.selectionAsync(); setCategoriaActiva(cat); setRecetaAbierta(null); }}
            >
              <Text style={[styles.catText, categoriaActiva === cat && styles.catTextActivo]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.countText}>{recetasFiltradas.length} recetas</Text>

        {/* LISTA */}
        {recetasFiltradas.map((r) => (
          <View key={r.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRecetaAbierta(recetaAbierta === r.id ? null : r.id); }}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardIconWrap}>
                  <Text style={styles.cardIcon}>{r.icon}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={styles.cardNombre}>{r.nombre}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>⏱ {r.tiempo}</Text>
                    <Text style={styles.cardMetaDot}>·</Text>
                    <Text style={styles.cardMetaText}>{r.dificultad}</Text>
                    <Text style={styles.cardMetaDot}>·</Text>
                    <Text style={styles.cardMetaText}>{r.calorias}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cardArrow}>{recetaAbierta === r.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {recetaAbierta === r.id && (
              <View style={styles.cardBody}>

                {/* MACROS */}
                <View style={styles.macrosRow}>
                  {[
                    { label:'Proteína', val: r.macros.proteina, color:'#4ade80' },
                    { label:'Grasa', val: r.macros.grasa, color:'#c9a84c' },
                    { label:'Carbos', val: r.macros.carbos, color:'#f87171' },
                  ].map(m => (
                    <View key={m.label} style={[styles.macroItem, { borderColor: m.color + '40' }]}>
                      <Text style={[styles.macroVal, { color: m.color }]}>{m.val}</Text>
                      <Text style={styles.macroLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>

                {/* INGREDIENTES */}
                <Text style={styles.seccion}>🛒 Ingredientes</Text>
                {r.ingredientes.map((ing, i) => (
                  <View key={i} style={styles.ingRow}>
                    <Text style={styles.ingBullet}>•</Text>
                    <Text style={styles.ingText}>{ing}</Text>
                  </View>
                ))}

                {/* PASOS */}
                <Text style={styles.seccion}>👩‍🍳 Preparación</Text>
                {r.pasos.map((paso, i) => (
                  <View key={i} style={styles.pasoRow}>
                    <View style={styles.pasoNum}>
                      <Text style={styles.pasoNumText}>{i+1}</Text>
                    </View>
                    <Text style={styles.pasoText}>{paso}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height:40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0c' },
  header: { backgroundColor:'#1a1508', padding:24, paddingTop:56, borderBottomWidth:1, borderBottomColor:'rgba(201,168,76,0.15)' },
  backBtn: { alignSelf:'flex-start', paddingVertical:8, paddingHorizontal:14, borderRadius:10, backgroundColor:'rgba(0,0,0,0.3)', borderWidth:1, borderColor:'#2a2010', marginBottom:20 },
  backText: { color:'#c9a84c', fontWeight:'900', fontSize:12 },
  headerSobre: { fontSize:10, color:'#4a3a20', fontWeight:'900', letterSpacing:3, marginBottom:6 },
  headerTitle: { fontSize:36, fontWeight:'900', color:'#f0e6c8', marginBottom:4 },
  headerSub: { fontSize:13, color:'#6a5a40' },
  body: { padding:16 },
  fraseCard: { backgroundColor:'#13120f', borderRadius:18, padding:20, borderWidth:1, borderColor:'rgba(201,168,76,0.3)', marginBottom:16 },
  fraseLabel: { fontSize:10, letterSpacing:3, color:'#c9a84c', marginBottom:10 },
  fraseTexto: { fontSize:14, color:'#e8e0d0', lineHeight:24, fontStyle:'italic', marginBottom:8 },
  fraseAuthor: { fontSize:12, color:'#6a5a40' },
  catsScroll: { marginBottom:8 },
  catBtn: { paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor:'#13120f', borderWidth:1, borderColor:'#2a2010' },
  catBtnActivo: { backgroundColor:'rgba(201,168,76,0.15)', borderColor:'#c9a84c' },
  catText: { fontSize:13, color:'#6a5a40', fontWeight:'700' },
  catTextActivo: { color:'#c9a84c' },
  countText: { fontSize:12, color:'#4a3a20', marginBottom:12, marginTop:4 },
  card: { backgroundColor:'#13120f', borderRadius:18, borderWidth:1.5, borderColor:'#2a2010', marginBottom:10, overflow:'hidden' },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 },
  cardLeft: { flexDirection:'row', alignItems:'center', gap:12, flex:1 },
  cardIconWrap: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(201,168,76,0.1)', borderWidth:1, borderColor:'rgba(201,168,76,0.25)', alignItems:'center', justifyContent:'center' },
  cardIcon: { fontSize:20 },
  cardNombre: { fontSize:14, fontWeight:'800', color:'#f0e6c8', marginBottom:4, lineHeight:18 },
  cardMeta: { flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap' },
  cardMetaText: { fontSize:11, color:'#6a5a40' },
  cardMetaDot: { color:'#2a2010', fontSize:11 },
  cardArrow: { fontSize:11, color:'#c9a84c', fontWeight:'900' },
  cardBody: { padding:16, paddingTop:4, borderTopWidth:1, borderTopColor:'#1a1a14' },
  macrosRow: { flexDirection:'row', gap:8, marginBottom:16 },
  macroItem: { flex:1, backgroundColor:'#0a0a0c', borderRadius:12, padding:10, alignItems:'center', borderWidth:1 },
  macroVal: { fontSize:15, fontWeight:'900', marginBottom:2 },
  macroLabel: { fontSize:10, color:'#6a5a40', letterSpacing:0.5 },
  seccion: { fontSize:12, fontWeight:'900', color:'#8a7a60', letterSpacing:1, marginBottom:10, marginTop:4 },
  ingRow: { flexDirection:'row', alignItems:'flex-start', gap:8, marginBottom:6 },
  ingBullet: { color:'#c9a84c', fontSize:16, lineHeight:20 },
  ingText: { flex:1, fontSize:13, color:'#e8e0d0', lineHeight:20 },
  pasoRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  pasoNum: { width:24, height:24, borderRadius:12, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1, borderColor:'rgba(201,168,76,0.35)', alignItems:'center', justifyContent:'center', flexShrink:0 },
  pasoNumText: { fontSize:11, fontWeight:'900', color:'#c9a84c' },
  pasoText: { flex:1, fontSize:13, color:'#e8e0d0', lineHeight:20 },
});
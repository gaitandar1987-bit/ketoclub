// ─── Sistema de XP Ketoclub ───────────────────────────────────
// Archivo central de lógica XP — importar desde cualquier screen

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Tabla de XP por acción ───────────────────────────────────
export const XP_ACCIONES = {
  dia_programa:    50,   // completar un día del programa
  habitos_100:     30,   // hábitos al 100% en el día
  sueno_7h:        20,   // sueño ≥7h
  ayuno:           20,   // ayuno completado
  pasos_5k:        15,   // ≥5000 pasos
  logro:          100,   // desbloquear un logro
  racha_7:        200,   // racha de 7 días consecutivos
};

// ─── Niveles ──────────────────────────────────────────────────
export const NIVELES = [
  { nivel: 1, nombre: 'Iniciado',      min: 0,    max: 499,   color: '#6a5a40', emoji: '🌱' },
  { nivel: 2, nombre: 'Constante',     min: 500,  max: 1199,  color: '#c9a84c', emoji: '⚡' },
  { nivel: 3, nombre: 'Guerrero',      min: 1200, max: 2499,  color: '#fb923c', emoji: '🔥' },
  { nivel: 4, nombre: 'Imparable',     min: 2500, max: 4999,  color: '#a78bfa', emoji: '💎' },
  { nivel: 5, nombre: 'Leyenda Keto',  min: 5000, max: 99999, color: '#fbbf24', emoji: '👑' },
];

// ─── Helpers ──────────────────────────────────────────────────
export function getNivel(xpTotal) {
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (xpTotal >= NIVELES[i].min) return NIVELES[i];
  }
  return NIVELES[0];
}

export function getProgreso(xpTotal) {
  const nivel    = getNivel(xpTotal);
  const siguiente = NIVELES.find(n => n.nivel === nivel.nivel + 1);
  if (!siguiente) return { pct: 100, falta: 0, actual: xpTotal - nivel.min, total: nivel.max - nivel.min };
  const actual = xpTotal - nivel.min;
  const total  = siguiente.min - nivel.min;
  return {
    pct:    Math.min(100, Math.round((actual / total) * 100)),
    falta:  siguiente.min - xpTotal,
    actual,
    total,
    siguiente,
  };
}

// ─── AsyncStorage keys ────────────────────────────────────────
function xpKey(memberKey)         { return `xp_total_${memberKey}`; }
function xpHistorialKey(memberKey){ return `xp_historial_${memberKey}`; }

// ─── Leer XP total ────────────────────────────────────────────
export async function getXP(memberKey) {
  try {
    const raw = await AsyncStorage.getItem(xpKey(memberKey));
    return raw ? parseInt(raw, 10) : 0;
  } catch(e) { return 0; }
}

// ─── Sumar XP por una acción ──────────────────────────────────
export async function sumarXP(memberKey, accion, detalle = '') {
  try {
    const puntos  = XP_ACCIONES[accion] || 0;
    if (!puntos) return 0;

    const actual  = await getXP(memberKey);
    const nuevo   = actual + puntos;
    await AsyncStorage.setItem(xpKey(memberKey), String(nuevo));

    // Guardar en historial (últimos 50 eventos)
    const rawH    = await AsyncStorage.getItem(xpHistorialKey(memberKey));
    const historial = rawH ? JSON.parse(rawH) : [];
    historial.unshift({
      accion,
      puntos,
      detalle,
      fecha: new Date().toISOString(),
    });
    await AsyncStorage.setItem(
      xpHistorialKey(memberKey),
      JSON.stringify(historial.slice(0, 50))
    );

    return nuevo;
  } catch(e) { return 0; }
}

// ─── Leer historial ───────────────────────────────────────────
export async function getHistorialXP(memberKey) {
  try {
    const raw = await AsyncStorage.getItem(xpHistorialKey(memberKey));
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

// ─── Labels legibles ──────────────────────────────────────────
export const XP_LABELS = {
  dia_programa: 'Día del programa',
  habitos_100:  'Hábitos al 100%',
  sueno_7h:     'Sueño ≥7h',
  ayuno:        'Ayuno completado',
  pasos_5k:     '≥5.000 pasos',
  logro:        'Logro desbloqueado',
  racha_7:      'Racha de 7 días',
};

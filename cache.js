/**
 * cache.js — Caché inteligente en memoria para AsyncStorage
 * 
 * Evita releer AsyncStorage en cada render.
 * Los datos se guardan en RAM mientras la app está abierta.
 * TTL configurable por key (default 5 minutos).
 * Se invalida automáticamente cuando se escribe.
 */

const _cache = {};      // { key: { value, ts } }
const _TTL   = {};      // TTL personalizado por prefijo

// TTLs en milisegundos por tipo de dato
const DEFAULT_TTLS = {
  'progress_':       2 * 60 * 1000,   // hábitos: 2 min (cambia frecuente)
  'hidratacion_':    1 * 60 * 1000,   // agua: 1 min
  'xp_total_':       3 * 60 * 1000,   // XP: 3 min
  'xp_historial_':   5 * 60 * 1000,   // historial XP: 5 min
  'measurements_':   10 * 60 * 1000,  // medidas: 10 min (cambia poco)
  'peso_historial_': 10 * 60 * 1000,  // historial peso: 10 min
  'perfil_':         15 * 60 * 1000,  // perfil: 15 min
  'foto_':           30 * 60 * 1000,  // fotos: 30 min
  'badges_':         10 * 60 * 1000,  // badges: 10 min
  'default':         5 * 60 * 1000,   // default: 5 min
};

function getTTL(key) {
  for (const prefix of Object.keys(DEFAULT_TTLS)) {
    if (prefix !== 'default' && key.startsWith(prefix)) return DEFAULT_TTLS[prefix];
  }
  return DEFAULT_TTLS['default'];
}

function isValid(key) {
  const entry = _cache[key];
  if (!entry) return false;
  const ttl = getTTL(key);
  return (Date.now() - entry.ts) < ttl;
}

/**
 * Leer con caché. Si hay datos frescos en memoria los devuelve sin tocar AsyncStorage.
 * Si no, lee de AsyncStorage, cachea y devuelve.
 */
export async function cacheGet(AsyncStorage, key) {
  if (isValid(key)) {
    return _cache[key].value;
  }
  try {
    const raw = await AsyncStorage.getItem(key);
    _cache[key] = { value: raw, ts: Date.now() };
    return raw;
  } catch(e) {
    console.log(`[cache] Error leyendo ${key}:`, e);
    return null;
  }
}

/**
 * Escribir e invalidar caché para esa key.
 */
export async function cacheSet(AsyncStorage, key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    _cache[key] = { value, ts: Date.now() };
  } catch(e) {
    console.log(`[cache] Error guardando ${key}:`, e);
    throw e;
  }
}

/**
 * Eliminar key del caché y de AsyncStorage.
 */
export async function cacheRemove(AsyncStorage, key) {
  try {
    await AsyncStorage.removeItem(key);
    delete _cache[key];
  } catch(e) {
    console.log(`[cache] Error eliminando ${key}:`, e);
  }
}

/**
 * Forzar invalidación de una key (sin borrar AsyncStorage).
 * Útil para refrescar datos después de una actualización externa.
 */
export function cacheInvalidate(key) {
  delete _cache[key];
}

/**
 * Invalidar todas las keys que empiezan con un prefijo.
 * Ej: cacheInvalidatePrefix('progress_') limpia todos los hábitos.
 */
export function cacheInvalidatePrefix(prefix) {
  Object.keys(_cache).forEach(k => {
    if (k.startsWith(prefix)) delete _cache[k];
  });
}

/**
 * Leer y parsear JSON en un solo paso.
 */
export async function cacheGetJSON(AsyncStorage, key) {
  const raw = await cacheGet(AsyncStorage, key);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch(e) { return null; }
}

/**
 * Serializar a JSON y guardar en un solo paso.
 */
export async function cacheSetJSON(AsyncStorage, key, value) {
  await cacheSet(AsyncStorage, key, JSON.stringify(value));
}

/**
 * Stats del caché — útil para debug.
 */
export function cacheStats() {
  const keys    = Object.keys(_cache);
  const validas = keys.filter(isValid).length;
  return { total: keys.length, validas, expiradas: keys.length - validas };
}

/**
 * Limpiar todo el caché en memoria (ej: al hacer logout).
 */
export function cacheClear() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
}

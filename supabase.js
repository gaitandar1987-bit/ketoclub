// supabase.js — módulo central de acceso a Supabase
// Va en la raíz del proyecto junto a cache.js y xp.js

const SB_URL = 'https://jwidrpwfccjqylymxhcv.supabase.co';
const SB_KEY = 'sb_publishable_T9O10---KeKob14NKLk5yA_MMuGFXdO';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
};

async function sbFetch(tabla, params = '') {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${tabla}?${params}`, { headers: HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.log(`[supabase] Error fetching ${tabla}:`, e);
    return null;
  }
}

export async function getRecetas() {
  return await sbFetch('recetas', 'activo=eq.true&order=orden.asc');
}

export async function getMeditaciones() {
  return await sbFetch('meditaciones', 'activo=eq.true&order=orden.asc');
}

export async function getEntrenamientos() {
  return await sbFetch('entrenamientos', 'activo=eq.true&order=orden.asc');
}

export async function getBiblioteca() {
  return await sbFetch('biblioteca', 'activo=eq.true&order=orden.asc');
}

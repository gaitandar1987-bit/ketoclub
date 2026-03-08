import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://jwidrpwfccjqylymxhcv.supabase.co';
const SB_KEY = 'sb_publishable_T9O10---KeKob14NKLk5yA_MMuGFXdO';

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const ALIAS = 'ketoclub';
export const PRECIO_INGRESO = 22222;
export const PRECIO_RENOV = 18888;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont correctement chargées
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erreur: variables d\'environnement Supabase manquantes');
  console.log('URL:', supabaseUrl ? '✓ présente' : '✗ manquante');
  console.log('ANON_KEY:', supabaseAnonKey ? '✓ présente' : '✗ manquante');
} else {
  console.log('Configuration Supabase chargée');
}

// Créer le client avec des options optimisées
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}); 
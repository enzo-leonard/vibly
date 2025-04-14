import { supabase } from '../supabase';
import { TABLES } from './schema';

/**
 * API pour interagir avec la base de données Supabase
 * Contient des fonctions pour chaque opération courante
 */

// ===================
// PROFILES
// ===================

/**
 * Récupère un profil par userId
 * @param {string} userId - ID de l'utilisateur authentifié
 * @returns {Promise} - Résultat de la requête
 */
export const fetchProfileByUserId = async (userId) => {
  return await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('user_id', userId)
    .single();
};

/**
 * Récupère tous les profils
 * @returns {Promise} - Résultat de la requête
 */
export const fetchAllProfiles = async () => {
  return await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .order('first_name', { ascending: true });
};

/**
 * Met à jour un profil utilisateur
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise} - Résultat de la requête
 */
export const updateProfile = async (profileData) => {
  const { user_id, ...data } = profileData;
  
  // Ajouter la date de mise à jour
  const updates = {
    ...data,
    updated_at: new Date().toISOString(),
    user_id
  };
  
  return await supabase
    .from(TABLES.PROFILES)
    .upsert(updates, { onConflict: 'user_id', returning: 'representation' });
};

// ===================
// CONVERSATIONS
// ===================

/**
 * Crée une nouvelle conversation
 * @returns {Promise} - Résultat de la requête
 */
export const createConversation = async () => {
  const now = new Date().toISOString();
  return await supabase
    .from(TABLES.CONVERSATIONS)
    .insert({
      created_at: now,
      updated_at: now
    })
    .select()
    .single();
};

/**
 * Récupère toutes les conversations pour un profil
 * @param {number} profileId - ID du profil
 * @returns {Promise} - Résultat de la requête
 */
export const fetchConversationsForProfile = async (profileId) => {
  // D'abord, récupérer toutes les conversations auxquelles l'utilisateur participe
  const { data: participations, error: participationsError } = await supabase
    .from(TABLES.CONVERSATION_PARTICIPANTS)
    .select('conversation_id')
    .eq('profile_id', profileId);

  if (participationsError) throw participationsError;
  
  if (!participations || participations.length === 0) {
    return { data: [] };
  }

  // Extraire les IDs de conversation
  const conversationIds = participations.map(p => p.conversation_id);
  
  // Récupérer les détails des conversations
  return await supabase
    .from(TABLES.CONVERSATIONS)
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });
};

/**
 * Ajoute un participant à une conversation
 * @param {string} conversationId - ID de la conversation
 * @param {number} profileId - ID du profil à ajouter
 * @returns {Promise} - Résultat de la requête
 */
export const addParticipantToConversation = async (conversationId, profileId) => {
  return await supabase
    .from(TABLES.CONVERSATION_PARTICIPANTS)
    .insert({
      conversation_id: conversationId,
      profile_id: profileId,
      created_at: new Date().toISOString()
    });
};

/**
 * Récupère tous les participants d'une conversation avec leurs profils
 * @param {string} conversationId - ID de la conversation
 * @returns {Promise} - Résultat de la requête
 */
export const fetchConversationParticipants = async (conversationId) => {
  return await supabase
    .from(TABLES.CONVERSATION_PARTICIPANTS)
    .select(`
      *,
      ${TABLES.PROFILES}(*)
    `)
    .eq('conversation_id', conversationId);
};

// ===================
// MESSAGES
// ===================

/**
 * Envoie un message dans une conversation
 * @param {string} conversationId - ID de la conversation
 * @param {number} profileId - ID du profil expéditeur
 * @param {string} content - Contenu du message
 * @returns {Promise} - Résultat de la requête
 */
export const sendMessage = async (conversationId, profileId, content) => {
  const now = new Date().toISOString();
  
  // Envoyer le message
  const { data, error } = await supabase
    .from(TABLES.MESSAGES)
    .insert({
      conversation_id: conversationId,
      profile_id: profileId,
      content,
      created_at: now
    })
    .select()
    .single();

  if (error) throw error;
  
  // Mettre à jour la date de dernière activité de la conversation
  await supabase
    .from(TABLES.CONVERSATIONS)
    .update({ updated_at: now })
    .eq('id', conversationId);
    
  return { data };
};

/**
 * Récupère les messages d'une conversation
 * @param {string} conversationId - ID de la conversation
 * @param {number} limit - Nombre maximum de messages à récupérer
 * @returns {Promise} - Résultat de la requête
 */
export const fetchMessagesForConversation = async (conversationId, limit = 50) => {
  return await supabase
    .from(TABLES.MESSAGES)
    .select(`
      *,
      ${TABLES.PROFILES}(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);
};

/**
 * S'abonne aux nouveaux messages d'une conversation
 * @param {string} conversationId - ID de la conversation
 * @param {Function} callback - Fonction appelée lorsqu'un nouveau message arrive
 * @returns {Object} - Objet subscription à conserver pour se désabonner
 */
export const subscribeToConversationMessages = (conversationId, callback) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: TABLES.MESSAGES,
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
}; 
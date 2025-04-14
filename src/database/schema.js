// Exports pour utilisation potentielle ailleurs dans l'application
export const TABLES = {
  PROFILES: 'profiles',
  ASSOCIATIONS: 'associations',
  ASSOCIATION_MEMBERS: 'association_members',
  EVENTS: 'events',
  EVENT_PARTICIPANTS: 'event_participants',
  POSTS: 'posts',
  POST_LIKES: 'post_likes',
  POST_COMMENTS: 'post_comments',
  CONVERSATIONS: 'conversations',
  CONVERSATION_PARTICIPANTS: 'conversation_participants',
  MESSAGES: 'messages'
};

// Fonctions utilitaires pour construire des requêtes
export const getProfileByUserId = (supabase, userId) => {
  return supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('user_id', userId)
    .single();
};

// Fonctions pour les associations
export const getAssociations = (supabase, type = null) => {
  let query = supabase
    .from(TABLES.ASSOCIATIONS)
    .select(`
      *,
      ${TABLES.ASSOCIATION_MEMBERS}(count)
    `);
  
  if (type) {
    query = query.eq('type', type);
  }
  
  return query;
};

export const getAssociationById = (supabase, id) => {
  return supabase
    .from(TABLES.ASSOCIATIONS)
    .select(`
      *,
      ${TABLES.ASSOCIATION_MEMBERS}(*)
    `)
    .eq('id', id)
    .single();
};

export const getUserAssociations = (supabase, profileId) => {
  return supabase
    .from(TABLES.ASSOCIATION_MEMBERS)
    .select(`
      *,
      ${TABLES.ASSOCIATIONS}(*)
    `)
    .eq('profile_id', profileId);
};

// Fonctions pour les événements
export const getEvents = (supabase, associationId = null) => {
  let query = supabase
    .from(TABLES.EVENTS)
    .select(`
      *,
      ${TABLES.ASSOCIATIONS}!left(*),
      ${TABLES.EVENT_PARTICIPANTS}(count)
    `);
  
  if (associationId) {
    query = query.eq('association_id', associationId);
  }
  
  return query.order('start_date', { ascending: true });
};

export const getUserEvents = (supabase, profileId) => {
  return supabase
    .from(TABLES.EVENT_PARTICIPANTS)
    .select(`
      *,
      ${TABLES.EVENTS}!inner(
        *,
        ${TABLES.ASSOCIATIONS}(*)
      )
    `)
    .eq('profile_id', profileId);
};

// Fonctions pour les publications
export const getPosts = (supabase, associationId = null) => {
  let query = supabase
    .from(TABLES.POSTS)
    .select(`
      *,
      ${TABLES.PROFILES}(*),
      ${TABLES.ASSOCIATIONS}(*),
      ${TABLES.POST_LIKES}(count),
      ${TABLES.POST_COMMENTS}(count)
    `);
  
  if (associationId) {
    query = query.eq('association_id', associationId);
  }
  
  return query.order('created_at', { ascending: false });
};

export const getPostLikes = (supabase, postId) => {
  return supabase
    .from(TABLES.POST_LIKES)
    .select(`
      *,
      ${TABLES.PROFILES}(*)
    `)
    .eq('post_id', postId);
};

export const getPostComments = (supabase, postId) => {
  return supabase
    .from(TABLES.POST_COMMENTS)
    .select(`
      *,
      ${TABLES.PROFILES}(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
};

// Fonctions pour les conversations
export const getConversationsForProfile = (supabase, profileId) => {
  return supabase
    .from(TABLES.CONVERSATION_PARTICIPANTS)
    .select(`
      conversation_id,
      ${TABLES.CONVERSATIONS}!inner(*)
    `)
    .eq('profile_id', profileId);
};

export const getMessagesForConversation = (supabase, conversationId) => {
  return supabase
    .from(TABLES.MESSAGES)
    .select(`
      *,
      ${TABLES.PROFILES}!inner(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });
};

export const getParticipantsForConversation = (supabase, conversationId) => {
  return supabase
    .from(TABLES.CONVERSATION_PARTICIPANTS)
    .select(`
      *,
      ${TABLES.PROFILES}!inner(*)
    `)
    .eq('conversation_id', conversationId);
}; 
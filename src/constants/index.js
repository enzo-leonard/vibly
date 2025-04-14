export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROFILE: '/profile',
  CHAT: '/chat',
  FEED: '/feed',
  CREATE: '/create',
  CREATE_ASSOCIATION: '/create-association',
  EDIT_ASSOCIATION: '/edit-association',
  JOIN_ASSOCIATION: '/join-association',
  EVENTS: '/events',
  OFFERS: '/offers',
};

export const API_ENDPOINTS = {
  EVENTS: 'events',
  ASSOCIATIONS: 'associations',
  USERS: 'users',
  MESSAGES: 'messages',
};

export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  TOKEN: 'token',
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  AUTH_ERROR: 'Erreur d\'authentification. Veuillez vous reconnecter.',
  GENERIC_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
};

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Événement créé avec succès',
  ASSOCIATION_CREATED: 'Association créée avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
}; 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // État de l'authentification
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // État des associations
      associations: [],
      setAssociations: (associations) => set({ associations }),
      addAssociation: (association) => 
        set((state) => ({ associations: [...state.associations, association] })),

      // État des événements
      events: [],
      setEvents: (events) => set({ events }),
      addEvent: (event) => 
        set((state) => ({ events: [...state.events, event] })),

      // État des messages
      messages: {},
      setMessages: (messages) => set({ messages }),
      addMessage: (chatId, message) => 
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message]
          }
        })),

      // Thème
      theme: 'light',
      toggleTheme: () => 
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Loading states
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      // Error handling
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'vibly-storage', // nom du stockage local
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
      }), // ce qui sera persisté
    }
  )
);

export default useStore; 
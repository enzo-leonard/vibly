import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../supabase';

// Hook pour les requêtes GET
export const useFetch = (key, queryFn, options = {}) => {
  return useQuery(key, queryFn, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Hook pour les mutations (POST, PUT, DELETE)
export const useMutate = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

// Exemples de fonctions de requête
export const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchAssociations = async () => {
  const { data, error } = await supabase
    .from('associations')
    .select('*');
  
  if (error) throw error;
  return data;
};

export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Exemple d'utilisation dans un composant :
/*
const { data: events, isLoading } = useFetch('events', fetchEvents);
const createEventMutation = useMutate(createEvent);
*/ 
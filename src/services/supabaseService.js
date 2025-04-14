import { supabase } from '../supabase';
import { API_ENDPOINTS } from '../constants';

class SupabaseService {
  // Service des événements
  static async getEvents() {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.EVENTS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createEvent(eventData) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.EVENTS)
      .insert([eventData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Service des associations
  static async getAssociations() {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.ASSOCIATIONS)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async createAssociation(associationData) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.ASSOCIATIONS)
      .insert([associationData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Service des utilisateurs
  static async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.USERS)
      .update(profileData)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Service des messages
  static async getMessages(chatId) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.MESSAGES)
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async sendMessage(messageData) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.MESSAGES)
      .insert([messageData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Gestion des fichiers
  static async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  }

  static async getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export default SupabaseService; 
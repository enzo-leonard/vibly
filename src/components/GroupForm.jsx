import { useState } from 'react';
import { supabase } from '../supabase';
import { TABLES } from '../database/schema';

export default function GroupForm({ user, profile, onSuccess, onError }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour créer un groupe');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!name.trim()) {
        setError('Le nom du groupe ne peut pas être vide');
        return;
      }
      
      if (!description.trim()) {
        setError('La description du groupe ne peut pas être vide');
        return;
      }
      
      // Créer le groupe
      const { error: groupError } = await supabase
        .from(TABLES.ASSOCIATIONS)
        .insert({
          name,
          description,
          image_url: imageUrl || null,
          created_by: profile.id,
          type: 'student_group'
        });
        
      if (groupError) throw groupError;
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      setError(error.message);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du groupe
        </label>
        <input
          type="text"
          id="name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Nom du groupe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Description du groupe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image (optionnel)
        </label>
        <input
          type="text"
          id="imageUrl"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="https://exemple.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg p-3 font-medium disabled:opacity-70"
      >
        {loading ? 'Création en cours...' : 'Créer le groupe'}
      </button>
    </form>
  );
} 
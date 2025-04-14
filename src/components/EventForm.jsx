import { useState } from 'react';
import { supabase } from '../supabase';
import { TABLES } from '../database/schema';
import defaultUserAvatar from '../assets/default_user.svg';
import defaultAssociationAvatar from '../assets/default_association.svg';

export default function EventForm({ user, profile, associations, onSuccess, onError }) {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour créer un événement');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!title.trim()) {
        setError('Le titre de l\'événement ne peut pas être vide');
        return;
      }
      
      if (!description.trim()) {
        setError('La description de l\'événement ne peut pas être vide');
        return;
      }
      
      if (!location.trim()) {
        setError('Le lieu de l\'événement ne peut pas être vide');
        return;
      }
      
      if (!startDate) {
        setError('La date de début de l\'événement ne peut pas être vide');
        return;
      }
      
      if (!endDate) {
        setError('La date de fin de l\'événement ne peut pas être vide');
        return;
      }
      
      if (new Date(endDate) <= new Date(startDate)) {
        setError('La date de fin doit être postérieure à la date de début');
        return;
      }
      
      // Créer l'événement
      const { error: eventError } = await supabase
        .from(TABLES.EVENTS)
        .insert({
          title,
          description,
          location,
          start_date: startDate,
          end_date: endDate,
          image_url: imageUrl || null,
          association_id: selectedAssociation?.id || null,
          created_by: profile.id
        });
        
      if (eventError) throw eventError;
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
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
      
      {associations.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Créer en tant que
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={() => setSelectedAssociation(null)}
              className={`p-3 border rounded-lg flex items-center ${
                selectedAssociation === null ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <img 
                  src={user?.user_metadata?.avatar_url || defaultUserAvatar} 
                  alt="Votre profil" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium">Votre profil</span>
            </div>
            
            {associations.map(association => (
              <div 
                key={association.id}
                onClick={() => setSelectedAssociation(association)}
                className={`p-3 border rounded-lg flex items-center ${
                  selectedAssociation?.id === association.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                  <img 
                    src={association.image_url || defaultAssociationAvatar} 
                    alt={association.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{association.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          id="title"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Titre de l'événement"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          placeholder="Description de l'événement"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Lieu
        </label>
        <input
          type="text"
          id="location"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Lieu de l'événement"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="datetime-local"
            id="startDate"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="datetime-local"
            id="endDate"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
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
        {loading ? 'Création en cours...' : 'Créer l\'événement'}
      </button>
    </form>
  );
} 
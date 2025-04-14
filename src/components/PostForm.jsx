import { useState } from 'react';
import { supabase } from '../supabase';
import { TABLES } from '../database/schema';
import defaultUserAvatar from '../assets/default_user.svg';
import defaultAssociationAvatar from '../assets/default_association.svg';

export default function PostForm({ user, profile, associations, onSuccess, onError }) {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour créer une publication');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!content.trim()) {
        setError('Le contenu de la publication ne peut pas être vide');
        return;
      }
      
      // Créer la publication
      const { error: postError } = await supabase
        .from(TABLES.POSTS)
        .insert({
          content,
          image_url: imageUrl || null,
          profile_id: profile.id,
          association_id: selectedAssociation?.id || null
        });
        
      if (postError) throw postError;
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de la publication:', error);
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
            Publier en tant que
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
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Contenu
        </label>
        <textarea
          id="content"
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Qu'est-ce qui se passe ?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
        {loading ? 'Publication en cours...' : 'Publier'}
      </button>
    </form>
  );
} 
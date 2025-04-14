import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUsers } from 'react-icons/fa';

export default function JoinAssociation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [associations, setAssociations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .eq('is_public', true);
        
      if (error) throw error;
      
      setAssociations(data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'associations:', error);
      setError(error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleJoinAssociation = async (associationId) => {
    if (!userProfile) {
      setError('Profil non trouvé');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('');
    
    try {
      // Vérifier si l'utilisateur est déjà membre
      const { data: existingMembership, error: checkError } = await supabase
        .from('association_members')
        .select('*')
        .eq('association_id', associationId)
        .eq('profile_id', userProfile.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingMembership) {
        setError('Vous êtes déjà membre de cette association');
        return;
      }
      
      // Ajouter l'utilisateur comme membre
      const { error: joinError } = await supabase
        .from('association_members')
        .insert({
          association_id: associationId,
          profile_id: userProfile.id,
          role: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (joinError) throw joinError;
      
      setMessage('Vous avez rejoint l\'association avec succès !');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'adhésion à l\'association:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/profile')}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Rejoindre une Association</h1>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une association..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <FaSearch />
                )}
              </button>
            </div>
          </form>

          {associations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associations.map((association) => (
                <div key={association.id} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      {association.image_url ? (
                        <img 
                          src={association.image_url} 
                          alt={association.name} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <FaUsers className="text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{association.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{association.description}</p>
                    </div>
                    <button
                      onClick={() => handleJoinAssociation(association.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {loading ? '...' : 'Rejoindre'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !searchLoading ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <FaUsers className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">Aucune association trouvée</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 
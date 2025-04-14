import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSave, FaTimes, FaUsers, FaPlus, FaUserPlus } from 'react-icons/fa';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: ''
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userAssociations, setUserAssociations] = useState([]);
  const [associationsLoading, setAssociationsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Fetch profile from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          console.log('Profil récupéré:', data);
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            avatar_url: data.avatar_url || ''
          });
        } else {
          console.log('Aucun profil trouvé, création potentiellement nécessaire');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserAssociations = async () => {
      if (!profile) return;
      
      try {
        setAssociationsLoading(true);
        
        // Fetch user's associations
        const { data, error } = await supabase
          .from('association_members')
          .select(`
            *,
            associations (*)
          `)
          .eq('profile_id', profile.id);
          
        if (error) throw error;
        
        setUserAssociations(data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des associations:', error);
      } finally {
        setAssociationsLoading(false);
      }
    };
    
    fetchUserAssociations();
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    
    try {
      const updates = {
        user_id: user.id,
        email: user.email,
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      // If no profile exists yet, also set created_at
      if (!profile) {
        updates.created_at = new Date().toISOString();
      }
      
      let { error, data } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'user_id', returning: 'minimal' });

      if (error) throw error;
      
      // Fetch the updated profile to make sure we have the latest data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      setProfile(updatedProfile);
      setMessage('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-purple-600 text-4xl" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Mon Profil'}
              </h1>
              <p className="text-purple-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
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

          {/* Profile Form */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                >
                  <FaEdit />
                  <span>Modifier</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <FaTimes />
                    <span>Annuler</span>
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                  >
                    <FaSave />
                    <span>Enregistrer</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'avatar</label>
                  <input
                    type="text"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                  <p className="mt-1">{profile?.first_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                  <p className="mt-1">{profile?.last_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Associations Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Mes Associations</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/create-association')}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <FaPlus />
                  <span>Créer</span>
                </button>
                <button 
                  onClick={() => navigate('/join-association')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <FaUserPlus />
                  <span>Rejoindre</span>
                </button>
              </div>
            </div>
            
            {associationsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : userAssociations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAssociations.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                        {member.associations.image_url ? (
                          <img 
                            src={member.associations.image_url} 
                            alt={member.associations.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUsers className="text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{member.associations.name}</h3>
                        <p className="text-sm text-gray-500">Rôle: {member.role}</p>
                      </div>
                      {member.role === 'admin' && (
                        <button 
                          onClick={() => navigate(`/edit-association/${member.association_id}`)}
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                          title="Modifier l'association"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <FaUsers className="mx-auto text-gray-400 text-4xl mb-2" />
                <p className="text-gray-500">Vous n'êtes membre d'aucune association</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function EditAssociation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_public: true,
    type: 'association'
  });
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAssociationAndCheckPermission = async () => {
      if (!user || !id) return;
      
      try {
        setInitialLoading(true);
        
        // 1. Récupérer le profil de l'utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Profil non trouvé');
        
        setUserProfile(profile);

        // 2. Vérifier si l'utilisateur est admin de l'association
        const { data: memberData, error: memberError } = await supabase
          .from('association_members')
          .select('*')
          .eq('association_id', id)
          .eq('profile_id', profile.id)
          .eq('role', 'admin')
          .single();

        if (memberError && memberError.code !== 'PGRST116') throw memberError;
        
        // Si l'utilisateur n'est pas administrateur, rediriger vers le profil
        if (!memberData) {
          setError('Vous n\'avez pas les droits pour modifier cette association');
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
          return;
        }

        setIsAdmin(true);

        // 3. Récupérer les données de l'association
        const { data: association, error: associationError } = await supabase
          .from('associations')
          .select('*')
          .eq('id', id)
          .single();

        if (associationError) throw associationError;
        if (!association) throw new Error('Association non trouvée');

        // Mettre à jour le formulaire avec les données existantes
        setFormData({
          name: association.name || '',
          description: association.description || '',
          image_url: association.image_url || '',
          is_public: association.is_public || true,
          type: association.type || 'association'
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAssociationAndCheckPermission();
  }, [user, id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('Vous n\'avez pas les droits pour modifier cette association');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      // Mettre à jour l'association
      const { error: updateError } = await supabase
        .from('associations')
        .update({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          is_public: formData.is_public,
          type: formData.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setMessage('Association mise à jour avec succès !');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'association:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Modifier l'Association</h1>
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

          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'association</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'association</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="association">Association</option>
                  <option value="etudiant">Étudiant</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Association publique
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaSave />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 
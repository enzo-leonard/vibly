import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { TABLES } from '../database/schema';
import EventForm from '../components/EventForm';
import PostForm from '../components/PostForm';

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [type, setType] = useState(null);
  const [step, setStep] = useState(1);
  const [associations, setAssociations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      try {
        // Récupérer le profil de l'utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Récupérer les associations de l'utilisateur
        const { data: associationsData, error: associationsError } = await supabase
          .from(TABLES.ASSOCIATIONS)
          .select('*')
          .eq('created_by', user.id);

        if (associationsError) throw associationsError;
        setAssociations(associationsData || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.message);
      }
    }

    fetchUserData();
  }, [user]);

  const handleContinue = () => {
    if (!type) {
      setError('Veuillez sélectionner un type');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setType(null);
    setError(null);
  };

  const handleSuccess = () => {
    switch (type) {
      case 'post':
        navigate('/feed');
        break;
      case 'event':
        navigate('/events');
        break;
      default:
        navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vous devez être connecté
          </h2>
          <p className="text-gray-600 mb-4">
            Connectez-vous pour créer du contenu
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 ? 'Que souhaitez-vous créer ?' : 'Créer un ' + type}
          </h1>
          {step === 2 && (
            <button
              onClick={handleBack}
              className="mt-2 text-purple-600 hover:text-purple-500"
            >
              ← Retour
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setType('event')}
              className={`p-6 border rounded-lg cursor-pointer transition-all ${
                type === 'event'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Événement</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Créez un événement pour votre association
                </p>
              </div>
            </div>

            <div
              onClick={() => setType('post')}
              className={`p-6 border rounded-lg cursor-pointer transition-all ${
                type === 'post'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Publication</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Partagez une publication
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            {type === 'event' && (
              <EventForm
                user={user}
                profile={profile}
                associations={associations}
                onSuccess={handleSuccess}
                onError={setError}
              />
            )}
            {type === 'post' && (
              <PostForm
                user={user}
                profile={profile}
                associations={associations}
                onSuccess={handleSuccess}
                onError={setError}
              />
            )}
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              disabled={!type}
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg px-6 py-3 font-medium disabled:opacity-70"
            >
              Continuer
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
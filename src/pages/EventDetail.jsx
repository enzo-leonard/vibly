import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { TABLES } from '../database/schema';
import defaultAssociationAvatar from '../assets/default_association.svg';
import defaultUserAvatar from '../assets/default_user.svg';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userParticipation, setUserParticipation] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from(TABLES.PROFILES)
          .select('id')
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'événement
        const { data: eventData, error: eventError } = await supabase
          .from(TABLES.EVENTS)
          .select(`
            *,
            ${TABLES.ASSOCIATIONS}!left(*),
            ${TABLES.EVENT_PARTICIPANTS}(*)
          `)
          .eq('id', id)
          .single();
          
        if (eventError) throw eventError;
        
        setEvent(eventData);
        
        // Si l'utilisateur est connecté, récupérer sa participation
        if (userProfile) {
          const { data: participationData, error: participationError } = await supabase
            .from(TABLES.EVENT_PARTICIPANTS)
            .select('*')
            .eq('event_id', id)
            .eq('profile_id', userProfile.id)
            .single();
            
          if (participationError && participationError.code !== 'PGRST116') {
            throw participationError;
          }
          
          setUserParticipation(participationData);
        }
        
        // Récupérer les participants
        const { data: participantsData, error: participantsError } = await supabase
          .from(TABLES.EVENT_PARTICIPANTS)
          .select(`
            *,
            ${TABLES.PROFILES}(*)
          `)
          .eq('event_id', id);
          
        if (participantsError) throw participantsError;
        
        setParticipants(participantsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, userProfile]);

  const handleParticipation = async (status) => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    
    try {
      if (userParticipation?.status === status) {
        // Supprimer la participation
        const { error } = await supabase
          .from(TABLES.EVENT_PARTICIPANTS)
          .delete()
          .eq('event_id', id)
          .eq('profile_id', userProfile.id);
          
        if (error) throw error;
        
        setUserParticipation(null);
        
        // Mettre à jour la liste des participants
        setParticipants(prev => prev.filter(p => p.profile_id !== userProfile.id));
      } else {
        // Mettre à jour ou créer la participation
        const { data, error } = await supabase
          .from(TABLES.EVENT_PARTICIPANTS)
          .upsert({
            event_id: id,
            profile_id: userProfile.id,
            status: status
          })
          .select(`
            *,
            ${TABLES.PROFILES}(*)
          `)
          .single();
          
        if (error) throw error;
        
        setUserParticipation(data);
        
        // Mettre à jour la liste des participants
        setParticipants(prev => {
          const existingIndex = prev.findIndex(p => p.profile_id === userProfile.id);
          if (existingIndex >= 0) {
            const newParticipants = [...prev];
            newParticipants[existingIndex] = data;
            return newParticipants;
          }
          return [...prev, data];
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la participation:', error);
      setError(error.message);
    }
  };

  // Formater la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-2 text-purple-800">Chargement...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Événement non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-6rem)] pb-20">
      {/* En-tête */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
              <img 
                src={event.associations?.image_url || defaultAssociationAvatar} 
                alt={event.associations?.name || 'Association'} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-500">
                {event.associations?.name || 'Association'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">À propos</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>

            {event.image_url && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Informations secondaires */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Informations</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mt-0.5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date et heure</p>
                    <p className="text-sm text-gray-500">{formatDate(event.start_date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mt-0.5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lieu</p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mt-0.5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Participants</p>
                    <p className="text-sm text-gray-500">{participants.length} personnes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleParticipation('going')}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                    userParticipation?.status === 'going'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {userParticipation?.status === 'going' ? 'Je ne participe plus' : 'Je participe'}
                </button>
                
                <button
                  onClick={() => handleParticipation('interested')}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                    userParticipation?.status === 'interested'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {userParticipation?.status === 'interested' ? 'Je ne suis plus intéressé' : 'Je suis intéressé'}
                </button>
              </div>
            </div>

            {/* Liste des participants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Participants</h2>
              
              <div className="space-y-3">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img 
                        src={participant.profiles?.avatar_url || defaultUserAvatar} 
                        alt={`${participant.profiles?.first_name || ''} ${participant.profiles?.last_name || ''}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {`${participant.profiles?.first_name || ''} ${participant.profiles?.last_name || ''}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.status === 'going' ? 'Participe' : 'Intéressé'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {participants.length === 0 && (
                  <p className="text-sm text-gray-500">Aucun participant pour le moment</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
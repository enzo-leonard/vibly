import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { TABLES, getEvents } from '../database/schema';
import defaultAssociationAvatar from '../assets/default_association.svg';

export default function Events() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userEvents, setUserEvents] = useState({});

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
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Récupérer les événements
        const { data: eventsData, error: eventsError } = await getEvents(supabase);
        
        if (eventsError) throw eventsError;
        
        setEvents(eventsData || []);
        
        // Si l'utilisateur est connecté, récupérer ses participations
        if (userProfile) {
          const { data: participationsData, error: participationsError } = await supabase
            .from(TABLES.EVENT_PARTICIPANTS)
            .select('event_id, status')
            .eq('profile_id', userProfile.id);
            
          if (participationsError) throw participationsError;
          
          // Créer un objet avec les IDs des événements et leur statut
          const participationsMap = {};
          participationsData.forEach(participation => {
            participationsMap[participation.event_id] = participation.status;
          });
          
          setUserEvents(participationsMap);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userProfile]);

  const handleParticipation = async (eventId, status) => {
    if (!userProfile) return;
    
    try {
      const currentStatus = userEvents[eventId];
      
      if (currentStatus === status) {
        // Supprimer la participation
        const { error } = await supabase
          .from(TABLES.EVENT_PARTICIPANTS)
          .delete()
          .eq('event_id', eventId)
          .eq('profile_id', userProfile.id);
          
        if (error) throw error;
        
        // Mettre à jour l'état local
        setUserEvents(prev => {
          const newEvents = { ...prev };
          delete newEvents[eventId];
          return newEvents;
        });
      } else {
        // Mettre à jour ou créer la participation
        const { error } = await supabase
          .from(TABLES.EVENT_PARTICIPANTS)
          .upsert({
            event_id: eventId,
            profile_id: userProfile.id,
            status: status
          });
          
        if (error) throw error;
        
        // Mettre à jour l'état local
        setUserEvents(prev => ({
          ...prev,
          [eventId]: status
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la participation:', error);
      setError(error.message);
    }
  };

  // Calculer la date relative
  const getRelativeTimeString = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffDays = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Passé";
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Dans ${weeks} ${weeks === 1 ? 'semaine' : 'semaines'}`;
    }
    
    const months = Math.floor(diffDays / 30);
    return `Dans ${months} ${months === 1 ? 'mois' : 'mois'}`;
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

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-6rem)] pb-20">
      {/* En-tête */}
      <div className="container mx-auto px-4 mt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          {userProfile && (
            <Link 
              to="/create?type=event"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Créer un événement
            </Link>
          )}
        </div>
      </div>

      {/* Liste des événements */}
      <div className="container mx-auto px-4 mt-4 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {events.length > 0 ? (
          events.map(event => (
            <Link 
              key={event.id} 
              to={`/events/${event.id}`}
              className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={event.associations?.image_url || defaultAssociationAvatar}
                      alt={event.associations?.name || 'Association'} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {event.associations?.name || 'Association'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getRelativeTimeString(event.date)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h2 className="text-xl font-bold">{event.title}</h2>
                  <p className="text-gray-600 mt-1">{event.description}</p>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Aucun événement trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
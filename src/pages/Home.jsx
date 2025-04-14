import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Définir un timeout pour éviter les blocages
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch profiles from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(20); // Limiter le nombre de résultats pour des performances optimales

        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    } else {
      setLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 bg-red-100 text-red-700 rounded m-3">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 bg-yellow-100 text-yellow-800 rounded m-3">
        <p>Vous devez être connecté pour voir cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Utilisateurs</h1>
      
      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-4">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
                    {user.first_name ? user.first_name.charAt(0) : user.email?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h2 className="font-bold">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.email || 'Utilisateur sans nom'}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
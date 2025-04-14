import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Create user profile in the profiles table
  const createProfile = async (userId, email, userData = {}) => {
    try {
      const { firstName, lastName } = userData;
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          email: email,
          first_name: firstName || '',
          last_name: lastName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Erreur lors de la création du profil:', error);
      }
    } catch (error) {
      console.error('Exception lors de la création du profil:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Définir un timeout pour éviter les blocages
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 2000); // Réduit à 2 secondes
    
    // Function to handle auth state changes
    const handleAuthStateChange = (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser && (event === 'SIGNED_IN' || event === 'SIGNED_UP')) {
        // Créer le profil en arrière-plan sans bloquer l'UI
        const metadata = currentUser.user_metadata || {};
        createProfile(currentUser.id, currentUser.email, metadata).catch(console.error);
      }
      
      setLoading(false);
    };

    // Get initial session without async/await to prevent blocking
    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        
        handleAuthStateChange('INITIAL', data.session);
      }
    }).catch(error => {
      if (mounted) {
        console.error('Exception lors de la récupération de la session:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    });
    
    // Setup the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  // Auth functions
  const signUp = (email, password, userData = {}) => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email_confirmed: true
        }
      }
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
            {authError && (
              <p className="text-red-500 mt-2">Erreur: {authError}</p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
} 
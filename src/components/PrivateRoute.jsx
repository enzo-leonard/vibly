import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('PrivateRoute:', { 
    path: location.pathname,
    isAuthenticated: !!user, 
    isLoading: loading
  });

  // Si encore en chargement, afficher un indicateur plus léger
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Vérification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!user) {
    console.log('Utilisateur non authentifié, redirection vers /auth');
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  console.log('Utilisateur authentifié, affichage du contenu protégé');
  return <Outlet />;
} 
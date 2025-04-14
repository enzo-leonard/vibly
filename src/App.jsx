import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Feed from './pages/Feed';
import Create from './pages/Create';
import CreateAssociation from './pages/CreateAssociation';
import EditAssociation from './pages/EditAssociation';
import JoinAssociation from './pages/JoinAssociation';
import './index.css';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Offers from './pages/Offers';

function App() {
  console.log('App component rendered');
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Page d'authentification publique */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Routes protégées avec layout commun */}
          <Route path="/" element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Feed />} />
              <Route path="event" element={<Events />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="feed" element={<Feed />} />
              <Route path="create" element={<Create />} />
              <Route path="create-association" element={<CreateAssociation />} />
              <Route path="edit-association/:id" element={<EditAssociation />} />
              <Route path="join-association" element={<JoinAssociation />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="offers" element={<Offers />} />
            </Route>
          </Route>
          
          {/* Redirection des routes inconnues vers l'accueil */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

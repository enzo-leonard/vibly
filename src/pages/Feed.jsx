import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { TABLES, getPosts, getPostLikes, getPostComments } from '../database/schema';
import defaultUserAvatar from '../assets/default_user.svg';
import defaultAssociationAvatar from '../assets/default_association.svg';

export default function Feed() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [userLikes, setUserLikes] = useState({});

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
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Récupérer les publications
        const { data: postsData, error: postsError } = await getPosts(supabase);
        
        if (postsError) throw postsError;
        
        setPosts(postsData || []);
        
        // Si l'utilisateur est connecté, récupérer ses likes
        if (userProfile) {
          const { data: likesData, error: likesError } = await supabase
            .from(TABLES.POST_LIKES)
            .select('post_id')
            .eq('profile_id', userProfile.id);
            
          if (likesError) throw likesError;
          
          // Créer un objet avec les IDs des posts likés
          const likesMap = {};
          likesData.forEach(like => {
            likesMap[like.post_id] = true;
          });
          
          setUserLikes(likesMap);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des publications:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userProfile]);

  const handleLike = async (postId) => {
    if (!userProfile) return;
    
    try {
      // Vérifier si l'utilisateur a déjà liké ce post
      const isLiked = userLikes[postId];
      
      if (isLiked) {
        // Supprimer le like
        const { error } = await supabase
          .from(TABLES.POST_LIKES)
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', userProfile.id);
          
        if (error) throw error;
        
        // Mettre à jour l'état local
        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[postId];
          return newLikes;
        });
        
        // Mettre à jour le compteur de likes dans le post
        setPosts(prev => prev.map(post => {
          const currentCount = post.post_likes?.[0]?.count || 0;
          if (post.id === postId) {
            return {
              ...post,
              post_likes: [{ count: Math.max(0, currentCount - 1) }]
            };
          }
          return post;
        }));
      } else {
        // Ajouter un like
        const { error } = await supabase
          .from(TABLES.POST_LIKES)
          .insert({
            post_id: postId,
            profile_id: userProfile.id
          });
          
        if (error) throw error;
        
        // Mettre à jour l'état local
        setUserLikes(prev => ({
          ...prev,
          [postId]: true
        }));
        
        // Mettre à jour le compteur de likes dans le post
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const currentCount = post.post_likes?.[0]?.count || 0;
            return {
              ...post,
              post_likes: [{ count: currentCount + 1 }]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      setError(error.message);
    }
  };

  const handleComment = async (postId) => {
    if (!userProfile || !commentText.trim()) return;
    
    try {
      // Ajouter le commentaire
      const { error } = await supabase
        .from(TABLES.POST_COMMENTS)
        .insert({
          post_id: postId,
          profile_id: userProfile.id,
          content: commentText.trim()
        });
        
      if (error) throw error;
      
      // Mettre à jour le compteur de commentaires dans le post
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            post_comments: (post.post_comments || 0) + 1
          };
        }
        return post;
      }));
      
      // Réinitialiser le champ de commentaire
      setCommentText('');
      
      // Rafraîchir les commentaires si le post est déjà développé
      if (expandedComments[postId]) {
        const { data, error: commentsError } = await getPostComments(supabase, postId);
        
        if (commentsError) throw commentsError;
        
        // Mettre à jour les commentaires dans l'état local
        setExpandedComments(prev => ({
          ...prev,
          [postId]: data
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      setError(error.message);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      // Fermer les commentaires
      setExpandedComments(prev => {
        const newComments = { ...prev };
        delete newComments[postId];
        return newComments;
      });
    } else {
      // Ouvrir et charger les commentaires
      try {
        const { data, error } = await getPostComments(supabase, postId);
        
        if (error) throw error;
        
        setExpandedComments(prev => ({
          ...prev,
          [postId]: data
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
        setError(error.message);
      }
    }
  };

  // Calculer la date relative
  const getRelativeTimeString = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffDays = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `il y a ${weeks} ${weeks === 1 ? 'semaine' : 'semaines'}`;
    }
    
    const months = Math.floor(diffDays / 30);
    return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
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
      {/* Liste des publications */}
      <div className="container mx-auto px-4 mt-4 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={post.association_id 
                        ? post.associations?.image_url || defaultAssociationAvatar
                        : post.profiles?.avatar_url || defaultUserAvatar} 
                      alt={post.association_id ? post.associations?.name : post.profiles?.first_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {post.association_id 
                        ? post.associations?.name || 'Association' 
                        : `${post.profiles?.first_name || ''} ${post.profiles?.last_name || ''}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getRelativeTimeString(post.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                </div>
                
                {post.image_url && (
                  <div className="mt-3 w-full rounded-lg overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Publication"
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="mx-3 my-1 bg-slate-100/20 text-slate-500 rounded-full p-1 flex items-center gap-2"> {post.post_likes?.[0]?.count || 0}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 text-purple-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
</svg>
                </div>

              {/* Actions */}
              <div onClick={() => console.log('can play', post)} className="flex border-t border-gray-100">

                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex-1 p-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50"
                >
                  {userLikes[post.id] ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5  text-purple-500">
  <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
</svg>
: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 text-purple-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
</svg>
}
                  <span >J'aime </span>
                </button>

                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex-1 p-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                  </svg>
                  <span>Commenter ({post.post_comments?.[0]?.count || 0})</span>
                </button>
              </div>
              
              {/* Section des commentaires */}
              {expandedComments[post.id] && (
                <div className="border-t border-gray-100 p-4">
                  <div className="space-y-3 mb-4">
                    {expandedComments[post.id].map(comment => (
                      <div key={comment.id} className="flex">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={comment.profiles?.avatar_url || defaultUserAvatar} 
                            alt={`${comment.profiles?.first_name || ''} ${comment.profiles?.last_name || ''}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-2">
                          <p className="font-medium text-sm">
                            {`${comment.profiles?.first_name || ''} ${comment.profiles?.last_name || ''}`}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getRelativeTimeString(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {userProfile && (
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img 
                          src={userProfile.avatar_url || defaultUserAvatar} 
                          alt="Votre avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="Ajouter un commentaire..."
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            className="bg-purple-600 text-white px-3 rounded-r-lg"
                          >
                            Envoyer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Aucune publication trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { 
  getConversationsForProfile, 
  getMessagesForConversation, 
  getParticipantsForConversation, 
  getProfileByUserId,
  TABLES 
} from '../database/schema';
import { FaCheck, FaCheckDouble, FaPlusCircle, FaArrowLeft, FaSearch } from 'react-icons/fa';

function Chat() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationName, setConversationName] = useState('');
  const [showConversationsList, setShowConversationsList] = useState(true);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getProfileByUserId(supabase, user.id);
        
        if (error) {
          console.error("Erreur lors du chargement du profil:", error);
          return;
        }
        
        setProfile(data);
        
        // Load conversations after profile is loaded
        loadConversations(data.id);
      } catch (error) {
        console.error("Exception lors du chargement du profil:", error);
      }
    };
    
    loadProfile();
  }, [user]);

  // Load conversations
  const loadConversations = async (profileId) => {
    try {
      const { data, error } = await getConversationsForProfile(supabase, profileId);
      
      if (error) {
        console.error("Erreur lors du chargement des conversations:", error);
        return;
      }
      
      // Get conversation names or generate them from participants
      const conversationsWithNames = await Promise.all(data.map(async (item) => {
        // Try to get the name from metadata
        let convo = item.conversations;
        
        // Get participants to generate a name if none exists
        const { data: participantsData } = await getParticipantsForConversation(
          supabase, 
          convo.id
        );
        
        // Filter out current user
        const otherParticipants = participantsData
          .filter(p => p.profile_id !== profileId)
          .map(p => p.profiles);
        
        // Generate conversation name from participants if not set
        const generatedName = otherParticipants.length > 0
          ? otherParticipants.map(p => `${p.first_name} ${p.last_name}`).join(', ')
          : 'Nouvelle conversation';
          
        // Add additional data
        return {
          ...convo,
          displayName: convo.name || generatedName,
          participants: participantsData,
          hasUnread: convo.has_unread
        };
      }));
      
      setConversations(conversationsWithNames);
      setLoading(false);
    } catch (error) {
      console.error("Exception lors du chargement des conversations:", error);
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    try {
      // Load messages
      const { data: messagesData, error: messagesError } = await getMessagesForConversation(
        supabase, 
        conversationId
      );
      
      if (messagesError) {
        console.error("Erreur lors du chargement des messages:", messagesError);
        return;
      }
      
      setMessages(messagesData);
      
      // Load participants
      const { data: participantsData, error: participantsError } = await getParticipantsForConversation(
        supabase, 
        conversationId
      );
      
      if (participantsError) {
        console.error("Erreur lors du chargement des participants:", participantsError);
        return;
      }
      
      setParticipants(participantsData);
      
      // Mark conversation as read
      updateReadStatus(conversationId);
      
      // Set up real-time subscription
      setupMessageSubscription(conversationId);
      
      // Scroll to bottom after messages load
      scrollToBottom();
    } catch (error) {
      console.error("Exception lors du chargement des données de conversation:", error);
    }
  };

  // Update read status for messages
  const updateReadStatus = async (conversationId) => {
    try {
      // Mark conversation as read for current user
      await supabase
        .from(TABLES.CONVERSATION_PARTICIPANTS)
        .update({ last_read: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('profile_id', profile.id);
        
      // Update conversation in state
      setConversations(conversations.map(convo => 
        convo.id === conversationId 
          ? { ...convo, hasUnread: false }
          : convo
      ));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de lecture:", error);
    }
  };

  // Set up real-time subscription for messages
  const setupMessageSubscription = (conversationId) => {
    const subscription = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.MESSAGES,
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // When we receive a new message, add it to our messages state
        const newMessage = payload.new;
        
        // Get the profile details for the message sender
        getProfileById(newMessage.profile_id).then(profile => {
          setMessages(currentMessages => [
            { ...newMessage, profiles: profile },
            ...currentMessages
          ]);
          scrollToBottom();
        });
      })
      .subscribe();

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  };

  // Helper to get profile by ID
  const getProfileById = async (profileId) => {
    const { data } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', profileId)
      .single();
    return data;
  };

  // Select a conversation to view
  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
    setShowUserSearch(false);
    setShowConversationsList(false);
  };

  // Back to conversation list
  const backToConversations = () => {
    setShowConversationsList(true);
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation || !profile) return;
    
    try {
      // Clear the input field before sending to improve UX
      const messageToSend = newMessage.trim();
      setNewMessage('');
      
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .insert({
          conversation_id: activeConversation.id,
          profile_id: profile.id,
          content: messageToSend,
          created_at: new Date().toISOString(),
          is_read: false
        });
        
      if (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        return;
      }
      
      // Update conversation's last activity
      await supabase
        .from(TABLES.CONVERSATIONS)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation.id);
        
      // Force scroll to bottom after sending
      scrollToBottom();
    } catch (error) {
      console.error("Exception lors de l'envoi du message:", error);
    }
  };

  // Search for users
  const searchUsers = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
        .neq('id', profile?.id) // Exclude current user
        .limit(10);

      if (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error);
        return;
      }

      setSearchResults(data);
    } catch (error) {
      console.error("Exception lors de la recherche d'utilisateurs:", error);
    }
  };

  // Handle user search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchUsers(term);
  };

  // Toggle user selection
  const toggleUserSelection = (user) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Create a new conversation with selected users
  const createNewConversation = async () => {
    if (showUserSearch && selectedUsers.length === 0) {
      // Toggle to show user search if we're creating a new conversation
      setShowUserSearch(true);
      return;
    }

    try {
      // First create the conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .insert({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: conversationName || null
        })
        .select()
        .single();
        
      if (conversationError) {
        console.error("Erreur lors de la création de la conversation:", conversationError);
        return;
      }
      
      // Add current user as participant
      await supabase
        .from(TABLES.CONVERSATION_PARTICIPANTS)
        .insert({
          conversation_id: conversationData.id,
          profile_id: profile.id,
          created_at: new Date().toISOString(),
          last_read: new Date().toISOString()
        });
      
      // Add selected users as participants
      for (const selectedUser of selectedUsers) {
        await supabase
          .from(TABLES.CONVERSATION_PARTICIPANTS)
          .insert({
            conversation_id: conversationData.id,
            profile_id: selectedUser.id,
            created_at: new Date().toISOString(),
            last_read: null
          });
      }
      
      // Reset selection and toggle search off
      setSelectedUsers([]);
      setShowUserSearch(false);
      setSearchTerm('');
      setSearchResults([]);
      setConversationName('');
      
      // Refresh conversations
      loadConversations(profile.id);
      
      // Select the newly created conversation
      const convoWithDetails = {
        ...conversationData,
        displayName: conversationName || selectedUsers.map(u => `${u.first_name} ${u.last_name}`).join(', '),
        participants: [...selectedUsers, profile]
      };
      
      selectConversation(convoWithDetails);
    } catch (error) {
      console.error("Exception lors de la création de la conversation:", error);
    }
  };

  // Cancel user search
  const cancelUserSearch = () => {
    setShowUserSearch(false);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    setConversationName('');
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
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Conversations sidebar - only show on larger screens or when selected */}
      {showConversationsList && (
        <div className="w-full md:w-1/3 bg-white shadow-md md:border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-purple-700 text-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200 sticky top-16 bg-white z-10">
            <button 
              onClick={() => {
                setShowUserSearch(true);
                setShowConversationsList(false);
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
            >
              <FaPlusCircle className="mr-2" />
              Nouvelle Discussion
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center"
                >
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-purple-700 font-bold">
                    {conversation.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center justify-between">
                      <span>{conversation.displayName}</span>
                      {conversation.hasUnread && (
                        <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          ●
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-between">
                      <span>
                        {new Date(conversation.updated_at).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Pas de conversations
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* User search */}
      {showUserSearch && (
        <div className="w-full flex flex-col h-full overflow-hidden">
          <div className="p-4 bg-purple-700 text-white flex items-center sticky top-0 z-10">
            <button 
              onClick={() => {
                setShowUserSearch(false);
                setShowConversationsList(true);
              }}
              className="mr-3"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold">Nouvelle discussion</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200 sticky top-16 bg-white z-10">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la conversation (optionnel)
              </label>
              <input
                type="text"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                placeholder="Donnez un nom à cette discussion..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher par nom ou email..."
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 && (
              <div className="p-2">
                {searchResults.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-50 flex items-center ${
                      selectedUsers.some(u => u.id === user.id) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-purple-700 font-bold">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="ml-2">
                      {selectedUsers.some(u => u.id === user.id) ? (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white">
                          <FaCheck size={12} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <div className="text-center text-gray-500 my-6 p-4">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <div className="flex justify-between items-center space-x-3">
              <button 
                onClick={cancelUserSearch}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button 
                onClick={createNewConversation}
                disabled={selectedUsers.length === 0}
                className={`flex-1 py-3 rounded-lg text-white ${
                  selectedUsers.length > 0 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } transition`}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat area */}
      {!showUserSearch && activeConversation && !showConversationsList && (
        <div className="w-full flex flex-col h-full overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center sticky top-0 z-10">
            <button 
              onClick={backToConversations}
              className="mr-3 text-purple-700"
            >
              <FaArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-purple-700 font-bold">
              {activeConversation.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{activeConversation.displayName}</h3>
              <div className="text-xs text-gray-500">
                {participants.length} participants
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse bg-gray-50">
            <div ref={messagesEndRef} />
            {messages.length > 0 ? (
              messages.map(message => (
                <div 
                  key={message.id}
                  className={`mb-4 max-w-xs md:max-w-md ${
                    message.profile_id === profile?.id 
                      ? 'ml-auto' 
                      : 'mr-auto'
                  }`}
                >
                  <div className={`rounded-2xl p-3 ${
                    message.profile_id === profile?.id 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                  }`}>
                    {message.profile_id !== profile?.id && (
                      <div className="font-semibold text-xs mb-1 text-gray-600">
                        {message.profiles?.first_name} {message.profiles?.last_name}
                      </div>
                    )}
                    <div>{message.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-1">
                      {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {message.profile_id === profile?.id && (
                      <span className="text-purple-600">
                        {message.is_read ? <FaCheckDouble size={10} /> : <FaCheck size={10} />}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 my-auto p-8">
                Pas de messages. Commencez la conversation!
              </div>
            )}
          </div>
          
          {/* Message input */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 bg-white sticky bottom-0">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 border border-gray-300 rounded-l-full p-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                type="submit"
                className="bg-purple-600 text-white rounded-r-full px-6 py-3 hover:bg-purple-700 transition"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Empty state */}
      {!showUserSearch && !activeConversation && !showConversationsList && (
        <div className="flex items-center justify-center h-full w-full text-gray-500">
          <div className="text-center p-4">
            <div className="text-6xl text-purple-300 mb-4">💬</div>
            <h3 className="text-xl font-medium text-purple-700 mb-2">Vos discussions</h3>
            <p className="mb-6">Sélectionnez une conversation pour commencer à discuter</p>
            <button 
              onClick={() => setShowConversationsList(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Voir les conversations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat; 
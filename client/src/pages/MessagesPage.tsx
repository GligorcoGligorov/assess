import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  room_id: string;
  other_user_name: string;
  property_title: string;
  content: string;
  created_at: string;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect socket
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api.get('/messages/conversations');
        setConversations(data.data.conversations || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Join room and fetch messages
  const openConversation = async (conv: Conversation) => {
    setActiveRoom(conv.room_id);
    setActiveConversation(conv);

    // Leave previous room
    if (activeRoom) {
      socketRef.current?.emit('leave_room', activeRoom);
    }

    // Join new room
    socketRef.current?.emit('join_room', conv.room_id);

    // Fetch messages
    const parts = conv.room_id.split('_');
    const propertyId = parts[parts.length - 1];
    const otherUserId = parts.find(p => p !== user?.id && p !== propertyId);

    try {
      const data = await api.get('/messages', {
        params: { receiver_id: otherUserId, property_id: propertyId }
      });
      setMessages(data.data.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => {
      socketRef.current?.off('receive_message');
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    setIsSending(true);

    const parts = activeRoom.split('_');
    const propertyId = parts[parts.length - 1];
    const receiverId = parts.find(p => p !== user?.id && p !== propertyId);

    try {
      await api.post('/messages', {
        receiver_id: receiverId,
        property_id: propertyId,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🏡</span>
            <span className="text-xl font-bold text-slate-900">RentEase</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="pt-16 flex flex-1 max-w-6xl mx-auto w-full px-6 py-6 gap-6">
        {/* Conversations list */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Messages</h2>
              <p className="text-slate-500 text-sm mt-0.5">{conversations.length} conversations</p>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-slate-500 text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {conversations.map((conv) => (
                  <button
                    key={conv.room_id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors ${
                      activeRoom === conv.room_id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {conv.other_user_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{conv.other_user_name}</p>
                        <p className="text-slate-500 text-xs truncate">{conv.property_title || 'Property'}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{conv.content}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeRoom && activeConversation ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {activeConversation.other_user_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{activeConversation.other_user_name}</p>
                  <p className="text-slate-500 text-xs">{activeConversation.property_title || 'Property'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="text-slate-500 text-sm">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs mr-2 flex-shrink-0 self-end">
                            {message.sender_name?.charAt(0)}
                          </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-3 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                          }`}>
                            {message.content}
                          </div>
                          <span className="text-xs text-slate-400 mt-1 px-1">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Send →
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your messages</h3>
                <p className="text-slate-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
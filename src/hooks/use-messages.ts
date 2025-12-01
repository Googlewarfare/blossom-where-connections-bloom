import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    photo_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export const useMessages = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, conversations(id, created_at, updated_at)')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchError) throw matchError;

      const conversationsData: Conversation[] = [];

      for (const match of matches || []) {
        const conversationData = match.conversations;
        if (!conversationData) continue;

        const conversation = Array.isArray(conversationData) 
          ? conversationData[0] 
          : conversationData;
        
        if (!conversation) continue;

        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

        // Fetch other user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', otherUserId)
          .single();

        // Fetch profile photo
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('photo_url')
          .eq('user_id', otherUserId)
          .eq('is_primary', true)
          .limit(1);

        // Fetch last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('read', false)
          .neq('sender_id', user.id);

        conversationsData.push({
          id: conversation.id,
          match_id: match.id,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          other_user: {
            id: otherUserId,
            full_name: profile?.full_name || 'Unknown',
            photo_url: photos && photos.length > 0 ? photos[0].photo_url : '',
          },
          last_message: lastMsg && lastMsg.length > 0 ? lastMsg[0] : undefined,
          unread_count: unreadCount || 0,
        });
      }

      // Sort by most recent activity
      conversationsData.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at;
        const bTime = b.last_message?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('read', false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          conversation_id: conversationId,
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Set up realtime subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    refreshConversations: fetchConversations,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: 'heart' | 'like' | 'laugh';
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read: boolean;
  edited_at?: string;
  deleted: boolean;
  reactions?: MessageReaction[];
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
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
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

      // Fetch reactions for all messages
      if (data && data.length > 0) {
        const messageIds = data.map(m => m.id);
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('*')
          .in('message_id', messageIds);
        
        setReactions((reactionsData || []) as MessageReaction[]);
      }

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

  // Add reaction to a message
  const addReaction = async (messageId: string, reaction: 'heart' | 'like' | 'laugh') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction,
        });

      if (error) {
        // If unique constraint violation, update existing reaction
        if (error.code === '23505') {
          await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', user.id);
          
          await supabase
            .from('message_reactions')
            .insert({
              message_id: messageId,
              user_id: user.id,
              reaction,
            });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Remove reaction from a message
  const removeReaction = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
    }
  };

  // Edit a message
  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      // Get current message content for history
      const { data: currentMessage } = await supabase
        .from('messages')
        .select('content')
        .eq('id', messageId)
        .single();

      if (currentMessage) {
        // Save to edit history
        await supabase
          .from('message_edit_history')
          .insert({
            message_id: messageId,
            content: currentMessage.content,
          });
      }

      // Update message
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  // Delete a message (soft delete)
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
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

  // Set up realtime subscription for messages and reactions
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as MessageReaction]);
          } else if (payload.eventType === 'DELETE') {
            setReactions((prev) =>
              prev.filter((r) => r.id !== payload.old.id)
            );
          }
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

  // Combine messages with their reactions
  const messagesWithReactions = messages.map((msg) => ({
    ...msg,
    reactions: reactions.filter((r) => r.message_id === msg.id),
  }));

  return {
    messages: messagesWithReactions,
    conversations,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    refreshConversations: fetchConversations,
  };
};

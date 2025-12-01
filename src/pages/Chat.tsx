import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/hooks/use-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageReactions } from '@/components/MessageReactions';

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversationId
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, conversations, loading, sendMessage, addReaction, removeReaction } =
    useMessages(selectedConversation || undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    await sendMessage(messageText);
    setMessageText('');
  };

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/matches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </h2>

            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No conversations yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/discover')}
                  className="mt-2"
                >
                  Start matching
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conversation.other_user.photo_url} />
                          <AvatarFallback>
                            {conversation.other_user.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">
                              {conversation.other_user.full_name}
                            </h3>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default" className="shrink-0">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          {conversation.last_message && (
                            <>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message.sender_id === user?.id
                                  ? 'You: '
                                  : ''}
                                {conversation.last_message.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(
                                  new Date(conversation.last_message.created_at),
                                  'MMM d, h:mm a'
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Chat Window */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation && currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentConversation.other_user.photo_url} />
                    <AvatarFallback>
                      {currentConversation.other_user.full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">
                    {currentConversation.other_user.full_name}
                  </h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 text-xs mt-1 ${
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                              {isOwn && (
                                <span className="ml-1">
                                  {message.read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Message Reactions */}
                          {user && (
                            <MessageReactions
                              messageId={message.id}
                              reactions={message.reactions || []}
                              userId={user.id}
                              onAddReaction={addReaction}
                              onRemoveReaction={removeReaction}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, PREMIUM_FEATURES } from '@/lib/auth';
import { useMessages } from '@/hooks/use-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, MessageCircle, Check, CheckCheck, X, Paperclip, Image as ImageIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageReactions } from '@/components/MessageReactions';
import { MessageActions } from '@/components/MessageActions';
import { MediaPreview, UploadingMediaPreview } from '@/components/MediaPreview';
import { IcebreakerQuestions } from '@/components/IcebreakerQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscriptionStatus } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversationId
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const hasReadReceipts = subscriptionStatus?.subscribed && 
    subscriptionStatus.subscriptions?.some(sub => sub.product_id === PREMIUM_FEATURES.READ_RECEIPTS);

  const {
    messages,
    conversations,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  } = useMessages(selectedConversation || undefined);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
    
    // Handle subscription success
    const subscriptionSuccess = searchParams.get('subscription_success');
    if (subscriptionSuccess === 'true') {
      toast({
        title: "Read Receipts Active! 💬",
        description: "You can now see when messages are read!",
      });
      window.history.replaceState({}, '', '/chat');
    }
  }, [conversationId, searchParams, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read when viewing them
    const markMessagesAsRead = async () => {
      if (!selectedConversation || !user || messages.length === 0) return;
      
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender_id !== user.id
      );
      
      if (unreadMessages.length === 0) return;
      
      // Update all unread messages
      await Promise.all(
        unreadMessages.map(msg =>
          supabase
            .from('messages')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('id', msg.id)
        )
      );
    };
    
    markMessagesAsRead();
  }, [messages, selectedConversation, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      return (isImage || isVideo) && isUnder10MB;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (file: File) => {
    setSelectedFiles(prev => prev.filter(f => f !== file));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && selectedFiles.length === 0) return;

    await sendMessage(messageText, selectedFiles);
    setMessageText('');
    setSelectedFiles([]);
    setUploadProgress({});
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    await editMessage(messageId, editText);
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const startEditing = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditText(currentContent);
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

  const handleSubscribeReadReceipts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-read-receipts-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription",
        variant: "destructive",
      });
    }
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
          <div className="ml-auto flex gap-2">
            {hasReadReceipts ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Read Receipts Active
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubscriptionDialog(true)}
                className="border-primary/30"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Get Read Receipts
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/activity')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Activity
            </Button>
          </div>
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
                    const isEditing = editingMessageId === message.id;
                    
                    if (message.deleted) {
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="rounded-2xl px-4 py-2 bg-muted/50">
                              <p className="text-muted-foreground italic text-sm">
                                This message was deleted
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {isEditing ? (
                            <div className="w-full space-y-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleEditMessage(message.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingMessageId(null);
                                  }
                                }}
                                className="w-full"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditMessage(message.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingMessageId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
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
                                    className={`flex items-center gap-2 text-xs mt-1 ${
                                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}
                                   >
                                     <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                                     {message.edited_at && (
                                       <span className="italic">(edited)</span>
                                     )}
                                     {isOwn && hasReadReceipts && (
                                       <span className="ml-1 flex items-center gap-1">
                                         {message.read ? (
                                           <>
                                             <CheckCheck className="h-3 w-3 text-blue-400" />
                                             {message.read_at && (
                                               <span className="text-[10px]">
                                                 Read {format(new Date(message.read_at), 'h:mm a')}
                                               </span>
                                             )}
                                           </>
                                         ) : (
                                           <Check className="h-3 w-3" />
                                         )}
                                       </span>
                                     )}
                                     {isOwn && !hasReadReceipts && (
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         className="h-4 px-1 py-0 text-[10px] hover:bg-transparent"
                                         onClick={() => setShowSubscriptionDialog(true)}
                                       >
                                         <CheckCheck className="h-3 w-3 mr-0.5" />
                                         Enable
                                       </Button>
                                     )}
                                   </div>
                                </div>
                                {isOwn && (
                                  <MessageActions
                                    onEdit={() => startEditing(message.id, message.content)}
                                    onDelete={() => handleDeleteMessage(message.id)}
                                  />
                                )}
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
                              
                              {/* Media attachments */}
                              {message.media && message.media.length > 0 && (
                                <MediaPreview media={message.media} />
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t">
                  {selectedFiles.length > 0 && (
                    <UploadingMediaPreview
                      files={selectedFiles}
                      progress={uploadProgress}
                      onRemove={removeFile}
                    />
                  )}
                  <div className="flex gap-2 p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <IcebreakerQuestions onSend={(question) => setMessageText(question)} />
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!messageText.trim() && selectedFiles.length === 0}
                    >
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

        {/* Read Receipts Subscription Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Read Receipts Premium 💬
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                Know exactly when your messages are read!
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                      $4.99/month
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">See when messages are read</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">Real-time read timestamps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">Delivery confirmations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">Better conversation flow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">Cancel anytime</span>
                    </li>
                  </ul>
                  <Button
                    onClick={handleSubscribeReadReceipts}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    size="lg"
                  >
                    <CheckCheck className="w-5 h-5 mr-2" />
                    Subscribe Now
                  </Button>
                </div>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Chat;

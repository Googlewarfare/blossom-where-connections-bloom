import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, ThumbsUp, Laugh, Smile } from 'lucide-react';
import { MessageReaction } from '@/hooks/use-messages';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  userId: string;
  onAddReaction: (messageId: string, reaction: 'heart' | 'like' | 'laugh') => void;
  onRemoveReaction: (messageId: string) => void;
}

const REACTION_ICONS = {
  heart: { icon: Heart, emoji: '❤️', label: 'Heart' },
  like: { icon: ThumbsUp, emoji: '👍', label: 'Like' },
  laugh: { icon: Laugh, emoji: '😂', label: 'Laugh' },
};

export const MessageReactions = ({
  messageId,
  reactions,
  userId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) => {
  const [open, setOpen] = useState(false);

  // Group reactions by type
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check if user has reacted
  const userReaction = reactions.find((r) => r.user_id === userId);

  const handleReactionClick = (reaction: 'heart' | 'like' | 'laugh') => {
    if (userReaction?.reaction === reaction) {
      onRemoveReaction(messageId);
    } else {
      onAddReaction(messageId, reaction);
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      <AnimatePresence>
        {Object.entries(reactionCounts).map(([reaction, count]) => {
          const { emoji } = REACTION_ICONS[reaction as keyof typeof REACTION_ICONS];
          const isUserReaction = userReaction?.reaction === reaction;

          return (
            <motion.button
              key={reaction}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReactionClick(reaction as 'heart' | 'like' | 'laugh')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                isUserReaction
                  ? 'bg-primary/20 border border-primary'
                  : 'bg-muted/50 hover:bg-muted border border-border'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-xs font-medium">{count}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Add reaction button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
          >
            <Smile className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-2">
            {Object.entries(REACTION_ICONS).map(([key, { emoji, label }]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReactionClick(key as 'heart' | 'like' | 'laugh')}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  userReaction?.reaction === key
                    ? 'bg-primary/20'
                    : 'hover:bg-muted'
                }`}
                title={label}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

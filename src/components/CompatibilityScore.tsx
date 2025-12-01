import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface CompatibilityScoreProps {
  targetUserId: string;
}

export const CompatibilityScore = ({ targetUserId }: CompatibilityScoreProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCompatibility();
  }, [user, targetUserId]);

  const fetchCompatibility = async () => {
    if (!user) return;

    try {
      // Check if score already exists
      const { data: existingScore } = await supabase
        .from('compatibility_scores')
        .select('score, calculated_at')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      // If score exists and was calculated within last 24 hours, use it
      if (existingScore) {
        const ageInHours = (Date.now() - new Date(existingScore.calculated_at).getTime()) / (1000 * 60 * 60);
        if (ageInHours < 24) {
          setScore(existingScore.score);
          setLoading(false);
          return;
        }
      }

      // Calculate new score
      const { data, error } = await supabase.functions.invoke('calculate-compatibility', {
        body: {
          userId1: user.id,
          userId2: targetUserId
        }
      });

      if (error) throw error;
      if (data?.score) {
        setScore(data.score);
      }
    } catch (error) {
      console.error('Error fetching compatibility:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Calculating...</span>
      </Badge>
    );
  }

  if (score === null) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  return (
    <Badge className={`${getScoreColor(score)} text-white gap-1`}>
      <Heart className="h-3 w-3 fill-current" />
      <span className="font-bold">{score}%</span>
      <span className="text-xs">{getScoreLabel(score)}</span>
    </Badge>
  );
};

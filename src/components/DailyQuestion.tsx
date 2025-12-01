import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send } from 'lucide-react';

interface DailyQuestionData {
  id: string;
  question: string;
  category: string;
  date: string;
}

interface Answer {
  id: string;
  user_id: string;
  answer: string;
  profiles: {
    full_name: string;
    photo_url?: string;
  };
}

export const DailyQuestion = () => {
  const [question, setQuestion] = useState<DailyQuestionData | null>(null);
  const [answer, setAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayQuestion();
  }, []);

  const fetchTodayQuestion = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: questionData, error: qError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('date', today)
        .eq('is_active', true)
        .single();

      if (qError) throw qError;
      setQuestion(questionData);

      // Check if user already answered
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: userAnswer } = await supabase
          .from('user_question_answers')
          .select('*')
          .eq('question_id', questionData.id)
          .eq('user_id', userData.user.id)
          .maybeSingle();

        if (userAnswer) {
          setHasAnswered(true);
          setAnswer(userAnswer.answer);
        }

        // Fetch public answers
        const { data: answersData } = await supabase
          .from('user_question_answers')
          .select(`
            id,
            user_id,
            answer,
            profiles:user_id (
              full_name
            )
          `)
          .eq('question_id', questionData.id)
          .eq('is_public', true)
          .limit(10);

        if (answersData) {
          setAnswers(answersData as any);
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_question_answers')
        .insert({
          user_id: userData.user.id,
          question_id: question.id,
          answer: answer.trim(),
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "Answer submitted!",
        description: "Your answer has been shared with the community."
      });

      setHasAnswered(true);
      fetchTodayQuestion();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No daily question available yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Daily Question</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{question.category}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          
          {!hasAnswered ? (
            <>
              <Textarea
                placeholder="Share your thoughts..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {answer.length}/500
                </span>
                <Button 
                  onClick={submitAnswer} 
                  disabled={loading || !answer.trim()}
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Your Answer:</p>
              <p>{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answers.map((ans) => (
              <div key={ans.id} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-sm mb-2">
                  {ans.profiles?.full_name || 'Anonymous'}
                </p>
                <p className="text-sm">{ans.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

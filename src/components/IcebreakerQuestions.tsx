import { useState, useEffect } from 'react';
import { Lightbulb, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface IcebreakerQuestion {
  id: string;
  question: string;
  category: string;
}

interface IcebreakerQuestionsProps {
  onSend: (question: string) => void;
}

export const IcebreakerQuestions = ({ onSend }: IcebreakerQuestionsProps) => {
  const [questions, setQuestions] = useState<IcebreakerQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IcebreakerQuestion | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('icebreaker_questions')
      .select('*')
      .eq('is_active', true)
      .limit(20);
    
    if (data) {
      setQuestions(data);
      setCurrentQuestion(data[Math.floor(Math.random() * data.length)]);
    }
  };

  const getRandomQuestion = () => {
    if (questions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
  };

  const handleSend = () => {
    if (currentQuestion) {
      onSend(currentQuestion.question);
      setIsOpen(false);
      getRandomQuestion();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Lightbulb className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-80 z-50"
          >
            <Card className="p-4 shadow-lg border-2 border-primary/20">
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Icebreaker</h4>
                  <p className="text-sm text-muted-foreground">{currentQuestion.question}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getRandomQuestion}
                  className="flex-1"
                >
                  New Question
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  className="flex-1 gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface SuccessStory {
  id: string;
  story_text: string;
  photo_url?: string;
  meet_date?: string;
  created_at: string;
}

const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    const { data } = await supabase
      .from('success_stories')
      .select('*')
      .eq('approved', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setStories(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Success Stories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from real couples who found love through Blossom
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {story.photo_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={story.photo_url}
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed mb-4">{story.story_text}</p>
                {story.meet_date && (
                  <p className="text-xs text-muted-foreground">
                    Met: {new Date(story.meet_date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {stories.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No success stories yet. Be the first to share yours!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;

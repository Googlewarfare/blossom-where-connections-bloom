import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
  };
  profile_photos: Array<{
    photo_url: string;
    is_primary: boolean;
  }>;
}

export const StoryFeed = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select(
        `
        *,
        profiles:user_id (full_name),
        profile_photos:user_id (photo_url, is_primary)
      `,
      )
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      setStories(data as any);
    }
  };

  const viewStory = async (story: Story) => {
    setSelectedStory(story);
    setViewerOpen(true);

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from("story_views").insert({
        story_id: story.id,
        viewer_id: userData.user.id,
      });
    }
  };

  const getPrimaryPhoto = (photos: any[]) => {
    const primary = photos?.find((p) => p.is_primary);
    return primary?.photo_url || photos?.[0]?.photo_url;
  };

  // Group stories by user
  const groupedStories = stories.reduce(
    (acc, story) => {
      if (!acc[story.user_id]) {
        acc[story.user_id] = [];
      }
      acc[story.user_id].push(story);
      return acc;
    },
    {} as Record<string, Story[]>,
  );

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4">
        <Button
          variant="outline"
          className="flex-shrink-0 h-20 w-20 rounded-full p-0 border-2 border-dashed"
        >
          <Plus className="h-8 w-8" />
        </Button>

        {Object.values(groupedStories).map((userStories) => {
          const firstStory = userStories[0];
          return (
            <button
              key={firstStory.user_id}
              onClick={() => viewStory(firstStory)}
              className="flex-shrink-0 relative"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary via-primary/50 to-accent p-0.5">
                  <Avatar className="w-full h-full border-4 border-background">
                    <AvatarImage
                      src={getPrimaryPhoto(firstStory.profile_photos)}
                    />
                    <AvatarFallback>
                      {firstStory.profiles?.full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs mt-1 truncate max-w-[80px] text-center">
                {firstStory.profiles?.full_name}
              </p>
              {userStories.length > 1 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {userStories.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-md p-0 bg-black border-none">
          {selectedStory && (
            <div className="relative h-[600px]">
              {selectedStory.media_type.startsWith("image") ? (
                <img
                  src={selectedStory.media_url}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={selectedStory.media_url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              )}

              <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage
                    src={getPrimaryPhoto(selectedStory.profile_photos)}
                  />
                  <AvatarFallback>
                    {selectedStory.profiles?.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">
                    {selectedStory.profiles?.full_name}
                  </p>
                  <p className="text-white/80 text-xs">
                    {new Date(selectedStory.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {selectedStory.caption && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-white text-sm">{selectedStory.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

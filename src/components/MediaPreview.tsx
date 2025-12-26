import { useState, useEffect } from "react";
import { X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageMedia } from "@/hooks/use-messages";
import { supabase } from "@/integrations/supabase/client";

interface MediaPreviewProps {
  media: MessageMedia[];
  onRemove?: (media: MessageMedia) => void;
}

// Cache for signed URLs to avoid refetching
const signedUrlCache = new Map<string, { url: string; expiry: number }>();

const getSignedUrl = async (filePath: string): Promise<string | null> => {
  // Check cache first
  const cached = signedUrlCache.get(filePath);
  if (cached && cached.expiry > Date.now()) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error) throw error;

    // Cache for 55 minutes (leave 5 min buffer before expiry)
    signedUrlCache.set(filePath, {
      url: data.signedUrl,
      expiry: Date.now() + 55 * 60 * 1000,
    });

    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }
};

const MediaItem = ({
  item,
  onRemove,
}: {
  item: MessageMedia;
  onRemove?: (media: MessageMedia) => void;
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isImage = (type: string) => type.startsWith("image/");
  const isVideo = (type: string) => type.startsWith("video/");
  const isAudio = (type: string) => type.startsWith("audio/");

  useEffect(() => {
    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(false);

      // file_url now contains the storage path, not a full URL
      const filePath = item.file_url.includes("://")
        ? item.file_url.split("/").slice(-3).join("/") // Extract path from full URL
        : item.file_url;

      const url = await getSignedUrl(filePath);
      if (url) {
        setSignedUrl(url);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    fetchSignedUrl();
  }, [item.file_url]);

  if (loading) {
    return (
      <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
        <File className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative group">
      {isImage(item.file_type) ? (
        <img
          src={signedUrl}
          alt={item.file_name}
          className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(signedUrl, "_blank")}
        />
      ) : isVideo(item.file_type) ? (
        <video
          src={signedUrl}
          className="h-20 w-20 object-cover rounded-lg"
          controls
        />
      ) : isAudio(item.file_type) ? (
        <div className="h-20 w-40 bg-muted rounded-lg flex items-center justify-center p-2">
          <audio src={signedUrl} controls className="w-full h-8" />
        </div>
      ) : (
        <div
          className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80"
          onClick={() => window.open(signedUrl, "_blank")}
        >
          <File className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(item)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const MediaPreview = ({ media, onRemove }: MediaPreviewProps) => {
  if (media.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {media.map((item) => (
        <MediaItem key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface UploadingMediaPreviewProps {
  files: File[];
  progress?: Record<string, number>;
  onRemove?: (file: File) => void;
}

export const UploadingMediaPreview = ({
  files,
  progress = {},
  onRemove,
}: UploadingMediaPreviewProps) => {
  const isImage = (type: string) => type.startsWith("image/");
  const isVideo = (type: string) => type.startsWith("video/");

  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t">
      {files.map((file, index) => {
        const objectUrl =
          isImage(file.type) || isVideo(file.type)
            ? URL.createObjectURL(file)
            : null;

        return (
          <div key={index} className="relative group">
            {isImage(file.type) && objectUrl ? (
              <img
                src={objectUrl}
                alt={file.name}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ) : isVideo(file.type) && objectUrl ? (
              <video
                src={objectUrl}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ) : (
              <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
                <File className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Progress overlay */}
            {progress[file.name] !== undefined && progress[file.name] < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  {progress[file.name]}%
                </div>
              </div>
            )}

            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(file)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

import { X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageMedia } from '@/hooks/use-messages';

interface MediaPreviewProps {
  media: MessageMedia[];
  onRemove?: (media: MessageMedia) => void;
}

export const MediaPreview = ({ media, onRemove }: MediaPreviewProps) => {
  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  if (media.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {media.map((item) => (
        <div key={item.id} className="relative group">
          {isImage(item.file_type) ? (
            <img
              src={item.file_url}
              alt={item.file_name}
              className="h-20 w-20 object-cover rounded-lg"
            />
          ) : isVideo(item.file_type) ? (
            <video
              src={item.file_url}
              className="h-20 w-20 object-cover rounded-lg"
              controls={false}
            />
          ) : (
            <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
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
  onRemove 
}: UploadingMediaPreviewProps) => {
  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t">
      {files.map((file, index) => {
        const objectUrl = isImage(file.type) || isVideo(file.type) 
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

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VideoCallModalProps {
  isOpen: boolean;
  callState: {
    callId: string | null;
    status: 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
    remoteUserId: string | null;
    isCaller: boolean;
  };
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onAnswer: (callId: string, callerId: string) => void;
  onDecline: (callId: string) => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const VideoCallModal = ({
  isOpen,
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  onAnswer,
  onDecline,
  onEnd,
  onToggleMute,
  onToggleVideo,
}: VideoCallModalProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteUser, setRemoteUser] = useState<{ full_name: string; photo_url?: string } | null>(null);

  // Fetch remote user info
  useEffect(() => {
    const fetchRemoteUser = async () => {
      if (!callState.remoteUserId) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', callState.remoteUserId)
        .single();
      
      const { data: photo } = await supabase
        .from('profile_photos')
        .select('photo_url')
        .eq('user_id', callState.remoteUserId)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (profile) {
        setRemoteUser({
          full_name: profile.full_name || 'Unknown',
          photo_url: photo?.photo_url,
        });
      }
    };
    
    fetchRemoteUser();
  }, [callState.remoteUserId]);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <div className="relative w-full h-full bg-black">
          {/* Remote Video (Full Screen) */}
          {callState.status === 'active' && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background">
              <Avatar className="h-32 w-32 mb-4">
                {remoteUser?.photo_url ? (
                  <AvatarImage src={getPhotoUrl(remoteUser.photo_url)} />
                ) : null}
                <AvatarFallback className="text-4xl">
                  {remoteUser?.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">
                {remoteUser?.full_name || 'Unknown'}
              </h2>
              <p className="text-white/70">
                {callState.status === 'calling' && 'Calling...'}
                {callState.status === 'ringing' && !callState.isCaller && 'Incoming call...'}
                {callState.status === 'ringing' && callState.isCaller && 'Ringing...'}
              </p>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {localStream && (
            <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-white/50" />
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {callState.status === 'ringing' && !callState.isCaller ? (
              <>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                  onClick={() => callState.callId && onDecline(callState.callId)}
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                  onClick={() => callState.callId && callState.remoteUserId && 
                    onAnswer(callState.callId, callState.remoteUserId)}
                >
                  <Phone className="h-8 w-8" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  className="h-14 w-14 rounded-full"
                  onClick={onToggleMute}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                  onClick={onEnd}
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  className="h-14 w-14 rounded-full"
                  onClick={onToggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

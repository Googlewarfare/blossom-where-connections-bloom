import { createContext, useContext, ReactNode } from "react";
import { useVideoCall } from "@/hooks/use-video-call";
import { VideoCallModal } from "@/components/VideoCallModal";

interface VideoCallContextType {
  startCall: (recipientId: string, matchId: string) => Promise<void>;
  callState: {
    callId: string | null;
    status: "idle" | "calling" | "ringing" | "active" | "ended";
    remoteUserId: string | null;
    matchId: string | null;
    isCaller: boolean;
  };
}

const VideoCallContext = createContext<VideoCallContextType | null>(null);

export const useVideoCallContext = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error(
      "useVideoCallContext must be used within VideoCallProvider",
    );
  }
  return context;
};

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useVideoCall();

  const isCallActive = callState.status !== "idle";

  return (
    <VideoCallContext.Provider value={{ startCall, callState }}>
      {children}
      <VideoCallModal
        isOpen={isCallActive}
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onAnswer={answerCall}
        onDecline={declineCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
      />
    </VideoCallContext.Provider>
  );
};

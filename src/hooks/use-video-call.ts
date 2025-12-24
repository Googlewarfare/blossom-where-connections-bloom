import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface CallState {
  callId: string | null;
  status: 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
  remoteUserId: string | null;
  matchId: string | null;
  isCaller: boolean;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useVideoCall = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    remoteUserId: null,
    matchId: null,
    isCaller: false,
  });
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const signalChannel = useRef<any>(null);
  const callChannel = useRef<any>(null);

  // Initialize media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Please allow access to your camera and microphone",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create peer connection
  const createPeerConnection = (stream: MediaStream, remoteUserId: string, callId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    // Add local tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };
    
    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && user) {
        console.log('Sending ICE candidate');
        await supabase.from('call_signals').insert({
          call_id: callId,
          from_user_id: user.id,
          to_user_id: remoteUserId,
          signal_type: 'ice-candidate',
          signal_data: event.candidate.toJSON() as any,
        });
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, status: 'active' }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };
    
    peerConnection.current = pc;
    return pc;
  };

  // Start a call
  const startCall = async (recipientId: string, matchId: string) => {
    if (!user) return;
    
    try {
      setCallState({
        callId: null,
        status: 'calling',
        remoteUserId: recipientId,
        matchId,
        isCaller: true,
      });
      
      // Create call record
      const { data: call, error } = await supabase
        .from('video_calls')
        .insert({
          caller_id: user.id,
          recipient_id: recipientId,
          match_id: matchId,
          status: 'ringing',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCallState(prev => ({ ...prev, callId: call.id }));
      
      // Initialize media
      const stream = await initializeMedia();
      
      // Create peer connection
      const pc = createPeerConnection(stream, recipientId, call.id);
      
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      await supabase.from('call_signals').insert({
        call_id: call.id,
        from_user_id: user.id,
        to_user_id: recipientId,
        signal_type: 'offer',
        signal_data: { sdp: offer.sdp, type: offer.type } as any,
      });
      
      // Subscribe to signals
      subscribeToSignals(call.id, recipientId);
      
      toast({
        title: "Calling...",
        description: "Waiting for answer",
      });
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Call Failed",
        description: "Could not start video call",
        variant: "destructive",
      });
      endCall();
    }
  };

  // Answer a call
  const answerCall = async (callId: string, callerId: string) => {
    if (!user) return;
    
    try {
      setCallState({
        callId,
        status: 'active',
        remoteUserId: callerId,
        matchId: null,
        isCaller: false,
      });
      
      // Update call status
      await supabase
        .from('video_calls')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', callId);
      
      // Initialize media
      const stream = await initializeMedia();
      
      // Create peer connection
      const pc = createPeerConnection(stream, callerId, callId);
      
      // Get the offer
      const { data: signals } = await supabase
        .from('call_signals')
        .select('*')
        .eq('call_id', callId)
        .eq('signal_type', 'offer')
        .single();
      
      if (signals && signals.signal_data) {
        const signalData = signals.signal_data as { sdp: string; type: RTCSdpType };
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        
        // Create and send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await supabase.from('call_signals').insert({
          call_id: callId,
          from_user_id: user.id,
          to_user_id: callerId,
          signal_type: 'answer',
          signal_data: { sdp: answer.sdp, type: answer.type } as any,
        });
      }
      
      // Subscribe to signals
      subscribeToSignals(callId, callerId);
      
    } catch (error) {
      console.error('Error answering call:', error);
      toast({
        title: "Error",
        description: "Could not answer call",
        variant: "destructive",
      });
      endCall();
    }
  };

  // Decline a call
  const declineCall = async (callId: string) => {
    await supabase
      .from('video_calls')
      .update({ status: 'declined', ended_at: new Date().toISOString() })
      .eq('id', callId);
    
    setCallState({
      callId: null,
      status: 'idle',
      remoteUserId: null,
      matchId: null,
      isCaller: false,
    });
  };

  // End a call
  const endCall = useCallback(async () => {
    console.log('Ending call');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Update call status
    if (callState.callId) {
      await supabase
        .from('video_calls')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', callState.callId);
    }
    
    // Cleanup subscriptions
    if (signalChannel.current) {
      supabase.removeChannel(signalChannel.current);
    }
    if (callChannel.current) {
      supabase.removeChannel(callChannel.current);
    }
    
    setRemoteStream(null);
    setCallState({
      callId: null,
      status: 'idle',
      remoteUserId: null,
      matchId: null,
      isCaller: false,
    });
  }, [localStream, callState.callId]);

  // Subscribe to signaling channel
  const subscribeToSignals = (callId: string, remoteUserId: string) => {
    signalChannel.current = supabase
      .channel(`signals-${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `to_user_id=eq.${user?.id}`,
        },
        async (payload) => {
          const signal = payload.new as any;
          if (signal.call_id !== callId) return;
          
          console.log('Received signal:', signal.signal_type);
          
          if (!peerConnection.current) return;
          
          if (signal.signal_type === 'answer') {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(signal.signal_data)
            );
            setCallState(prev => ({ ...prev, status: 'active' }));
          } else if (signal.signal_type === 'ice-candidate') {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(signal.signal_data)
            );
          }
        }
      )
      .subscribe();
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!user) return;
    
    callChannel.current = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const call = payload.new as any;
          if (call.status === 'ringing' && callState.status === 'idle') {
            setCallState({
              callId: call.id,
              status: 'ringing',
              remoteUserId: call.caller_id,
              matchId: call.match_id,
              isCaller: false,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls',
        },
        (payload) => {
          const call = payload.new as any;
          if (call.id === callState.callId) {
            if (call.status === 'ended' || call.status === 'declined') {
              endCall();
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      if (callChannel.current) {
        supabase.removeChannel(callChannel.current);
      }
    };
  }, [user, callState.status, callState.callId, endCall]);

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return {
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
  };
};

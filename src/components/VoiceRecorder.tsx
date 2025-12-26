import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({
  onRecordingComplete,
  disabled,
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, duration);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Update timer every second
      timerRef.current = setInterval(() => {
        setRecordingTime(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={startRecording}
          disabled={disabled}
          className="hover:bg-primary/10"
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <>
          <Button
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            className="animate-pulse"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
          <span className="text-sm font-medium tabular-nums">
            {formatTime(recordingTime)}
          </span>
        </>
      )}
    </div>
  );
};

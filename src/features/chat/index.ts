/**
 * Chat Feature Module
 * 
 * Handles messaging, media sharing, and reactions.
 */

// Chat page
export { default as ChatPage } from "@/pages/Chat";

// Chat components
export { MessageActions } from "@/components/MessageActions";
export { MessageReactions } from "@/components/MessageReactions";
export { MediaPreview } from "@/components/MediaPreview";
export { VoiceRecorder } from "@/components/VoiceRecorder";
export { EncryptionIndicator } from "@/components/EncryptionIndicator";

// Chat hooks
export { useMessages } from "@/hooks/use-messages";

export interface UserSettings {
  phoenixBaseUrl: string;
  phoenixSessionId: string;
  phoenixSessionName: string;
}

export interface PhoenixSession {
  id: string;
  display_name: string;
  created_at: string;
}

export type MessageRequest =
  | { type: 'LIST_SESSIONS' }
  | { type: 'GENERATE_MESSAGES'; payload: MessagingRequest }
  | { type: 'CHECK_CONFIG' }
  | { type: 'OPEN_OPTIONS' };

export interface MessageResponse {
  success: boolean;
  error?: string;
  settings?: UserSettings;
  configStatus?: {
    phoenixAuthenticated: boolean;
  };
  sessions?: PhoenixSession[];
  replies?: ScoredReply[];
  summary?: ConversationSummary;
}

export interface ChatMessage {
  sender: 'me' | 'other';
  senderName: string;
  content: string;
  timestamp?: string;
}

export interface ConversationContext {
  participantName: string;
  participantHeadline?: string;
  messages: ChatMessage[];
  topic?: string;
  sentiment?: 'positive' | 'neutral' | 'negotiating' | 'cold';
  lastMessageFrom: 'me' | 'other';
  detectedIntent?: MessageIntent;
  isRecruiter?: boolean;
}

export type MessageIntent =
  | 'recruiter-inbound'
  | 'cold-outreach'
  | 'follow-up'
  | 'thank-you'
  | 'informational'
  | 'connection-request'
  | 'general';

export type MessagingToneType =
  | 'friendly'
  | 'professional'
  | 'follow-up'
  | 'informational'
  | 'networking';

export interface MessagingRequest {
  conversationContext: ConversationContext;
  sessionId: string;
  userThoughts?: string;
}

export interface ScoredReply {
  text: string;
  recommendationTag: MessagingRecommendationTag;
}

export type MessagingRecommendationTag =
  | 'Most Authentic'
  | 'Best Follow-up'
  | 'Move Forward'
  | 'Build Rapport'
  | 'Safe Choice'
  | 'Get the Meeting';

export interface ConversationSummary {
  topic: string;
  lastMessageSummary: string;
  suggestedAction: string;
}

export interface PostData {
  authorName: string;
  authorHeadline: string;
  postContent: string;
  imageUrl?: string;
}

export interface CommentData {
  authorName: string;
  authorHeadline: string;
  content: string;
  isReply?: boolean;
}

export interface ThreadContext {
  mode: 'post' | 'reply';
  parentComment?: CommentData;
  existingComments: CommentData[];
  threadParticipants: string[];
}

export interface EnrichedPostData extends PostData {
  threadContext: ThreadContext;
}

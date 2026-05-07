import { getSettings, migrateFromSaaSVersion, migrateFromSalesVersion } from '../utils/storage';
import {
  fetchPhoenixSessions,
  formatMessagesText,
  generateLinkedInReply,
  generateTemporaryLinkedInReply,
  getPhoenixUser,
  refineLinkedInReply,
} from '../utils/phoenix-client';
import type { MessageRequest, MessageResponse, ScoredReply } from '../types';

migrateFromSaaSVersion();
migrateFromSalesVersion();

chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
  if (request.type === 'LIST_SESSIONS') {
    handleListSessions()
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message || 'Failed to load Phoenix sessions' });
      });
    return true;
  }

  if (request.type === 'GENERATE_MESSAGES') {
    handleGenerateMessages(request.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message || 'Failed to generate message replies' });
      });
    return true;
  }

  if (request.type === 'REFINE_MESSAGE_REPLY') {
    handleRefineMessageReply(request.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message || 'Failed to refine message reply' });
      });
    return true;
  }

  if (request.type === 'CHECK_CONFIG') {
    handleCheckConfig()
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message || 'Failed to check configuration' });
      });
    return true;
  }

  if (request.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    return false;
  }

  return false;
});

async function handleListSessions(): Promise<MessageResponse> {
  const settings = await getSettings();

  if (!settings.phoenixBaseUrl) {
    return { success: false, error: 'Phoenix base URL is not configured.', sessions: [] };
  }

  const auth = await getPhoenixUser(settings.phoenixBaseUrl);
  if (!auth.success) {
    return {
      success: false,
      error: auth.error || 'Log in to Phoenix to use Phoenix Pilot.',
      settings,
      sessions: [],
      configStatus: {
        phoenixAuthenticated: false,
      },
    };
  }

  const sessions = await fetchPhoenixSessions(settings.phoenixBaseUrl);
  return {
    success: true,
    settings,
    sessions,
    configStatus: {
      phoenixAuthenticated: true,
    },
  };
}

async function handleCheckConfig(): Promise<MessageResponse> {
  const settings = await getSettings();
  const auth = await getPhoenixUser(settings.phoenixBaseUrl);

  if (!auth.success) {
    return {
      success: false,
      error: auth.error || 'Log in to Phoenix to use Phoenix Pilot.',
      settings,
      configStatus: {
        phoenixAuthenticated: false,
      },
    };
  }

  return {
    success: true,
    settings,
    configStatus: {
      phoenixAuthenticated: true,
    },
  };
}

async function handleGenerateMessages(payload: {
  conversationContext: Parameters<typeof formatMessagesText>[0];
  sessionId?: string;
  useTemporarySession?: boolean;
  userThoughts?: string;
}): Promise<MessageResponse> {
  const { conversationContext, sessionId, useTemporarySession, userThoughts } = payload;
  const settings = await getSettings();

  if (!settings.phoenixBaseUrl) {
    return { success: false, error: 'Phoenix base URL is not configured.' };
  }

  if (!sessionId && !useTemporarySession) {
    return { success: false, error: 'Select a Phoenix session before generating a reply.' };
  }

  const pilotBlock = {
    username: conversationContext.participantName,
    headline: conversationContext.participantHeadline,
    messagesText: formatMessagesText(conversationContext),
  };

  const result = useTemporarySession
    ? await generateTemporaryLinkedInReply(settings.phoenixBaseUrl, pilotBlock, userThoughts)
    : await generateLinkedInReply(settings.phoenixBaseUrl, sessionId!, pilotBlock, userThoughts);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const replies: ScoredReply[] = [{ text: result.reply!, recommendationTag: 'Most Authentic' }];
  return { success: true, replies, sessionId: result.sessionId || sessionId };
}

async function handleRefineMessageReply(payload: {
  sessionId: string;
  instruction: string;
}): Promise<MessageResponse> {
  const settings = await getSettings();

  if (!settings.phoenixBaseUrl) {
    return { success: false, error: 'Phoenix base URL is not configured.' };
  }

  if (!payload.sessionId) {
    return { success: false, error: 'Generate a reply before refining it.' };
  }

  if (!payload.instruction.trim()) {
    return { success: false, error: 'Add a refinement instruction.' };
  }

  const result = await refineLinkedInReply(
    settings.phoenixBaseUrl,
    payload.sessionId,
    payload.instruction.trim()
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const replies: ScoredReply[] = [{ text: result.reply!, recommendationTag: 'Refined' }];
  return { success: true, replies, sessionId: payload.sessionId };
}

import { getSettings, migrateFromSaaSVersion, migrateFromSalesVersion } from '../utils/storage';
import { formatMessagesText, generateLinkedInReply, getPhoenixUser } from '../utils/phoenix-client';
import type { MessageRequest, MessageResponse, ScoredReply } from '../types';

migrateFromSaaSVersion();
migrateFromSalesVersion();

chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
  if (request.type === 'GENERATE_MESSAGES') {
    handleGenerateMessages(request.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message || 'Failed to generate message replies' });
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
  sessionId: string;
  userThoughts?: string;
}): Promise<MessageResponse> {
  const { conversationContext, sessionId, userThoughts } = payload;
  const settings = await getSettings();

  if (!settings.phoenixBaseUrl) {
    return { success: false, error: 'Phoenix base URL is not configured.' };
  }

  if (!sessionId) {
    return { success: false, error: 'Select a Phoenix session before generating a reply.' };
  }

  const result = await generateLinkedInReply(
    settings.phoenixBaseUrl,
    sessionId,
    {
      username: conversationContext.participantName,
      headline: conversationContext.participantHeadline,
      messagesText: formatMessagesText(conversationContext),
    },
    userThoughts
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const replies: ScoredReply[] = [{ text: result.reply!, recommendationTag: 'Most Authentic' }];
  return { success: true, replies };
}

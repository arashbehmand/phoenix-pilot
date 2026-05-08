import type { ConversationContext, PhoenixSession } from '../types';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail || body?.error || body?.message;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || JSON.stringify(item)).join('; ');
    }
    if (typeof detail === 'string') {
      return detail;
    }
  } catch {
    // Fall through to status text.
  }
  return response.statusText || `HTTP ${response.status}`;
}

export async function fetchPhoenixSessions(baseUrl: string): Promise<PhoenixSession[]> {
  try {
    if (!baseUrl.trim()) return [];

    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/v1/sessions`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) return [];

    const sessions = await response.json();
    return Array.isArray(sessions)
      ? sessions.filter((session) => !session?.is_hidden && !session?.is_archived)
      : [];
  } catch {
    return [];
  }
}

export async function testPhoenixConnection(
  baseUrl: string
): Promise<{ success: boolean; error?: string; sessionCount?: number }> {
  try {
    if (!baseUrl.trim()) {
      return { success: false, error: 'Phoenix base URL is required.' };
    }

    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/v1/sessions`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false, error: await readError(response) };
    }

    const sessions = await response.json();
    return {
      success: true,
      sessionCount: Array.isArray(sessions) ? sessions.length : 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not connect to Phoenix.',
    };
  }
}

export async function getPhoenixUser(
  baseUrl: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    if (!baseUrl.trim()) {
      return { success: false, error: 'Phoenix base URL is required.' };
    }

    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false, error: await readError(response) };
    }

    const user = await response.json();
    return { success: true, email: typeof user?.email === 'string' ? user.email : undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not verify Phoenix login.',
    };
  }
}

export function formatMessagesText(context: ConversationContext): string {
  return context.messages
    .map((message) => {
      const timestamp = message.timestamp || '';
      return `[${timestamp}] ${message.senderName}: ${message.content}`;
    })
    .join('\n');
}

export async function generateLinkedInReply(
  baseUrl: string,
  sessionId: string,
  pilotBlock: {
    username: string;
    headline?: string;
    messagesText: string;
  },
  draftContent?: string
): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    const apiBase = normalizeBaseUrl(baseUrl);

    const blockResponse = await fetch(`${apiBase}/api/v1/sessions/${sessionId}/pilot-block`, {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders(),
      body: JSON.stringify({
        username: pilotBlock.username,
        headline: pilotBlock.headline,
        messages_text: pilotBlock.messagesText,
      }),
    });

    if (!blockResponse.ok) {
      return { success: false, error: await readError(blockResponse) };
    }

    const taskResponse = await fetch(`${apiBase}/api/v1/sessions/${sessionId}/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders(),
      body: JSON.stringify({
        task_id: 'linkedin_response',
        user_inputs: { draft_content: draftContent || '' },
      }),
    });

    if (!taskResponse.ok) {
      const error = await readError(taskResponse);
      if (taskResponse.status === 422 || /honest_context/i.test(error)) {
        return {
          success: false,
          error: 'Phoenix session is missing honest context. Add honest job preferences in Phoenix, then try again.',
        };
      }
      return { success: false, error };
    }

    const body = await taskResponse.json();
    const reply = body?.artifact?.text_payload || body?.artifact?.content_raw || body?.text_payload;
    if (typeof reply !== 'string' || !reply.trim()) {
      return { success: false, error: 'Phoenix returned an empty LinkedIn response.' };
    }

    return { success: true, reply: reply.trim() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not generate LinkedIn reply.',
    };
  }
}

export async function generateTemporaryLinkedInReply(
  baseUrl: string,
  pilotBlock: {
    username: string;
    headline?: string;
    messagesText: string;
  },
  draftContent?: string,
  temporarySessionKey?: string,
  previousTemporarySessionId?: string
): Promise<{ success: boolean; reply?: string; sessionId?: string; error?: string }> {
  try {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/v1/sessions/temporary-linkedin-response`, {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders(),
      body: JSON.stringify({
        username: pilotBlock.username,
        headline: pilotBlock.headline,
        messages_text: pilotBlock.messagesText,
        draft_content: draftContent || '',
        client_session_key: temporarySessionKey || undefined,
        previous_session_id: previousTemporarySessionId || undefined,
      }),
    });

    if (!response.ok) {
      const error = await readError(response);
      if (/default honest context/i.test(error) || /honest context/i.test(error)) {
        return {
          success: false,
          error:
            'Phoenix needs a default honest context for no-session generation. Save honest job preferences in Phoenix or choose a session.',
        };
      }
      return { success: false, error };
    }

    const body = await response.json();
    const reply = body?.artifact?.text_payload || body?.artifact?.content_raw || body?.text_payload;
    if (typeof reply !== 'string' || !reply.trim()) {
      return { success: false, error: 'Phoenix returned an empty LinkedIn response.' };
    }

    return { success: true, reply: reply.trim(), sessionId: body?.session_id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not generate LinkedIn reply.',
    };
  }
}

export async function refineLinkedInReply(
  baseUrl: string,
  sessionId: string,
  instruction: string
): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    const response = await fetch(
      `${normalizeBaseUrl(baseUrl)}/api/v1/sessions/${sessionId}/artifacts/linkedin_response/refine`,
      {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ instruction }),
      }
    );

    if (!response.ok) {
      return { success: false, error: await readError(response) };
    }

    const body = await response.json();
    const reply = body?.text_payload || body?.artifact?.text_payload || body?.content_raw;
    if (typeof reply !== 'string' || !reply.trim()) {
      return { success: false, error: 'Phoenix returned an empty refined reply.' };
    }

    return { success: true, reply: reply.trim() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not refine LinkedIn reply.',
    };
  }
}

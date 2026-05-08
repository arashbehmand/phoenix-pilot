import type { UserSettings } from '../types';

const STORAGE_KEYS = {
  PHOENIX_BASE_URL: 'phoenix_base_url',
  PHOENIX_SESSION_ID: 'phoenix_session_id',
  PHOENIX_SESSION_NAME: 'phoenix_session_name',
  TEMPORARY_SESSION_MAP: 'phoenix_temporary_session_map',
} as const;

const LEGACY_KEYS = [
  'llm_provider',
  'openai_api_key',
  'llm_model',
  'user_persona',
  'enable_emojis',
  'language_level',
  'enable_image_analysis',
  'job_search_context',
  'phoenix_token',
  'phoenix_user_id',
  'comment_history',
  'comment_feedback',
  'persona_observations',
  'service_description',
  'auth_token',
  'server_url',
  'use_backend',
  'auth_step',
  'auth_userEmail',
  'extension_user_email',
  'fullenrich_api_key',
] as const;

const DEFAULT_SETTINGS: UserSettings = {
  phoenixBaseUrl: 'https://api.phoenix0.online',
  phoenixSessionId: '',
  phoenixSessionName: '',
};

function isExtensionContextValid(): boolean {
  try {
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

async function safeStorageOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isExtensionContextValid()) {
    console.warn('Extension context invalidated. Please refresh the page.');
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated. Please refresh the page.');
      return fallback;
    }
    throw error;
  }
}

export async function getSettings(): Promise<UserSettings> {
  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.get(
          [
            STORAGE_KEYS.PHOENIX_BASE_URL,
            STORAGE_KEYS.PHOENIX_SESSION_ID,
            STORAGE_KEYS.PHOENIX_SESSION_NAME,
          ],
          (result) => {
            if (chrome.runtime.lastError) {
              console.warn('Storage error:', chrome.runtime.lastError);
              resolve(DEFAULT_SETTINGS);
              return;
            }

            resolve({
              phoenixBaseUrl: result[STORAGE_KEYS.PHOENIX_BASE_URL] || DEFAULT_SETTINGS.phoenixBaseUrl,
              phoenixSessionId: result[STORAGE_KEYS.PHOENIX_SESSION_ID] || '',
              phoenixSessionName: result[STORAGE_KEYS.PHOENIX_SESSION_NAME] || '',
            });
          }
        );
      }),
    DEFAULT_SETTINGS
  );
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.set(
          {
            [STORAGE_KEYS.PHOENIX_BASE_URL]: settings.phoenixBaseUrl,
            [STORAGE_KEYS.PHOENIX_SESSION_ID]: settings.phoenixSessionId,
            [STORAGE_KEYS.PHOENIX_SESSION_NAME]: settings.phoenixSessionName,
          },
          () => {
            if (chrome.runtime.lastError) {
              console.warn('Storage error:', chrome.runtime.lastError);
            }
            resolve();
          }
        );
      }),
    undefined
  );
}

export async function savePhoenixSession(sessionId: string, sessionName: string): Promise<void> {
  const settings = await getSettings();
  await saveSettings({
    ...settings,
    phoenixSessionId: sessionId,
    phoenixSessionName: sessionName,
  });
}

export async function getTemporarySessionId(sessionKey: string): Promise<string> {
  if (!sessionKey) return '';

  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.TEMPORARY_SESSION_MAP], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('Storage error:', chrome.runtime.lastError);
            resolve('');
            return;
          }

          const sessionMap = result[STORAGE_KEYS.TEMPORARY_SESSION_MAP];
          resolve(
            sessionMap && typeof sessionMap === 'object' && typeof sessionMap[sessionKey] === 'string'
              ? sessionMap[sessionKey]
              : ''
          );
        });
      }),
    ''
  );
}

export async function saveTemporarySessionId(sessionKey: string, sessionId: string): Promise<void> {
  if (!sessionKey || !sessionId) return;

  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.TEMPORARY_SESSION_MAP], (result) => {
          const existingMap = result[STORAGE_KEYS.TEMPORARY_SESSION_MAP];
          const sessionMap =
            existingMap && typeof existingMap === 'object' && !Array.isArray(existingMap)
              ? existingMap
              : {};

          chrome.storage.local.set(
            {
              [STORAGE_KEYS.TEMPORARY_SESSION_MAP]: {
                ...sessionMap,
                [sessionKey]: sessionId,
              },
            },
            () => {
              if (chrome.runtime.lastError) {
                console.warn('Storage error:', chrome.runtime.lastError);
              }
              resolve();
            }
          );
        });
      }),
    undefined
  );
}

export async function migrateFromSaaSVersion(): Promise<void> {
  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.get(['migration_v2_done'], (result) => {
          if (result.migration_v2_done) {
            resolve();
            return;
          }

          chrome.storage.local.remove([...LEGACY_KEYS], () => {
            chrome.storage.local.set({ migration_v2_done: true }, () => {
              console.log('[Phoenix Pilot] Legacy SaaS settings removed');
              resolve();
            });
          });
        });
      }),
    undefined
  );
}

export async function migrateFromSalesVersion(): Promise<void> {
  return safeStorageOperation(
    () =>
      new Promise((resolve) => {
        chrome.storage.local.get(['migration_phoenix_pilot_done'], (result) => {
          if (result.migration_phoenix_pilot_done) {
            resolve();
            return;
          }

          chrome.storage.local.remove([...LEGACY_KEYS], () => {
            chrome.storage.local.set({ migration_phoenix_pilot_done: true }, () => {
              console.log('[Phoenix Pilot] Legacy local generation settings removed');
              resolve();
            });
          });
        });
      }),
    undefined
  );
}

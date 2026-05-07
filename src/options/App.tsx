import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { getPhoenixUser, testPhoenixConnection } from '../utils/phoenix-client';
import type { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  phoenixBaseUrl: 'https://api.phoenix0.online',
  phoenixSessionId: '',
  phoenixSessionName: '',
};

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; email?: string; error?: string; sessionCount?: number } | null>(null);

  useEffect(() => {
    getSettings().then((storedSettings) => {
      setSettings(storedSettings);
      checkLogin(storedSettings.phoenixBaseUrl);
    });
  }, []);

  const checkLogin = async (baseUrl = settings.phoenixBaseUrl) => {
    setIsChecking(true);
    const user = await getPhoenixUser(baseUrl);
    if (!user.success) {
      setStatus({ success: false, error: user.error || 'Not logged in to Phoenix.' });
      setIsChecking(false);
      return;
    }

    const sessions = await testPhoenixConnection(baseUrl);
    setStatus({
      success: true,
      email: user.email,
      sessionCount: sessions.sessionCount,
    });
    setIsChecking(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await saveSettings(settings);
    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 2500);
    checkLogin(settings.phoenixBaseUrl);
  };

  const openPhoenixLogin = () => {
    const webUrl = settings.phoenixBaseUrl
      .replace(/\/+$/, '')
      .replace('://api.', '://')
      .replace(':8000', ':5173');
    chrome.tabs.create({ url: `${webUrl}/login` });
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <h1 style={styles.title}>Phoenix Pilot Settings</h1>
          <p style={styles.subtitle}>Phoenix login powers LinkedIn message replies.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.section}>
            <label style={styles.label}>Phoenix API Base URL</label>
            <p style={styles.hint}>Production uses Phoenix automatically. Change this only for local development.</p>
            <input
              type="url"
              value={settings.phoenixBaseUrl}
              onChange={(e) => setSettings((prev) => ({ ...prev, phoenixBaseUrl: e.target.value }))}
              placeholder="https://api.phoenix0.online"
              style={styles.input}
            />
          </div>

          <div
            style={{
              ...styles.statusBox,
              ...(status?.success ? styles.statusSuccess : styles.statusWarning),
            }}
          >
            <div style={styles.statusTitle}>
              {isChecking ? 'Checking Phoenix login...' : status?.success ? 'Logged in to Phoenix' : 'Phoenix login required'}
            </div>
            <div style={styles.statusText}>
              {status?.success
                ? `${status.email || 'Phoenix account'} · ${status.sessionCount ?? 0} sessions available`
                : status?.error || 'Log in on the Phoenix website, then return to LinkedIn.'}
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button onClick={openPhoenixLogin} style={styles.primaryButton}>
              Open Phoenix Login
            </button>
            <button onClick={() => checkLogin()} disabled={isChecking} style={styles.secondaryButton}>
              {isChecking ? 'Checking...' : 'Check Login'}
            </button>
          </div>

          <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        <div style={styles.footer}>
          <span>Phoenix Pilot - AI job search assistant for LinkedIn</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '48px 16px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    fontFamily: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapper: {
    maxWidth: 640,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #0a66c2 0%, #00a0dc 100%)',
    marginBottom: 20,
    boxShadow: '0 8px 32px rgba(10, 102, 194, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    margin: 0,
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 32,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    margin: '0 0 12px',
    lineHeight: 1.5,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  statusBox: {
    padding: 16,
    borderRadius: 12,
    border: '1px solid',
    marginBottom: 20,
  },
  statusSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusWarning: {
    background: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 1.5,
  },
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0a66c2 0%, #00a0dc 100%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  saveButton: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #0a66c2 0%, #00a0dc 100%)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    color: '#6b7280',
    fontSize: 12,
  },
};

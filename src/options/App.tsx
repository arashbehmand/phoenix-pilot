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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <h1 style={styles.title}>Phoenix Pilot settings</h1>
          <p style={styles.subtitle}>Phoenix login powers LinkedIn message replies.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.section}>
            <label style={styles.label}>Phoenix API base URL</label>
            <p style={styles.hint}>Production uses Phoenix automatically. Change only for local development.</p>
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
            <div
              style={{
                ...styles.statusTitle,
                ...(status?.success ? styles.statusTitleSuccess : styles.statusTitleWarning),
              }}
            >
              {isChecking
                ? 'Checking Phoenix login...'
                : status?.success
                  ? 'Logged in to Phoenix'
                  : 'Phoenix login required'}
            </div>
            <div style={styles.statusText}>
              {status?.success
                ? `${status.email || 'Phoenix account'} · ${status.sessionCount ?? 0} sessions available`
                : status?.error || 'Log in on the Phoenix website, then return to LinkedIn.'}
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button onClick={openPhoenixLogin} style={styles.primaryButton}>
              Open Phoenix login
            </button>
            <button onClick={() => checkLogin()} disabled={isChecking} style={styles.ghostButton}>
              {isChecking ? 'Checking...' : 'Check login'}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...styles.saveButton,
              ...(saveSuccess ? styles.saveButtonSuccess : {}),
            }}
          >
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save settings'}
          </button>
        </div>

        <div style={styles.footer}>Phoenix Pilot · AI job search assistant for LinkedIn</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '52px 20px 80px',
    background: '#FFFFFF',
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#0A0A0A',
    WebkitFontSmoothing: 'antialiased',
  },
  wrapper: {
    maxWidth: 600,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 36,
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 8,
    background: '#FFE7D6',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
    color: '#0A0A0A',
    margin: '0 0 8px',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: 15,
    color: '#525252',
    margin: 0,
    lineHeight: 1.55,
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 8,
    padding: 28,
    border: '1px solid #E6E6E6',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#0A0A0A',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: '#8A8A8A',
    margin: '0 0 10px',
    lineHeight: 1.5,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 4,
    border: '1px solid #E6E6E6',
    background: '#F8F8F8',
    color: '#0A0A0A',
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    outline: 'none',
    boxSizing: 'border-box',
  },
  statusBox: {
    padding: 14,
    borderRadius: 6,
    border: '1px solid',
    marginBottom: 18,
  },
  statusSuccess: {
    background: '#DCFCE7',
    borderColor: '#15803D',
  },
  statusWarning: {
    background: '#FEF3C7',
    borderColor: '#B45309',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  statusTitleSuccess: {
    color: '#15803D',
  },
  statusTitleWarning: {
    color: '#B45309',
  },
  statusText: {
    fontSize: 13,
    color: '#525252',
    lineHeight: 1.5,
  },
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 14,
  },
  primaryButton: {
    padding: '11px 16px',
    borderRadius: 6,
    border: 'none',
    background: '#F26522',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  ghostButton: {
    padding: '11px 16px',
    borderRadius: 6,
    border: '1px solid #D0D0D0',
    background: 'transparent',
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveButton: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: 6,
    border: 'none',
    background: '#0A0A0A',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveButtonSuccess: {
    background: '#15803D',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    color: '#8A8A8A',
    fontSize: 12,
  },
};

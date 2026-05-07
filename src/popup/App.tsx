import { useEffect, useState } from 'react';
import { getSettings } from '../utils/storage';
import { getPhoenixUser } from '../utils/phoenix-client';

type ConfigStatus = 'loading' | 'ready' | 'missing';

export default function App() {
  const [status, setStatus] = useState<ConfigStatus>('loading');
  const [subtitle, setSubtitle] = useState('Checking Phoenix login...');

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const settings = await getSettings();
      const user = await getPhoenixUser(settings.phoenixBaseUrl);
      if (user.success) {
        setSubtitle(user.email || 'Logged in to Phoenix');
        setStatus('ready');
      } else {
        setSubtitle('Log in to Phoenix to generate LinkedIn replies');
        setStatus('missing');
      }
    } catch (error) {
      console.error('Configuration check failed:', error);
      setSubtitle('Phoenix login required');
      setStatus('missing');
    }
  };

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  const openLinkedIn = () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/messaging/' });
  };

  const openGitHub = () => {
    chrome.tabs.create({ url: 'https://github.com/egorceo/phoenix-pilot' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <div>
            <div style={styles.headerTitle}>Phoenix Pilot</div>
            <div style={styles.headerSubtitle}>LinkedIn message replies</div>
          </div>
        </div>
        <button onClick={openSettings} style={styles.iconButton} title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.34 3l.06.06A1.65 1.65 0 0 0 8.22 3.4H8.3A1.65 1.65 0 0 0 10 1.9V2a2 2 0 1 1 4 0v-.1a1.65 1.65 0 0 0 1.7 1.5h.08a1.65 1.65 0 0 0 1.82-.34l.06-.06A2 2 0 0 1 21 6.34l-.06.06a1.65 1.65 0 0 0-.34 1.82v.08A1.65 1.65 0 0 0 22.1 10H22a2 2 0 1 1 0 4h.1a1.65 1.65 0 0 0-1.5 1.7z" />
          </svg>
        </button>
      </div>

      <div style={styles.content}>
        <div
          style={{
            ...styles.statusBox,
            ...(status === 'ready' ? styles.statusReady : styles.statusMissing),
          }}
        >
          <div style={styles.statusTitle}>
            {status === 'loading' ? 'Checking...' : status === 'ready' ? 'Ready' : 'Login Required'}
          </div>
          <div style={styles.statusSubtitle}>{subtitle}</div>
        </div>

        <button onClick={openLinkedIn} style={styles.primaryButton}>Open LinkedIn Messages</button>

        <div style={styles.linksSection}>
          <button onClick={openSettings} style={styles.linkButton}>Settings</button>
          <button onClick={openGitHub} style={styles.linkButton}>GitHub</button>
        </div>
      </div>

      <div style={styles.footer}>AI job search assistant for LinkedIn</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 320,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#fff',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #0a66c2 0%, #00a0dc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
  },
  content: {
    padding: 16,
  },
  statusBox: {
    padding: 14,
    borderRadius: 12,
    border: '1px solid',
    marginBottom: 14,
  },
  statusReady: {
    background: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusMissing: {
    background: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 1.45,
  },
  primaryButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0a66c2 0%, #00a0dc 100%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  linksSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 12,
  },
  linkButton: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
};

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <div>
            <div style={styles.headerTitle}>Phoenix Pilot</div>
            <div style={styles.headerSubtitle}>LinkedIn message replies</div>
          </div>
        </div>
        <button onClick={openSettings} style={styles.iconButton} title="Settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <div
            style={{
              ...styles.statusTitle,
              ...(status === 'ready' ? styles.statusTitleReady : styles.statusTitleMissing),
            }}
          >
            {status === 'loading' ? 'Checking...' : status === 'ready' ? 'Ready' : 'Login required'}
          </div>
          <div style={styles.statusSubtitle}>{subtitle}</div>
        </div>

        <button onClick={openLinkedIn} style={styles.primaryButton}>
          Open LinkedIn messages
        </button>

        <div style={styles.linksSection}>
          <button onClick={openSettings} style={styles.ghostButton}>Settings</button>
          <button onClick={openGitHub} style={styles.ghostButton}>GitHub</button>
        </div>
      </div>

      <div style={styles.footer}>AI job search assistant for LinkedIn</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 320,
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#0A0A0A',
    background: '#FFFFFF',
    WebkitFontSmoothing: 'antialiased',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderBottom: '1px solid #E6E6E6',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 6,
    background: '#FFE7D6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0A0A0A',
    lineHeight: 1.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 1,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    border: '1px solid #E6E6E6',
    background: '#FFFFFF',
    color: '#525252',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    padding: 14,
  },
  statusBox: {
    padding: 12,
    borderRadius: 6,
    border: '1px solid',
    marginBottom: 12,
  },
  statusReady: {
    background: '#DCFCE7',
    borderColor: '#15803D',
  },
  statusMissing: {
    background: '#FEF3C7',
    borderColor: '#B45309',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 3,
  },
  statusTitleReady: {
    color: '#15803D',
  },
  statusTitleMissing: {
    color: '#B45309',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#525252',
    lineHeight: 1.5,
  },
  primaryButton: {
    width: '100%',
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
  linksSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginTop: 8,
  },
  ghostButton: {
    padding: '9px 12px',
    borderRadius: 4,
    border: '1px solid #E6E6E6',
    background: '#FFFFFF',
    color: '#525252',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  footer: {
    padding: '10px 14px',
    borderTop: '1px solid #E6E6E6',
    color: '#8A8A8A',
    fontSize: 11,
    textAlign: 'center',
  },
};

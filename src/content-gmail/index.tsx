import React from 'react';
import ReactDOM from 'react-dom/client';
import { GmailPanel } from './components/GmailPanel';
import { findComposeWindows, scrapeComposeContext, injectTextIntoCompose } from './utils/gmail-scraper';
import type { EmailContext } from '../types';

const buttonStyles = `
  .lai-gmail-ai-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #F26522;
    border: none;
    cursor: pointer;
    transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    margin: 0 4px;
    flex-shrink: 0;
    vertical-align: middle;
    align-self: center;
  }

  .lai-gmail-ai-button:hover {
    background: #D8541A;
    transform: scale(1.08);
  }

  .lai-gmail-ai-button svg {
    width: 15px;
    height: 15px;
    color: white;
  }
`;

// Per-compose-window tracking
const injectedComposeWindows = new Set<string>();
const composeBodyMap = new Map<string, HTMLElement>();

let panelRoot: ReactDOM.Root | null = null;
let panelContainer: HTMLElement | null = null;
let activeComposeKey: string | null = null;
let activeEmailContext: EmailContext | null = null;

function injectStyles() {
  if (document.getElementById('lai-gmail-styles')) return;
  const style = document.createElement('style');
  style.id = 'lai-gmail-styles';
  style.textContent = buttonStyles;
  document.head.appendChild(style);
}

function getPanelContainer(): HTMLElement {
  if (panelContainer) return panelContainer;

  panelContainer = document.createElement('div');
  panelContainer.id = 'lai-gmail-panel-container';

  const shadow = panelContainer.attachShadow({ mode: 'open' });
  const styleSheet = document.createElement('style');
  styleSheet.textContent = getPanelStyles();
  shadow.appendChild(styleSheet);

  const mountPoint = document.createElement('div');
  mountPoint.id = 'lai-gmail-panel-mount';
  shadow.appendChild(mountPoint);

  document.body.appendChild(panelContainer);
  return panelContainer;
}

function renderGmailPanel(emailContext: EmailContext | null) {
  const container = getPanelContainer();
  const shadow = container.shadowRoot!;
  const mountPoint = shadow.getElementById('lai-gmail-panel-mount')!;

  if (!panelRoot) {
    panelRoot = ReactDOM.createRoot(mountPoint);
  }

  panelRoot.render(
    <React.StrictMode>
      <GmailPanel
        emailContext={emailContext}
        onClose={closePanel}
        onInsertDraft={insertDraft}
      />
    </React.StrictMode>
  );
}

function insertDraft(draft: string) {
  if (!activeComposeKey) return;
  const composeBody = composeBodyMap.get(activeComposeKey);
  if (composeBody) {
    injectTextIntoCompose(composeBody, draft);
  }
  closePanel();
}

function openGmailPanel(composeKey: string, emailContext: EmailContext) {
  activeComposeKey = composeKey;
  activeEmailContext = emailContext;
  renderGmailPanel(emailContext);
}

function closePanel() {
  if (panelRoot) {
    panelRoot.unmount();
    panelRoot = null;
  }
  if (panelContainer) {
    panelContainer.remove();
    panelContainer = null;
  }
  activeComposeKey = null;
  activeEmailContext = null;
}

function injectGmailButton(composeWindow: Element) {
  // Generate or retrieve the compose key for this window
  let composeKey = composeWindow.getAttribute('data-phoenix-gmail-key');
  if (!composeKey) {
    composeKey = `gmail-compose-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    composeWindow.setAttribute('data-phoenix-gmail-key', composeKey);
  }

  // Already injected into this window
  if (injectedComposeWindows.has(composeKey)) return;

  // Store the compose body reference
  const { composeBody } = scrapeComposeContext(composeWindow);
  if (composeBody) {
    composeBodyMap.set(composeKey, composeBody);
  }

  // Find toolbar to inject button into
  const toolbarSelectors = [
    '.gU.Up',
    'tr.btC',
    '.adj',
    '.IZ.bG.aA7',
  ];

  let toolbar: Element | null = null;
  for (const selector of toolbarSelectors) {
    toolbar = composeWindow.querySelector(selector);
    if (toolbar) break;
  }

  if (!toolbar) return;

  const button = document.createElement('button');
  button.className = 'lai-gmail-ai-button';
  button.type = 'button';
  button.title = 'Phoenix email assistant';
  button.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  `;

  const capturedKey = composeKey;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { emailContext, composeBody: freshBody } = scrapeComposeContext(composeWindow);
    if (freshBody) composeBodyMap.set(capturedKey, freshBody);
    openGmailPanel(capturedKey, emailContext);
  });

  toolbar.appendChild(button);
  injectedComposeWindows.add(composeKey);
}

function cleanupComposeWindow(composeKey: string) {
  injectedComposeWindows.delete(composeKey);
  composeBodyMap.delete(composeKey);
  if (activeComposeKey === composeKey) {
    closePanel();
  }
}

function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Check for new compose windows added
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        // The node itself could be a compose window
        if (node.matches('.M9')) {
          injectGmailButton(node);
        }
        // Or it may contain compose windows
        node.querySelectorAll('.M9').forEach((el) => injectGmailButton(el));
      }

      // Check for removed compose windows
      for (const node of mutation.removedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const removedKey = node.getAttribute?.('data-phoenix-gmail-key');
        if (removedKey) {
          cleanupComposeWindow(removedKey);
        }
        // Also check descendants that had compose windows
        node.querySelectorAll?.('[data-phoenix-gmail-key]').forEach((el) => {
          const key = el.getAttribute('data-phoenix-gmail-key');
          if (key) cleanupComposeWindow(key);
        });
      }
    }

    // Also scan for any missed compose windows on each mutation
    findComposeWindows().forEach((el) => injectGmailButton(el));
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function init() {
  injectStyles();
  // Inject into any compose windows already on the page
  findComposeWindows().forEach((el) => injectGmailButton(el));
  setupObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function getPanelStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      max-height: calc(100vh - 100px);
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid #E6E6E6;
      box-shadow: 0 16px 48px -12px rgba(10,10,10,0.18);
      font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      color: #0A0A0A;
      z-index: 999999;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #E6E6E6;
      background: #FFFFFF;
      cursor: move;
      flex-shrink: 0;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 14px;
      color: #0A0A0A;
    }

    .panel-icon {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .panel-icon.email {
      background: #FFE7D6;
      color: #F26522;
    }

    .close-btn {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid #E6E6E6;
      background: #FFFFFF;
      color: #8A8A8A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms, color 180ms;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: #FEE2E2;
      border-color: #C42626;
      color: #C42626;
    }

    .messaging-context {
      padding: 12px 16px;
      background: #FFF4EC;
      border-bottom: 1px solid #E6E6E6;
      flex-shrink: 0;
    }

    .context-participant {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .context-label {
      font-size: 11px;
      color: #8A8A8A;
    }

    .context-value {
      font-size: 14px;
      font-weight: 600;
      color: #0A0A0A;
    }

    .context-headline {
      font-size: 12px;
      color: #8A8A8A;
      margin-top: 4px;
    }

    .context-empty {
      color: #8A8A8A;
      font-size: 13px;
      text-align: center;
      padding: 4px 0;
    }

    .panel-content {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #8A8A8A;
      margin-bottom: 8px;
    }

    .session-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
    }

    .thoughts-input-wrapper {
      position: relative;
    }

    .thoughts-input {
      width: 100%;
      padding: 10px 32px 10px 12px;
      background: #F8F8F8;
      border: 1px solid #E6E6E6;
      border-radius: 4px;
      color: #0A0A0A;
      font-size: 13px;
      font-family: inherit;
      line-height: 1.5;
      resize: none;
      min-height: 60px;
      max-height: 120px;
      transition: border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .thoughts-input::placeholder {
      color: #8A8A8A;
      font-size: 12px;
    }

    .thoughts-input:focus {
      outline: none;
      border-color: #F26522;
      box-shadow: 0 0 0 3px rgba(242, 101, 34, 0.12);
    }

    .tone-select:focus,
    .refine-input:focus {
      outline: none;
      border-color: #F26522;
      box-shadow: 0 0 0 3px rgba(242, 101, 34, 0.12);
    }

    .clear-thoughts-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: #F4F4F4;
      color: #8A8A8A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .optional-label {
      font-weight: 400;
      color: #8A8A8A;
      font-size: 10px;
      text-transform: none;
      letter-spacing: 0;
    }

    .tone-select {
      width: 100%;
      padding: 10px 12px;
      background: #F8F8F8;
      border: 1px solid #E6E6E6;
      border-radius: 4px;
      color: #0A0A0A;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .tone-select option {
      background: #FFFFFF;
      color: #0A0A0A;
    }

    .generate-btn {
      width: 100%;
      padding: 11px 20px;
      background: #F26522;
      border: none;
      border-radius: 6px;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .generate-btn:hover:not(:disabled) {
      background: #D8541A;
      transform: translateY(-1px);
    }

    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    .spinner-small {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(242, 101, 34, 0.2);
      border-top-color: #F26522;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .shimmer-card {
      background: #F4F4F4;
      border: 1px solid #E6E6E6;
      border-radius: 6px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shimmer-line {
      height: 11px;
      border-radius: 4px;
      background: linear-gradient(90deg, #E6E6E6 0%, #F4F4F4 50%, #E6E6E6 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .shimmer-line.long { width: 100%; }
    .shimmer-line.short { width: 55%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .comment-card {
      background: #FFFFFF;
      border: 1px solid #E6E6E6;
      border-radius: 6px;
      padding: 14px;
    }

    .recommendation-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      color: #F26522;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
      padding: 3px 8px;
      background: #FFF4EC;
      border: 1px solid #FFE7D6;
      border-radius: 2px;
    }

    .comment-text {
      font-size: 13px;
      line-height: 1.65;
      color: #0A0A0A;
      margin-bottom: 12px;
      white-space: pre-wrap;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .refine-panel {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #F0F0F0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .refine-custom-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .refine-input {
      flex: 1;
      min-width: 160px;
      padding: 8px 10px;
      background: #F8F8F8;
      border: 1px solid #E6E6E6;
      border-radius: 4px;
      color: #0A0A0A;
      font-size: 12px;
      font-family: inherit;
      transition: border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .refine-input::placeholder {
      color: #8A8A8A;
    }

    .action-btn,
    .settings-btn,
    .insert-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 7px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms, color 180ms;
    }

    .action-btn,
    .settings-btn {
      border: 1px solid #E6E6E6;
      background: #FFFFFF;
      color: #525252;
    }

    .action-btn:hover:not(:disabled),
    .settings-btn:hover {
      background: #F4F4F4;
      border-color: #D0D0D0;
      color: #0A0A0A;
    }

    .settings-btn.inline {
      margin-top: 10px;
      width: 100%;
    }

    .action-btn.copied {
      background: #DCFCE7;
      border-color: #15803D;
      color: #15803D;
    }

    .insert-btn {
      border: none;
      background: #F26522;
      color: #FFFFFF;
      font-weight: 500;
    }

    .insert-btn:hover {
      background: #D8541A;
    }

    .error-message {
      background: #FEE2E2;
      border: 1px solid #C42626;
      border-radius: 6px;
      padding: 12px;
      color: #C42626;
      font-size: 13px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 16px;
    }

    .error-icon {
      flex-shrink: 0;
      color: #C42626;
    }

    .panel-footer {
      padding: 10px 16px;
      border-top: 1px solid #E6E6E6;
      background: #FAFAFA;
      font-size: 11px;
      color: #8A8A8A;
      text-align: center;
      line-height: 1.5;
      flex-shrink: 0;
    }
  `;
}

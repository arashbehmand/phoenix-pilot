import React from 'react';
import ReactDOM from 'react-dom/client';
import { MessagingPanel } from './components/MessagingPanel';
import {
  findMessageFormContainer,
  injectTextIntoMessageInput,
  isMessagingPage,
  scrapeConversationContext,
} from './utils/messaging-scraper';
import type { ConversationContext } from '../types';

const contentStyles = `
  .lai-messaging-ai-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    margin: 0 4px;
    flex-shrink: 0;
    vertical-align: middle;
    align-self: center;
  }

  .lai-messaging-ai-button:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 10px rgba(124, 58, 237, 0.4);
    background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
  }

  .lai-messaging-ai-button svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

let panelRoot: ReactDOM.Root | null = null;
let panelContainer: HTMLElement | null = null;
let currentConversationContext: ConversationContext | null = null;

function injectStyles() {
  if (document.getElementById('lai-content-styles')) return;
  const style = document.createElement('style');
  style.id = 'lai-content-styles';
  style.textContent = contentStyles;
  document.head.appendChild(style);
}

function getPanelContainer(): HTMLElement {
  if (panelContainer) return panelContainer;

  panelContainer = document.createElement('div');
  panelContainer.id = 'lai-panel-container';

  const shadow = panelContainer.attachShadow({ mode: 'open' });
  const styleSheet = document.createElement('style');
  styleSheet.textContent = getPanelStyles();
  shadow.appendChild(styleSheet);

  const mountPoint = document.createElement('div');
  mountPoint.id = 'lai-panel-mount';
  shadow.appendChild(mountPoint);

  document.body.appendChild(panelContainer);
  return panelContainer;
}

function renderMessagingPanel(conversationContext: ConversationContext | null, isScanning: boolean) {
  const container = getPanelContainer();
  const shadow = container.shadowRoot!;
  const mountPoint = shadow.getElementById('lai-panel-mount')!;

  if (!panelRoot) {
    panelRoot = ReactDOM.createRoot(mountPoint);
  }

  panelRoot.render(
    <React.StrictMode>
      <MessagingPanel
        conversationContext={conversationContext}
        isScanning={isScanning}
        onClose={closePanel}
        onInsertReply={insertReply}
      />
    </React.StrictMode>
  );
}

function insertReply(reply: string) {
  const success = injectTextIntoMessageInput(reply);
  if (success) closePanel();
}

function openMessagingPanel() {
  getPanelContainer();
  currentConversationContext = null;
  renderMessagingPanel(null, true);

  (async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const context = await scrapeConversationContext();
    currentConversationContext = context;
    renderMessagingPanel(context, false);
  })();
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
  currentConversationContext = null;
}

function injectMessagingButton() {
  if (!isMessagingPage()) return;
  if (document.querySelector('.lai-messaging-ai-button')) return;

  const footerSelectors = [
    '.msg-form__left-actions',
    '.msg-form__right-actions',
    '.msg-form__footer',
    '.msg-form__content-container',
    '.msg-form',
  ];

  let footerContainer: Element | null = null;
  for (const selector of footerSelectors) {
    footerContainer = document.querySelector(selector);
    if (footerContainer) break;
  }

  if (!footerContainer && !findMessageFormContainer()) return;

  const button = document.createElement('button');
  button.className = 'lai-messaging-ai-button';
  button.type = 'button';
  button.title = 'Phoenix reply assistant';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  `;

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openMessagingPanel();
  });

  const leftActions = document.querySelector('.msg-form__left-actions');
  if (leftActions) {
    leftActions.appendChild(button);
    return;
  }

  const rightActions = document.querySelector('.msg-form__right-actions');
  if (rightActions) {
    rightActions.insertBefore(button, rightActions.firstChild);
    return;
  }

  footerContainer?.appendChild(button);
}

function isInIframe(): boolean {
  try {
    return window !== window.top;
  } catch {
    return true;
  }
}

function init() {
  injectStyles();

  if (!isInIframe() && isMessagingPage()) {
    injectMessagingButton();
  }

  let injectTimeout: ReturnType<typeof setTimeout> | null = null;
  const debouncedInject = () => {
    if (injectTimeout) clearTimeout(injectTimeout);
    injectTimeout = setTimeout(() => {
      if (!isInIframe() && isMessagingPage()) {
        injectMessagingButton();
      }
    }, 300);
  };

  const observer = new MutationObserver(debouncedInject);
  observer.observe(document.body, { childList: true, subtree: true });

  setInterval(() => {
    if (!isInIframe() && isMessagingPage()) {
      injectMessagingButton();
    }
  }, 2000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function getPanelStyles(): string {
  return `
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
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #fff;
      z-index: 999999;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
      cursor: move;
      flex-shrink: 0;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 14px;
    }

    .panel-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .panel-icon.messaging {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    }

    .close-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .messaging-context {
      padding: 12px 16px;
      background: rgba(124, 58, 237, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .context-scanning,
    .context-participant,
    .context-stats .stat {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .context-scanning {
      color: #a78bfa;
      font-size: 13px;
    }

    .context-label {
      font-size: 11px;
      color: #9ca3af;
    }

    .context-value {
      font-size: 14px;
      font-weight: 600;
      color: #f3f4f6;
    }

    .context-headline {
      font-size: 12px;
      color: #9ca3af;
      margin: 4px 0 8px;
    }

    .context-stats {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .context-stats .stat {
      font-size: 11px;
      color: #9ca3af;
    }

    .sentiment-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6b7280;
    }

    .sentiment-dot.positive { background: #22c55e; }
    .sentiment-dot.neutral { background: #eab308; }
    .sentiment-dot.negotiating { background: #f97316; }
    .sentiment-dot.cold { background: #6b7280; }

    .context-empty {
      padding: 12px;
      color: #9ca3af;
      font-size: 13px;
      text-align: center;
    }

    .panel-content {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 13px;
      font-family: inherit;
      line-height: 1.5;
      resize: none;
      min-height: 60px;
      max-height: 120px;
    }

    .thoughts-input::placeholder {
      color: #6b7280;
      font-size: 12px;
    }

    .thoughts-input:focus,
    .tone-select:focus {
      outline: none;
      border-color: #0a66c2;
      box-shadow: 0 0 0 3px rgba(10, 102, 194, 0.2);
    }

    .clear-thoughts-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .optional-label {
      font-weight: 400;
      color: #6b7280;
      font-size: 10px;
    }

    .tone-select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }

    .tone-select option {
      background: #1a1a2e;
      color: #fff;
    }

    .generate-btn {
      width: 100%;
      padding: 12px 20px;
      background: linear-gradient(135deg, #0a66c2 0%, #0077b5 100%);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .generate-btn:disabled,
    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner,
    .spinner-small {
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner {
      width: 18px;
      height: 18px;
    }

    .spinner-small {
      width: 12px;
      height: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .shimmer-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shimmer-line {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .shimmer-line.long { width: 100%; }
    .shimmer-line.short { width: 50%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .comment-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 14px;
    }

    .recommendation-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      padding: 3px 8px;
      background: rgba(59, 130, 246, 0.15);
      border-radius: 4px;
    }

    .comment-text {
      font-size: 13px;
      line-height: 1.6;
      color: #e5e7eb;
      margin-bottom: 12px;
      white-space: pre-wrap;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .action-btn,
    .settings-btn,
    .insert-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 10px;
      border-radius: 6px;
      color: #fff;
      font-size: 11px;
      cursor: pointer;
    }

    .action-btn,
    .settings-btn {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #d1d5db;
    }

    .settings-btn.inline {
      margin-top: 10px;
      width: 100%;
    }

    .action-btn.copied {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .insert-btn {
      border: none;
      background: linear-gradient(135deg, #0a66c2 0%, #0077b5 100%);
      font-weight: 500;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      padding: 12px;
      color: #fca5a5;
      font-size: 13px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 16px;
    }

    .error-icon {
      flex-shrink: 0;
      color: #ef4444;
    }

    .panel-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
      font-size: 11px;
      color: #6b7280;
      text-align: center;
      line-height: 1.5;
      flex-shrink: 0;
    }
  `;
}

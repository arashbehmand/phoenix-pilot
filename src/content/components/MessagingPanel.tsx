import { useEffect, useRef, useState } from 'react';
import type { ConversationContext, MessageRequest, MessageResponse, PhoenixSession, ScoredReply } from '../../types';
import { savePhoenixSession } from '../../utils/storage';

function isExtensionContextValid(): boolean {
  try {
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

async function safeSendMessage(request: MessageRequest): Promise<MessageResponse> {
  if (!isExtensionContextValid()) {
    return {
      success: false,
      error: 'Extension was updated. Please refresh the page.',
    };
  }

  try {
    return (await chrome.runtime.sendMessage(request)) as MessageResponse;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Extension context invalidated') ||
        error.message.includes('Receiving end does not exist'))
    ) {
      return {
        success: false,
        error: 'Extension was updated. Please refresh the page.',
      };
    }
    throw error;
  }
}

interface MessagingPanelProps {
  conversationContext: ConversationContext | null;
  isScanning?: boolean;
  onClose: () => void;
  onInsertReply: (reply: string) => void;
}

export function MessagingPanel({
  conversationContext,
  isScanning = false,
  onClose,
  onInsertReply,
}: MessagingPanelProps) {
  const [userThoughts, setUserThoughts] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<PhoenixSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [replies, setReplies] = useState<ScoredReply[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const canGenerate =
    !isScanning &&
    !isLoadingSessions &&
    !!conversationContext &&
    conversationContext.messages.length > 0 &&
    !!selectedSessionId;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.panel-header')) return;

      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;

      const rect = panel.getBoundingClientRect();
      dragRef.current.initialX = rect.left;
      dragRef.current.initialY = rect.top;

      panel.style.transition = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      panel.style.right = 'auto';
      panel.style.left = `${dragRef.current.initialX + dx}px`;
      panel.style.top = `${dragRef.current.initialY + dy}px`;
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      panel.style.transition = '';
    };

    panel.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      panel.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setError(null);

    const response = await safeSendMessage({ type: 'LIST_SESSIONS' });
    const loadedSessions = response.sessions || [];
    setSessions(loadedSessions);

    if (loadedSessions.length === 0) {
      setSelectedSessionId('');
      setError(response.error || 'Log in to Phoenix, then reopen this panel or refresh sessions.');
    } else if (
      response.settings?.phoenixSessionId &&
      loadedSessions.some((session) => session.id === response.settings?.phoenixSessionId)
    ) {
      setSelectedSessionId(response.settings.phoenixSessionId);
    } else {
      setSelectedSessionId('');
    }

    setIsLoadingSessions(false);
  };

  const handleSessionChange = async (sessionId: string) => {
    const selected = sessions.find((session) => session.id === sessionId);
    setSelectedSessionId(sessionId);
    await savePhoenixSession(sessionId, selected?.display_name || '');
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleGenerate = async () => {
    if (!conversationContext) {
      setError('No conversation context available.');
      return;
    }

    if (!selectedSessionId) {
      setError('Select a Phoenix session before generating a reply.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setReplies([]);

    try {
      const response = await safeSendMessage({
        type: 'GENERATE_MESSAGES',
        payload: {
          conversationContext,
          sessionId: selectedSessionId,
          userThoughts: userThoughts.trim() || undefined,
        },
      });

      if (response.success && response.replies) {
        setReplies(response.replies);
      } else {
        setError(response.error || 'Failed to generate replies.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const openSettings = () => {
    if (isExtensionContextValid()) {
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    } else {
      setError('Extension was updated. Please refresh the page.');
    }
  };

  return (
    <div className="panel messaging-panel" ref={panelRef}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon messaging">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span>Conversation Co-pilot</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="messaging-context">
        {isScanning ? (
          <div className="context-scanning">
            <div className="spinner-small" />
            <span>Analyzing conversation...</span>
          </div>
        ) : conversationContext ? (
          <>
            <div className="context-participant">
              <span className="context-label">Chatting with:</span>
              <span className="context-value">{conversationContext.participantName}</span>
            </div>
            {conversationContext.participantHeadline && (
              <div className="context-headline">{conversationContext.participantHeadline}</div>
            )}
            <div className="context-stats">
              <span className="stat">{conversationContext.messages.length} messages</span>
              <span className="stat">
                <span className={`sentiment-dot ${conversationContext.sentiment}`} />
                {conversationContext.sentiment}
              </span>
            </div>
          </>
        ) : (
          <div className="context-empty">Open a conversation to get started</div>
        )}
      </div>

      <div className="panel-content">
        <div className="section">
          <div className="section-label">Phoenix Session</div>
          <div className="session-row">
            <select
              className="tone-select"
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              disabled={isLoadingSessions || sessions.length === 0}
            >
              <option value="">
                {isLoadingSessions ? 'Loading sessions...' : sessions.length === 0 ? 'No sessions available' : 'Select a Phoenix session'}
              </option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.display_name}
                </option>
              ))}
            </select>
            <button className="action-btn" onClick={loadSessions} disabled={isLoadingSessions} title="Refresh sessions">
              {isLoadingSessions ? <div className="spinner-small" /> : 'Refresh'}
            </button>
          </div>
          {sessions.length === 0 && !isLoadingSessions && (
            <button className="settings-btn inline" onClick={openSettings}>Open Phoenix Login</button>
          )}
        </div>

        <div className="section">
          <div className="section-label">Your goal for this reply <span className="optional-label">(optional)</span></div>
          <div className="thoughts-input-wrapper">
            <textarea
              ref={textareaRef}
              className="thoughts-input"
              value={userThoughts}
              onChange={(e) => {
                setUserThoughts(e.target.value);
                adjustTextareaHeight();
              }}
              placeholder="Ask for a 20-min call, thank them for the intro, schedule next steps..."
              rows={2}
            />
            {userThoughts && (
              <button
                className="clear-thoughts-btn"
                onClick={() => {
                  setUserThoughts('');
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                  }
                }}
                title="Clear"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="section">
          <button className="generate-btn" onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
            {isGenerating ? (
              <>
                <div className="spinner" />
                Crafting Reply...
              </>
            ) : !conversationContext ? (
              'Open a Conversation'
            ) : !selectedSessionId ? (
              'Select a Phoenix Session'
            ) : (
              'Suggest Reply'
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="shimmer-container">
            <div className="shimmer-card">
              <div className="shimmer-line long" />
              <div className="shimmer-line short" />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg className="error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {replies.length > 0 && !isGenerating && (
          <div className="section">
            <div className="section-label">Suggested Reply</div>
            <div className="results">
              {replies.map((reply, index) => (
                <div key={index} className="comment-card">
                  <div className="recommendation-tag">{reply.recommendationTag}</div>
                  <div className="comment-text">{reply.text}</div>
                  <div className="comment-actions">
                    <button
                      className={`action-btn ${copiedIndex === index ? 'copied' : ''}`}
                      onClick={() => handleCopyToClipboard(reply.text, index)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </button>
                    <button className="insert-btn" onClick={() => onInsertReply(reply.text)} title="Insert into message box">
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <span>Phoenix Pilot - AI job search assistant for LinkedIn</span>
      </div>
    </div>
  );
}

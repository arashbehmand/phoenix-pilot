import { useEffect, useRef, useState } from 'react';
import type { EmailContext, MessageRequest, MessageResponse, PhoenixSession } from '../../types';
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
    return { success: false, error: 'Extension was updated. Please refresh the page.' };
  }
  try {
    return (await chrome.runtime.sendMessage(request)) as MessageResponse;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Extension context invalidated') ||
        error.message.includes('Receiving end does not exist'))
    ) {
      return { success: false, error: 'Extension was updated. Please refresh the page.' };
    }
    throw error;
  }
}

interface GmailPanelProps {
  emailContext: EmailContext | null;
  onClose: () => void;
  onInsertDraft: (draft: string) => void;
}

export function GmailPanel({ emailContext, onClose, onInsertDraft }: GmailPanelProps) {
  const [userInstructions, setUserInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<PhoenixSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [draft, setDraft] = useState('');
  const [activeDraftSessionId, setActiveDraftSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementText, setRefinementText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const canGenerate = !isLoadingSessions && !!emailContext && !!selectedSessionId;

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

    if (!response.success) {
      setSelectedSessionId('');
      setError(response.error || 'Log in to Phoenix, then reopen this panel or refresh sessions.');
    } else if (
      response.settings?.phoenixSessionId &&
      loadedSessions.some((s) => s.id === response.settings?.phoenixSessionId)
    ) {
      setSelectedSessionId(response.settings.phoenixSessionId);
    } else if (loadedSessions.length > 0) {
      setSelectedSessionId(loadedSessions[0].id);
    }

    setIsLoadingSessions(false);
  };

  const handleSessionChange = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveDraftSessionId('');
    const selected = sessions.find((s) => s.id === sessionId);
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
    if (!emailContext) {
      setError('No email context available.');
      return;
    }
    if (!selectedSessionId) {
      setError('Select a Phoenix session before generating a draft.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDraft('');
    setActiveDraftSessionId('');

    try {
      const response = await safeSendMessage({
        type: 'GENERATE_EMAIL',
        payload: {
          emailContext,
          sessionId: selectedSessionId,
          userInstructions: userInstructions.trim() || undefined,
        },
      });

      if (response.success && response.draft) {
        setDraft(response.draft);
        setActiveDraftSessionId(response.sessionId || selectedSessionId);
      } else {
        setError(response.error || 'Failed to generate email draft.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    const trimmed = instruction.trim();
    if (!trimmed) return;
    if (!activeDraftSessionId) {
      setError('Generate a draft before refining it.');
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await safeSendMessage({
        type: 'REFINE_EMAIL_DRAFT',
        payload: { sessionId: activeDraftSessionId, instruction: trimmed },
      });

      if (response.success && response.draft) {
        setDraft(response.draft);
      } else {
        setError(response.error || 'Failed to refine draft.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const openSettings = () => {
    if (isExtensionContextValid()) {
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    }
  };

  const contextLabel = emailContext
    ? [emailContext.recipientName, emailContext.subject].filter(Boolean).join(' · ')
    : null;

  return (
    <div className="panel gmail-panel" ref={panelRef}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <span>Email Co-pilot</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="messaging-context">
        {emailContext ? (
          <div className="context-participant">
            <span className="context-label">Composing to:</span>
            <span className="context-value">{contextLabel}</span>
          </div>
        ) : (
          <div className="context-empty">Open a compose window to get started</div>
        )}
        {emailContext?.threadText && (
          <div className="context-headline">Reply · thread detected</div>
        )}
      </div>

      <div className="panel-content">
        <div className="section">
          <div className="section-label">Phoenix Context</div>
          <div className="session-row">
            <select
              className="tone-select"
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              disabled={isLoadingSessions}
            >
              <option value="">
                {isLoadingSessions ? 'Loading sessions...' : 'Select a session'}
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
          {error && sessions.length === 0 && !isLoadingSessions && (
            <button className="settings-btn inline" onClick={openSettings}>Open Phoenix Login</button>
          )}
        </div>

        <div className="section">
          <div className="section-label">What should this email say? <span className="optional-label">(optional)</span></div>
          <div className="thoughts-input-wrapper">
            <textarea
              ref={textareaRef}
              className="thoughts-input"
              value={userInstructions}
              onChange={(e) => {
                setUserInstructions(e.target.value);
                adjustTextareaHeight();
              }}
              placeholder="Thank them for the offer, ask about the start date, negotiate salary..."
              rows={2}
            />
            {userInstructions && (
              <button
                className="clear-thoughts-btn"
                onClick={() => {
                  setUserInstructions('');
                  if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
              <><div className="spinner" />Drafting...</>
            ) : !selectedSessionId ? (
              'Select a Session'
            ) : (
              'Generate Draft'
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

        {draft && !isGenerating && (
          <div className="section">
            <div className="section-label">Draft</div>
            <div className="results">
              <div className="comment-card">
                <div className="recommendation-tag">Email Draft</div>
                <div className="comment-text">{draft}</div>
                <div className="comment-actions">
                  <button
                    className={`action-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    className="insert-btn"
                    onClick={() => { onInsertDraft(draft); onClose(); }}
                    title="Insert into email body"
                  >
                    Insert
                  </button>
                </div>
                <div className="refine-panel">
                  <div className="refine-custom-row">
                    <input
                      className="refine-input"
                      value={refinementText}
                      onChange={(e) => setRefinementText(e.target.value)}
                      placeholder="Make it shorter, more formal..."
                      disabled={isRefining}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && refinementText.trim()) {
                          handleRefine(refinementText);
                          setRefinementText('');
                        }
                      }}
                    />
                    <button
                      className="action-btn"
                      disabled={isRefining || !refinementText.trim()}
                      onClick={() => {
                        handleRefine(refinementText);
                        setRefinementText('');
                      }}
                    >
                      {isRefining ? <div className="spinner-small" /> : 'Refine'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <span>Phoenix Pilot - AI email assistant</span>
      </div>
    </div>
  );
}

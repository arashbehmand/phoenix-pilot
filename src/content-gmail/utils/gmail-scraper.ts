import type { EmailContext } from '../../types';

export interface EmailComposeScrape {
  emailContext: EmailContext;
  composeBody: HTMLElement | null;
}

export function findComposeWindows(): Element[] {
  return Array.from(document.querySelectorAll('.M9'));
}

function findRecipientName(composeWindow: Element): string {
  // Recipient chips render as spans with class aoD hl
  const chips = composeWindow.querySelectorAll('.aoD.hl');
  if (chips.length > 0) {
    const name = chips[0].textContent?.trim();
    if (name) return name;
  }

  // Fallback: To-field input placeholder value or aria-label sibling
  const toInput = composeWindow.querySelector('input[aria-label="To"]') as HTMLInputElement | null;
  if (toInput?.value.trim()) return toInput.value.trim();

  // Last fallback: look for any filled To field text
  const toField = composeWindow.querySelector('.aHl');
  if (toField?.textContent?.trim()) return toField.textContent.trim();

  return 'Recipient';
}

function findSubject(composeWindow: Element): string {
  const input = composeWindow.querySelector('input[name="subjectbox"]') as HTMLInputElement | null;
  return input?.value.trim() ?? '';
}

function scrapeConversationThread(composeWindow: Element): string {
  // For inline replies the thread messages live outside the compose window,
  // so we scope to document (Gmail shows one conversation at a time).
  const containerSelectors = ['div[data-message-id]', '.adn', '.h7'];
  let messageEls: Element[] = [];
  for (const sel of containerSelectors) {
    const found = Array.from(document.querySelectorAll(sel));
    if (found.length > 0) { messageEls = found; break; }
  }

  if (messageEls.length === 0) return '';

  const entries: string[] = [];
  for (const msgEl of messageEls) {
    // Skip the container that wraps the active compose window
    if (msgEl.contains(composeWindow) || composeWindow.contains(msgEl)) continue;

    const bodyEl = msgEl.querySelector('.a3s') ?? msgEl.querySelector('.ii.gt');
    if (!bodyEl) continue;

    // Clone and strip nested quotes, signatures, scripts — avoids quote duplication
    const clone = bodyEl.cloneNode(true) as Element;
    ['.gmail_quote', '.gmail_quote_container', 'blockquote', '.gmail_signature', 'script', 'style']
      .forEach((sel) => clone.querySelectorAll(sel).forEach((el) => el.remove()));

    const bodyText = clone.textContent?.trim() ?? '';
    if (!bodyText) continue;

    const senderEl = msgEl.querySelector('.gD') as HTMLElement | null;
    const sender = senderEl?.getAttribute('name') || senderEl?.textContent?.trim() || '';
    const timeEl = msgEl.querySelector('.g3') as HTMLElement | null;
    const timestamp = timeEl?.getAttribute('title') || timeEl?.textContent?.trim() || '';

    const prefix = [timestamp && `[${timestamp}]`, sender && `${sender}:`].filter(Boolean).join(' ');
    entries.push(prefix ? `${prefix}\n${bodyText}` : bodyText);
  }

  if (entries.length === 0) return '';

  // Cap at ~8000 chars; drop oldest messages first to preserve recent context
  while (entries.length > 1 && entries.join('\n\n---\n\n').length > 8000) {
    entries.shift();
  }
  return entries.join('\n\n---\n\n').slice(0, 8000);
}

function findThreadText(composeWindow: Element): string {
  // Primary: scrape the surrounding conversation thread (covers inline replies)
  const thread = scrapeConversationThread(composeWindow);
  if (thread) return thread;

  // Fallback: quoted block inside compose (pop-out replies, forwards)
  const quote = composeWindow.querySelector('.gmail_quote');
  if (quote?.textContent?.trim()) return quote.textContent.trim().slice(0, 8000);

  // Last resort: older Gmail layout
  const h7 = composeWindow.querySelector('.h7');
  if (h7?.textContent?.trim()) return h7.textContent.trim().slice(0, 8000);

  return '';
}

function findComposeBody(composeWindow: Element): HTMLElement | null {
  // Preferred: aria-label on the message body div
  const labeled = composeWindow.querySelector('div[aria-label="Message Body"]') as HTMLElement | null;
  if (labeled) return labeled;

  // Fallback: first contenteditable div within the compose window
  const editables = composeWindow.querySelectorAll('div[contenteditable="true"]');
  for (const el of editables) {
    // Skip the To/Subject fields (they're inputs or have specific roles)
    const parent = el.parentElement;
    if (parent && (parent.matches('.vO') || parent.matches('.aoD'))) continue;
    return el as HTMLElement;
  }

  return null;
}

export function scrapeComposeContext(composeWindow: Element): EmailComposeScrape {
  return {
    emailContext: {
      recipientName: findRecipientName(composeWindow),
      subject: findSubject(composeWindow) || undefined,
      threadText: findThreadText(composeWindow) || undefined,
    },
    composeBody: findComposeBody(composeWindow),
  };
}

export function injectTextIntoCompose(composeBody: HTMLElement, text: string): boolean {
  try {
    composeBody.focus();
    composeBody.innerHTML = text.replace(/\n/g, '<br>');
    composeBody.dispatchEvent(new Event('input', { bubbles: true }));
    composeBody.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

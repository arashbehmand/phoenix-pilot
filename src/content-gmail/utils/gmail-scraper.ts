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

function findThreadText(composeWindow: Element): string {
  // Quoted reply text (.gmail_quote) is present when replying or forwarding
  const quote = composeWindow.querySelector('.gmail_quote');
  if (quote?.textContent?.trim()) {
    return quote.textContent.trim().slice(0, 2000);
  }

  // Alternate selector for older Gmail layouts
  const h7 = composeWindow.querySelector('.h7');
  if (h7?.textContent?.trim()) {
    return h7.textContent.trim().slice(0, 2000);
  }

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

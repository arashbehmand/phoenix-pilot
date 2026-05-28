import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 pt-28">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-p-ink-mid hover:text-p-ink transition-colors mb-10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-10">
          <div className="w-10 h-10 rounded-[6px] bg-p-orange-faint flex items-center justify-center mb-5">
            <Shield className="w-5 h-5 text-p-orange" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-p-ink-soft">Last updated: May 28, 2026</p>
        </div>

        <div className="space-y-10 text-p-ink-mid leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">1. Overview</h2>
            <p>
              Phoenix Pilot is a free, open-source Chrome extension that generates AI-powered replies to LinkedIn messages and Gmail emails. It operates as a client of{' '}
              <a href="https://phoenix0.online" target="_blank" rel="noopener noreferrer" className="text-p-blue hover:text-p-blue-deep transition-colors">phoenix0.online</a>
              — the job search platform that handles all AI processing. This policy explains what data the extension accesses, how it is used, and your rights regarding that data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">2. Data We Collect</h2>

            <h3 className="text-base font-semibold text-p-ink mb-2">2.1 Conversation Content</h3>
            <p className="mb-3">
              When you activate the extension to generate a reply, it reads content from the page you are currently viewing:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-3 mb-3">
              <li><strong className="text-p-ink font-medium">LinkedIn:</strong> Participant name, headline, message history, and post content from the active conversation or thread.</li>
              <li><strong className="text-p-ink font-medium">Gmail:</strong> Sender name, subject line, and email thread content from the active compose window or thread.</li>
            </ul>
            <p>
              This content is sent to phoenix0.online solely to generate a contextual reply. The extension does not store conversation content locally or persist it independently of the phoenix0.online platform.
            </p>

            <h3 className="text-base font-semibold text-p-ink mt-5 mb-2">2.2 Extension Settings</h3>
            <p className="mb-3">
              The following preferences are stored locally in your browser using Chrome's storage API and never leave your device:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-3">
              <li>Phoenix API base URL</li>
              <li>Selected Phoenix session ID and name</li>
              <li>Temporary session identifiers for reply generation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">3. How We Use Your Data</h2>
            <p className="mb-3">Data accessed by the extension is used exclusively for:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-3">
              <li>Generating contextual message replies via the phoenix0.online API</li>
              <li>Maintaining your authenticated session with phoenix0.online</li>
              <li>Remembering your extension preferences between browser sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">4. Data Transmission</h2>
            <p className="mb-3">
              When you generate a reply, conversation content is transmitted to the Phoenix API at{' '}
              <code className="text-sm bg-p-surface-sunken border border-p-line rounded px-1.5 py-0.5 text-p-ink">https://api.phoenix0.online</code>.
              All communication is encrypted via HTTPS.
            </p>
            <p>
              The extension does not transmit any data to any third party other than phoenix0.online.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">5. Data Storage and Retention</h2>
            <p className="mb-3">
              Phoenix Pilot does not operate its own servers. The extension stores only your settings locally in your browser. Conversation data is processed ephemerally — read from the page, sent to phoenix0.online for reply generation, and not persisted by the extension itself.
            </p>
            <p className="mb-3">
              Data held by phoenix0.online is governed by the{' '}
              <a href="https://phoenix0.online/privacy" target="_blank" rel="noopener noreferrer" className="text-p-blue hover:text-p-blue-deep transition-colors">phoenix0.online privacy policy</a>.
            </p>
            <p>
              <strong className="text-p-ink font-medium">Data retention:</strong> Upon deletion of your phoenix0.online account, all associated data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">6. Third-Party Services</h2>
            <p className="mb-3">Phoenix Pilot interacts with the following services:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-3">
              <li><strong className="text-p-ink font-medium">phoenix0.online:</strong> The main platform that handles AI processing and session management. All API calls from the extension go to this service.</li>
              <li><strong className="text-p-ink font-medium">LinkedIn:</strong> The extension reads conversation data from LinkedIn pages. No data is written to or modified on LinkedIn.</li>
              <li><strong className="text-p-ink font-medium">Gmail:</strong> The extension reads email thread data from Gmail pages. No data is written to or modified in Gmail.</li>
              <li><strong className="text-p-ink font-medium">Google Fonts:</strong> The extension loads IBM Plex Sans from Google Fonts for consistent typography in the injected UI.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">7. Permissions</h2>
            <p className="mb-3">The extension requests the following Chrome permissions:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-3">
              <li><strong className="text-p-ink font-medium">storage:</strong> Saves your extension settings locally in your browser.</li>
              <li><strong className="text-p-ink font-medium">activeTab:</strong> Reads conversation context from the current tab when you activate the extension.</li>
              <li><strong className="text-p-ink font-medium">Host permissions (LinkedIn, Gmail, phoenix0.online):</strong> Injects the reply assistant UI on LinkedIn and Gmail pages, and communicates with the phoenix0.online API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">8. Your Rights</h2>
            <p className="mb-3">You can:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-3">
              <li>Clear all locally stored settings via the extension's settings page or by removing the extension</li>
              <li>Request deletion of your data by deleting your phoenix0.online account — all associated data is removed within 30 days</li>
              <li>Choose not to use the extension on pages containing sensitive content</li>
              <li>Revoke the extension's access at any time by disabling or uninstalling it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">9. Children's Privacy</h2>
            <p>
              Phoenix Pilot is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-p-ink mb-3">11. Contact</h2>
            <p>
              If you have questions about this privacy policy, please open an issue on the{' '}
              <a href="https://github.com/arashbehmand/phoenix-pilot" className="text-p-blue hover:text-p-blue-deep transition-colors" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

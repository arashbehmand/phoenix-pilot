import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-phoenix-cyan to-blue-500 mb-6 shadow-lg shadow-phoenix-cyan/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-400">Last updated: May 28, 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 border border-white/10 space-y-6 text-gray-300"
        >
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
            <p>
              Phoenix Pilot is a Chrome extension that helps you generate AI-powered replies to LinkedIn messages and Gmail emails. This privacy policy explains what data the extension accesses, how it is used, and your choices regarding that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">2.1 Conversation Content</h3>
            <p className="mb-4">
              When you activate the extension to generate a reply, it reads content from the page you are currently viewing:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">LinkedIn:</strong> Participant name, headline, message history, and post content from the active conversation or thread.</li>
              <li><strong className="text-white">Gmail:</strong> Sender name, subject line, and email thread content from the active compose window or thread.</li>
            </ul>
            <p className="mb-4">
              This content is sent to the Phoenix API solely to generate a contextual reply. The extension does not store conversation content locally or on any server controlled by the extension developer.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">2.2 Extension Settings</h3>
            <p className="mb-4">
              The following settings are stored locally in your browser using Chrome's storage API:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Phoenix API base URL</li>
              <li>Selected Phoenix session ID and name</li>
              <li>Temporary session identifiers for reply generation</li>
            </ul>
            <p className="mt-4">
              These settings never leave your browser and are not transmitted to any external service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">
              Data accessed by the extension is used exclusively for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generating contextual message replies via the Phoenix API</li>
              <li>Maintaining your authenticated session with the Phoenix API</li>
              <li>Remembering your extension preferences between browser sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Transmission</h2>
            <p className="mb-4">
              When you generate a reply, conversation content is transmitted to the Phoenix API at <code>https://api.phoenix0.online</code>. All communication is encrypted via HTTPS.
            </p>
            <p>
              The extension does not transmit any data to the extension developer or to any third party other than the Phoenix API.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Storage</h2>
            <p className="mb-4">
              Phoenix Pilot does not operate its own servers. The extension stores only your settings locally in your browser. Conversation data is processed ephemerally — it is read from the page, sent to the Phoenix API for reply generation, and is not persisted by the extension.
            </p>
            <p>
              For information on how the Phoenix service stores and processes your data, please refer to the Phoenix privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
            <p className="mb-4">
              Phoenix Pilot interacts with the following services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Phoenix API (api.phoenix0.online):</strong> Used to generate AI-powered replies and manage sessions. Conversation content is sent to this service for processing.</li>
              <li><strong className="text-white">LinkedIn:</strong> The extension reads conversation data from LinkedIn pages. No data is written to or modified on LinkedIn.</li>
              <li><strong className="text-white">Gmail:</strong> The extension reads email thread data from Gmail pages. No data is written to or modified in Gmail.</li>
              <li><strong className="text-white">Google Fonts:</strong> The extension loads the IBM Plex Sans font from Google Fonts for consistent typography in the injected UI.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Permissions</h2>
            <p className="mb-4">
              The extension requests the following Chrome permissions:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">storage:</strong> Saves your extension settings locally in your browser.</li>
              <li><strong className="text-white">activeTab:</strong> Reads conversation context from the current tab when you activate the extension.</li>
              <li><strong className="text-white">Host permissions (LinkedIn, Gmail, Phoenix API):</strong> Injects the reply assistant UI on LinkedIn and Gmail pages, and communicates with the Phoenix API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="mb-4">
              You can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clear all locally stored settings via the extension's settings page or by removing the extension</li>
              <li>Choose not to use the extension on pages containing sensitive content</li>
              <li>Revoke the extension's access by disabling or uninstalling it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p>
              Phoenix Pilot is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact</h2>
            <p>
              If you have questions about this privacy policy, please open an issue on our <a href="https://github.com/arashbehmand/phoenix-pilot" className="text-phoenix-cyan hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
            </p>
          </section>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

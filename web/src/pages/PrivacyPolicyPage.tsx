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
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              Phoenix Pilot ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension.
            </p>
            <p>
              By using Phoenix Pilot, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How the Extension Works</h2>
            <p className="mb-4">
              Phoenix Pilot is a Chrome extension that helps you generate AI-powered replies to LinkedIn messages and Gmail emails. The extension connects to your self-hosted or managed Phoenix backend instance to generate responses based on your configured sessions and preferences.
            </p>
            <p>
              <strong className="text-white">Important:</strong> Phoenix Pilot does not operate its own backend servers. The extension communicates only with the Phoenix API endpoint you configure (by default, <code>https://api.phoenix0.online</code>). Your data is processed by your Phoenix instance, not by Phoenix Pilot directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-white mb-3">3.1 Authentication</h3>
            <p className="mb-4">
              Phoenix Pilot uses cookie-based authentication to connect to your Phoenix API. The extension does not store passwords, API keys, or bearer tokens. Authentication is handled entirely through your browser's existing session cookies for the Phoenix API domain.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">3.2 Conversation Data</h3>
            <p className="mb-4">
              When you use the extension to generate a reply, the extension reads the current conversation context from the page you are viewing:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">LinkedIn:</strong> Participant name, headline, message history, and post content from the active LinkedIn conversation or thread.</li>
              <li><strong className="text-white">Gmail:</strong> Sender name, subject, and email thread content from the active Gmail compose window or thread.</li>
            </ul>
            <p>
              This data is sent to your Phoenix API endpoint solely for the purpose of generating a contextual reply. Phoenix Pilot does not store this conversation data locally or transmit it to any third party.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">3.3 Extension Settings</h3>
            <p className="mb-4">
              The following settings are stored locally in your browser's Chrome storage:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your configured Phoenix API base URL</li>
              <li>Your selected Phoenix session ID and name</li>
              <li>Temporary session identifiers for stateless reply generation</li>
            </ul>
            <p className="mt-4">
              These settings never leave your browser and are not transmitted to any external service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. How We Use Your Information</h2>
            <p className="mb-4">The data processed by the extension is used exclusively for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generating contextual message replies via your Phoenix backend</li>
              <li>Maintaining your authenticated session with the Phoenix API</li>
              <li>Remembering your preferences between browser sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Storage and Security</h2>
            <p className="mb-4">
              Phoenix Pilot stores only your extension settings locally in Chrome storage. Conversation data is processed ephemerally — it is read from the page, sent to your Phoenix API for reply generation, and is not persisted by the extension.
            </p>
            <p className="mb-4">
              All communication between the extension and your Phoenix API is encrypted via HTTPS/TLS.
            </p>
            <p>
              For details on how your Phoenix backend stores and processes data, please refer to the privacy policy of your Phoenix instance operator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
            <p className="mb-4">Phoenix Pilot interacts with the following:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Phoenix API:</strong> Your configured Phoenix backend instance for reply generation and session management. Data handling is governed by your Phoenix instance's privacy policy.</li>
              <li><strong className="text-white">LinkedIn:</strong> The extension reads conversation data from LinkedIn pages you visit. No data is written to or modified on LinkedIn.</li>
              <li><strong className="text-white">Gmail:</strong> The extension reads email thread data from Gmail pages you visit. No data is written to or modified in Gmail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Permissions</h2>
            <p className="mb-4">The extension requests the following Chrome permissions:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">storage:</strong> To save your extension settings locally.</li>
              <li><strong className="text-white">activeTab:</strong> To read conversation context from the current tab when you activate the extension.</li>
              <li><strong className="text-white">Host permissions (LinkedIn, Gmail, Phoenix API):</strong> To inject the reply assistant UI on LinkedIn and Gmail pages, and to communicate with your Phoenix API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clear all locally stored settings at any time via the extension's settings page or by removing the extension</li>
              <li>Choose which Phoenix backend instance to connect to</li>
              <li>Revoke the extension's access by disabling or uninstalling it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p>
              Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please open an issue on our <a href="https://github.com/arashbehmand/phoenix-pilot" className="text-phoenix-cyan hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
            </p>
          </section>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}


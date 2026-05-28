import { Link } from 'react-router-dom';
import { Github, Linkedin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-p-line py-10 px-6 lg:px-8 bg-white">
      <div className="max-w-[1180px] mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-sm font-semibold text-p-ink block mb-3">Phoenix Pilot</span>
            <p className="text-sm text-p-ink-soft leading-relaxed">
              Free, open-source messaging co-pilot for LinkedIn and Gmail, powered by Phoenix.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-p-ink-soft mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-p-ink-mid">
              <li><a href="#features" className="hover:text-p-ink transition-colors">Features</a></li>
              <li><a href="#install" className="hover:text-p-ink transition-colors">Install Guide</a></li>
              <li>
                <a href="https://github.com/arashbehmand/phoenix-pilot" target="_blank" rel="noopener noreferrer" className="hover:text-p-ink transition-colors flex items-center gap-1">
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-p-ink-soft mb-3">Creator</h4>
            <ul className="space-y-2 text-sm text-p-ink-mid">
              <li>
                <a href="https://www.linkedin.com/in/egor-karpovich/" target="_blank" rel="noopener noreferrer" className="hover:text-p-ink transition-colors flex items-center gap-1">
                  <Linkedin className="w-3 h-3" />
                  Egor Karpovich
                </a>
              </li>
              <li>
                <a href="https://travel-code.com" target="_blank" rel="noopener noreferrer" className="hover:text-p-ink transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Travel Code
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-p-ink-soft mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-p-ink-mid">
              <li><Link to="/privacy" className="hover:text-p-ink transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-p-ink transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-p-ink transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-p-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-p-ink-soft">© 2025 Phoenix Pilot. Open-source under MIT License.</p>
          <p className="text-xs text-p-ink-soft">
            Built by Egor Karpovich — Supported by{' '}
            <a href="https://travel-code.com" target="_blank" rel="noopener noreferrer" className="text-p-blue hover:text-p-blue-deep transition-colors">
              Travel Code
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

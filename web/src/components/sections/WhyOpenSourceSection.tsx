import { Code, Lock } from 'lucide-react';

export function WhyOpenSourceSection() {
  return (
    <section className="py-20 px-6 lg:px-8 border-t border-p-line">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight mb-8">
            An honest note.
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-[6px] bg-p-orange-faint flex items-center justify-center mt-0.5">
                <Code className="w-5 h-5 text-p-orange" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-p-ink mb-1">The extension is open-source.</h3>
                <p className="text-p-ink-mid leading-relaxed">
                  The Chrome extension code is MIT licensed. You can read it, audit it, and fork it on{' '}
                  <a href="https://github.com/arashbehmand/phoenix-pilot" target="_blank" rel="noopener noreferrer" className="text-p-blue hover:text-p-blue-deep transition-colors">GitHub</a>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-[6px] bg-p-surface-sunken flex items-center justify-center mt-0.5">
                <Lock className="w-5 h-5 text-p-ink-soft" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-p-ink mb-1">The backend is not — yet.</h3>
                <p className="text-p-ink-mid leading-relaxed">
                  Phoenix Pilot connects to <a href="https://phoenix0.online" target="_blank" rel="noopener noreferrer" className="text-p-blue hover:text-p-blue-deep transition-colors">phoenix0.online</a>,
                  which is currently closed-source. Without it the extension does nothing.
                  Calling this project "open-source" in the self-hostable sense would be misleading — so we won't.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

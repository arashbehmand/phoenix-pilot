import { Linkedin, ExternalLink } from 'lucide-react';

export function BuiltBySection() {
  return (
    <section className="py-20 px-6 lg:px-8 border-t border-p-line bg-p-surface-alt">
      <div className="max-w-[1180px] mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-p-ink tracking-tight">Built by people who care.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
          <div className="bg-white border border-p-line rounded-[8px] p-6">
            <div className="w-10 h-10 rounded-[6px] bg-p-orange-faint flex items-center justify-center mb-4">
              <span className="text-sm font-bold text-p-orange">EK</span>
            </div>
            <h3 className="text-base font-semibold text-p-ink mb-0.5">Egor Karpovich</h3>
            <p className="text-sm text-p-ink-soft mb-4">Co-founder & CEO</p>
            <a
              href="https://www.linkedin.com/in/egor-karpovich/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-p-blue hover:text-p-blue-deep transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>

          <div className="bg-white border border-p-line rounded-[8px] p-6">
            <div className="w-10 h-10 rounded-[6px] bg-p-blue-faint flex items-center justify-center mb-4">
              <span className="text-sm font-bold text-p-blue">TC</span>
            </div>
            <h3 className="text-base font-semibold text-p-ink mb-0.5">Travel Code</h3>
            <p className="text-sm text-p-ink-soft mb-4">AI-powered corporate travel management platform</p>
            <a
              href="https://travel-code.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-p-blue hover:text-p-blue-deep transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              travel-code.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

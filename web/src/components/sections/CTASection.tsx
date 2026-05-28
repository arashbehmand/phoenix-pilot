import { Download, Github } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-p-dark">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-p-orange mb-4">
            Free forever · Open-source
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Start replying with <em className="not-italic text-p-orange">context</em>.
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Install Phoenix Pilot in two minutes. No API keys, no signup.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/arashbehmand/phoenix-pilot/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-p-orange hover:bg-p-orange-deep text-white font-semibold rounded-[6px] transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href="https://github.com/arashbehmand/phoenix-pilot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-[6px] transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

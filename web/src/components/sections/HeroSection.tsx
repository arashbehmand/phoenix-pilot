import { Check, Download, Github } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-32 pb-24 px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-p-orange mb-6">
            Free · Open-Source · MIT License
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-p-ink leading-[1.06] tracking-tight mb-6">
            Reply with <em className="not-italic text-p-orange">context</em>,<br />
            not a blank prompt.
          </h1>

          <p className="text-lg text-p-ink-mid leading-relaxed max-w-2xl mb-10">
            Phoenix Pilot brings your Phoenix job search session into LinkedIn messaging and Gmail.
            Draft recruiter replies, follow-ups, and networking messages that already know your
            target role and background.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-12">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-p-ink hover:bg-p-ink/80 text-white font-semibold rounded-[6px] transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
            <a
              href="#install"
              className="px-5 py-2.5 text-sm font-medium text-p-ink-mid hover:text-p-ink transition-colors"
            >
              How to install ↓
            </a>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-p-ink-mid">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-p-orange flex-shrink-0" />
              Open Source (MIT License)
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-p-orange flex-shrink-0" />
              Setup in 2 minutes
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-p-orange flex-shrink-0" />
              No API keys needed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

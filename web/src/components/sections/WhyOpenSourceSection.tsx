import { Heart } from 'lucide-react';

export function WhyOpenSourceSection() {
  return (
    <section className="py-20 px-6 lg:px-8 border-t border-p-line">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-2xl">
          <div className="w-9 h-9 rounded-[6px] bg-p-orange-faint flex items-center justify-center mb-6">
            <Heart className="w-5 h-5 text-p-orange" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight mb-4">
            Why open source?
          </h2>
          <p className="text-lg text-p-ink-mid leading-relaxed">
            We built Phoenix Pilot as part of the Phoenix job search platform, then decided to open it up.
            No catch, no freemium, no data harvesting. Just a useful tool for anyone navigating a job search,
            backed by Travel Code.
          </p>
        </div>
      </div>
    </section>
  );
}

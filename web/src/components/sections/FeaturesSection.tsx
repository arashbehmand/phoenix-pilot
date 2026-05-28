import { Mail, MessageSquare, Shield, Sparkles, Workflow, Wrench } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'LinkedIn Reply Co-pilot',
    description: 'Generate recruiter replies, follow-ups, and networking responses directly inside LinkedIn messaging with session-aware Phoenix context.',
  },
  {
    icon: Mail,
    title: 'Gmail Draft Assistant',
    description: 'Turn active Gmail threads into polished responses using the same Phoenix sessions you already maintain for your job search.',
  },
  {
    icon: Workflow,
    title: 'Phoenix Session Context',
    description: 'Choose a Phoenix session and reuse your existing preferences, artifacts, and context instead of rewriting the same background for every reply.',
  },
  {
    icon: Sparkles,
    title: 'Temporary Session Mode',
    description: 'Generate replies without committing everything to a persistent session when you just need quick default-backed help.',
  },
  {
    icon: Shield,
    title: 'Cookie-Based Auth',
    description: 'Use your existing Phoenix login. The extension does not ask for provider API keys and stores only local extension settings.',
  },
  {
    icon: Wrench,
    title: 'Configurable Backend',
    description: 'Point the extension at your own Phoenix API endpoint in development or use the managed production backend in normal operation.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 lg:px-8 border-t border-p-line">
      <div className="max-w-[1180px] mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-p-orange mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight mb-3">
            Built for job search conversations.
          </h2>
          <p className="text-lg text-p-ink-mid max-w-2xl">
            Session-aware LinkedIn and Gmail assistance powered by Phoenix, designed to help
            you respond faster without losing context.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-p-line border border-p-line rounded-[8px] overflow-hidden">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 hover:bg-p-surface-alt transition-colors"
            >
              <div className="w-9 h-9 rounded-[6px] bg-p-orange-faint flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-p-orange" />
              </div>
              <h3 className="text-sm font-semibold text-p-ink mb-2">{feature.title}</h3>
              <p className="text-sm text-p-ink-mid leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

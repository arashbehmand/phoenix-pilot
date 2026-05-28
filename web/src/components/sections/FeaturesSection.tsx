import { motion } from 'framer-motion';
import { Mail, MessageSquare, Shield, Sparkles, Workflow, Wrench } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'LinkedIn Reply Co-pilot',
    description: 'Generate recruiter replies, follow-ups, and networking responses directly inside LinkedIn messaging with session-aware Phoenix context.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Mail,
    title: 'Gmail Draft Assistant',
    description: 'Turn active Gmail threads into polished responses using the same Phoenix sessions you already maintain for your job search.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Workflow,
    title: 'Phoenix Session Context',
    description: 'Choose a Phoenix session and reuse your existing preferences, artifacts, and context instead of rewriting the same background for every reply.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'Temporary Session Mode',
    description: 'Generate replies without committing everything to a persistent session when you just need quick default-backed help.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Cookie-Based Auth',
    description: 'Use your existing Phoenix login. The extension does not ask for provider API keys and stores only local extension settings.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Wrench,
    title: 'Configurable Backend',
    description: 'Point the extension at your own Phoenix API endpoint in development or use the managed production backend in normal operation.',
    color: 'from-indigo-500 to-purple-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Job Search Conversations</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Session-aware LinkedIn and Gmail assistance powered by Phoenix, designed to help you respond faster without losing context.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-phoenix-cyan/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

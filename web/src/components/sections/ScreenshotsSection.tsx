import { motion } from 'framer-motion';

const screenshots = [
  {
    src: '/screenshots/phoenix-pilot-linkedin.png',
    alt: 'Phoenix Pilot LinkedIn conversation co-pilot',
    caption: 'Generate recruiter and networking replies directly inside LinkedIn messaging with Phoenix session context.',
  },
  {
    src: '/screenshots/phoenix-pilot-gmail.png',
    alt: 'Phoenix Pilot Gmail email co-pilot',
    caption: 'Draft Gmail responses from the active thread without leaving your inbox workflow.',
  },
  {
    src: '/screenshots/phoenix-pilot-popup.png',
    alt: 'Phoenix Pilot browser action popup',
    caption: 'Quick status view for login health, navigation, and settings access from the toolbar popup.',
  },
];

export function ScreenshotsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            See It in <span className="text-gradient">Action</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how Phoenix Pilot turns active LinkedIn and Gmail conversations into session-aware reply drafts without leaving your workflow
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl border border-white/10 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="aspect-video bg-white/5 overflow-hidden">
              <img
                src={screenshots[0].src}
                alt={screenshots[0].alt}
                className="w-full h-full object-cover object-left-top group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-400 text-center">{screenshots[0].caption}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-white/10 p-8 flex flex-col justify-center"
          >
            <h3 className="text-2xl font-semibold text-white mb-4">Current Store Build</h3>
            <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
              <li>LinkedIn messaging assistant with reply generation inside the conversation view.</li>
              <li>Gmail compose and thread assistant using the same Phoenix session context.</li>
              <li>Session-aware prompts powered by your Phoenix backend, not a generic standalone model.</li>
              <li>Cookie-based Phoenix authentication with local-only extension settings.</li>
            </ul>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {screenshots.slice(1).map((item, index) => (
            <motion.div
              key={item.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl border border-white/10 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="aspect-video bg-white/5 overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-400 text-center">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

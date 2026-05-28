const screenshots = [
  {
    src: 'screenshots/phoenix-pilot-linkedin.png',
    alt: 'Phoenix Pilot LinkedIn conversation co-pilot',
    label: 'LinkedIn Messaging',
    caption: 'Generate recruiter and networking replies directly inside LinkedIn messaging with Phoenix session context.',
  },
  {
    src: 'screenshots/phoenix-pilot-gmail.png',
    alt: 'Phoenix Pilot Gmail email co-pilot',
    label: 'Gmail Assistant',
    caption: 'Draft Gmail responses from the active thread without leaving your inbox workflow.',
  },
  {
    src: 'screenshots/phoenix-pilot-popup.png',
    alt: 'Phoenix Pilot browser action popup',
    label: 'Toolbar Popup',
    caption: 'Quick status view for login health, navigation, and settings access from the toolbar.',
  },
];

export function ScreenshotsSection() {
  const base = import.meta.env.BASE_URL;

  return (
    <section className="py-20 px-6 lg:px-8 border-t border-p-line bg-p-surface-alt">
      <div className="max-w-[1180px] mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-p-orange mb-3">See it in action</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight">
            Phoenix Pilot in your workflow.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {screenshots.map((item) => (
            <div key={item.src} className="bg-white border border-p-line rounded-[8px] overflow-hidden">
              <div className="aspect-video bg-p-surface-sunken overflow-hidden">
                <img
                  src={`${base}${item.src}`}
                  alt={item.alt}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div className="p-4 border-t border-p-line">
                <p className="text-xs font-semibold text-p-orange uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm text-p-ink-mid leading-relaxed">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

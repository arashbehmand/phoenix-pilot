import { Download, FolderOpen, Globe, ToggleRight, Upload, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Download,
    title: 'Download',
    description: 'Click "Download" above or grab the ZIP from the GitHub releases page.',
  },
  {
    icon: FolderOpen,
    title: 'Unzip',
    description: 'Extract the downloaded ZIP to any folder on your computer.',
  },
  {
    icon: Globe,
    title: 'Open Extensions',
    description: 'In Chrome, type chrome://extensions in the address bar and press Enter.',
  },
  {
    icon: ToggleRight,
    title: 'Developer Mode',
    description: 'Enable "Developer mode" toggle in the top-right corner of the extensions page.',
  },
  {
    icon: Upload,
    title: 'Load Extension',
    description: 'Click "Load unpacked" and select the unzipped folder with the extension files.',
  },
  {
    icon: CheckCircle,
    title: 'Connect & Go',
    description: "Click the Phoenix Pilot icon in Chrome. Sign in to your Phoenix account and select a session — you're ready.",
  },
];

export function InstallSection() {
  return (
    <section id="install" className="py-20 px-6 lg:px-8 border-t border-p-line">
      <div className="max-w-[1180px] mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-p-orange mb-3">Installation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-p-ink tracking-tight mb-3">
            Up and running in two minutes.
          </h2>
          <p className="text-lg text-p-ink-mid max-w-2xl">
            Works on Chrome, Brave, Edge, Arc, and any Chromium-based browser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white border border-p-line rounded-[8px] p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-[6px] bg-p-orange-faint flex items-center justify-center">
                  <span className="text-sm font-bold text-p-orange">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <step.icon className="w-4 h-4 text-p-ink-soft" />
                    <h3 className="text-sm font-semibold text-p-ink">{step.title}</h3>
                  </div>
                  <p className="text-sm text-p-ink-mid leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

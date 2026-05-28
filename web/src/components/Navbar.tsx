import { Github } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-p-line">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <span className="text-sm font-semibold tracking-tight text-p-ink">Phoenix Pilot</span>
          <a
            href="https://github.com/arashbehmand/phoenix-pilot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-p-ink-mid hover:text-p-ink transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { InstallSection } from './sections/InstallSection';
import { ScreenshotsSection } from './sections/ScreenshotsSection';
import { WhyOpenSourceSection } from './sections/WhyOpenSourceSection';
import { BuiltBySection } from './sections/BuiltBySection';
import { CTASection } from './sections/CTASection';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ScreenshotsSection />
      <InstallSection />
      <WhyOpenSourceSection />
      <BuiltBySection />
      <CTASection />
      <Footer />
    </div>
  );
}

# Phoenix Pilot Landing Page

Modern, high-converting landing page for Phoenix Pilot.com built with React, TailwindCSS, and Framer Motion.

## 🚀 Quick Start

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:5174`

## 📦 Build for Production

```bash
npm run build
```

Output will be in `web/dist/` directory.

## 🎨 Features

- **Dark Professional Theme** - Deep blues, grays, and electric cyan accents
- **Interactive Demo** - Live LinkedIn post mockup with AI-generated comments
- **Persona Evolution Slider** - Visual timeline showing AI learning progression
- **Responsive Design** - Mobile and desktop optimized
- **Smooth Animations** - Framer Motion powered transitions

## 📁 Structure

```
web/
├── src/
│   ├── components/
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SocialProofSection.tsx
│   │   │   ├── DemoSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PersonaEvolutionSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── CTASection.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── LandingPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
└── package.json
```

## 🌐 Deployment

### Option 1: Static Hosting (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

### Option 2: Nginx on DigitalOcean

```bash
npm run build
# Copy dist/ to /var/www/phoenix-pilot
# Configure Nginx to serve static files
```

## 🔗 Integration

- **Login Button**: Links to extension popup or auth flow
- **Install Extension**: Links to Chrome Web Store (when published)


// Type declarations for Landing page components
declare module './components/Header' {
  export interface HeaderProps {
    onSignIn: () => void;
    onGetStarted: () => void;
  }
  const Header: React.FC<HeaderProps>;
  export default Header;
}

declare module './components/Hero' {
  export interface HeroProps {
    onSignIn: () => void;
    onGetStarted: () => void;
  }
  const Hero: React.FC<HeroProps>;
  export default Hero;
}

declare module './components/HomepageScreenshot' {
  const HomepageScreenshot: React.FC;
  export default HomepageScreenshot;
}

declare module './components/Partners' {
  const Partners: React.FC;
  export default Partners;
}

declare module './components/KeyFeatures' {
  const KeyFeatures: React.FC;
  export default KeyFeatures;
}

declare module './components/FeatureScreenshot' {
  const FeatureScreenshot: React.FC;
  export default FeatureScreenshot;
}

declare module './components/HowItWorks' {
  const HowItWorks: React.FC;
  export default HowItWorks;
}

declare module './components/Testimonials' {
  const Testimonials: React.FC;
  export default Testimonials;
}

declare module './components/Pricing' {
  export interface PricingProps {
    onGetStarted: () => void;
  }
  const Pricing: React.FC<PricingProps>;
  export default Pricing;
}

declare module './components/FAQ' {
  const FAQ: React.FC;
  export default FAQ;
}

declare module './components/CTA' {
  const CTA: React.FC;
  export default CTA;
}

declare module './components/Footer' {
  const Footer: React.FC;
  export default Footer;
} 
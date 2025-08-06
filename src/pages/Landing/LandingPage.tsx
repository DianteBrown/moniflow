import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomepageScreenshot from "./components/HomepageScreenshot";
import Partners from "./components/Partners";
import KeyFeatures from "./components/KeyFeatures";
import FeatureScreenshot from "./components/FeatureScreenshot";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import "./landing-page.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleGetStarted = () => {
    navigate("/auth", { state: { initialView: "register" } });
  };

  return (
    <div className="landing-page">
      <Header onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      <Hero onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      <HomepageScreenshot />
      <Partners />
      <KeyFeatures />
      <FeatureScreenshot />
      <HowItWorks />
      <Testimonials />
      <Pricing onGetStarted={handleGetStarted} />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage; 
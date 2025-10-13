import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomepageScreenshot from "./components/HomepageScreenshot";
import GetStarted from "./components/GetStarted";
import KeyFeatures from "./components/KeyFeatures";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";

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
      <Hero />
      <HomepageScreenshot />
      <GetStarted onGetStarted={handleGetStarted} />
      <KeyFeatures />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default LandingPage; 
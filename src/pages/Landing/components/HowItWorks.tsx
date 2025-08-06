const HowItWorks = () => {
  const steps = [
    {
      icon: "/assets/images/connect-icon1.svg",
      title: "Connect your accounts",
      description: "Securely link your bank accounts, credit cards, and other financial accounts to get a complete picture."
    },
    {
      icon: "/assets/images/goals-icon.svg",
      title: "Set your goals",
      description: "Define your monthly budget, create savings goals, and customize your financial dashboard."
    },
    {
      icon: "/assets/images/track-icon.svg",
      title: "Track & optimize",
      description: "Monitor your progress, get insights, and make adjustments to reach your financial goals faster."
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <p className="how-it-works-title">HOW IT WORKS</p>
          <h2 className="how-it-works-subtitle">Getting started with Moniflow is quick and easy</h2>
        </div>
        
        <div className="steps-container">
          {/* Connecting line */}
          <div className="step-connector"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-icon">
                <img src={step.icon} alt={step.title} />
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 
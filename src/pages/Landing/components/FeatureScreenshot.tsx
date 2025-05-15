const FeatureScreenshot = () => {
  const features = [
    {
      icon: "/assets/images/feature-invest-icon.svg",
      text: "Smart investing"
    },
    {
      icon: "/assets/images/feature-tracking-icon.svg",
      text: "Tracking payments"
    },
    {
      icon: "/assets/images/feature-goal-icon.svg",
      text: "Goal tracking"
    },
    {
      icon: "/assets/images/feature-banking-icon.svg",
      text: "Banking integration"
    },
    {
      icon: "/assets/images/feature-resource-icon.svg",
      text: "Resource control"
    }
  ];

  return (
    <section className="feature-screenshot" id="features">
      <div className="container">
        <div className="feature-screenshot-container">
          <div className="feature-images">
            <div className="circle-decoration circle-1"></div>
            <div className="circle-decoration circle-2"></div>
            <div className="circle-decoration circle-3"></div>
            <img src="/assets/images/product-image.png" alt="Product Details" className="primary-image" />
            <img src="/assets/images/dashboard-screenshot.png" alt="Dashboard Overview" className="secondary-image" />
          </div>
          <div className="feature-screenshot-content">
            <h2 className="feature-screenshot-title">Unlock financial freedom and new possibilities with our platform.</h2>
            <div className="feature-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-item-icon">
                    <img src={feature.icon} alt={feature.text} />
                  </div>
                  <span className="feature-item-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureScreenshot; 
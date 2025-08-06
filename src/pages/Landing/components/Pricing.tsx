interface PricingProps {
  onGetStarted: () => void;
}

const Pricing = ({ onGetStarted }: PricingProps) => {
  const pricingPlans = [
    {
      name: "Regular",
      price: 19,
      period: "month",
      description: "All the basic features to boost your finances",
      features: [
        "Connect up to 2 accounts",
        "Basic expense tracking",
        "Monthly budget",
        "10 Agents",
        "Live Chat Support"
      ],
      isPopular: false
    },
    {
      name: "Premium",
      price: 49,
      period: "month",
      description: "All the basic features to boost your finances",
      features: [
        "Unlimited accounts",
        "Advanced expense tracking",
        "Unlimited savings goals",
        "Personalized insights",
        "Bill reminders"
      ],
      isPopular: true
    },
    {
      name: "Business",
      price: 99,
      period: "month",
      description: "All the basic features to boost your finances",
      features: [
        "All Premium features",
        "Business expense tracking",
        "Tax category reporting",
        "Invoice tracking",
        "Live Chat Support"
      ],
      isPopular: false
    }
  ];

  const renderCheckIcon = (isPremium: boolean = false) => (
    <svg 
      className="feature-icon" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12.2427 20.9531C17.3721 20.9531 21.5303 16.7949 21.5303 11.6655C21.5303 6.53613 17.3721 2.37793 12.2427 2.37793C7.11328 2.37793 2.95508 6.53613 2.95508 11.6655C2.95508 16.7949 7.11328 20.9531 12.2427 20.9531ZM16.5464 10.1645C16.9998 9.71117 16.9998 8.97609 16.5464 8.52271C16.0931 8.06933 15.358 8.06933 14.9046 8.52271L11.0817 12.3456L9.58074 10.8446C9.12736 10.3912 8.39229 10.3912 7.93891 10.8446C7.48553 11.298 7.48553 12.0331 7.93891 12.4864L10.2608 14.8083C10.7142 15.2617 11.4493 15.2617 11.9026 14.8083L16.5464 10.1645Z"
        fill={isPremium ? "#FFFFFF" : "#4B5563"}
      />
    </svg>
  );

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="section-header">
          <h2 className="section-title">BEST PLAN</h2>
          <p className="section-subtitle">Our Best Plan For You</p>
        </div>
        
        <div className="pricing-cards">
          {/* Regular Plan */}
          <div className="pricing-card">
            <div className="card-top">
              <h3 className="plan-name">Regular</h3>
            </div>
            <div className="plan-price">
              <span className="price">${pricingPlans[0].price}</span>
              <span className="price-suffix">/ {pricingPlans[0].period}</span>
            </div>
            <p className="plan-description">{pricingPlans[0].description}</p>
            <hr className="price-divider" />
            <ul className="feature-list">
              {pricingPlans[0].features.map((feature, i) => (
                <li key={i} className="feature-item">
                  {renderCheckIcon()}
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="btn pricing-btn" onClick={onGetStarted}>Get started</button>
          </div>
          
          {/* Premium Plan */}
          <div className="pricing-card premium-card">
            <div className="card-top">
              <h3 className="plan-name">Premium</h3>
              <span className="popular-tag">Popular</span>
            </div>
            <div className="plan-price">
              <span className="price">${pricingPlans[1].price}</span>
              <span className="price-suffix">/ {pricingPlans[1].period}</span>
            </div>
            <p className="plan-description">{pricingPlans[1].description}</p>
            <hr className="price-divider" />
            <ul className="feature-list">
              {pricingPlans[1].features.map((feature, i) => (
                <li key={i} className="feature-item">
                  {renderCheckIcon(true)}
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="btn premium-btn" onClick={onGetStarted}>Get started</button>
          </div>
          
          {/* Business Plan */}
          <div className="pricing-card">
            <div className="card-top">
              <h3 className="plan-name">Business</h3>
            </div>
            <div className="plan-price">
              <span className="price">${pricingPlans[2].price}</span>
              <span className="price-suffix">/ {pricingPlans[2].period}</span>
            </div>
            <p className="plan-description">{pricingPlans[2].description}</p>
            <hr className="price-divider" />
            <ul className="feature-list">
              {pricingPlans[2].features.map((feature, i) => (
                <li key={i} className="feature-item">
                  {renderCheckIcon()}
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="btn pricing-btn" onClick={onGetStarted}>Get started</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 
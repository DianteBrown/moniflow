
const KeyFeatures = () => {
  const features = [
    {
      icon: "/assets/images/Track Spending.png",
      title: "Track Spending",
      description: "Monitor your expenses in one place with real-time transaction tracking",
    },
    {
      icon: "/assets/images/Set Goals.png",
      title: "Set Goals",
      description: "Define your financial future with intelligent budgeting and savings goals",
    },
    {
      icon: "/assets/images/Analyze Trends.png",
      title: "Analyze Trends",
      description: "Gain insights with detailed expense reports and spending analytics",
    },
    {
      icon: "/assets/images/Secure Cloud.png",
      title: "Secure Cloud Storage",
      description: "Protect your data with industry-leading security and encryption",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[var(--gray-background)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-4xl font-bold text-[text-gray] tracking-widest uppercase mb-3">Features</h2>
        </div>

        <div className="grid  grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-2"
            >
              <img
                src={feature.icon}
                alt={feature.title}
                className="h-14 w-14 mb-6"
              />
                <h3 className="text-xl font-bold text-[text-gray] mb-4">{feature.title}</h3>
              <p className="text-[text-gray] mb-4 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures; 
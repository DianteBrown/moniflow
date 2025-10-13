
const KeyFeatures = () => {
  const features = [
    {
      icon: "/assets/images/Track Spending.png",
      title: "Track Spending",
      description: "Monitor of your expenses in one-place",
    },
    {
      icon: "/assets/images/Set Goals.png",
      title: "Set Goals",
      description: "Define financial forgers anchiove triem",
    },
    {
      icon: "/assets/images/Analyze Trends.png",
      title: "Analyze Trends",
      description: "Gain insights, with detailed expense reports",
    },
    {
      icon: "/assets/images/Secure Cloud.png",
      title: "Secure Cloud Storage",
      description: "Profied your data with noursiny leading security",
    },
  ];

  return (
    <section className="py-20 bg-[var(--gray-background)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-4xl font-bold text-[#ffffff] tracking-widest uppercase mb-3">Features</h2>
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
              <h3 className="text-xl font-bold text-[#ffffff] mb-4">{feature.title}</h3>
              <p className="text-[#ffffff] mb-4 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures; 
const KeyFeatures = () => {
  const features = [
    {
      icon: "/assets/images/icon-expense.svg",
      title: "Expense Tracking",
      description: "Automatically categorize expenses and get detailed insights into your spending patterns.",
      bgColor: "bg-[#F3F7F6]"
    },
    {
      icon: "/assets/images/icon-goal.svg",
      title: "Savings Goals",
      description: "Set and track custom savings goals with automated contribution plans and progress tracking.",
      bgColor: "bg-[#E8DFD4]"
    },
    {
      icon: "/assets/images/icon-budget.svg",
      title: "Budget Management",
      description: "Create custom budgets by category and receive real-time alerts when approaching limits.",
      bgColor: "bg-[#D6E6E5]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#292930] tracking-widest uppercase mb-3">KEY FEATURES</h2>
          <p className="text-xl md:text-2xl text-[#555555] max-w-3xl mx-auto">
            Powerful tools to help you track, manage, and optimize your personal finances
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`${feature.bgColor} rounded-2xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden`}
            >
              <img 
                src={feature.icon} 
                alt={feature.title} 
                className="h-14 w-14 mb-6"
              />
              <h3 className="text-xl font-bold text-[#292930] mb-4">{feature.title}</h3>
              <p className="text-[#555555] mb-4">{feature.description}</p>
              
              <a href="#" className="inline-flex items-center text-[#184A47] font-medium">
                Learn more
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="16" 
                  height="16" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </a>
              
              {/* Decorative curved line */}
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-[#ffffff40] rounded-tl-full opacity-30"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures; 
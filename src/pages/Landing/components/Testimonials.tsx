const Testimonials = () => {
  const testimonials = [
    {
      text: "Heritage Budgeting has completely changed how I manage my money. I've saved over $3,000 in the past year just by being more aware of my spending habits.",
      author: "Alex Johnson",
      role: "Marketing Manager"
    },
    {
      text: "The budgeting tools are intuitive and have helped me get a clear picture of where my money is going each month. I highly recommend it to anyone looking to improve their finances.",
      author: "Sarah Williams",
      role: "Graphic Designer"
    },
    {
      text: "I've tried several budgeting apps, but Heritage Budgeting stands out with its clean interface and powerful analytics. It's become an essential part of my financial planning.",
      author: "Michael Chen",
      role: "Software Engineer"
    }
  ];

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <p className="testimonials-title">TESTIMONIALS</p>
          <h2 className="testimonials-subtitle">What Our Users Say</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Star rating */}
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-[#FFC100] fill-current"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                  </svg>
                ))}
              </div>
              
              {/* Testimonial text */}
              <p className="text-[#555555] mb-8 min-h-[100px]">{testimonial.text}</p>
              
              {/* Author info */}
              <div className="mt-auto">
                <h3 className="font-bold text-[#292930] text-lg mb-1">{testimonial.author}</h3>
                <p className="text-[#555555] text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 
import { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const faqs = [
    {
      question: "Is my financial data secure?",
      answer: "Yes, we use bank-level 256-bit encryption to protect your data. We never store your bank credentials, and we use secure connections to your financial institutions."
    },
    {
      question: "How do I connect my bank accounts?",
      answer: "Connecting your accounts is simple and secure. After signing up, you'll be prompted to connect your financial accounts. We use industry-leading security measures to ensure your information stays safe."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you'll still have access to your account until the end of your current billing period."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store to manage your finances on the go."
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes, you can export your data in CSV or Excel format at any time. This makes it easy to use your financial information in other applications or for tax preparation."
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="faq-header">
          <h2 className="faq-title">Frequently asked questions</h2>
          <p className="faq-subtitle">We're happy to answer your questions</p>
        </div>
        
        <div className="faq-items">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div 
                className={`faq-question ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="faq-question-text">{faq.question}</h3>
                <div className="faq-toggle">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M4 6L8 10L12 6" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              </div>
              
              <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 
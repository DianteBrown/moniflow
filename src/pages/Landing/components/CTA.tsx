import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  const handleDemoRequest = () => {
    navigate("/auth", { state: { initialView: "register" } });
  };

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between" style={{backgroundColor: 'var(--heritage-green)'}}>
          <div className="max-w-xl mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg" style={{color: 'var(--heritage-cream)'}}>
              Join thousands of users who are tracking their spending, reaching their savings goals, and taking control of their financial future.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleDemoRequest}
              className="px-8 py-4 bg-white rounded-lg font-medium text-lg transition-colors hover:opacity-90"
              style={{color: 'var(--heritage-green)', backgroundColor: 'var(--heritage-gold)'}}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 
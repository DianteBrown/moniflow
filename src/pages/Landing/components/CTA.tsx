import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  const handleDemoRequest = () => {
    navigate("/auth", { state: { initialView: "register" } });
  };

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="bg-[#184A47] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready To Take Control Of Your Finances?
            </h2>
            <p className="text-[#DDE9E8] text-lg">
              Join Thousands Of Users Who Are Tracking Their Spending, Reaching Their Savings Goals, And Taking Control Of Their Financial Future.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleDemoRequest}
              className="px-8 py-4 bg-white text-[#184A47] rounded-lg font-medium text-lg hover:bg-[#F3F7F6] transition-colors"
            >
              Schedule A Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 
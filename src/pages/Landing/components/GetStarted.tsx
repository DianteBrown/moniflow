import { Button } from "@/components/ui/button";

const GetStarted = ({ onGetStarted }: { onGetStarted: () => void }) => {
    return (
      <section className="get-started-section">
        <div className="get-started-container">
          <Button onClick={onGetStarted} className="get-started-button">Get Started Free</Button>
        </div>
      </section>
    );
  };
  
  export default GetStarted; 
const Partners = () => {
  return (
    <section className="partners-section">
      <div className="partners-container">
        <div className="partners-grid">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <img 
              key={num}
              src={`/assets/images/partner${num}.png`} 
              alt={`Partner ${num}`} 
              className="partner-logo"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 
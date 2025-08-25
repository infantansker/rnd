import './Footer.css';

const Footer = () => {
  return (
    <div className="footer-container" id="about">
      <section className="footer">
        <h3 className="partners-title">Partners</h3>
        <div className="slider">
          <div className="slide-track">
            <img src="/techvase.png" alt="Tech Vaseegrah" className="partner-logo" />
            <img src="/ccafe.png" alt="C3 Cafe" className="partner-logo" />
            <img src="/vaseegrahveda.png" alt="Vaseegrah Veda" className="partner-logo" />
            <img src="/cp.png" alt="CP Brand" className="partner-logo" />

            {/* Repeat again for smooth infinite scroll */}
            <img src="/techvase.png" alt="Tech Vase" className="partner-logo" />
            <img src="/ccafe.png" alt="C3 Cafe" className="partner-logo" />
            <img src="/vaseegrahveda.png" alt="Vaseegrah Veda" className="partner-logo" />
            <img src="/cp.png" alt="CP Brand" className="partner-logo" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;

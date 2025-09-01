import Hero from './Hero/Hero';
import Plans from './Plans/Plans';
import Programs from './Programs/Programs';
import AboutData from './About/AboutData';
import Testimonials from './Testimonials/Testimonials';
import Contact from './Contact/Contact';
import Footer from './Footer/Footer';

const Home = () => (
  <div className="App">
    <Hero />
    <Programs />
    <AboutData />
    <Plans />
    <Testimonials />
    <Contact />
    <Footer />
  </div>
);

export default Home;

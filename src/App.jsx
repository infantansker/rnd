import './App.css';
import Hero from './Components/Hero/Hero';
import Plans from './Components/Plans/Plans';
import Programs from './Components/Programs/Programs';
import AboutData from './Components/About/AboutData';
import Testimonials from './Components/Testimonials/Testimonials';
import Footer from './Components/Footer/Footer';
import Contact from './Components/Contact/Contact';
import EventsPage from './Components/EventsPage';
import Home from './Components/Home';
import Login from './Components/Login/Login';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <Hero />
              <Home/>
              <Programs />
              <AboutData />
              <Plans />
              <Testimonials />
              <Contact />
              <Footer />
            </div>
          }
        />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/login" element={<Login />} />
       
       
        
      </Routes>
    </Router>
  );
}

export default App;
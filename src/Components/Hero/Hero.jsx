import React from 'react'
import "./Hero.css"
import hero_image from "../../assets/hero_image.png"
import hero_back from "../../assets/hero_image_back.png"
import { motion } from "framer-motion"
import Header from '../Header/Header'
import { Link } from "react-router-dom";


const Hero = () => {
  const transition = { duration: 3, type: "spring" };
  const mobile = window.innerWidth <= 768 ? true : false;

  return (
    <div className="hero" id='home'>
      <div className="blur hero-blur"></div>

      <div className="left-h">
        <Header />
        <div className="the-best">
          <motion.div
            initial={{ left: mobile ? "178px" : '238px' }}
            whileInView={{ left: "8px" }}
            transition={{ ...transition, type: "tween" }}
          ></motion.div>
          <span>THE BEST RUNNING CLUB IN THE TOWN</span>
        </div>

        <div className="hero-text">
          <div>
            <span className="stroke-text">Run </span>
            <span>Together</span>
          </div>
          <div>
            <span>Grow Together</span>
          </div>
        </div>

        {/* Button container using existing CSS class */}
        <div className="hero-btns">
          <Link className="btn" to="/register">
            Get Started
          </Link>
          <button className="btn">Learn More</button>
        </div>
      </div>

      <div className="right-h">
        <div className="auth-buttons">
          <Link className="login-btn" to="/login">
            Login
          </Link>
          <Link className="register-btn" to="/register">
            Join now
          </Link>
        </div>

        <motion.div
          initial={{ right: "-1rem" }}
          whileInView={{ right: "4rem" }}
          transition={transition}
          className="heart-rate"
        >
          <span>Where Runners </span>
          <span> Turns Thinkers </span>
        </motion.div>

        <img className="hero-img" src={hero_image} alt="Hero running" />

        <motion.img
          initial={{ right: mobile ? "11rem" : '11rem' }}
          whileInView={{ right: "20rem" }}
          transition={transition}
          className="hero-back"
          src={hero_back}
          alt="Hero background"
        />

        <motion.div
          initial={{ right: "32rem" }}
          whileInView={{ right: "28rem" }}
          transition={transition}
          className="calories"
        >
          <div>
            <span>Distance run together 2km this week</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;

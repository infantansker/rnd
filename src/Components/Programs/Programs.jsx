import React, { useState, useEffect } from "react";
import "./Programs.css";
import { programsData } from "../../data/programsData";
import RightArrow from "../../assets/rightArrow.png";

const Programs = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Force re-render to ensure content is displayed
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Debug: Log the programs data
  console.log("Programs Data:", programsData);

  // Handle case where programsData might be undefined or empty
  if (!programsData || programsData.length === 0) {
    return (
      <div className="programs" id="programs">
        <div className="programs-header">
          <span className="stroke-text">Explore our</span>
          <span>PROGRAMS</span>
          <span className="stroke-text">to shape you</span>
        </div>
        <div className="no-programs" style={{ 
          padding: '2rem', 
          color: '#ccc', 
          fontSize: '1.2rem' 
        }}>
          <p>No programs available at the moment.</p>
        </div>
      </div>
    );
  }

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleKeyPress = (e, program) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log(`Selected program: ${program.heading}`);
      // Add your navigation logic here
    }
  };

  const renderProgramIcon = (program) => {
    // Handle different types of icons (React components, images, etc.)
    if (!program.image) {
      return <div style={{ width: '50px', height: '50px', backgroundColor: '#555', borderRadius: '50%' }}></div>;
    }

    // If it's a React component
    if (typeof program.image === 'object' && program.image.type) {
      return program.image;
    }

    // If it's a string (URL)
    if (typeof program.image === 'string') {
      return (
        <img 
          src={program.image} 
          alt={`${program.heading || 'Program'} icon`}
          onError={(e) => {
            console.log('Image failed to load:', program.image);
            e.target.style.display = 'none';
          }}
        />
      );
    }

    // Default case - assume it's a React component
    return program.image;
  };

  return (
    <div className="programs" id="programs">
      <div className="programs-header">
        <span className="stroke-text">Explore our</span>
        <span>PROGRAMS</span>
        <span className="stroke-text">to shape you</span>
      </div>

      <div className="programs-categories">
        {programsData.map((program, index) => {
          // Debug: Log each program
          console.log(`Program ${index}:`, program);
          
          return (
            <div
              className={`category ${hoveredIndex === index ? "jump" : ""}`}
              key={program.id || `program-${index}`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, program)}
              aria-label={`${program.heading || 'Program'} - ${program.details || 'No description available'}`}
              style={{
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              <div className="program-icon">
                {renderProgramIcon(program)}
              </div>
              
              <div className="program-heading">
                {program.heading || 'Program Title'}
              </div>
              
              <div className="program-details">
                {program.details || 'Program description coming soon...'}
              </div>
              
              <div className="join-now">
                <img 
                  src={RightArrow} 
                  alt="Join now" 
                  onError={(e) => {
                    console.log('Arrow image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Programs;
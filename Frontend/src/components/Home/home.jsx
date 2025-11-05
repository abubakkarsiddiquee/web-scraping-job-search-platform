import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faMapMarkerAlt,
  faArrowRight,
  faClockRotateLeft,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import "./home.css";

function HomePage({ user, setShowLogin }) {
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "remote", "remote", "bangladesh"
  ]);

  const suggestions = [
    "remote work from home",
    "work from home",
    "hiring immediately",
    "remote customer service",
    "data entry remote",
    "customer service",
    "full-time"
  ];

  const handleRemoveRecent = (indexToRemove) => {
    setRecentSearches(recentSearches.filter((_, i) => i !== indexToRemove));
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/jobs");
    } else {
      setShowLogin(true);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/jobs");
    }
  };

  const handleSuggestionClick = (text) => {
    navigate(`/jobs?search=${encodeURIComponent(text)}`);
  };

  return (
    <div className="homepage">
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <div
            className="search-input"
            onClick={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          >
            <FontAwesomeIcon icon={faSearch} className="icon" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchClick();
              }}
            />
          </div>

          <div className="search-input location">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
            <input
              type="text"
              placeholder='City, state, zip code, or "remote"'
            />
          </div>

          <button className="search-button" onClick={handleSearchClick}>
            Search
          </button>
        </div>

        {/* 🔽 Dropdown Suggestions */}
        {showSuggestions && (
          <div className="suggestions-dropdown">
            <div className="section">
              <p className="section-title">Recent searches</p>
              {recentSearches.map((item, i) => (
                <div className="suggestion-item recent" key={i}>
                  <FontAwesomeIcon icon={faClockRotateLeft} className="suggestion-icon" />
                  <div
                    className="recent-texts"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <p className="suggestion-text">{item}</p>
                    <p className="suggestion-subtext">
                      <span className="new">99,000 new</span>
                      <span className="dim">in {item}</span>
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="remove-icon"
                    onClick={() => handleRemoveRecent(i)}
                  />
                </div>
              ))}
            </div>

            <div className="section">
              <p className="section-title">Search suggestions</p>
              {suggestions.map((item, i) => (
                <div
                  className="suggestion-item"
                  key={i}
                  onClick={() => handleSuggestionClick(item)}
                >
                  <FontAwesomeIcon icon={faSearch} className="suggestion-icon" />
                  <p className="suggestion-text">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="brand-section">
        <h1 className="logo">
          Job<span className="merge">Nest</span>
        </h1>

        <h2>Your next job starts here</h2>
        <p>Create an account or sign in to see your personalized job recommendations.</p>
        <button className="get-started" onClick={handleGetStarted}>
          Get Started <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
        </button>
        <p className="post-resume">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (user) {
                navigate("/profile");
              } else {
                setShowLogin(true);
              }
            }}
          >
            Post your resume
          </a>{" "}
          – It only takes a few seconds
        </p>


      </div>
      {/* Section Title */}
      <section className="job-section">
        <h2 className="section-title1">Your Personalized Job Assistant</h2>

        {/* Feature Row 1 */}
        <div className="job-feature-row">
          <div className="job-feature-text">
            <h3>
              <i className="fas fa-file-upload colorful-icon resume-icon" style={{ marginRight: '8px' }}></i>
              Upload Your Resume
            </h3>
            <p>Upload your resume once, and we’ll match it against thousands of job listings daily — organized and personalized just for you.</p>
          </div>
          <div className="job-feature-img">
            <div className="mock-card"> <img
              src="public/Gemini_Generated_Image_h9z7yvh9z7yvh9z7.jpg"
              alt="Resume Upload Mock"
            /></div>
          </div>
        </div>

        {/* Feature Row 2 */}
        <div className="job-feature-row reverse">
          <div className="job-feature-text">
            <h3>
              <i className="fas fa-bolt colorful-icon match-icon" style={{ marginRight: '8px' }}></i>
              Instant Matches
            </h3>
<p>
  See job matches instantly, organized by category, company, and location. Search less, find faster.  
  We collect job listings from multiple sources across the web, saving you time and effort.  
  Get the latest opportunities in one place without jumping between different sites.  
  Filter results by your preferred skills, experience level, or location to find the perfect fit.  
  Stay updated with fresh postings so you never miss an opportunity.
</p>
          </div>
          <div className="job-feature-img">
            <div className="mock-card1"> <img
              src="/Gemini_Generated_Image_6qsxdd6qsxdd6qsx.jpg"
              alt="Resume Upload Mock"
            /> </div>
          </div>
        </div>

        {/* Feature Row 3 */}
        <div className="job-feature-row">
          <div className="job-feature-text">
            <h3>
              <i className="fas fa-compass colorful-icon explore-icon" style={{ marginRight: '8px' }}></i>
              Explore Without Limits
            </h3>
<p>
  We pull listings from across the web and give you the ability to explore without hitting paywalls or being tracked.  
  Discover job opportunities from trusted sources, all compiled in one place for your convenience.  
  Our system ensures you get the most up-to-date listings without unnecessary ads or distractions.  
  Search freely, compare offers, and apply with confidence — all without leaving our platform.
</p>
          </div>
          <div className="job-feature-img">
            <div className="mock-card3"><img src="/Gemini_Generated_Image_lhs20qlhs20qlhs2.jpg" alt="" /></div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="privacy-box">
          <h3>
            <i className="fas fa-shield-alt colorful-icon" style={{ color: "#1e90ff", marginRight: "10px" }}></i>
            We respect your privacy and don’t use your data to train anything.
          </h3>
<p>
  Your searches and uploads stay private. We don’t track you or sell your info — ever.  
  Every job search you make is secure and confidential, so you can explore opportunities without worry.  
  We value your trust and ensure your personal data is never shared with third parties.  
  Focus on finding the right job — we’ll handle the privacy.
</p>
        </div>
        <div className="job-source-box">
  <div className="job-source-header">
    <i className="fas fa-globe-americas"></i>
    <h3>Jobs from Trusted Platforms</h3>
  </div>
  <p>
    We pull listings from top job sites including <strong>Bdjobs</strong>, 
    <strong> LinkedIn</strong>, <strong> Glassdoor</strong>, and <strong> Indeed</strong> — 
    giving you access to the latest opportunities in one place.
  </p>
</div>


        <h3 style={{
          textAlign: 'center',
          margin: '40px 0 24px',
          marginTop:"2cm",
          color: '#383131',
          fontSize: '30px',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fas fa-users colorful-icon"></i>
          How people are using JobNest
        </h3>


        {/* Benefits */}
        <div className="job-benefits">
          <div className="benefit">
            <h4>
              <i className="fas fa-rocket colorful-icon" style={{ marginRight: '8px' }}></i>
              Power search
            </h4>
            <p>Apply smarter with powerful search and filters for remote, hybrid, and onsite roles.</p>
          </div>
          <div className="benefit">
            <h4>
              <i className="fas fa-brain colorful-icon" style={{ marginRight: '8px' }}></i>
              Stay organized
            </h4>
            <p>Save jobs, set reminders, and come back when you’re ready to apply.</p>
          </div>
          <div className="benefit">
            <h4>
              <i className="fas fa-lightbulb colorful-icon" style={{ marginRight: '8px' }}></i>
              Discover more
            </h4>
            <p>Find hidden jobs not posted on major boards — updated in real-time.</p>
          </div>
        </div>
      </section>


    </div>
  );
}

export default HomePage;

import React from 'react';
import './Pagech1.css';
import Imglading1 from "../../images/Imglading1.png";

const Pagech1 = () => {
  return (
    <div className="pagech1">
      <div className="pagech1-content">
        <div className="pagech1-text">
          <div className="badge">
            <span className="badge-text">AI Assistant</span>
          </div>
          <h1 className="pagech1-title">
            Assistant Safe City
          </h1>
          <p className="pagech1-description">
            Your intelligent companion for a safer city experience
          </p>
          <p className="pagech1-subdescription">
            Get instant help, report issues, and receive real-time updates
          </p>
          <div className="pagech1-buttons">
            <button className="start-chat-btn">Start Chatting</button>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
        <div className="pagech1-image">
          <img src={Imglading1} alt="Safe City Assistant" className="animated-image" />
        </div>
      </div>
      
      <div className="features-highlight">
        <div className="feature-item">
          <div className="feature-icon">💬</div>
          <h3>24/7 Assistance</h3>
          <p>Always available to help you</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🚨</div>
          <h3>Emergency Alerts</h3>
          <p>Real-time notifications</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📍</div>
          <h3>Location Services</h3>
          <p>Precise incident reporting</p>
        </div>
      </div>
    </div>
  );
};

export default Pagech1;
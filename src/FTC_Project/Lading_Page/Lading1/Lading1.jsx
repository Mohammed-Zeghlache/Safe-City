import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import the hook
import "../Lading1/Lading1.css";
import Imglading1 from "../../images/Imglading1.png";

const Landing1 = () => {
  const navigate = useNavigate(); // 2. Initialize the navigate function

  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">
          The Ultimate all in
          <br />
          one-workplace
        </h1>
        <p className="landing-description">
          Safe City your best destination to citizen to make the community and the city
          <br />
          in better condition
        </p>
        {/* 3. Add the onClick event to the button */}
        <button 
          className="chatbot-btn" 
          onClick={() => navigate("/report")}
        >
          Talk with Chatboot
        </button>
      </div>
      <div className="landing-image-wrapper">
        <div className="landing-image">
          <img src={Imglading1} alt="Safe City" className="animated-image" />
        </div>
      </div>
    </div>
  );
};

export default Landing1;

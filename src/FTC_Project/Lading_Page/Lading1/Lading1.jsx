import React from "react";
import "../Lading1/Lading1.css";
import Imglading1 from "../../images/Imglading1.png";

const Landing1 = () => {
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
        <button className="chatbot-btn">Talk with Chatboot</button>
      </div>
      <div className="landing-image-wrapper">
        <div className="landing-image">
          <img src={Imglading1} alt="Safe City" className="animated-image" />
          {/* <button className="response-btn">Get response</button> */}
        </div>
      </div>
    </div>
  );
};

export default Landing1;
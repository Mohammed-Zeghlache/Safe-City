import React from "react";
import "../Lading3/Lading3.css";

import water from "../../images/water.jpg";
import agression from "../../images/agression.jpg";
import autre from "../../images/autre.jpg";
import déchet from "../../images/déchet.jpg";
import eclairage2 from "../../images/eclairage2.jpg";
import accident from "../../images/accident.jpg";
import danger from "../../images/danger.jpg";
import câble from "../../images/câble.jpg";
import route from "../../images/route.jpg";




const Landing3 = () => {
  return (
    <div className="landing3">
      <h2 className="problems-title">Types of reported problems</h2>

      <div className="problems-container">
        <div className="problem-card">
          <img src={accident} alt="Accident" className="problem-image" />
          <p className="problem-name">Accident</p>
        </div>

        <div className="problem-card">
          <img src={eclairage2} alt="Eclairage publique" className="problem-image" />
          <p className="problem-name">Eclairage publique</p>
        </div>

        <div className="problem-card">
          <img src={danger} alt="Dangers zone" className="problem-image" />
          <p className="problem-name">Dangers zone</p>
        </div>

        <div className="problem-card">
          <img src={water} alt="Water leakage" className="problem-image" />
          <p className="problem-name">Water leakage</p>
        </div>

         <div className="problem-card">
          <img src={déchet} alt="déchet" className="problem-image" />
          <p className="problem-name">déchet</p>
        </div>

        <div className="problem-card">
          <img src={câble} alt="Cable issue" className="problem-image" />
          <p className="problem-name">Cable issue</p>
        </div>

        <div className="problem-card">
          <img src={agression} alt="agression" className="problem-image" />
          <p className="problem-name">agression</p>
        </div>

         <div className="problem-card">
          <img src={route} alt="route" className="problem-image" />
          <p className="problem-name">Route degradee</p>
        </div>
        

      </div>
    </div>
  );
};

export default Landing3;
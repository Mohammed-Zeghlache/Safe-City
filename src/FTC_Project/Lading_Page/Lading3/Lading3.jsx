import React from "react";
import "../Lading3/Lading3.css";

import Water from '../../images/Water.jpg'
import Agression from "../../images/Agression.jpg";
import Dechet from "../../images/Dechet.jpg";
import Eclairage2 from "../../images/Eclairage2.jpg";
import Accident from "../../images/Accident.jpg";
import Danger from "../../images/Danger.jpg";
import Cable from "../../images/Cable.jpg";
import Route from "../../images/Route.jpg";




const Landing3 = () => {
  return (
    <div className="landing3">
      <h2 className="problems-title">Types of reported problems</h2>

      <div className="problems-container">
        <div className="problem-card">
          <img src={Accident} alt="Accident" className="problem-image" />
          <p className="problem-name">Accident</p>
        </div>

        <div className="problem-card">
          <img src={Eclairage2} alt="Eclairage publique" className="problem-image" />
          <p className="problem-name">Eclairage publique</p>
        </div>

        <div className="problem-card">
          <img src={Danger} alt="Dangers zone" className="problem-image" />
          <p className="problem-name">Dangers zone</p>
        </div>

        <div className="problem-card">
          <img src={Water} alt="Water leakage" className="problem-image" />
          <p className="problem-name">Water leakage</p>
        </div>

         <div className="problem-card">
          <img src={Dechet} alt="déchet" className="problem-image" />
          <p className="problem-name">déchet</p>
        </div>

        <div className="problem-card">
          <img src={Cable} alt="Cable issue" className="problem-image" />
          <p className="problem-name">Cable issue</p>
        </div>

        <div className="problem-card">
          <img src={Agression} alt="agression" className="problem-image" />
          <p className="problem-name">agression</p>
        </div>

         <div className="problem-card">
          <img src={Route} alt="route" className="problem-image" />
          <p className="problem-name">Route degradee</p>
        </div>
        

      </div>
    </div>
  );
};

export default Landing3;
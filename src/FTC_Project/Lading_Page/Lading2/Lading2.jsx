import React from "react";
import "../Lading2/Lading2.css";
import { FiAlertCircle, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { FaCity, FaComments, FaMapMarkedAlt, FaBell } from "react-icons/fa";

const Landing2 = () => {
  return (
    <div className="landing2">
      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <FiAlertCircle />
          </div>
          <h2 className="stat-number">1248</h2>
          <p className="stat-label">Problèmes signalés cette semaine</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <h2 className="stat-number">842</h2>
          <p className="stat-label">Problèmes résolus par les communes</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiMapPin />
          </div>
          <h2 className="stat-number">26</h2>
          <p className="stat-label">Villes connectées en Algérie</p>
        </div>
      </div>

      {/* What Section */}
      <div className="what-section">
        <h2 className="section-title">What does the home page afford ?</h2>
        <p className="section-description">
          La home page doit rassurer, expliquer le service en quelques secondes et donner un accès
          <br />
          immédiate au chatbot robotique pour commencer un signalement
        </p>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <FaComments />
          </div>
          <p className="feature-text">
            Le citoyen commence directement depuis la home
            <br />
            page sans chercher un formulaire compliqué
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaMapMarkedAlt />
          </div>
          <p className="feature-text">
            Une carte publique montre les incidents récents et
            <br />
            aide à confirmer l'adresse exacte
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaBell />
          </div>
          <p className="feature-text">
            Les utilisateurs consultent facilement l'état des
            <br />
            signalements et les réponses de la commune.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing2;
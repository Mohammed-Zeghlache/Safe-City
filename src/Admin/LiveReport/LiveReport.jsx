// components/LiveReport.jsx
import React, { useState } from 'react';
import { FiMapPin, FiUser, FiPhone, FiCompass } from 'react-icons/fi';
import { MdLocationOn, MdReport, MdPriorityHigh, MdDescription } from 'react-icons/md';

const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou',
  'Sétif', 'Béjaïa', 'Tipaza', 'Boumerdès'
];

const REPORT_TYPES = {
  accident: { label: 'Accident', icon: '🚗' },
  eclairage_publique: { label: 'Éclairage', icon: '💡' },
  dangers_zone: { label: 'Danger', icon: '⚠️' },
  water_leakage: { label: 'Fuite eau', icon: '💧' },
  déchet: { label: 'Déchet', icon: '🗑️' }
};

const LiveReport = ({ onSubmit, darkMode, onGetLocation, location }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    reportType: 'accident',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.wilaya || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    onSubmit({
      ...formData,
      latitude: location?.lat || 36.7538,
      longitude: location?.lng || 3.0588,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  return (
    <div className="live-report-content">
      <div className="report-header">
        <h2><FiMapPin /> Signalement en direct</h2>
        <p>Ajoutez un signalement avec votre position actuelle</p>
      </div>
      
      <form className="live-report-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label><FiUser /> Nom complet *</label>
            <input 
              type="text" 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Entrez votre nom"
              required
            />
          </div>
          
          <div className="form-group">
            <label><FiPhone /> Téléphone</label>
            <input 
              type="tel" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Numéro de téléphone"
            />
          </div>
          
          <div className="form-group">
            <label><FiMapPin /> Wilaya *</label>
            <select value={formData.wilaya} onChange={(e) => setFormData({...formData, wilaya: e.target.value})} required>
              <option value="">Sélectionner une wilaya</option>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label><MdLocationOn /> Adresse</label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Adresse précise"
            />
          </div>
          
          <div className="form-group">
            <label><MdReport /> Type de signalement *</label>
            <select value={formData.reportType} onChange={(e) => setFormData({...formData, reportType: e.target.value})}>
              {Object.entries(REPORT_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label><MdPriorityHigh /> Priorité</label>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="high">Haute - Urgent</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
          
          <div className="form-group full-width">
            <label><MdDescription /> Description *</label>
            <textarea 
              rows="4" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez l'incident en détail..."
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label><FiCompass /> Position GPS</label>
            <div className="gps-controls">
              <button type="button" className="gps-btn" onClick={onGetLocation}>
                <FiCompass /> Obtenir ma position
              </button>
              {location && (
                <div className="gps-info">
                  <p>Latitude: {location.lat.toFixed(6)}</p>
                  <p>Longitude: {location.lng.toFixed(6)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            <FiMapPin /> Soumettre le signalement
          </button>
        </div>
      </form>
    </div>
  );
};

export default LiveReport;
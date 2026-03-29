// components/LiveMap.jsx
import React from 'react';
import { FiMap, FiCompass, FiRefreshCw, FiMapPin } from 'react-icons/fi';
import { FaCloudRain, FaCloudSun } from 'react-icons/fa';

const LiveMap = ({ reports, weatherAlerts, darkMode, onGetLocation, onRefresh }) => {
  return (
    <div className="live-map-content">
      <div className="map-header">
        <h2><FiMap /> Carte des signalements en direct</h2>
        <div className="map-actions">
          <button className="map-action-btn" onClick={onGetLocation}>
            <FiCompass /> Ma position
          </button>
          <button className="map-action-btn refresh" onClick={onRefresh}>
            <FiRefreshCw /> Actualiser
          </button>
        </div>
      </div>
      
      <div className="map-container">
        <div 
          className="simple-map" 
          style={{ 
            background: darkMode ? '#1e293b' : '#e2e8f0', 
            minHeight: '500px', 
            borderRadius: '12px', 
            overflow: 'hidden',
            padding: '20px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p>📍 Carte interactive - {reports.filter(r => r.latitude).length} signalements actifs</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            {reports.filter(r => r.latitude).slice(0, 12).map(report => (
              <div 
                key={report.id} 
                style={{ 
                  background: darkMode ? '#0f172a' : '#fff', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{report.icon || '📍'}</span>
                  <span className="status-badge" style={{ 
                    background: report.status === 'pending' ? '#fef3c7' : report.status === 'in-progress' ? '#dbeafe' : '#d1fae5',
                    color: report.status === 'pending' ? '#d97706' : report.status === 'in-progress' ? '#2563eb' : '#059669',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {report.status === 'pending' ? '⏳ En attente' : report.status === 'in-progress' ? '🔄 En cours' : '✅ Résolu'}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{report.fullName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{report.wilaya}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>
                  Lat: {report.latitude?.toFixed(4)} | Lng: {report.longitude?.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="weather-alerts-section">
          <div className="section-header">
            <h3><FaCloudRain /> Alertes météo</h3>
          </div>
          <div className="weather-alerts-list">
            {weatherAlerts.map(alert => (
              <div key={alert.id} className={`weather-alert severity-${alert.severity}`}>
                <div className="alert-icon">
                  {alert.type === 'Pluies orageuses' ? <FaCloudRain /> : <FaCloudSun />}
                </div>
                <div className="alert-content">
                  <h4>{alert.region} - {alert.type}</h4>
                  <p>{alert.message}</p>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
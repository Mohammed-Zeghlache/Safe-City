import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./HazardMap.css";

// Fix for default markers in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different hazard levels - Memoize these to prevent recreation
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HazardMap = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    red: 0,
    orange: 0,
    yellow: 0,
    total: 0
  });
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [filter, setFilter] = useState("all");
  
  // Fixed map center - don't change this
  const mapCenter = useMemo(() => [28.0339, 1.6596], []);
  const mapZoom = 6;

  // Problem type categories
  const problemCategories = {
    red: ["Accident", "Cable issue", "Dangers zone", "agression"],
    orange: ["Eclairage publique", "Route degradee", "danger"],
    yellow: ["Water leakage", "déchet", "autre"]
  };

  useEffect(() => {
    // Load demo data immediately without API call
    const demoData = generateDemoData();
    setHazards(demoData);
    updateStats(demoData);
    setLoading(false);
  }, []);

  const getProblemLevel = (problemType) => {
    if (problemCategories.red.includes(problemType)) return "red";
    if (problemCategories.orange.includes(problemType)) return "orange";
    if (problemCategories.yellow.includes(problemType)) return "yellow";
    return "yellow";
  };

  const getProblemIcon = (problemType) => {
    const icons = {
      "Accident": "🚗💥",
      "Cable issue": "⚡🔌",
      "Dangers zone": "⚠️🚫",
      "agression": "👊😠",
      "Eclairage publique": "💡🏮",
      "Route degradee": "🛣️🔧",
      "Water leakage": "💧🚰",
      "déchet": "🗑️🚮",
      "autre": "📌❓"
    };
    return icons[problemType] || "📍";
  };

  const generateDemoData = () => {
    const algeriaLocations = [
      // RED ZONES - Critical
      { name: "Algiers Center", lat: 36.7538, lng: 3.0588, type: "Accident", description: "Serious car accident reported - Multiple vehicles involved" },
      { name: "Oran Port", lat: 35.6975, lng: -0.6339, type: "agression", description: "Aggression incident reported - Police on site" },
      { name: "Constantine", lat: 36.3650, lng: 6.6147, type: "Dangers zone", description: "Dangerous area - Landslide risk" },
      { name: "Annaba", lat: 36.9027, lng: 7.7558, type: "Cable issue", description: "Electrical cable fire hazard" },
      { name: "Blida", lat: 36.4700, lng: 2.8277, type: "Accident", description: "Multi-vehicle collision" },
      { name: "Setif", lat: 36.1908, lng: 5.4138, type: "agression", description: "Street violence reported" },
      { name: "Tizi Ouzou", lat: 36.7167, lng: 4.0500, type: "Dangers zone", description: "Landslide risk zone" },
      
      // ORANGE ZONES - High Risk
      { name: "Tlemcen", lat: 34.8883, lng: -1.3189, type: "Eclairage publique", description: "Street lights not working" },
      { name: "Djelfa", lat: 34.6700, lng: 3.2600, type: "Route degradee", description: "Damaged road surface" },
      { name: "Biskra", lat: 34.8500, lng: 5.7333, type: "Eclairage publique", description: "No lighting in main street" },
      { name: "Bejaia", lat: 36.7500, lng: 5.0833, type: "Route degradee", description: "Potholes causing accidents" },
      { name: "Mascara", lat: 35.3974, lng: 0.1423, type: "Eclairage publique", description: "Broken street lamps" },
      
      // YELLOW ZONES - Medium Risk
      { name: "Sidi Bel Abbes", lat: 35.1947, lng: -0.6306, type: "Water leakage", description: "Water pipe burst" },
      { name: "Mostaganem", lat: 35.9322, lng: 0.0883, type: "déchet", description: "Garbage accumulation" },
      { name: "Bouira", lat: 36.3749, lng: 3.8935, type: "Water leakage", description: "Water flooding street" },
      { name: "Guelma", lat: 36.4619, lng: 7.4339, type: "déchet", description: "Illegal waste dumping" },
      { name: "Medea", lat: 36.2675, lng: 2.7539, type: "autre", description: "Infrastructure issue" }
    ];

    return algeriaLocations.map((location, index) => ({
      id: index,
      position: [location.lat, location.lng],
      title: location.name,
      description: location.description,
      type: location.type,
      level: getProblemLevel(location.type),
      icon: getProblemIcon(location.type),
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reporter: "Citizen Report",
      status: "Active",
      severity: getSeverity(getProblemLevel(location.type))
    }));
  };

  const getSeverity = (level) => {
    switch(level) {
      case "red": return "Critical - Immediate Action Required";
      case "orange": return "High - Urgent Attention Needed";
      case "yellow": return "Medium - Needs Attention";
      default: return "Medium";
    }
  };

  const updateStats = (hazardsData) => {
    if (!Array.isArray(hazardsData)) {
      setStats({ red: 0, orange: 0, yellow: 0, total: 0 });
      return;
    }
    
    const red = hazardsData.filter(h => h && h.level === "red").length;
    const orange = hazardsData.filter(h => h && h.level === "orange").length;
    const yellow = hazardsData.filter(h => h && h.level === "yellow").length;
    setStats({ red, orange, yellow, total: hazardsData.length });
  };

  const getIconByLevel = (level) => {
    switch(level) {
      case "red": return redIcon;
      case "orange": return orangeIcon;
      case "yellow": return yellowIcon;
      default: return yellowIcon;
    }
  };

  const getCircleColor = (level) => {
    switch(level) {
      case "red": return "#dc2626";
      case "orange": return "#f97316";
      case "yellow": return "#eab308";
      default: return "#eab308";
    }
  };

  const getCircleRadius = (level) => {
    switch(level) {
      case "red": return 25;
      case "orange": return 18;
      case "yellow": return 12;
      default: return 12;
    }
  };

  const handleMarkerClick = (hazard) => {
    setSelectedHazard(hazard);
  };

  // Memoize filtered hazards to prevent unnecessary re-renders
  const filteredHazards = useMemo(() => {
    if (!Array.isArray(hazards)) return [];
    if (filter === "all") return hazards;
    return hazards.filter(h => h && h.level === filter);
  }, [hazards, filter]);

  if (loading) {
    return (
      <div className="hazard-map-loading">
        <div className="loading-spinner"></div>
        <p>Loading hazard map...</p>
      </div>
    );
  }

  return (
    <div className="hazard-map-container">
      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        📍 Algeria Hazard Map - Real-time Hazard Locations
      </div>
      
      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card total" onClick={() => setFilter("all")}>
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Reports</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card red" onClick={() => setFilter("red")}>
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3>Critical (Red Zone)</h3>
            <p className="stat-number">{stats.red}</p>
            <span className="stat-sub">Accident | Cable | Danger | Agression</span>
          </div>
        </div>
        <div className="stat-card orange" onClick={() => setFilter("orange")}>
          <div className="stat-icon">🟠</div>
          <div className="stat-info">
            <h3>High Risk (Orange)</h3>
            <p className="stat-number">{stats.orange}</p>
            <span className="stat-sub">Lighting | Road Issues</span>
          </div>
        </div>
        <div className="stat-card yellow" onClick={() => setFilter("yellow")}>
          <div className="stat-icon">🟡</div>
          <div className="stat-info">
            <h3>Medium Risk (Yellow)</h3>
            <p className="stat-number">{stats.yellow}</p>
            <span className="stat-sub">Water | Waste | Other</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-header">
          <h2>📍 Interactive Hazard Map - Algeria</h2>
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-color red"></div>
              <span>Critical (Immediate Action)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color orange"></div>
              <span>High Risk (Urgent)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color yellow"></div>
              <span>Medium Risk (Monitor)</span>
            </div>
          </div>
        </div>
        
        {/* MapContainer without key prop that changes */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="hazard-map"
          zoomControl={true}
          style={{ background: "#f0f2f5", height: "600px", width: "100%" }}
          whenCreated={(map) => {
            // This ensures the map is properly initialized
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredHazards.map((hazard) => {
            if (!hazard || !hazard.position || !Array.isArray(hazard.position) || hazard.position.length !== 2) {
              return null;
            }
            
            const [lat, lng] = hazard.position;
            if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
              return null;
            }
            
            return (
              <React.Fragment key={hazard.id}>
                <CircleMarker
                  center={[lat, lng]}
                  radius={getCircleRadius(hazard.level)}
                  color={getCircleColor(hazard.level)}
                  fillColor={getCircleColor(hazard.level)}
                  fillOpacity={0.3}
                  weight={2}
                  opacity={0.7}
                >
                  <Tooltip>
                    <div className="tooltip-content">
                      <strong>{hazard.title}</strong><br />
                      <span>{hazard.icon} {hazard.type}</span><br />
                      Level: {hazard.level.toUpperCase()}
                    </div>
                  </Tooltip>
                </CircleMarker>
                
                <Marker
                  position={[lat, lng]}
                  icon={getIconByLevel(hazard.level)}
                  eventHandlers={{
                    click: () => handleMarkerClick(hazard)
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{hazard.icon} {hazard.title}</h3>
                      <div className={`severity-badge ${hazard.level}`}>
                        {hazard.level.toUpperCase()} - {hazard.severity}
                      </div>
                      <p><strong>📋 Problem Type:</strong> {hazard.type}</p>
                      <p><strong>⚠️ Risk Level:</strong> 
                        <span className={`level-badge ${hazard.level}`}>
                          {hazard.level.toUpperCase()}
                        </span>
                      </p>
                      <p><strong>📝 Description:</strong> {hazard.description}</p>
                      <p><strong>🕒 Reported:</strong> {new Date(hazard.timestamp).toLocaleString()}</p>
                      <p><strong>👤 Reporter:</strong> {hazard.reporter}</p>
                      <p><strong>📊 Status:</strong> <span className="status-active">{hazard.status}</span></p>
                      <button className="details-btn" onClick={() => handleMarkerClick(hazard)}>
                        View Full Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected Hazard Details Modal */}
      {selectedHazard && (
        <div className="hazard-details-modal" onClick={() => setSelectedHazard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedHazard(null)}>×</button>
            <h3>{selectedHazard.icon} Hazard Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <strong>Location:</strong>
                <p>{selectedHazard.title}</p>
              </div>
              <div className="detail-item">
                <strong>Coordinates:</strong>
                <p>{selectedHazard.position[0].toFixed(4)}, {selectedHazard.position[1].toFixed(4)}</p>
              </div>
              <div className="detail-item">
                <strong>Problem Type:</strong>
                <p>{selectedHazard.type}</p>
              </div>
              <div className="detail-item">
                <strong>Risk Level:</strong>
                <div className={`severity-badge ${selectedHazard.level}`}>
                  {selectedHazard.level.toUpperCase()} - {selectedHazard.severity}
                </div>
              </div>
              <div className="detail-item">
                <strong>Description:</strong>
                <p>{selectedHazard.description}</p>
              </div>
              <div className="detail-item">
                <strong>Reported by:</strong>
                <p>{selectedHazard.reporter}</p>
              </div>
              <div className="detail-item">
                <strong>Date & Time:</strong>
                <p>{new Date(selectedHazard.timestamp).toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <strong>Status:</strong>
                <span className="status-active">{selectedHazard.status}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="action-btn assign">🚑 Assign Emergency Team</button>
              <button className="action-btn resolve">✅ Mark Resolved</button>
              <button className="action-btn track">📍 Track Progress</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardMap;
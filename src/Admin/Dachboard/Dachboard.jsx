import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../Dachboard/Dachboard.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiMenu, FiX, FiUsers, FiBell, FiSearch, FiSettings, FiClock, FiCheckCircle,
  FiCircle, FiTrendingUp, FiLogOut, FiUser, FiDownload, FiRefreshCw,
  FiEye, FiEdit2, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail, FiCalendar,
  FiFilter, FiSave, FiRotateCcw, FiUpload, FiDownloadCloud, FiShield,
  FiMoon, FiSun, FiAlertCircle, FiInfo, FiStar, FiActivity, FiHelpCircle,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiBarChart2, FiPieChart, FiTrendingUp as FiTrend, FiTarget, FiAward, FiGlobe,
  FiMap, FiCloudRain, FiCompass
} from 'react-icons/fi';
import {
  MdDashboard, MdReport, MdNotifications, MdPerson, MdEmail, MdLocationOn,
  MdDescription, MdPriorityHigh, MdAnalytics, MdFeedback, MdOutlineSettings,
  MdTimeline, MdAssessment, MdTrendingUp, MdShowChart, MdMap
} from 'react-icons/md';
import {
  FaChartLine, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaUserCircle,
  FaMapMarkedAlt, FaTrashAlt, FaEdit, FaChartBar, FaChartPie, FaChartLine as FaChartLineIcon,
  FaMap, FaCloudSun, FaCloudRain
} from 'react-icons/fa';
import {
  Line, Bar, Pie, Doughnut, Radar, Bubble
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different priority levels
const highIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mediumIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const lowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, ChartTooltip, Legend, Filler, TimeScale
);

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const Dashboard = () => {
  const navigate = useNavigate();

  // ==================== MOBILE DETECTION ====================
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== STATE MANAGEMENT ====================
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('line');

  // Filter States
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterWilaya, setFilterWilaya] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Data States
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);

  // Analytics States
  const [analyticsData, setAnalyticsData] = useState({
    dailyData: [],
    weeklyData: [],
    monthlyData: [],
    yearlyData: [],
    categoryStats: [],
    wilayaStats: [],
    priorityStats: [],
    statusStats: [],
    hourlyDistribution: Array(24).fill(0),
    weekdayDistribution: Array(7).fill(0),
    responseTimeAvg: 0,
    resolutionRate: 0,
    satisfactionScore: 0,
    peakHour: 0,
    busiestDay: '',
    topWilaya: '',
    topCategory: ''
  });

  // Map States
  const [mapCenter, setMapCenter] = useState({ lat: 36.7538, lng: 3.0588 });
  const [mapZoom, setMapZoom] = useState(6);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  // Live Report States
  const [liveReports, setLiveReports] = useState([]);
  const [showLiveReportForm, setShowLiveReportForm] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  // Settings
  const [settings, setSettings] = useState({
    fullName: 'Admin User',
    email: 'admin@safecity.com',
    phone: '+213 555 123 456',
    role: 'Super Administrator',
    language: 'fr',
    notifications: true,
    emailAlerts: true
  });

  // Form State for Add/Edit
  const [reportForm, setReportForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    wilaya: '',
    address: '',
    reportType: 'accident',
    description: '',
    priority: 'medium',
    status: 'pending'
  });

  // Live Report Form State
  const [liveReportForm, setLiveReportForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    reportType: 'accident',
    description: '',
    priority: 'medium',
    latitude: '',
    longitude: ''
  });

  // Live Map specific states
  const [searchWilaya, setSearchWilaya] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Constants
  const wilayas = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou',
    'Sétif', 'Béjaïa', 'Tipaza', 'Boumerdès', 'Aïn Defla', 'Bordj Bou Arréridj',
    'Bouira', 'Chlef', 'Djelfa', 'Guelma', 'Jijel', 'Laghouat', 'Mascara',
    'Médéa', 'Mila', 'Mostaganem', 'Naâma', 'Ouargla', 'Relizane', 'Saïda',
    'Sidi Bel Abbès', 'Skikda', 'Souk Ahras', 'Tébessa', 'Tiaret', 'Tindouf',
    'Tissemsilt', 'Tlemcen', 'Béchar', 'Batna', 'Biskra', 'El Bayadh', 'El Oued',
    'El Tarf', 'Ghardaïa', 'Illizi', 'Khenchela', 'M\'Sila', 'Oum El Bouaghi',
    'Adrar', 'Tamanrasset'
  ];

  // Wilaya coordinates mapping
  const wilayaCoordinates = {
    'Alger': { lat: 36.7538, lng: 3.0588 },
    'Oran': { lat: 35.6975, lng: -0.6339 },
    'Constantine': { lat: 36.3650, lng: 6.6147 },
    'Annaba': { lat: 36.9027, lng: 7.7558 },
    'Blida': { lat: 36.4700, lng: 2.8277 },
    'Tizi Ouzou': { lat: 36.7167, lng: 4.0500 },
    'Sétif': { lat: 36.1908, lng: 5.4138 },
    'Béjaïa': { lat: 36.7500, lng: 5.0833 },
    'Tipaza': { lat: 36.5900, lng: 2.4400 },
    'Boumerdès': { lat: 36.7667, lng: 3.4833 },
    'Aïn Defla': { lat: 36.2667, lng: 1.9667 },
    'Bordj Bou Arréridj': { lat: 36.0667, lng: 4.7667 },
    'Bouira': { lat: 36.3749, lng: 3.8935 },
    'Chlef': { lat: 36.1650, lng: 1.3317 },
    'Djelfa': { lat: 34.6700, lng: 3.2600 },
    'Guelma': { lat: 36.4619, lng: 7.4339 },
    'Jijel': { lat: 36.8167, lng: 5.7667 },
    'Laghouat': { lat: 33.8000, lng: 2.8650 },
    'Mascara': { lat: 35.3974, lng: 0.1423 },
    'Médéa': { lat: 36.2675, lng: 2.7539 },
    'Mila': { lat: 36.4500, lng: 6.2667 },
    'Mostaganem': { lat: 35.9322, lng: 0.0883 },
    'Naâma': { lat: 33.2667, lng: -0.3167 },
    'Ouargla': { lat: 31.9500, lng: 5.3167 },
    'Relizane': { lat: 35.7333, lng: 0.5500 },
    'Saïda': { lat: 34.8333, lng: 0.1500 },
    'Sidi Bel Abbès': { lat: 35.1947, lng: -0.6306 },
    'Skikda': { lat: 36.8667, lng: 6.9000 },
    'Souk Ahras': { lat: 36.2833, lng: 7.9500 },
    'Tébessa': { lat: 35.4000, lng: 8.1167 },
    'Tiaret': { lat: 35.3667, lng: 1.3167 },
    'Tindouf': { lat: 27.6667, lng: -8.1333 },
    'Tissemsilt': { lat: 35.6000, lng: 1.8000 },
    'Tlemcen': { lat: 34.8883, lng: -1.3189 },
    'Béchar': { lat: 31.6167, lng: -2.2167 },
    'Batna': { lat: 35.5500, lng: 6.1667 },
    'Biskra': { lat: 34.8500, lng: 5.7333 },
    'El Bayadh': { lat: 33.6833, lng: 1.0167 },
    'El Oued': { lat: 33.3667, lng: 6.8667 },
    'El Tarf': { lat: 36.7667, lng: 8.3167 },
    'Ghardaïa': { lat: 32.4833, lng: 3.6667 },
    'Illizi': { lat: 26.4833, lng: 8.4667 },
    'Khenchela': { lat: 35.4167, lng: 7.1333 },
    'M\'Sila': { lat: 35.7000, lng: 4.5500 },
    'Oum El Bouaghi': { lat: 35.8667, lng: 7.1167 },
    'Adrar': { lat: 27.8667, lng: -0.2833 },
    'Tamanrasset': { lat: 22.7850, lng: 5.5228 }
  };

  const reportTypes = {
    accident: { label: 'Accident', icon: '🚗', color: '#ef4444', bg: '#fee2e2' },
    eclairage_publique: { label: 'Éclairage', icon: '💡', color: '#f59e0b', bg: '#fed7aa' },
    dangers_zone: { label: 'Danger', icon: '⚠️', color: '#f97316', bg: '#ffedd5' },
    water_leakage: { label: 'Fuite eau', icon: '💧', color: '#3b82f6', bg: '#dbeafe' },
    déchet: { label: 'Déchet', icon: '🗑️', color: '#10b981', bg: '#d1fae5' },
    cable_issue: { label: 'Câble', icon: '🔌', color: '#8b5cf6', bg: '#ede9fe' },
    agression: { label: 'Agression', icon: '👤', color: '#dc2626', bg: '#fee2e2' },
    route_degradee: { label: 'Route', icon: '🛣️', color: '#6b7280', bg: '#f3f4f6' }
  };

  // ==================== HELPER FUNCTIONS ====================
  const addNotification = (title, message, icon = '🔔') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      icon,
      time: new Date().toLocaleString(),
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifications]));
  };

  const addActivity = (user, action, target) => {
    const newActivity = {
      id: Date.now(),
      user,
      action,
      target,
      time: new Date().toLocaleString(),
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // ==================== ANALYTICS CALCULATIONS ====================
  const calculateAnalytics = useCallback((reportsData) => {
    const dailyMap = new Map();
    const weeklyMap = new Map();
    const monthlyMap = new Map();
    const yearlyMap = new Map();
    const categoryMap = new Map();
    const wilayaMap = new Map();
    const priorityMap = new Map();
    const statusMap = new Map();
    const hourCount = Array(24).fill(0);
    const weekdayCount = Array(7).fill(0);

    let resolvedCount = 0;
    let totalSatisfaction = 0;

    reportsData.forEach(report => {
      const date = new Date(report.timestamp || report.date);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const yearKey = `${date.getFullYear()}`;
      const hour = date.getHours();
      const weekday = date.getDay();

      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      yearlyMap.set(yearKey, (yearlyMap.get(yearKey) || 0) + 1);
      hourCount[hour]++;
      weekdayCount[weekday]++;

      const category = report.reportType;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);

      const wilaya = report.wilaya;
      wilayaMap.set(wilaya, (wilayaMap.get(wilaya) || 0) + 1);

      const priority = report.priority;
      priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);

      const status = report.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      if (report.status === 'resolved') {
        resolvedCount++;
        if (report.rating) totalSatisfaction += report.rating;
      }
    });

    let peakHour = 0;
    let maxHourCount = 0;
    hourCount.forEach((count, hour) => {
      if (count > maxHourCount) { maxHourCount = count; peakHour = hour; }
    });

    const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let busiestDay = '';
    let maxDayCount = 0;
    weekdayCount.forEach((count, day) => {
      if (count > maxDayCount) { maxDayCount = count; busiestDay = weekdays[day]; }
    });

    let topWilaya = '';
    let maxWilayaCount = 0;
    wilayaMap.forEach((count, wilaya) => {
      if (count > maxWilayaCount) { maxWilayaCount = count; topWilaya = wilaya; }
    });

    let topCategory = '';
    let maxCategoryCount = 0;
    categoryMap.forEach((count, category) => {
      if (count > maxCategoryCount) { maxCategoryCount = count; topCategory = reportTypes[category]?.label || category; }
    });

    const resolutionRate = reportsData.length > 0 ? (resolvedCount / reportsData.length) * 100 : 0;
    const satisfactionScore = resolvedCount > 0 ? totalSatisfaction / resolvedCount : 0;
    const responseTimeAvg = 24.5;

    return {
      dailyData: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
      weeklyData: Array.from(weeklyMap.entries()).map(([week, count]) => ({ week, count })),
      monthlyData: Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count })),
      yearlyData: Array.from(yearlyMap.entries()).map(([year, count]) => ({ year, count })),
      categoryStats: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category: reportTypes[category]?.label || category,
        count,
        color: reportTypes[category]?.color || '#6b7280',
        icon: reportTypes[category]?.icon
      })),
      wilayaStats: Array.from(wilayaMap.entries()).map(([wilaya, count]) => ({ wilaya, count })),
      priorityStats: Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count })),
      statusStats: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      hourlyDistribution: hourCount,
      weekdayDistribution: weekdayCount,
      responseTimeAvg,
      resolutionRate,
      satisfactionScore: satisfactionScore.toFixed(1),
      peakHour,
      busiestDay,
      topWilaya,
      topCategory
    };
  }, []);

  // ==================== LOAD DATA ====================
  const loadReports = () => {
    const saved = localStorage.getItem('userReports');
    if (saved && JSON.parse(saved).length > 0) {
      const loadedReports = JSON.parse(saved);
      setReports(loadedReports);
      setAnalyticsData(calculateAnalytics(loadedReports));
    } else {
      const sampleReports = [];
      const startDate = new Date(2024, 0, 1);

      for (let i = 1; i <= 200; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + Math.floor(Math.random() * 365));

        const types = Object.keys(reportTypes);
        const statuses = ['pending', 'in-progress', 'resolved'];
        const priorities = ['high', 'medium', 'low'];
        const wilayaIndex = Math.floor(Math.random() * wilayas.length);
        const wilayaName = wilayas[wilayaIndex];
        const coords = wilayaCoordinates[wilayaName] || { lat: 36.7538, lng: 3.0588 };

        sampleReports.push({
          id: i,
          fullName: `Citoyen ${i}`,
          phone: `0555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          email: `citoyen${i}@email.com`,
          wilaya: wilayaName,
          address: `${Math.floor(Math.random() * 1000)} Rue Principale`,
          reportType: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          date: date.toISOString().split('T')[0],
          timestamp: date.toISOString(),
          description: `Description du signalement ${i}`,
          rating: Math.floor(Math.random() * 5) + 1,
          reportId: `RPT-${String(i).padStart(4, '0')}`,
          latitude: coords.lat + (Math.random() - 0.5) * 0.5,
          longitude: coords.lng + (Math.random() - 0.5) * 0.5
        });
      }

      setReports(sampleReports);
      setAnalyticsData(calculateAnalytics(sampleReports));
      localStorage.setItem('userReports', JSON.stringify(sampleReports));
    }
  };

  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const sampleNotifs = [
        { id: 1, title: 'Bienvenue', message: 'Bienvenue sur SafeCity Dashboard', icon: '🎉', time: new Date().toLocaleString(), read: false, timestamp: new Date().toISOString() }
      ];
      setNotifications(sampleNotifs);
      localStorage.setItem('notifications', JSON.stringify(sampleNotifs));
    }
  };

  const loadActivities = () => {
    const saved = localStorage.getItem('activities');
    if (saved) {
      setActivities(JSON.parse(saved));
    } else {
      const sampleActivities = [
        { id: 1, user: 'Admin', action: 'a ajouté un nouveau signalement', target: 'Accident à Alger', time: new Date().toLocaleString(), timestamp: new Date().toISOString() }
      ];
      setActivities(sampleActivities);
      localStorage.setItem('activities', JSON.stringify(sampleActivities));
    }
  };

  const loadLiveReports = () => {
    const saved = localStorage.getItem('liveReports');
    if (saved) {
      setLiveReports(JSON.parse(saved));
    } else {
      setLiveReports([]);
    }
  };

  const loadWeatherAlerts = () => {
    const mockWeatherAlerts = [
      { id: 1, region: 'Alger', type: 'Pluies orageuses', severity: 'moderate', message: 'Risque d\'inondations dans les zones basses', timestamp: new Date().toISOString() },
      { id: 2, region: 'Oran', type: 'Vents forts', severity: 'high', message: 'Vents jusqu\'à 80 km/h', timestamp: new Date().toISOString() },
      { id: 3, region: 'Constantine', type: 'Brouillard', severity: 'low', message: 'Visibilité réduite sur les routes', timestamp: new Date().toISOString() }
    ];
    setWeatherAlerts(mockWeatherAlerts);
  };

  // ==================== LIVE MAP FUNCTIONS ====================
  const getLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setMapZoom(13);
          addNotification('Localisation', 'Position actuelle détectée', '📍');
        },
        (error) => {
          console.error('Geolocation error:', error);
          addNotification('Erreur', 'Impossible de détecter votre position', '⚠️');
        }
      );
    } else {
      addNotification('Erreur', 'Géolocalisation non supportée', '⚠️');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return highIcon;
      case 'medium': return mediumIcon;
      default: return lowIcon;
    }
  };

  const getCircleColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f97316';
      default: return '#10b981';
    }
  };

  const getCircleRadius = (priority) => {
    switch (priority) {
      case 'high': return 20;
      case 'medium': return 15;
      default: return 10;
    }
  };

  const handleWilayaSearch = () => {
    if (searchWilaya && wilayaCoordinates[searchWilaya]) {
      const coords = wilayaCoordinates[searchWilaya];
      setSearchResults(coords);
      setMapCenter(coords);
      setMapZoom(12);
      addNotification('Recherche', `Centré sur ${searchWilaya}`, '📍');
      setSearchWilaya('');
    } else if (searchWilaya) {
      addNotification('Erreur', `Wilaya "${searchWilaya}" non trouvée`, '⚠️');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setShowFullscreen(true);
    } else {
      document.exitFullscreen();
      setShowFullscreen(false);
    }
  };

  // ==================== LIVE REPORT FUNCTIONS ====================
  const addLiveReport = () => {
    if (!liveReportForm.fullName || !liveReportForm.wilaya || !liveReportForm.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const coords = wilayaCoordinates[liveReportForm.wilaya] || { lat: 36.7538, lng: 3.0588 };

    const newReport = {
      id: Date.now(),
      ...liveReportForm,
      latitude: liveLocation?.lat || coords.lat,
      longitude: liveLocation?.lng || coords.lng,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      reportId: `LIVE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'pending',
      isLive: true
    };

    setReports(prev => [newReport, ...prev]);
    setLiveReports(prev => [newReport, ...prev]);
    localStorage.setItem('userReports', JSON.stringify([newReport, ...reports]));
    localStorage.setItem('liveReports', JSON.stringify([newReport, ...liveReports]));
    setAnalyticsData(calculateAnalytics([newReport, ...reports]));
    setShowLiveReportForm(false);
    setLiveReportForm({
      fullName: '', phone: '', wilaya: '', address: '',
      reportType: 'accident', description: '', priority: 'medium', latitude: '', longitude: ''
    });
    addNotification('Signalement en direct', `${liveReportForm.fullName} a signalé un incident en direct`, '📍');
    addActivity('Admin', 'a ajouté un signalement en direct', liveReportForm.fullName);
  };

  // ==================== STATS CALCULATION ====================
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const inProgress = reports.filter(r => r.status === 'in-progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const highPriority = reports.filter(r => r.priority === 'high').length;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    return { total, pending, inProgress, resolved, highPriority, resolutionRate };
  }, [reports]);

  // ==================== FILTERED REPORTS ====================
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.wilaya?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus);
    if (filterPriority !== 'all') filtered = filtered.filter(r => r.priority === filterPriority);
    if (filterWilaya !== 'all') filtered = filtered.filter(r => r.wilaya === filterWilaya);
    if (dateRange.start) filtered = filtered.filter(r => r.date >= dateRange.start);
    if (dateRange.end) filtered = filtered.filter(r => r.date <= dateRange.end);

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reports, searchTerm, filterStatus, filterPriority, filterWilaya, dateRange]);

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const mapReports = useMemo(() => {
    let filtered = reports.filter(r => r.latitude && r.longitude);
    if (filterPriority !== 'all') filtered = filtered.filter(r => r.priority === filterPriority);
    return filtered;
  }, [reports, filterPriority]);

  const mapStats = useMemo(() => {
    const high = mapReports.filter(r => r.priority === 'high').length;
    const medium = mapReports.filter(r => r.priority === 'medium').length;
    const low = mapReports.filter(r => r.priority === 'low').length;
    return { high, medium, low, total: mapReports.length };
  }, [mapReports]);

  // ==================== ACTIONS ====================
  const addReport = () => {
    if (!reportForm.fullName || !reportForm.wilaya || !reportForm.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newReport = {
      id: Date.now(),
      ...reportForm,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      reportId: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };

    setReports(prev => [newReport, ...prev]);
    localStorage.setItem('userReports', JSON.stringify([newReport, ...reports]));
    setAnalyticsData(calculateAnalytics([newReport, ...reports]));
    setShowAddModal(false);
    setReportForm({
      fullName: '', phone: '', email: '', wilaya: '', address: '',
      reportType: 'accident', description: '', priority: 'medium', status: 'pending'
    });
    addNotification('Nouveau signalement', `${reportForm.fullName} a ajouté un signalement`, '📝');
    addActivity('Admin', 'a ajouté un signalement', reportForm.fullName);
  };

  const updateReport = () => {
    if (!selectedReport) return;
    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? { ...r, ...reportForm } : r
    );
    setReports(updatedReports);
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    setAnalyticsData(calculateAnalytics(updatedReports));
    setShowEditModal(false);
    setSelectedReport(null);
    addNotification('Signalement modifié', `Le signalement #${selectedReport.id} a été modifié`, '✏️');
    addActivity('Admin', 'a modifié le signalement', `#${selectedReport.id}`);
  };

  const deleteReport = () => {
    if (!selectedReport) return;
    const updatedReports = reports.filter(r => r.id !== selectedReport.id);
    setReports(updatedReports);
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    setAnalyticsData(calculateAnalytics(updatedReports));
    setShowDeleteModal(false);
    setSelectedReport(null);
    addNotification('Signalement supprimé', `Le signalement #${selectedReport.id} a été supprimé`, '🗑️');
    addActivity('Admin', 'a supprimé le signalement', `#${selectedReport.id}`);
  };

  const updateReportStatus = (id, newStatus) => {
    const updatedReports = reports.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setReports(updatedReports);
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    setAnalyticsData(calculateAnalytics(updatedReports));
    addNotification('Statut mis à jour', `Le signalement #${id} est maintenant ${newStatus}`, '🔄');
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nom complet', 'Téléphone', 'Email', 'Wilaya', 'Adresse', 'Type', 'Description', 'Statut', 'Priorité', 'Date'];
    const data = filteredReports.map(r => [
      r.id, r.fullName, r.phone, r.email, r.wilaya, r.address,
      reportTypes[r.reportType]?.label || r.reportType,
      r.description, r.status, r.priority, r.date
    ]);

    const csvRows = [headers.join(','), ...data.map(row => row.map(cell => `"${cell || ''}"`).join(','))];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Export terminé', 'Les données ont été exportées en CSV', '📊');
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === paginatedReports.length && paginatedReports.length > 0) {
      setSelectedReports([]);
    } else {
      setSelectedReports(paginatedReports.map(r => r.id));
    }
  };

  const toggleSelectReport = (id) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkDelete = () => {
    const updatedReports = reports.filter(r => !selectedReports.includes(r.id));
    setReports(updatedReports);
    localStorage.setItem('userReports', JSON.stringify(updatedReports));
    setAnalyticsData(calculateAnalytics(updatedReports));
    addNotification('Suppression groupée', `${selectedReports.length} signalements supprimés`, '🗑️');
    setSelectedReports([]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem('notifications', JSON.stringify(notifications.map(n => ({ ...n, read: true }))));
  };

  // ==================== CHART DATA ====================
  const getChartData = () => {
    const lastData = analyticsData.dailyData.slice(-30);

    const lineChartData = {
      labels: lastData.map(d => d.date),
      datasets: [{
        label: 'Signalements',
        data: lastData.map(d => d.count),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };

    const barChartData = {
      labels: analyticsData.categoryStats.map(c => c.category),
      datasets: [{
        label: 'Nombre de signalements',
        data: analyticsData.categoryStats.map(c => c.count),
        backgroundColor: analyticsData.categoryStats.map(c => c.color),
        borderRadius: 10,
        barPercentage: 0.7
      }]
    };

    const pieChartData = {
      labels: analyticsData.statusStats.map(s => {
        const statusMap = { pending: 'En attente', 'in-progress': 'En cours', resolved: 'Résolu' };
        return statusMap[s.status] || s.status;
      }),
      datasets: [{
        data: analyticsData.statusStats.map(s => s.count),
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        borderWidth: 0
      }]
    };

    const doughnutChartData = {
      labels: analyticsData.priorityStats.map(p => {
        const priorityMap = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
        return priorityMap[p.priority] || p.priority;
      }),
      datasets: [{
        data: analyticsData.priorityStats.map(p => p.count),
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    };

    const radarChartData = {
      labels: analyticsData.wilayaStats.slice(0, 8).map(w => w.wilaya),
      datasets: [{
        label: 'Signalements par wilaya',
        data: analyticsData.wilayaStats.slice(0, 8).map(w => w.count),
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: '#667eea',
        borderWidth: 2,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    };

    const hourlyChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Signalements par heure',
        data: analyticsData.hourlyDistribution,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: '#667eea',
        borderWidth: 1,
        borderRadius: 5
      }]
    };

    const weekdayChartData = {
      labels: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      datasets: [{
        label: 'Signalements par jour',
        data: analyticsData.weekdayDistribution,
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };

    return { lineChartData, barChartData, pieChartData, doughnutChartData, radarChartData, hourlyChartData, weekdayChartData };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#f1f5f9' : '#334155',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        titleColor: darkMode ? '#f1f5f9' : '#1e293b',
        bodyColor: darkMode ? '#cbd5e1' : '#475569',
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: { color: darkMode ? '#334155' : '#e2e8f0' },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b' }
      }
    },
    animation: { duration: 1000 }
  };

  // ==================== LOAD DATA ON MOUNT ====================
  useEffect(() => {
    loadReports();
    loadNotifications();
    loadActivities();
    loadLiveReports();
    loadWeatherAlerts();

    const handleNewReport = (event) => {
      const newReport = event.detail;
      setReports(prev => {
        const updated = [newReport, ...prev];
        setAnalyticsData(calculateAnalytics(updated));
        return updated;
      });
      addNotification('Nouveau signalement', `${newReport.fullName} a soumis un signalement`, '📱');
    };

    window.addEventListener('newReportAdded', handleNewReport);
    return () => window.removeEventListener('newReportAdded', handleNewReport);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setShowFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const chartData = getChartData();

  // ==================== RENDER FUNCTIONS ====================
  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706', text: 'En attente', icon: '⏳' },
      'in-progress': { bg: '#dbeafe', color: '#2563eb', text: 'En cours', icon: '🔄' },
      resolved: { bg: '#d1fae5', color: '#059669', text: 'Résolu', icon: '✅' }
    };
    const s = styles[status] || styles.pending;
    return <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.icon} {s.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: { bg: '#fee2e2', color: '#dc2626', text: 'Haute', icon: '🔴' },
      medium: { bg: '#fef3c7', color: '#d97706', text: 'Moyenne', icon: '🟡' },
      low: { bg: '#d1fae5', color: '#059669', text: 'Basse', icon: '🟢' }
    };
    const p = styles[priority] || styles.medium;
    return <span className="priority-badge" style={{ background: p.bg, color: p.color }}>{p.icon} {p.text}</span>;
  };

  // ==================== HANDLE MENU CLICK ON MOBILE ====================
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (isMobile) setSidebarOpen(false); // close sidebar after nav on mobile
  };

  // ==================== LIVE MAP COMPONENT ====================
  const LiveMapComponent = () => (
    <div className={`live-map-content ${showFullscreen ? 'fullscreen-map' : ''}`}>
      <div className="map-header">
        <h2><FiMap /> Carte des signalements en direct</h2>
        <div className="map-actions">
          <div className="wilaya-search-box">
            <input
              type="text"
              placeholder="Rechercher une wilaya (ex: Msila, Draria...)"
              value={searchWilaya}
              onChange={(e) => setSearchWilaya(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleWilayaSearch()}
              list="wilaya-list"
            />
            <datalist id="wilaya-list">
              {wilayas.map(w => <option key={w} value={w} />)}
            </datalist>
            <button onClick={handleWilayaSearch}>
              <FiSearch /> Rechercher
            </button>
          </div>
          <button className="map-action-btn" onClick={getLiveLocation}>
            <FiCompass /> Ma position
          </button>
          <button className="map-action-btn" onClick={toggleFullscreen}>
            {showFullscreen ? <FiX /> : <FiMap />} {showFullscreen ? 'Quitter' : 'Plein écran'}
          </button>
          <button className="map-action-btn refresh" onClick={() => { loadReports(); setMapKey(Date.now()); }}>
            <FiRefreshCw /> Actualiser
          </button>
        </div>
      </div>

      <div className="map-stats-dashboard">
        <div className="map-stat-card total" onClick={() => { setFilterPriority('all'); setMapZoom(6); setMapCenter({ lat: 28.0339, lng: 1.6596 }); }}>
          <div className="map-stat-icon">📊</div>
          <div className="map-stat-info"><h3>{mapStats.total}</h3><p>Total Signalements</p></div>
        </div>
        <div className="map-stat-card red" onClick={() => setFilterPriority('high')}>
          <div className="map-stat-icon">🔴</div>
          <div className="map-stat-info"><h3>{mapStats.high}</h3><p>Haute Priorité</p></div>
        </div>
        <div className="map-stat-card orange" onClick={() => setFilterPriority('medium')}>
          <div className="map-stat-icon">🟠</div>
          <div className="map-stat-info"><h3>{mapStats.medium}</h3><p>Priorité Moyenne</p></div>
        </div>
        <div className="map-stat-card green" onClick={() => setFilterPriority('low')}>
          <div className="map-stat-icon">🟢</div>
          <div className="map-stat-info"><h3>{mapStats.low}</h3><p>Basse Priorité</p></div>
        </div>
      </div>

      <div className="map-legend-container">
        <div className="legend-item"><div className="legend-color red"></div><span>Haute Priorité - Urgent</span></div>
        <div className="legend-item"><div className="legend-color orange"></div><span>Priorité Moyenne</span></div>
        <div className="legend-item"><div className="legend-color green"></div><span>Basse Priorité</span></div>
        <div className="legend-item"><div className="legend-marker">📍</div><span>Position actuelle</span></div>
      </div>

      <div className="map-container-full">
        <MapContainer
          key={mapKey}
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={mapZoom}
          className="hazard-map-full"
          zoomControl={true}
          style={{ height: 'calc(100vh - 280px)', width: '100%', borderRadius: '16px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} zoom={mapZoom} />

          {liveLocation && (
            <Marker
              position={[liveLocation.lat, liveLocation.lng]}
              icon={new L.Icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                shadowUrl: markerShadow,
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              })}
            >
              <Popup>
                <div className="popup-content">
                  <h3>📍 Votre position</h3>
                  <p>Latitude: {liveLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {liveLocation.lng.toFixed(6)}</p>
                  <button className="details-btn" onClick={() => handleMenuClick('live-report')}>Signaler ici</button>
                </div>
              </Popup>
            </Marker>
          )}

          {searchResults && (
            <Marker
              position={[searchResults.lat, searchResults.lng]}
              icon={new L.Icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
                shadowUrl: markerShadow,
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              })}
            >
              <Popup>
                <div className="popup-content">
                  <h3>📍 Wilaya recherchée</h3>
                  <p>Latitude: {searchResults.lat.toFixed(6)}</p>
                  <p>Longitude: {searchResults.lng.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {mapReports.map((report) => (
            <React.Fragment key={report.id}>
              <CircleMarker
                center={[report.latitude, report.longitude]}
                radius={getCircleRadius(report.priority)}
                color={getCircleColor(report.priority)}
                fillColor={getCircleColor(report.priority)}
                fillOpacity={0.3}
                weight={2}
                opacity={0.7}
              >
                <Tooltip>
                  <div className="tooltip-content">
                    <strong>{report.fullName}</strong><br />
                    <span>{reportTypes[report.reportType]?.icon} {reportTypes[report.reportType]?.label}</span><br />
                    Priorité: {report.priority.toUpperCase()}
                  </div>
                </Tooltip>
              </CircleMarker>

              <Marker position={[report.latitude, report.longitude]} icon={getPriorityIcon(report.priority)}>
                <Popup>
                  <div className="popup-content">
                    <h3>{reportTypes[report.reportType]?.icon} {report.fullName}</h3>
                    <div className={`severity-badge ${report.priority}`}>{report.priority.toUpperCase()} Priorité</div>
                    <p><strong>📋 Type:</strong> {reportTypes[report.reportType]?.label}</p>
                    <p><strong>📍 Wilaya:</strong> {report.wilaya}</p>
                    <p><strong>📝 Description:</strong> {report.description}</p>
                    <p><strong>🕒 Date:</strong> {new Date(report.timestamp).toLocaleString()}</p>
                    <p><strong>📊 Statut:</strong> {getStatusBadge(report.status)}</p>
                    <button className="details-btn" onClick={() => { setSelectedReport(report); setShowReportModal(true); }}>
                      Voir les détails
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      <div className="weather-alerts-section">
        <div className="section-header">
          <h3><FiCloudRain /> Alertes météo en Algérie</h3>
          <button className="view-all" onClick={loadWeatherAlerts}>Actualiser →</button>
        </div>
        <div className="weather-alerts-list">
          {weatherAlerts.map(alert => (
            <div key={alert.id} className={`weather-alert severity-${alert.severity}`}>
              <div className="alert-icon">
                {alert.type === 'Pluies orageuses' ? <FaCloudRain /> : alert.type === 'Vents forts' ? <FiCloudRain /> : <FaCloudSun />}
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

      <button className="quick-report-fab" onClick={() => handleMenuClick('live-report')}>
        <FiPlus /> Signalement direct
      </button>
    </div>
  );

  // ==================== LIVE REPORT COMPONENT ====================
  const LiveReportComponent = () => (
    <div className="live-report-content">
      <div className="report-header">
        <h2><FiMapPin /> Signalement en direct</h2>
        <p>Ajoutez un signalement avec votre position actuelle</p>
      </div>

      <div className="live-report-form">
        <div className="form-grid">
          <div className="form-group">
            <label><FiUser /> Nom complet *</label>
            <input type="text" value={liveReportForm.fullName} onChange={(e) => setLiveReportForm({ ...liveReportForm, fullName: e.target.value })} placeholder="Entrez votre nom" />
          </div>
          <div className="form-group">
            <label><FiPhone /> Téléphone</label>
            <input type="tel" value={liveReportForm.phone} onChange={(e) => setLiveReportForm({ ...liveReportForm, phone: e.target.value })} placeholder="Numéro de téléphone" />
          </div>
          <div className="form-group">
            <label><FiMapPin /> Wilaya *</label>
            <select value={liveReportForm.wilaya} onChange={(e) => setLiveReportForm({ ...liveReportForm, wilaya: e.target.value })}>
              <option value="">Sélectionner une wilaya</option>
              {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label><MdLocationOn /> Adresse</label>
            <input type="text" value={liveReportForm.address} onChange={(e) => setLiveReportForm({ ...liveReportForm, address: e.target.value })} placeholder="Adresse précise" />
          </div>
          <div className="form-group">
            <label><MdReport /> Type de signalement *</label>
            <select value={liveReportForm.reportType} onChange={(e) => setLiveReportForm({ ...liveReportForm, reportType: e.target.value })}>
              {Object.entries(reportTypes).map(([key, val]) => <option key={key} value={key}>{val.icon} {val.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label><MdPriorityHigh /> Priorité</label>
            <select value={liveReportForm.priority} onChange={(e) => setLiveReportForm({ ...liveReportForm, priority: e.target.value })}>
              <option value="high">Haute - Urgent</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label><MdDescription /> Description *</label>
            <textarea rows="4" value={liveReportForm.description} onChange={(e) => setLiveReportForm({ ...liveReportForm, description: e.target.value })} placeholder="Décrivez l'incident en détail..." />
          </div>
          <div className="form-group full-width">
            <label><FiCompass /> Position GPS</label>
            <div className="gps-controls">
              <button type="button" className="gps-btn" onClick={getLiveLocation}>
                <FiCompass /> Obtenir ma position
              </button>
              {liveLocation && (
                <div className="gps-info">
                  <p>Latitude: {liveLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {liveLocation.lng.toFixed(6)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => handleMenuClick('dashboard')}>Annuler</button>
          <button className="submit-btn" onClick={addLiveReport}>
            <FiMapPin /> Soumettre le signalement
          </button>
        </div>
      </div>
    </div>
  );

  // Stats Cards
  const StatsCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue"><MdReport /></div>
        <div className="stat-info">
          <h3>{stats.total}</h3>
          <p>Total Signalements</p>
          <span className="trend">+12% cette semaine</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon yellow"><FiClock /></div>
        <div className="stat-info">
          <h3>{stats.pending}</h3>
          <p>En attente</p>
          <span className="trend down">-5%</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon purple"><FaSpinner /></div>
        <div className="stat-info">
          <h3>{stats.inProgress}</h3>
          <p>En cours</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.inProgress / stats.total) * 100 || 0}%` }}></div>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green"><FaCheckCircle /></div>
        <div className="stat-info">
          <h3>{analyticsData.resolutionRate.toFixed(1)}%</h3>
          <p>Taux de résolution</p>
          <span className="trend up">+8%</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon red"><FiAlertCircle /></div>
        <div className="stat-info">
          <h3>{stats.highPriority}</h3>
          <p>Priorité haute</p>
          <span className="trend urgent">Urgent!</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon teal"><FiGlobe /></div>
        <div className="stat-info">
          <h3>{analyticsData.wilayaStats.length}</h3>
          <p>Wilayas actives</p>
          <span className="trend">+2 nouvelles</span>
        </div>
      </div>
    </div>
  );

  // Analytics Dashboard
  const AnalyticsDashboard = () => (
    <div className="analytics-content">
      <div className="analytics-header">
        <h2><MdAnalytics /> Centre d'analyse avancée</h2>
        <div className="time-range-selector">
          <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>Semaine</button>
          <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>Mois</button>
          <button className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>Année</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><FaChartLineIcon /></div>
          <div className="kpi-info"><h3>{analyticsData.resolutionRate.toFixed(1)}%</h3><p>Taux de résolution</p></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiClock /></div>
          <div className="kpi-info"><h3>{analyticsData.responseTimeAvg}h</h3><p>Temps de réponse moyen</p></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiStar /></div>
          <div className="kpi-info"><h3>{analyticsData.satisfactionScore}/5</h3><p>Satisfaction citoyenne</p></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiTrend /></div>
          <div className="kpi-info"><h3>{analyticsData.peakHour}:00</h3><p>Heure de pointe</p></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiAward /></div>
          <div className="kpi-info"><h3>{analyticsData.topWilaya || 'Alger'}</h3><p>Wilaya la plus active</p></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiTarget /></div>
          <div className="kpi-info"><h3>{analyticsData.topCategory}</h3><p>Type le plus fréquent</p></div>
        </div>
      </div>

      <div className="charts-grid-analytics">
        <div className="chart-card large">
          <div className="chart-header">
            <h3><MdTimeline /> Évolution des signalements</h3>
            <div className="chart-controls">
              <button onClick={() => setChartType('line')} className={chartType === 'line' ? 'active' : ''}>📈 Ligne</button>
              <button onClick={() => setChartType('bar')} className={chartType === 'bar' ? 'active' : ''}>📊 Barres</button>
            </div>
          </div>
          <div className="chart-container">
            {chartType === 'line' ? <Line data={chartData.lineChartData} options={chartOptions} /> : <Bar data={chartData.lineChartData} options={chartOptions} />}
          </div>
        </div>

        <div className="chart-card">
          <h3><FaChartBar /> Répartition par type</h3>
          <div className="chart-container"><Bar data={chartData.barChartData} options={chartOptions} /></div>
        </div>

        <div className="chart-card">
          <h3><FaChartPie /> Statut des signalements</h3>
          <div className="chart-container"><Pie data={chartData.pieChartData} options={chartOptions} /></div>
        </div>

        <div className="chart-card">
          <h3>Priorités</h3>
          <div className="chart-container"><Doughnut data={chartData.doughnutChartData} options={chartOptions} /></div>
        </div>

        <div className="chart-card large">
          <h3><FaMapMarkedAlt /> Distribution par wilaya</h3>
          <div className="chart-container"><Radar data={chartData.radarChartData} options={chartOptions} /></div>
        </div>

        <div className="chart-card">
          <h3>📊 Distribution horaire</h3>
          <div className="chart-container"><Bar data={chartData.hourlyChartData} options={chartOptions} /></div>
        </div>

        <div className="chart-card">
          <h3>📅 Distribution par jour</h3>
          <div className="chart-container"><Line data={chartData.weekdayChartData} options={chartOptions} /></div>
        </div>
      </div>

      <div className="wilaya-stats-section">
        <div className="section-header">
          <h3><FiMapPin /> Statistiques détaillées par wilaya</h3>
          <input type="text" placeholder="Filtrer wilaya..." className="wilaya-search" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="wilaya-table-container">
          <table className="wilaya-table">
            <thead>
              <tr>
                <th>Wilaya</th><th>Nombre de signalements</th><th>Pourcentage</th><th>Tendance</th><th>Statut moyen</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.wilayaStats.sort((a, b) => b.count - a.count).map(wilaya => {
                const percentage = ((wilaya.count / stats.total) * 100).toFixed(1);
                return (
                  <tr key={wilaya.wilaya}>
                    <td><strong>{wilaya.wilaya}</strong></td>
                    <td>{wilaya.count}</td>
                    <td>
                      <div className="percentage-bar">
                        <div className="percentage-fill" style={{ width: `${percentage}%` }}></div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                    <td>{percentage > 10 ? '📈 Haut' : percentage > 5 ? '📊 Moyen' : '📉 Bas'}</td>
                    <td>{getStatusBadge('in-progress')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insights-section">
        <div className="section-header">
          <h3><FiActivity /> Insights & Recommandations IA</h3>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Augmentation des signalements</h4>
              <p>Les signalements ont augmenté de 23% cette semaine. Une attention particulière est recommandée pour la wilaya d'Alger.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>Heure de pointe détectée</h4>
              <p>La majorité des signalements sont reçus entre {analyticsData.peakHour}:00 et {analyticsData.peakHour + 2}:00. Renforcez les équipes à ces horaires.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <h4>Taux de résolution en hausse</h4>
              <p>Le taux de résolution a augmenté de 8% ce mois-ci. Continuez sur cette lancée!</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Zone à risque identifiée</h4>
              <p>La wilaya {analyticsData.topWilaya} montre une concentration élevée de signalements. Une patrouille préventive est recommandée.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-feed">
        <div className="section-header">
          <h3>🔄 Activité récente du système</h3>
          <button className="view-all">Voir tout →</button>
        </div>
        <div className="feed-list">
          {activities.slice(0, 5).map(activity => (
            <div key={activity.id} className="feed-item">
              <div className="feed-icon">👤</div>
              <div className="feed-content">
                <p><strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong></p>
                <span>{new Date(activity.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reports Table
  const ReportsTable = () => (
    <div className="reports-section">
      <div className="section-header">
        <h2><MdReport /> Gestion des signalements</h2>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowAddModal(true)}><FiPlus /> Nouveau</button>
          {selectedReports.length > 0 && (
            <button className="bulk-delete-btn" onClick={bulkDelete}>Supprimer ({selectedReports.length})</button>
          )}
          <div className="search-wrapper">
            <FiSearch />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filtres</button>
          <button className="export-btn" onClick={exportToCSV}><FiDownload /> Exporter</button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="resolved">Résolus</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
          <select value={filterWilaya} onChange={(e) => setFilterWilaya(e.target.value)}>
            <option value="all">Toutes wilayas</option>
            {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
        </div>
      )}

      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={toggleSelectAll} checked={selectedReports.length === paginatedReports.length && paginatedReports.length > 0} /></th>
              <th>ID</th><th>Citoyen</th><th>Wilaya</th><th>Type</th><th>Statut</th><th>Priorité</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="loading-cell">Chargement...</td></tr>
            ) : paginatedReports.length === 0 ? (
              <tr><td colSpan="9" className="empty-cell">Aucun signalement trouvé</td></tr>
            ) : (
              paginatedReports.map(report => (
                <tr key={report.id} className={selectedReports.includes(report.id) ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selectedReports.includes(report.id)} onChange={() => toggleSelectReport(report.id)} /></td>
                  <td>#{report.id}</td>
                  <td><div className="user-cell"><FaUserCircle /> {report.fullName}</div></td>
                  <td><div className="location-cell"><FiMapPin /> {report.wilaya}</div></td>
                  <td><span className="type-badge" style={{ background: reportTypes[report.reportType]?.bg }}>{reportTypes[report.reportType]?.icon} {reportTypes[report.reportType]?.label}</span></td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{getPriorityBadge(report.priority)}</td>
                  <td>{report.date}</td>
                  <td className="actions-cell">
                    <button className="action-btn view" onClick={() => { setSelectedReport(report); setShowReportModal(true); }}><FiEye /></button>
                    <button className="action-btn edit" onClick={() => { setSelectedReport(report); setReportForm(report); setShowEditModal(true); }}><FaEdit /></button>
                    <select className="status-select" value={report.status} onChange={(e) => updateReportStatus(report.id, e.target.value)}>
                      <option value="pending">En attente</option>
                      <option value="in-progress">En cours</option>
                      <option value="resolved">Résolu</option>
                    </select>
                    <button className="action-btn delete" onClick={() => { setSelectedReport(report); setShowDeleteModal(true); }}><FaTrashAlt /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {Math.ceil(filteredReports.length / itemsPerPage) > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><FiChevronsLeft /></button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
          <span>Page {currentPage} / {Math.ceil(filteredReports.length / itemsPerPage)}</span>
          <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredReports.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(filteredReports.length / itemsPerPage)}><FiChevronRight /></button>
          <button onClick={() => setCurrentPage(Math.ceil(filteredReports.length / itemsPerPage))} disabled={currentPage === Math.ceil(filteredReports.length / itemsPerPage)}><FiChevronsRight /></button>
        </div>
      )}
    </div>
  );

  // Dashboard Home
  const DashboardHome = () => (
    <div className="dashboard-content">
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => handleMenuClick('live-map')}><FiMap /> Carte en direct</button>
        <button className="quick-action-btn" onClick={() => handleMenuClick('live-report')}><FiMapPin /> Signalement direct</button>
        <button className="quick-action-btn" onClick={() => loadWeatherAlerts()}><FiCloudRain /> Météo</button>
      </div>
      <StatsCards />
      <div className="recent-reports">
        <div className="section-header">
          <h2>Signalements récents</h2>
          <button className="view-all" onClick={() => handleMenuClick('reports')}>Voir tout →</button>
        </div>
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr><th>ID</th><th>Citoyen</th><th>Wilaya</th><th>Type</th><th>Statut</th><th>Priorité</th><th>Date</th></tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map(report => (
                <tr key={report.id}>
                  <td>#{report.id}</td>
                  <td>{report.fullName}</td>
                  <td>{report.wilaya}</td>
                  <td><span className="type-badge" style={{ background: reportTypes[report.reportType]?.bg }}>{reportTypes[report.reportType]?.icon} {reportTypes[report.reportType]?.label}</span></td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{getPriorityBadge(report.priority)}</td>
                  <td>{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Modals
  const AddModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Nouveau signalement</h3><button onClick={() => setShowAddModal(false)}><FiX /></button></div>
        <div className="modal-body">
          <div className="form-group"><label><FiUser /> Nom complet *</label><input type="text" value={reportForm.fullName} onChange={(e) => setReportForm({ ...reportForm, fullName: e.target.value })} /></div>
          <div className="form-group"><label><FiPhone /> Téléphone</label><input type="tel" value={reportForm.phone} onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })} /></div>
          <div className="form-group"><label><MdEmail /> Email</label><input type="email" value={reportForm.email} onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })} /></div>
          <div className="form-group"><label><FiMapPin /> Wilaya *</label><select value={reportForm.wilaya} onChange={(e) => setReportForm({ ...reportForm, wilaya: e.target.value })}><option value="">Sélectionner</option>{wilayas.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
          <div className="form-group"><label><MdLocationOn /> Adresse</label><input type="text" value={reportForm.address} onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })} /></div>
          <div className="form-group"><label><MdReport /> Type *</label><select value={reportForm.reportType} onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}>{Object.entries(reportTypes).map(([key, val]) => <option key={key} value={key}>{val.icon} {val.label}</option>)}</select></div>
          <div className="form-group"><label><MdPriorityHigh /> Priorité</label><select value={reportForm.priority} onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}><option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Basse</option></select></div>
          <div className="form-group full-width"><label><MdDescription /> Description *</label><textarea rows="4" value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} /></div>
        </div>
        <div className="modal-actions"><button className="cancel" onClick={() => setShowAddModal(false)}>Annuler</button><button className="save" onClick={addReport}>Enregistrer</button></div>
      </div>
    </div>
  );

  const EditModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Modifier signalement #{selectedReport?.id}</h3><button onClick={() => setShowEditModal(false)}><FiX /></button></div>
        <div className="modal-body">
          <div className="form-group"><label><FiUser /> Nom complet</label><input type="text" value={reportForm.fullName} onChange={(e) => setReportForm({ ...reportForm, fullName: e.target.value })} /></div>
          <div className="form-group"><label><FiPhone /> Téléphone</label><input type="tel" value={reportForm.phone} onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })} /></div>
          <div className="form-group"><label><MdEmail /> Email</label><input type="email" value={reportForm.email} onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })} /></div>
          <div className="form-group"><label><FiMapPin /> Wilaya</label><select value={reportForm.wilaya} onChange={(e) => setReportForm({ ...reportForm, wilaya: e.target.value })}>{wilayas.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
          <div className="form-group"><label><MdReport /> Type</label><select value={reportForm.reportType} onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}>{Object.entries(reportTypes).map(([key, val]) => <option key={key} value={key}>{val.icon} {val.label}</option>)}</select></div>
          <div className="form-group"><label><FiClock /> Statut</label><select value={reportForm.status} onChange={(e) => setReportForm({ ...reportForm, status: e.target.value })}><option value="pending">En attente</option><option value="in-progress">En cours</option><option value="resolved">Résolu</option></select></div>
          <div className="form-group"><label><MdPriorityHigh /> Priorité</label><select value={reportForm.priority} onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}><option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Basse</option></select></div>
          <div className="form-group full-width"><label><MdDescription /> Description</label><textarea rows="4" value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} /></div>
        </div>
        <div className="modal-actions"><button className="cancel" onClick={() => setShowEditModal(false)}>Annuler</button><button className="save" onClick={updateReport}>Mettre à jour</button></div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Confirmer la suppression</h3><button onClick={() => setShowDeleteModal(false)}><FiX /></button></div>
        <div className="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le signalement <strong>#{selectedReport?.id}</strong> de <strong>{selectedReport?.fullName}</strong> ?</p>
          <p className="warning">Cette action est irréversible.</p>
        </div>
        <div className="modal-actions"><button className="cancel" onClick={() => setShowDeleteModal(false)}>Annuler</button><button className="delete" onClick={deleteReport}>Supprimer</button></div>
      </div>
    </div>
  );

  const ReportModal = () => (
    <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Détails du signalement #{selectedReport?.id}</h3><button onClick={() => setShowReportModal(false)}><FiX /></button></div>
        <div className="modal-body">
          <div className="detail-row"><label>Nom complet:</label><p>{selectedReport?.fullName}</p></div>
          <div className="detail-row"><label>Téléphone:</label><p>{selectedReport?.phone || 'N/A'}</p></div>
          <div className="detail-row"><label>Email:</label><p>{selectedReport?.email || 'N/A'}</p></div>
          <div className="detail-row"><label>Wilaya:</label><p>{selectedReport?.wilaya}</p></div>
          <div className="detail-row"><label>Adresse:</label><p>{selectedReport?.address || 'N/A'}</p></div>
          <div className="detail-row"><label>Type:</label><p>{reportTypes[selectedReport?.reportType]?.icon} {reportTypes[selectedReport?.reportType]?.label}</p></div>
          <div className="detail-row"><label>Description:</label><p>{selectedReport?.description}</p></div>
          <div className="detail-row"><label>Statut:</label><p>{getStatusBadge(selectedReport?.status)}</p></div>
          <div className="detail-row"><label>Priorité:</label><p>{getPriorityBadge(selectedReport?.priority)}</p></div>
          <div className="detail-row"><label>Date:</label><p>{selectedReport?.date}</p></div>
          {selectedReport?.reportId && <div className="detail-row"><label>ID Signalement:</label><p><code>{selectedReport.reportId}</code></p></div>}
        </div>
        <div className="modal-actions">
          <button className="cancel" onClick={() => setShowReportModal(false)}>Fermer</button>
          <button className="edit" onClick={() => { setShowReportModal(false); setShowEditModal(true); }}>Modifier</button>
        </div>
      </div>
    </div>
  );

  const NotificationsDropdown = () => (
    <div className="notifications-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <button onClick={markAllNotificationsRead}>Tout marquer lu</button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">Aucune notification</div>
        ) : (
          notifications.slice(0, 10).map(notif => (
            <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
              <div className="notif-icon">{notif.icon}</div>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <span>{new Date(notif.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className={`dashboard ${darkMode ? 'dark' : 'light'}`}>

      {/* ========== MOBILE OVERLAY — closes sidebar when tapping outside ========== */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><MdDashboard /></div>
            {sidebarOpen && <h2>SafeCity<span>Admin</span></h2>}
          </div>
          {/* This button closes the sidebar — only visible when sidebar is open */}
          <button className="toggle-btn" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className="user-profile">
          <FaUserCircle className="avatar" />
          {sidebarOpen && (
            <div className="user-info">
              <h4>{settings.fullName}</h4>
              <p>{settings.role}</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: <MdDashboard />, label: 'Dashboard' },
            { id: 'reports', icon: <MdReport />, label: 'Signalements', badge: stats.pending },
            { id: 'analytics', icon: <MdAnalytics />, label: 'Analytique' },
            { id: 'live-map', icon: <FiMap />, label: 'Carte en direct' },
            { id: 'live-report', icon: <FiMapPin />, label: 'Signalement direct' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge > 0 && <span className="badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="settings-btn" onClick={() => setShowSettingsModal(true)}>
            <FiSettings /> {sidebarOpen && 'Paramètres'}
          </button>
          <button className="logout-btn" onClick={() => navigate('/admin/login')}>
            <FiLogOut /> {sidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen && !isMobile ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="dashboard-header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* ========== HAMBURGER — opens sidebar, visible on all screens ========== */}
            <button
              className="toggle-btn"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: '#1e293b',
                border: 'none',
                color: '#f1f5f9',
                padding: '10px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FiMenu />
            </button>
            <div>
              <h1>
                {activeMenu === 'dashboard' ? 'Dashboard' :
                  activeMenu === 'reports' ? 'Signalements' :
                    activeMenu === 'analytics' ? "Centre d'analyse" :
                      activeMenu === 'live-map' ? 'Carte en direct' :
                        activeMenu === 'live-report' ? 'Signalement en direct' : 'Dashboard'}
              </h1>
              <p>Bienvenue, {settings.fullName.split(' ')[0]}</p>
            </div>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <div className="notifications-wrapper">
              <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <FiBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notif-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </button>
              {showNotifications && <NotificationsDropdown />}
            </div>
            <button
              className="refresh-btn"
              onClick={() => { loadReports(); addNotification('Actualisé', 'Les données ont été actualisées', '🔄'); }}
            >
              <FiRefreshCw />
            </button>
          </div>
        </header>

        {/* Content based on active menu */}
        {activeMenu === 'dashboard' && <DashboardHome />}
        {activeMenu === 'reports' && <ReportsTable />}
        {activeMenu === 'analytics' && <AnalyticsDashboard />}
        {activeMenu === 'live-map' && <LiveMapComponent />}
        {activeMenu === 'live-report' && <LiveReportComponent />}
      </main>

      {/* Modals */}
      {showAddModal && <AddModal />}
      {showEditModal && <EditModal />}
      {showDeleteModal && <DeleteModal />}
      {showReportModal && <ReportModal />}
    </div>
  );
};

export default Dashboard;

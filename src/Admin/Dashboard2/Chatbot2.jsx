import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Imglading1 from "../../FTC_Project/images/Imglading1.png"
import "../Dashboard2/Chatboot2.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSubmitted, setLocationSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [reportData, setReportData] = useState({
    type: "",
    description: "",
    userName: "",
    incidentTime: "",
    images: []
  });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("online");
  const [trackingMode, setTrackingMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // API Base URL - your backend
  const API_BASE_URL = 'https://hogwartsback26.onrender.com';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online");
    const handleOffline = () => setConnectionStatus("offline");
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── NEW: Send location to /api/start/chat ────────────────────────────────
  const sendLocationToBackend = async (location) => {
    try {
      const locationData = {
        latitude: location.lat || null,
        longitude: location.lng || null,
        address: location.address || null,
        manual: location.manual || false,
        timestamp: new Date().toISOString()
      };

      console.log("Sending location to /api/start/chat:", locationData);

      const response = await axios.post(`${API_BASE_URL}/api/start/chat`, locationData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("✅ Location sent to /api/start/chat:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending location to /api/start/chat:", error.response?.data || error.message);
      return null;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Send report to backend API — now uses /api/chat
  const sendReportToBackend = async (report) => {
    try {
      // Prepare the data exactly as your backend expects
      const reportData = {
        fullName: report.userName || report.fullName,
        phone: report.phone || "N/A",
        email: report.email || "N/A",
        wilaya: report.wilaya || (userLocation?.address?.split(',')[0] || "Unknown"),
        commune: report.commune || (userLocation?.address?.split(',')[1] || "Unknown"),
        address: report.address || userLocation?.address || "Provided location",
        reportType: report.reportType || report.type?.toLowerCase().replace(/ /g, '_') || "general",
        description: report.description,
        priority: report.priority || "medium",
        status: report.status || "pending",
        date: report.date || new Date().toISOString().split('T')[0],
        latitude: report.latitude || userLocation?.lat || null,
        longitude: report.longitude || userLocation?.lng || null,
        reportId: report.reportId,
        timestamp: report.timestamp || new Date().toISOString()
      };
      
      console.log("Sending report to backend:", reportData);
      
      // ─── CHANGED: was /api/chat/start, now /api/chat ───────────────────
      const response = await axios.post(`${API_BASE_URL}/api/chat`, reportData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // ──────────────────────────────────────────────────────────────────
      
      console.log("✅ Report sent to backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending report to backend:", error.response?.data || error.message);
      // Still return success for local storage even if backend fails
      return { local: true, error: error.message };
    }
  };

  // Send notification to backend API
  const sendNotificationToBackend = async (notification) => {
    try {
      const notificationData = {
        title: notification.title,
        message: notification.message,
        icon: notification.icon,
        type: "chatbot",
        userId: notification.userId || "chatbot_user",
        reportId: notification.reportId || null,
        timestamp: notification.timestamp || new Date().toISOString(),
        read: false,
        priority: notification.priority || "normal"
      };
      
      console.log("Sending notification to backend:", notificationData);
      
      const response = await axios.post(`${API_BASE_URL}/api/notifications`, notificationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Notification sent to backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending notification to backend:", error.response?.data || error.message);
      return null;
    }
  };

  // Add notification (saves to backend AND localStorage)
  const addNotification = async (title, message, icon = "📝", reportId = null) => {
    const newNotification = {
      id: Date.now(),
      title: title,
      message: message,
      icon: icon,
      time: new Date().toLocaleString(),
      read: false,
      timestamp: new Date().toISOString(),
      reportId: reportId,
      userId: "chatbot_user",
      source: "chatbot",
      priority: reportId?.startsWith('EMG') ? "high" : "normal"
    };
    
    // Save to localStorage for Dashboard to read
    const existingNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    existingNotifs.unshift(newNotification);
    localStorage.setItem("notifications", JSON.stringify(existingNotifs));
    
    // Send to backend API
    await sendNotificationToBackend(newNotification);
    
    // Dispatch event for real-time Dashboard update
    window.dispatchEvent(new CustomEvent('newNotification', { 
      detail: newNotification 
    }));
    
    console.log("📢 Notification added and sent to backend:", newNotification.title);
  };

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: text, 
        sender: "bot", 
        timestamp: new Date(), 
        id: Date.now() 
      }]);
      setIsTyping(false);
    }, 300);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { 
      text: text, 
      sender: "user", 
      timestamp: new Date(), 
      id: Date.now() 
    }]);
  };

  const getCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      addBotMessage("⚠️ Your browser doesn't support location services. Please type your location manually.");
      return;
    }

    addBotMessage("📍 Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: null
        };
        
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`);
          if (response.data && response.data.display_name) {
            location.address = response.data.display_name;
          }
        } catch (error) {
          console.log("Reverse geocoding failed");
        }
        
        setUserLocation(location);
        setLocationSubmitted(true);

        // ─── NEW: send location to /api/start/chat ────────────────────
        await sendLocationToBackend(location);
        // ─────────────────────────────────────────────────────────────

        addBotMessage(`✅ Location set: ${location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}\n\nWhat type of issue would you like to report?\n\n• 🚗 Accident\n• 💡 Eclairage publique\n• ⚠️ Dangers zone\n• 💧 Water leakage\n• 🗑️ Déchet\n• 🔌 Cable issue\n• 👤 Agression\n• 🛣️ Route degradee`);
        setStep(1);
        setQuickReplies(["🚗 Accident", "💡 Eclairage publique", "⚠️ Dangers zone", "💧 Water leakage", "🗑️ Déchet", "🔌 Cable issue", "👤 Agression", "🛣️ Route degradee"]);
        setShowQuickReplies(true);
      },
      (error) => {
        addBotMessage("⚠️ Could not detect location. Please type your location manually (e.g., 'Downtown, Main Street').");
      }
    );
  };

  const handleLocationInput = async (message) => {
    if (message.toLowerCase() === 'use current location') {
      getCurrentLocation();
      return true;
    }
    
    if (message.trim().length > 2) {
      const location = { address: message, manual: true };
      setUserLocation(location);
      setLocationSubmitted(true);

      // ─── NEW: send location to /api/start/chat ──────────────────────
      await sendLocationToBackend(location);
      // ───────────────────────────────────────────────────────────────

      addBotMessage(`✅ Location set: ${message}\n\nWhat type of issue would you like to report?\n\n• 🚗 Accident\n• 💡 Eclairage publique\n• ⚠️ Dangers zone\n• 💧 Water leakage\n• 🗑️ Déchet\n• 🔌 Cable issue\n• 👤 Agression\n• 🛣️ Route degradee`);
      setStep(1);
      setQuickReplies(["🚗 Accident", "💡 Eclairage publique", "⚠️ Dangers zone", "💧 Water leakage", "🗑️ Déchet", "🔌 Cable issue", "👤 Agression", "🛣️ Route degradee"]);
      setShowQuickReplies(true);
      return true;
    }
    return false;
  };

  const handleTypeSelection = (message) => {
    const lowerMsg = message.toLowerCase();
    let selectedType = "";
    
    if (lowerMsg.includes("accident")) selectedType = "Accident";
    else if (lowerMsg.includes("eclairage") || lowerMsg.includes("street light")) selectedType = "Eclairage publique";
    else if (lowerMsg.includes("dangers") || lowerMsg.includes("danger zone")) selectedType = "Dangers zone";
    else if (lowerMsg.includes("water") || lowerMsg.includes("leakage")) selectedType = "Water leakage";
    else if (lowerMsg.includes("déchet") || lowerMsg.includes("waste")) selectedType = "Déchet";
    else if (lowerMsg.includes("cable")) selectedType = "Cable issue";
    else if (lowerMsg.includes("agression") || lowerMsg.includes("assault")) selectedType = "Agression";
    else if (lowerMsg.includes("route") || lowerMsg.includes("road")) selectedType = "Route degradee";
    
    if (selectedType) {
      setReportData(prev => ({ ...prev, type: selectedType }));
      addBotMessage(`✅ Issue type: ${selectedType}\n\nPlease describe what happened in detail:`);
      setStep(2);
      setShowQuickReplies(false);
    } else {
      addBotMessage("Please select a valid issue type from the options above.");
    }
  };

  const handleDescription = (message) => {
    if (message.trim().length < 5) {
      addBotMessage("Please provide more detail (at least 5 characters):");
      return;
    }
    
    setReportData(prev => ({ ...prev, description: message }));
    addBotMessage(`✅ Description saved.\n\nPlease tell us your name (so we can contact you if needed):`);
    setStep(3);
  };

  const handleName = (message) => {
    if (message.trim().length < 2) {
      addBotMessage("Please enter a valid name (at least 2 characters):");
      return;
    }
    
    setReportData(prev => ({ ...prev, userName: message }));
    addBotMessage(`✅ Name saved: ${message}\n\nWhen did this incident happen?\n\nYou can type:\n• "Just now"\n• "2 hours ago"\n• A specific time like "3:00 PM"\n• A date like "March 28 at 10 AM"`);
    setStep(4);
  };

  const handleTime = (message) => {
    let formattedTime = message;
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg === 'just now') {
      formattedTime = new Date().toLocaleString();
    } else if (lowerMsg.includes('hour ago')) {
      const match = lowerMsg.match(/(\d+)/);
      const hours = match ? parseInt(match[0]) : 1;
      formattedTime = new Date(Date.now() - hours * 60 * 60 * 1000).toLocaleString();
    } else if (lowerMsg.includes('minute ago')) {
      const match = lowerMsg.match(/(\d+)/);
      const minutes = match ? parseInt(match[0]) : 5;
      formattedTime = new Date(Date.now() - minutes * 60 * 1000).toLocaleString();
    }
    
    setReportData(prev => ({ ...prev, incidentTime: formattedTime }));
    addBotMessage(`✅ Time recorded: ${formattedTime}\n\nWould you like to add a photo?\n\nType 'yes' to upload or 'no' to submit report.`);
    setStep(5);
    setQuickReplies(["Yes, add photo", "No, submit report"]);
    setShowQuickReplies(true);
  };

  const handlePhotoDecision = (message) => {
    if (message.toLowerCase().includes('yes')) {
      addBotMessage("📸 Click the 📎 button below to upload a photo.\n\nAfter uploading, type 'submit' to send your report.");
      setStep(6);
      setShowQuickReplies(false);
      setTimeout(() => fileInputRef.current?.click(), 500);
    } else {
      submitReport();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        addBotMessage("❌ Image too large. Max 5MB.");
        return;
      }
      
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
        setUploadingImage(false);
        addBotMessage(`📸 Photo added! Type 'submit' to send your report.`);
      };
      reader.readAsDataURL(file);
    } else {
      addBotMessage("Please select a valid image file (JPEG, PNG).");
    }
  };

  const submitReport = async () => {
    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Determine priority based on report type
    let priority = "medium";
    if (reportData.type === "Accident" || reportData.type === "Agression") {
      priority = "high";
    } else if (reportData.type === "Eclairage publique" || reportData.type === "Déchet") {
      priority = "low";
    }
    
    // Prepare report object
    const finalReport = {
      reportId: reportId,
      userName: reportData.userName,
      type: reportData.type,
      description: reportData.description,
      incidentTime: reportData.incidentTime,
      priority: priority,
      status: "pending",
      timestamp: new Date().toISOString(),
      location: {
        lat: userLocation?.lat || null,
        lng: userLocation?.lng || null,
        address: userLocation?.address || "Provided location"
      },
      wilaya: userLocation?.address?.split(',')[0] || "Unknown",
      commune: userLocation?.address?.split(',')[1] || "Unknown",
      images: reportData.images
    };
    
    // 1. Send report to backend API (now /api/chat)
    const backendResponse = await sendReportToBackend(finalReport);
    
    // 2. Send notification to backend API
    await addNotification(
      "New Report Submitted",
      `Type: ${reportData.type}\nFrom: ${reportData.userName}\nLocation: ${finalReport.wilaya}\nReport ID: ${reportId}\nPriority: ${priority.toUpperCase()}`,
      priority === "high" ? "🚨" : "📝",
      reportId
    );
    
    // 3. Save to localStorage for offline access
    const savedReports = JSON.parse(localStorage.getItem("userReports") || "[]");
    savedReports.unshift(finalReport);
    localStorage.setItem("userReports", JSON.stringify(savedReports));
    
    // 4. Dispatch event for Dashboard real-time update
    window.dispatchEvent(new CustomEvent('newReportAdded', { detail: finalReport }));
    
    // 5. Success message to user
    addBotMessage(`✅ **REPORT SUBMITTED!**\n\nReport ID: ${reportId}\nType: ${reportData.type}\nName: ${reportData.userName}\nTime: ${reportData.incidentTime}\nPriority: ${priority.toUpperCase()}\n\n✅ Report sent to Admin Dashboard\n✅ Notification sent to administrators\n\nYou can track this report in the Dashboard.\n\nWhat would you like to do next?`);
    
    // Reset for next report
    setReportData({ type: "", description: "", userName: "", incidentTime: "", images: [] });
    setStep(0);
    setQuickReplies(["📝 Track Report", "📋 New Report", "💡 Safety Tips", "🚨 Emergency"]);
    setShowQuickReplies(true);
  };

  const trackReportById = (reportId) => {
    const savedReports = JSON.parse(localStorage.getItem("userReports") || "[]");
    const report = savedReports.find(r => r.reportId === reportId);
    
    if (report) {
      addBotMessage(`📊 **REPORT STATUS**\n\nReport ID: ${report.reportId}\nType: ${report.type}\nStatus: ${report.status}\nSubmitted: ${new Date(report.timestamp).toLocaleString()}\nLocation: ${report.wilaya}\nPriority: ${report.priority}\n\nOur team is reviewing your report. You will receive updates via notifications.`);
    } else {
      addBotMessage(`❌ Report ${reportId} not found. Please check the ID and try again.`);
    }
    setTrackingMode(false);
  };

  const handleEmergency = async () => {
    const emergencyReportId = `EMG-${Date.now()}`;
    
    addBotMessage("🚨 **EMERGENCY!** 🚨\n\nPlease call emergency services immediately:\n• Police: 17\n• Ambulance: 14\n• Fire: 14\n\nStay calm and safe. Help is on the way!");
    
    // Create emergency report
    const emergencyReport = {
      reportId: emergencyReportId,
      userName: "Emergency User",
      type: "Emergency",
      description: "Emergency assistance requested via chatbot",
      priority: "high",
      status: "emergency",
      timestamp: new Date().toISOString(),
      location: {
        lat: userLocation?.lat || null,
        lng: userLocation?.lng || null,
        address: userLocation?.address || "Unknown"
      },
      wilaya: userLocation?.address?.split(',')[0] || "Unknown",
      commune: userLocation?.address?.split(',')[1] || "Unknown"
    };
    
    // Send emergency report to backend
    await sendReportToBackend(emergencyReport);
    
    // Send emergency notification
    await addNotification("🚨 EMERGENCY ALERT", "Emergency assistance requested via chatbot. Immediate attention required!", "🚨", emergencyReportId);
    
    // Save locally
    const savedReports = JSON.parse(localStorage.getItem("userReports") || "[]");
    savedReports.unshift(emergencyReport);
    localStorage.setItem("userReports", JSON.stringify(savedReports));
    
    // Dispatch for Dashboard
    window.dispatchEvent(new CustomEvent('newReportAdded', { detail: emergencyReport }));
  };

  const getSafetyTips = () => {
    const tips = [
      "🔒 **Safety Tips**\n\n• Stay aware of your surroundings\n• Keep emergency contacts handy\n• Share your location with trusted people\n• Trust your instincts",
      "🚨 **Emergency Numbers**\n\n• Police: 17\n• Ambulance: 14\n• Fire: 14\n• Save these in your phone",
      "💡 **Night Safety**\n\n• Stick to well-lit areas\n• Don't use headphones in isolated areas\n• Walk confidently\n• Keep your phone accessible",
      "🏠 **Home Safety**\n\n• Lock doors and windows\n• Know your neighbors\n• Install security lights\n• Have a safety plan"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const processMessage = async (message) => {
    const lowerMsg = message.toLowerCase().trim();
    
    // Emergency - highest priority
    if (lowerMsg === 'emergency' || lowerMsg === 'help' || lowerMsg === '🚨 emergency') {
      await handleEmergency();
      return;
    }
    
    // Tracking mode
    if (trackingMode) {
      trackReportById(message);
      return;
    }
    
    // Track report command
    if (lowerMsg === 'track report' || lowerMsg === 'track' || lowerMsg === '📝 track report') {
      addBotMessage("Please enter your Report ID (e.g., RPT-1234567890-ABC123):");
      setTrackingMode(true);
      return;
    }
    
    // New report command
    if (lowerMsg === 'new report' || lowerMsg === 'report' || lowerMsg === '📋 new report') {
      if (!locationSubmitted) {
        addBotMessage("📍 Please provide your location first.\n\nType your address or 'use current location':");
        setStep(0);
        return;
      }
      addBotMessage("What type of issue would you like to report?\n\n• 🚗 Accident\n• 💡 Eclairage publique\n• ⚠️ Dangers zone\n• 💧 Water leakage\n• 🗑️ Déchet\n• 🔌 Cable issue\n• 👤 Agression\n• 🛣️ Route degradee");
      setStep(1);
      setQuickReplies(["🚗 Accident", "💡 Eclairage publique", "⚠️ Dangers zone", "💧 Water leakage", "🗑️ Déchet", "🔌 Cable issue", "👤 Agression", "🛣️ Route degradee"]);
      setShowQuickReplies(true);
      return;
    }
    
    // Safety tips command
    if (lowerMsg === 'safety tips' || lowerMsg === 'tips' || lowerMsg === 'safety' || lowerMsg === '💡 safety tips') {
      addBotMessage(getSafetyTips());
      setQuickReplies(["📝 Track Report", "📋 New Report", "🚨 Emergency"]);
      setShowQuickReplies(true);
      return;
    }
    
    // Help menu
    if (lowerMsg === 'help' || lowerMsg === 'menu') {
      addBotMessage("🤖 **Help Menu**\n\n• Type 'new report' - File a new report\n• Type 'track report' - Check report status\n• Type 'safety tips' - Get safety advice\n• Type 'emergency' - Immediate help\n• Type 'location' - Update your location");
      setQuickReplies(["📋 New Report", "📝 Track Report", "💡 Safety Tips", "🚨 Emergency"]);
      setShowQuickReplies(true);
      return;
    }
    
    // Update location command
    if (lowerMsg === 'location' || lowerMsg === 'update location') {
      setLocationSubmitted(false);
      setStep(0);
      addBotMessage("📍 Please provide your location:\n\nType your address or 'use current location'");
      return;
    }
    
    // Hello greeting
    if (lowerMsg === 'hello' || lowerMsg === 'hi' || lowerMsg === 'hey') {
      addBotMessage(`👋 Hello! Welcome to Safe City Assistant.\n\n📍 Location: ${userLocation?.address || 'Not set'}\n\nType 'help' to see what I can do, or 'new report' to file a report.`);
      setQuickReplies(["📋 New Report", "📝 Track Report", "💡 Safety Tips", "🚨 Emergency"]);
      setShowQuickReplies(true);
      return;
    }
    
    // Step-based processing
    if (step === 0 && !locationSubmitted) {
      handleLocationInput(message);
    } else if (step === 1) {
      handleTypeSelection(message);
    } else if (step === 2) {
      handleDescription(message);
    } else if (step === 3) {
      handleName(message);
    } else if (step === 4) {
      handleTime(message);
    } else if (step === 5) {
      handlePhotoDecision(message);
    } else if (step === 6) {
      if (lowerMsg === 'submit') {
        await submitReport();
      } else {
        addBotMessage("Type 'submit' to send your report, or click 📎 to add a photo.");
      }
    } else {
      addBotMessage("Type 'help' to see available commands, or 'new report' to start a report.");
      setQuickReplies(["📋 New Report", "📝 Track Report", "💡 Safety Tips", "🚨 Emergency"]);
      setShowQuickReplies(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    addUserMessage(inputMessage);
    const message = inputMessage;
    setInputMessage("");
    await processMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply) => {
    setShowQuickReplies(false);
    addUserMessage(reply);
    processMessage(reply);
  };

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("👋 **Welcome to Safe City Assistant!**\n\nI'll help you report issues in your community.\n\n📍 **First, please provide your location**\n\nType your address/area or type 'use current location' to auto-detect.");
      }, 500);
    }
  }, [isOpen]);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      
      <button className={`chat-button ${isOpen ? "hidden" : ""}`} onClick={() => setIsOpen(true)}>
        <div className="chat-button-icon">
          <img src={Imglading1} alt="Safe City" className="custom-avatar-icon" />
          <span className="notification-dot"></span>
        </div>
        <span className="chat-button-text">Safe City Assistant</span>
      </button>
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <img src={Imglading1} alt="Assistant" />
              </div>
              <div>
                <h3>Safe City Assistant</h3>
                <p className="chat-status">
                  <span className={`status-dot ${connectionStatus === "online" ? "" : "offline"}`}></span>
                  {connectionStatus === "online" ? "Online" : "Offline"} • 
                  {locationSubmitted ? "📍 Located" : "📍 Location needed"}
                </p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-sender">
                    {msg.sender === "bot" ? "Assistant" : "You"}
                  </div>
                  <div className="message-text" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            {showQuickReplies && quickReplies.length > 0 && (
              <div className="quick-replies">
                {quickReplies.map((reply, idx) => (
                  <button key={idx} className="quick-reply-btn" onClick={() => handleQuickReply(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-area">
            <button className="attach-button" onClick={() => fileInputRef.current?.click()} title="Attach photo">
              📎
            </button>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="send-button" onClick={handleSendMessage}>
              Send
            </button>
          </div>
          
          {uploadingImage && (
            <div className="location-warning">
              📸 Uploading image...
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;

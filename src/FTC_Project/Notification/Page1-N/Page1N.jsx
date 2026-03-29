import React, { useState, useEffect } from "react";
import "./Page1N.css";

const Page1N = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get notifications from localStorage (sent from chatbot)
    const loadNotifications = () => {
      const savedNotifs = localStorage.getItem("notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
      setLoading(false);
    };
    
    loadNotifications();
    
    // Listen for new notifications
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const markAllAsRead = () => {
    const updatedNotifs = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    setNotifications(updatedNotifs);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifs));
  };

  const markAsRead = (id) => {
    const updatedNotifs = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifs);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifs));
  };

  const deleteNotification = (id) => {
    const updatedNotifs = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifs);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifs));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notif-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={markAllAsRead}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="empty">
          <span>🔔</span>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.read ? "unread" : ""}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="notif-icon">{notif.icon || "📝"}</div>
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-message">{notif.message}</div>
                <div className="notif-time">{notif.time}</div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page1N;
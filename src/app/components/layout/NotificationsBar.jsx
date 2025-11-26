'use client';


import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '@/lib/state';
import '../ui/currentUser.css'; // O tu CSS de notificaciones


const NotificationsBar = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!open && unreadCount > 0) {
      markAsRead();
    }
    setOpen(!open);
  };
  return (
    <div className="notification-container" ref={dropdownRef}>
      <div
        className="notification-icon"
        onClick={handleToggle}
      >
        <FaBell />

        {/* Badge rojo solo si hay no leídas */}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {/* Dropdown usando tus clases CSS existentes */}
      {open && (
        <div className="notifications-dropdown">
          {notifications.length === 0 ? (
            <div className="no-notifications">No hay notificaciones</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <div className="notification-title">
                  {notif.type === 'assign' ? 'Nueva Asignación' : 'Tarea Completada'}
                </div>
                <div className="notification-message">
                  {notif.message}
                </div>
                <div className="notification-date">
                  {new Date(notif.timestamp).toLocaleDateString()} • {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBar;

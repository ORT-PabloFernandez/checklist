'use client';


import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import '../ui/currentUser.css'; // O tu CSS de notificaciones


const NotificationsBar = ({ userRole, hasNotifications }) => {
  const [open, setOpen] = useState(false);


  // Mensaje según rol
  const message =
    userRole === 'Colaborador'
      ? 'Tienes una tarea asignada'
      : userRole === 'Supervisor'
      ? 'Actualizaciones en la tarea'
      : 'No hay notificaciones';


  return (
    <div className="notification-container">
      <div
        className="notification-icon"
        onClick={() => setOpen(!open)}
      >
        <FaBell />


        {/* Punto rojo */}
        {hasNotifications && <span className="notification-badge"></span>}
      </div>


      {/* Dropdown */}
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="dropdown-item">{message}</div>
        </div>
      )}
    </div>
  );
};


export default NotificationsBar;



'use client';

import React, { useState } from 'react';
import { FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import './currentUser.css';

const CurrentUser = ({ currentUser, logout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="current-user-container">
      <button
        type="button"
        className="user-menu-button"
        id="user-menu"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="sr-only">Abrir menú de usuario</span>
        <div className="user-button-content">
          <div className="user-avatar">
            <img 
              src={currentUser.avatar}
              alt={`Foto de ${currentUser.name}`} 
            />
          </div>
          <span className="user-name">{currentUser.name}</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          className="user-dropdown"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div className="dropdown-item">
            <FaUserCog className="icon" />
            Mi perfil
          </div>
          <div className="dropdown-item">
            {currentUser.email}
          </div>
          <div 
            onClick={logout}
            className="dropdown-item logout-item"
            role="menuitem"
          >
            <FaSignOutAlt className="icon" />
            Cerrar sesión
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentUser;

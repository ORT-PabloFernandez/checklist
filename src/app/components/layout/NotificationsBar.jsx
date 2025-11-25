'use client';

import React, { useState, useEffect } from 'react';
import '../ui/currentUser.css';
import { useCurrentUser } from '@/lib/state';
import { getNotifications } from '@/lib/storage';
import { FaBell } from 'react-icons/fa';

export const NotificationsBar = ({ }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useCurrentUser();
  
  const handleClickOutside = (e) => {
    if (!e.target.closest('.current-user-container')) {
      setDropdownOpen(false);
    }
  };
  React.useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if(!currentUser) {
      return 
    }
      const timer = setTimeout(async () => {
        const result = await getNotifications(currentUser.id);
        setNotifications(result);
      }, 500);
      return () => clearTimeout(timer);
  }, [currentUser]);

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
        <div className="user-button-content">
            <FaBell className="notificationIcon" />
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
          {
            (notifications ?? []).map((n) => {
              <Notification key = {n.id} data = {n} />
            })
          }
        </div>
      )}
    </div>
  );
};


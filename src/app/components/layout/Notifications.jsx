'use client';

import React from 'react';
import Link from 'next/link';
import { FaBell } from 'react-icons/fa';

const Notifications = ({ notificationIndicator }) => {
  return (
    <Link href="/notifications" className="notificationContainer">
      <FaBell className="notificationIcon" />
      {notificationIndicator && (
        <span className="notificationIndicator"></span>
      )}
    </Link>
  );
};

export default Notifications;

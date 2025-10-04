'use client';

import React from 'react';
import Link from 'next/link';
import { FaTasks, FaUserPlus, FaClipboardList, FaUserCheck, FaUsers } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const Menu = () => {
  const navLinks = [
    { name: 'Supervisor', path: '/supervisor', icon: <FaUserCheck className="navIcon" /> },
    { name: 'Colaborador', path: '/colaborador', icon: <FaUsers className="navIcon" /> },
    { name: 'Seguimiento', path: '/tracking', icon: <FaClipboardList className="navIcon" /> },
    { name: 'Administración', path: '/admin', icon: <FaClipboardList className="navIcon" /> },
  ];

  const pathname = usePathname();

  return (
    <div className="desktopNavLinks">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`navLink ${pathname === link.path ? 'activeLink' : 'inactiveLink'}`}
        >
          {link.icon}   
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default Menu;

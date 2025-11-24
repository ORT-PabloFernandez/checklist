'use client';

import React from 'react';
import Link from 'next/link';
import { FaTasks, FaUserPlus, FaClipboardList, FaUserCheck, FaUsers } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import CurrentUser from '../ui/CurrentUser';
import { useCurrentUser } from '@/lib/state';

const Menu = () => {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  const allNavLinks = [
    { name: 'Supervisor', path: '/supervisor', icon: <FaUserCheck className="navIcon" />, roles: ['Supervisor'] },
    { name: 'Colaborador', path: '/colaborador', icon: <FaUsers className="navIcon" />, roles: ['Colaborador'] },
    //{ name: 'Seguimiento', path: '/tracking', icon: <FaClipboardList className="navIcon" />, roles: ['Supervisor', 'Colaborador'] },
    // { name: 'Administración', path: '/admin', icon: <FaClipboardList className="navIcon" />, roles: ['Supervisor', 'Colaborador'] },
  ];

  // Filtrar por rol los botones que se le muestra al usuario
  const navLinks = currentUser
    ? allNavLinks.filter(link => link.roles.includes(currentUser.role))
    : [];

  return (
    <div className="desktopNavLinks">
      <div className="space-x-4"></div>
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

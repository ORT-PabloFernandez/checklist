'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../lib/state';
import { useRouter } from 'next/navigation';

// Importar los componentes modulares
import Logo from './Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Menu from './Menu';
import Notifications from './Notifications';
import CurrentUser from '../ui/CurrentUser';
import { clearAuth } from '@/lib/storage';
import './navbar.css';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationIndicator, setNotificationIndicator] = useState(true);
  const { currentUser, updateCurrentUser, logoutUser } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  
  // Escuchar cambios en el usuario logueado para actualizar los botones del navbar
  useEffect(() => {
    const handleUserUpdate = (event) => {
      const { user } = event.detail;
      updateCurrentUser(user);
    };

    window.addEventListener('userUpdate', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdate', handleUserUpdate);
    };
  }, [updateCurrentUser])

  const logout = () => {
    clearAuth();
    updateCurrentUser(null);
    logoutUser();

    // Disparo evento para actualizar el usuario y actualizar el navbar
    window.dispatchEvent(new CustomEvent('userUpdate', { detail: { user: null } }));
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo and Menu */}
        <div className="navbar-left">
          <Logo />
          {currentUser && <Menu />}
        </div>

        {/* User Menu */}
        <div className="navbar-right">
          {currentUser ? (
            <>
              <Notifications notificationIndicator={notificationIndicator} />
              <CurrentUser currentUser={currentUser} logout={logout} />
            </>
          ) : (
            <div className="desktopNavLinks">
              <Link 
                href="/auth/login" 
                className={`navLink ${pathname === '/auth/login' ? 'activeLink' : 'inactiveLink'}`}
              >
                <FaSignInAlt className="navIcon" />
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/signup" 
                className={`navLink ${pathname === '/auth/signup' ? 'activeLink' : 'inactiveLink'}`}
              >
                <FaUserPlus className="navIcon" />
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
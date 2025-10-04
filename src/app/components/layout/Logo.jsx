'use client';

import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <div className="logoContainer">
      <Link href="/dashboard">
        <span className="logo">Gestión de Usuarios</span>
      </Link>
    </div>
  );
};

export default Logo;

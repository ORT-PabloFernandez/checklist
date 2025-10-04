'use client';

import React from 'react';
import Link from 'next/link';
import './user.css';

const UserDetails = ({ user }) => {
  if (!user) return <div>Cargando...</div>;

  return (
    <div className="user-details-container">
      <div className="user-details-card">
        <div className="user-details-header">
          <div className="user-details-avatar">
            <img 
              src={user.avatar} 
              alt={`Foto de ${user.name}`}
              className="user-details-image"
            />
          </div>
          <h1 className="user-details-name">{user.name}</h1>
          <span className={`user-status 
            ${user.status === 'registered' && 'status-registered'}
            ${user.status === 'in_progress' && 'status-in-progress'}
            ${user.status === 'completed' && 'status-completed'}
            ${user.status === 'failed' && 'status-failed'}`}
          >
            {user.status === 'registered' && 'Registrado'}
            {user.status === 'in_progress' && 'En curso'}
            {user.status === 'completed' && 'Completado'}
            {user.status === 'failed' && 'No aprobado'}
          </span>
        </div>
        
        <div className="user-details-info">
          <div className="user-details-item">
            <strong>Email:</strong>
            <p>{user.email}</p>
          </div>
          {user.phone && (
            <div className="user-details-item">
              <strong>Teléfono:</strong>
              <p>{user.phone}</p>
            </div>
          )}
          {user.website && (
            <div className="user-details-item">
              <strong>Sitio web:</strong>
              <p>{user.website}</p>
            </div>
          )}
          {user.address && (
            <div className="user-details-item">
              <strong>Dirección:</strong>
              <p>{user.address}</p>
            </div>
          )}
        </div>
        
        <div className="user-details-footer">
          <Link href="/users" className="back-button">
            Volver a la lista
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

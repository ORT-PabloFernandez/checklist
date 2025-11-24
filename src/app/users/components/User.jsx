'use client';

import { useState } from 'react';
import './user.css';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';


export default function User({user}) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <li key={user.id} className="user-item">
        <div className="user-content">
            <div className="user-info">
                <Link href={`/users/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="user-avatar">
                        {user.avatar && !imageError ? (
                            <img 
                            src={user.avatar} 
                            alt={`Foto de ${user.name}`}
                            className="user-image"
                            onError={() => setImageError(true)}
                            />
                        ) : (
                            <FaUser className="user-image" />
                        )}
                    </div>
                </Link>
                <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                </div>
            </div>
            <div className="user-status-container">
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
        </div>
        </li>
    )
}
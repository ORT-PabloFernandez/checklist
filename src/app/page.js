'use client';

import React from 'react';
import { FaUserCheck, FaChartLine, FaUsers, FaBell } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import './home.css';

export default function Home() {
  // Datos de ejemplo para estadísticas
  const stats = [
    { id: 1, title: 'Usuarios Activos', value: '1,284', icon: <FaUsers className="stats-icon" />, color: 'blue' },
    { id: 2, title: 'Tasa de Conversión', value: '67%', icon: <FaChartLine className="stats-icon" />, color: 'green' },
    { id: 3, title: 'Tareas Completadas', value: '12,493', icon: <FaUserCheck className="stats-icon" />, color: 'orange' },
    { id: 4, title: 'Notificaciones', value: '24', icon: <FaBell className="stats-icon" />, color: 'red' }
  ];

  // Datos de ejemplo para usuarios destacados
  const featuredUsers = [
    { id: 1, name: 'Alex Wilber', role: 'Desarrollador Senior', completion: 92, image: '/images/Alex Wilber.jpg' },
    { id: 2, name: 'Adele Vance', role: 'Diseñadora UX', completion: 88, image: '/images/Adele Vance.jpg' },
    { id: 3, name: 'Diego Siciliani', role: 'Product Manager', completion: 76, image: '/images/Diego Siciliani.jpg' },
  ];

  // Datos de ejemplo para actividades recientes
  const recentActivity = [
    { id: 1, user: 'Alex Wilber', action: 'completó la tarea', target: 'Optimización de SEO', time: 'hace 2 horas' },
    { id: 2, user: 'Adele Vance', action: 'actualizó su perfil', target: '', time: 'hace 3 horas' },
    { id: 3, user: 'Diego Siciliani', action: 'creó un nuevo proyecto', target: 'Rediseño de Dashboard', time: 'ayer' },
    { id: 4, user: 'Megan Bowen', action: 'comentó sobre', target: 'Informe Trimestral', time: 'ayer' },
    { id: 5, user: 'Nestor Wilke', action: 'se unió al equipo', target: 'Desarrollo Frontend', time: 'hace 2 días' },
  ];

  return (
    <div className="home-page">
      {/* Banner principal */}
      <div className="home-banner">
        <div className="banner-content">
          <h1>Sistema de Seguimiento de Usuarios</h1>
          <p>Monitorea el progreso, analiza estadísticas y optimiza el rendimiento de tu equipo</p>
          <div className="banner-buttons">
            <Link href="/dashboard" className="btn btn-primary">Ver Dashboard</Link>
            <Link href="/users" className="btn btn-secondary">Administrar Usuarios</Link>
          </div>
        </div>
        <div className="banner-image">
          <Image src="/globe.svg" alt="Análisis Global" width={300} height={300} priority />
        </div>
      </div>

      {/* Estadísticas */}
      <section className="stats-section">
        <h2>Estadísticas en Tiempo Real</h2>
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gestión de Checklists */}
      <section className="stats-section">
        <h2>Gestión de Checklists Operativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">Panel de Supervisor</h3>
            <p className="text-gray-600 mb-4">
              Gestione asignaciones, cree nuevos checklists y revise el trabajo de los colaboradores.
            </p>
            <Link href="/supervisor" className="btn btn-primary">
              Acceder como Supervisor
            </Link>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">Panel de Colaborador</h3>
            <p className="text-gray-600 mb-4">
              Visualice y ejecute los checklists asignados, registrando información en campo.
            </p>
            <Link href="/colaborador" className="btn btn-primary">
              Acceder como Colaborador
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de dos columnas */}
      <div className="two-column-section">
        {/* Usuarios destacados */}
        <section className="featured-users-section">
          <h2>Usuarios Destacados</h2>
          <div className="user-cards">
            {featuredUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar">
                    <Image src={user.image} alt={user.name} width={50} height={50} className="avatar-image" />
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.role}</p>
                  </div>
                </div>
                <div className="user-progress">
                  <div className="progress-label">
                    <span>Progreso</span>
                    <span>{user.completion}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${user.completion}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actividad reciente */}
        <section className="recent-activity-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.user}</strong> {activity.action} 
                    {activity.target && <span className="activity-target">{activity.target}</span>}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
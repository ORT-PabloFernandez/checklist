'use client';

import { useState, useEffect } from 'react';
import UserList from './components/UserList';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener los usuarios de la API
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/ORT-PabloFernandez/PNTP2-REACT-EJEMPLO/main/src/data/usersv2.json');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setLoading(false);
      }
    };

    // Llamar a la función de fetch
    fetchUsers();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente

  return (
    <div className="container">
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <UserList users={users} />
      )}
    </div>
  );
}

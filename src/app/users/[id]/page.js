'use client';

import { useState, useEffect } from 'react';
import UserDetails from '../components/UserDetails';
import { useParams } from 'next/navigation';

export default function UserDetailsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const userId = params.id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Obtener los datos de los usuarios
        const response = await fetch('https://raw.githubusercontent.com/ORT-PabloFernandez/PNTP2-REACT-EJEMPLO/main/src/data/usersv2.json');
        const users = await response.json();
        
        // Buscar el usuario específico por ID
        const foundUser = users.find(user => user.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          console.error('Usuario no encontrado');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los detalles del usuario:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return <div className="container">Cargando detalles del usuario...</div>;
  }

  if (!user) {
    return <div className="container">Usuario no encontrado</div>;
  }

  return (
    <div className="container">
      <UserDetails user={user} />
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import RoleSwitcher from '../../components/RoleSwitcher';
import AssignmentList from '../../components/AssignmentList';
import { useCurrentUser } from '../../lib/state';

export default function ColaboradorDashboard() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  // Redirect if not a colaborador (using useEffect to avoid state updates during render)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Colaborador') {
      router.push(`/${currentUser.role.toLowerCase()}`);
    }
  }, [currentUser, router]);
  
  const handleActionClick = (action, assignment) => {
    if (action === 'execute') {
      router.push(`/colaborador/exec/${assignment.id}`);
    }
  };

  // Mostrar pantalla de carga si no tenemos usuario aún
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando usuario...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RoleSwitcher />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Panel de Colaborador</h1>
        <p className="text-gray-600">
          Visualice y ejecute las asignaciones de checklists asignadas a usted.
        </p>
        <p className="text-gray-500">Usuario actual: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Mis Asignaciones</h2>
      </div>
      
      <AssignmentList 
        role="Colaborador"
        filterEmail={currentUser.email}
        onActionClick={handleActionClick}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleSwitcher from '../../components/RoleSwitcher';
import AssignmentList from '../../components/AssignmentList';
import AssignmentForm from '../../components/AssignmentForm';
import TaskBuilderForm from '../../components/TaskBuilderForm';
import TaskList from '../../components/TaskList';
import { useCurrentUser } from '../../lib/state';

export default function SupervisorDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskListRefreshKey, setTaskListRefreshKey] = useState(0);
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  // Redirect if not a supervisor (using useEffect to avoid state updates during render)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Supervisor') {
      router.push(`/${currentUser.role.toLowerCase()}`);
    }
  }, [currentUser, router]);
  
  const handleActionClick = (action, assignment) => {
    if (action === 'review') {
      router.push(`/supervisor/review/${assignment.id}`);
    }
  };
  
  const handleFormSuccess = () => {
    setShowForm(false);
  };

  const handleTaskFormSuccess = () => {
    setShowTaskForm(false);
    setTaskListRefreshKey(prev => prev + 1);
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
        <h1 className="text-2xl font-bold mb-2">Panel de Supervisor</h1>
        <p className="text-gray-600">
          Gestione y supervise las asignaciones de checklists operativos.
        </p>
        <p className="text-gray-500">Usuario actual: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Asignaciones</h2>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
        >
          {showForm ? 'Ocultar formulario' : 'Nueva Asignación'}
        </button>
      </div>
      
      {showForm && (
        <div className="mb-8">
          <AssignmentForm onSuccess={handleFormSuccess} />
        </div>
      )}
      
      <AssignmentList 
        role="Supervisor"
        onActionClick={handleActionClick}
      />

      <div className="mt-10">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tareas</h2>
          
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            {showTaskForm ? 'Ocultar formulario' : 'Nueva Tarea'}
          </button>
        </div>

        {showTaskForm && (
          <div className="mb-8">
            <TaskBuilderForm onSuccess={handleTaskFormSuccess} />
          </div>
        )}

        <TaskList key={taskListRefreshKey} />
      </div>
    </div>
  );
}

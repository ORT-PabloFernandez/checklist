'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAssignments } from '../lib/state';
import { formatShortDate, formatStatus, isOverdue } from '../lib/utils';

export default function AssignmentList({
  role = 'Supervisor', // Supervisor or Colaborador
  filterEmail = null,  // Filter by assignee (for Colaborador view)
  onActionClick = null // Optional callback for custom actions
}) {
  const router = useRouter();
  const { assignments, loading, refreshAssignments } = useAssignments();
  const [statusFilter, setStatusFilter] = useState('all');

  // nuevo estado para búsqueda de tareas
  const [taskSearch, setTaskSearch] = useState('');

  // Recargar asignaciones cuando el componente se monta o cuando vuelven cambios
  useEffect(() => {
    const handleStorageChange = () => {
      if (refreshAssignments) refreshAssignments();
    };

    const handleAssignmentsUpdated = () => {
      if (refreshAssignments) refreshAssignments();
    };

    window.addEventListener('storage', handleStorageChange); // para otras pestañas
    window.addEventListener('assignmentsUpdated', handleAssignmentsUpdated); // para misma pestaña

    if (refreshAssignments) refreshAssignments();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('assignmentsUpdated', handleAssignmentsUpdated);
    };
  }, [refreshAssignments]);

  // Filter assignments based on role and filters
  const filteredAssignments = assignments.filter(assignment => {
    // Filter by email if specified (for Colaborador view)
    if (filterEmail && assignment.asignadoA &&
        assignment.asignadoA.toLowerCase() !== filterEmail.toLowerCase()) {
      return false;
    }

    // Filter by status
    if (statusFilter !== 'all') {
      // Special case for "vencida"
      if (statusFilter === 'vencida') {
        return isOverdue(assignment.fechaVencimiento) && assignment.estado !== 'Aprobada';
      }
      // Normal status filter
      return (assignment.estado || '').toLowerCase() === statusFilter.toLowerCase();
    }

    return true;
  });

  // Sort by due date (closest first) and then by creation date (newest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (isOverdue(a.fechaVencimiento) && !isOverdue(b.fechaVencimiento)) return -1;
    if (!isOverdue(a.fechaVencimiento) && isOverdue(b.fechaVencimiento)) return 1;

    const dateA = new Date(a.fechaVencimiento);
    const dateB = new Date(b.fechaVencimiento);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    const createA = new Date(a.fechaCreacion);
    const createB = new Date(b.fechaCreacion);
    return createB - createA;
  });

  const getActionButton = (assignment) => {
    if (!onActionClick) return null;

    const status = (assignment.estado || '').toLowerCase();

    if (role === 'Supervisor') {
      if (status === 'enviada' || status === 'en revisión' || status === 'en revision') {
        return (
          <button
            onClick={() => onActionClick('review', assignment)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Revisar
          </button>
        );
      }
    } else if (role === 'Colaborador') {
      const execButtonText = status === 'asignada' ? 'Iniciar' : 'Continuar';
      if (status === 'asignada' || status === 'en ejecución' || status === 'en ejecucion' || status === 'rechazada') {
        return (
          <button
            onClick={() => onActionClick('execute', assignment)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            {execButtonText}
          </button>
        );
      }
    }

    return null;
  };

  // Función para obtener tareas desde localStorage
  const getTasksFromLocalStorage = () => {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return tasks;
    } catch (e) {
      return [];
    }
  };

  // Filtrar tareas por búsqueda (case-insensitive)
  const allTasks = getTasksFromLocalStorage();
  const filteredTasks = allTasks.filter(t => {
    if (!taskSearch) return true;
    return (t.nombre || '').toLowerCase().includes(taskSearch.toLowerCase());
  });

  // Manejo de acciones para tareas
  const handleTaskAction = (action, task) => {
    if (action === 'create') {
      router.push('/task/create');
    } else if (action === 'edit') {
      router.push(`/task/edit/${task.id}`);
    } else if (action === 'delete') {
      handleDeleteTask(task.id);
    } else if (action === 'assign') {
      router.push(`/task/assign/${task.id}`);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      // notify other listeners
      window.dispatchEvent(new Event('tasksUpdated'));
      // refresh UI
      if (refreshAssignments) refreshAssignments();
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="asignada">Asignada</option>
            <option value="en ejecución">En ejecución</option>
            <option value="enviada">En revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="vencida">Vencida</option>
          </select>
        </div>
      </div>

      {/* Assignments table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="py-2 px-4 border-b">Checklist</th>
              {role === 'Supervisor' && <th className="py-2 px-4 border-b">Asignado a</th>}
              <th className="py-2 px-4 border-b">Vencimiento</th>
              <th className="py-2 px-4 border-b">Prioridad</th>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={role === 'Supervisor' ? 6 : 5} className="py-4 px-4 text-center text-gray-500">
                  Cargando asignaciones...
                </td>
              </tr>
            ) : sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={role === 'Supervisor' ? 6 : 5} className="py-4 px-4 text-center text-gray-500">
                  No hay asignaciones {statusFilter !== 'all' ? `con estado "${statusFilter}"` : ''}
                </td>
              </tr>
            ) : (
              sortedAssignments.map((assignment) => {
                const status = formatStatus(assignment.estado, assignment.fechaVencimiento);
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{assignment.checklistNombre}</td>
                    {role === 'Supervisor' && <td className="py-2 px-4 border-b">{assignment.asignadoA}</td>}
                    <td className="py-2 px-4 border-b">{formatShortDate(assignment.fechaVencimiento)}</td>
                    <td className="py-2 px-4 border-b capitalize">{assignment.prioridad || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={status.class}>{status.text}</span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center gap-2">
                        {getActionButton(assignment)}
                        {assignment.lastExecutionId && (
                          <Link
                            href={`/summary/${assignment.lastExecutionId}`}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Ver detalle
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Tareas section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Tareas Creadas</h2>

        {/* Barra de búsqueda para tareas */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Buscar tareas por nombre..."
            className="border rounded px-3 py-2 w-full md:w-1/2"
          />
          <button
            onClick={() => { setTaskSearch(''); }}
            className="px-3 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
            title="Limpiar búsqueda"
          >
            Limpiar
          </button>
          <button
            onClick={() => handleTaskAction('create')}
            className="ml-auto px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Crear Nueva Tarea
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Cantidad de Pasos</th>
                <th className="py-2 px-4 border-b">Fecha de Creación</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                    {allTasks.length === 0 ? 'No hay tareas creadas' : 'No se encontraron tareas'}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{task.nombre}</td>
                    <td className="py-2 px-4 border-b">{task.pasos ? task.pasos.length : 0}</td>
                    <td className="py-2 px-4 border-b">{formatShortDate(task.fechaCreacion)}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleTaskAction('edit', task)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleTaskAction('delete', task)}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => handleTaskAction('assign', task)}
                        className="ml-2 px-2 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Asignar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
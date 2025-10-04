'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAssignments } from '../lib/state';
import { formatShortDate, formatStatus, isOverdue } from '../lib/utils';

export default function AssignmentList({
  role = 'Supervisor', // Supervisor or Colaborador
  filterEmail = null,  // Filter by assignee (for Colaborador view)
  onActionClick = null // Optional callback for custom actions
}) {
  const { assignments, loading } = useAssignments();
  const [statusFilter, setStatusFilter] = useState('all');
  
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
      return assignment.estado.toLowerCase() === statusFilter.toLowerCase();
    }
    
    return true;
  });
  
  // Sort by due date (closest first) and then by creation date (newest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (isOverdue(a.fechaVencimiento) && !isOverdue(b.fechaVencimiento)) {
      return -1; // Overdue items first
    }
    if (!isOverdue(a.fechaVencimiento) && isOverdue(b.fechaVencimiento)) {
      return 1;
    }
    
    // Then by due date
    const dateA = new Date(a.fechaVencimiento);
    const dateB = new Date(b.fechaVencimiento);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    
    // Then by creation date (newest first)
    const createA = new Date(a.fechaCreacion);
    const createB = new Date(b.fechaCreacion);
    return createB - createA;
  });
  
  const getActionButton = (assignment) => {
    if (!onActionClick) return null;
    
    const status = assignment.estado.toLowerCase();
    
    if (role === 'Supervisor') {
      // Supervisor can review if assignment is sent for review
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
      // Colaborador can execute assignments
      const execButtonText = status === 'asignada' ? 'Iniciar' : 'Continuar';
      
      if (status === 'asignada' || status === 'en ejecución' || status === 'en ejecucion' || 
          status === 'rechazada') {
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
                    <td className="py-2 px-4 border-b">
                      {formatShortDate(assignment.fechaVencimiento)}
                    </td>
                    <td className="py-2 px-4 border-b capitalize">{assignment.prioridad || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={status.class}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center gap-2">
                        {getActionButton(assignment)}
                        
                        {/* View summary button - if an execution exists */}
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
    </div>
  );
}

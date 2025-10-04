'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getExecution, getAssignment, updateAssignment } from '../lib/storage';
import { formatDate } from '../lib/utils';
import { useCurrentUser } from '../lib/state';

export default function ReviewPanel({ assignmentId }) {
  const [assignment, setAssignment] = useState(null);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [signatureConfirm, setSignatureConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Load data
  useEffect(() => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      
      // Get assignment
      const assignmentData = getAssignment(assignmentId);
      if (!assignmentData) {
        throw new Error('No se encontró la asignación');
      }
      setAssignment(assignmentData);
      
      // Get the latest execution
      if (assignmentData.lastExecutionId) {
        const executionData = getExecution(assignmentData.lastExecutionId);
        if (!executionData) {
          throw new Error('No se encontró la ejecución asociada');
        }
        setExecution(executionData);
      } else {
        throw new Error('La asignación no tiene una ejecución asociada');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading review data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);
  
  const handleSubmitDecision = () => {
    try {
      if (!decision) {
        setFormError('Debe seleccionar una decisión');
        return;
      }
      
      if (decision === 'Rechazada' && !comments) {
        setFormError('Debe proporcionar comentarios para rechazar la ejecución');
        return;
      }
      
      if (!signatureConfirm) {
        setFormError('Debe confirmar su aprobación con la firma');
        return;
      }
      
      if (!assignment) {
        throw new Error('No hay asignación para actualizar');
      }
      
      // Update assignment based on decision
      const updatedAssignment = { ...assignment };
      
      if (decision === 'Aprobada') {
        updatedAssignment.estado = 'Aprobada';
      } else {
        // If rejected, add to rejections and change status back to execution
        updatedAssignment.estado = 'En ejecución';
        
        // Add rejection record
        if (!updatedAssignment.rechazos) {
          updatedAssignment.rechazos = [];
        }
        
        updatedAssignment.rechazos.push({
          fecha: new Date().toISOString(),
          comentarios: comments,
          revisor: currentUser?.email || 'unknown'
        });
      }
      
      // Save changes
      updateAssignment(updatedAssignment);
      
      // Redirect back to supervisor dashboard
      router.push('/supervisor');
      
    } catch (err) {
      console.error('Error updating assignment:', err);
      setFormError(`Error: ${err.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando datos de revisión...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        {error}
      </div>
    );
  }
  
  if (!assignment || !execution) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded">
        No se encontraron datos para revisión.
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm p-4 border">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Revisar Ejecución</h2>
        <p className="text-gray-600">
          Checklist: <strong>{assignment.checklistNombre}</strong>
        </p>
        <div className="flex flex-wrap gap-4 text-sm mt-2">
          <p>
            <span className="font-medium">Ejecutado por:</span> {execution.user}
          </p>
          <p>
            <span className="font-medium">Fecha de ejecución:</span> {formatDate(execution.timestamp)}
          </p>
          <p>
            <span className="font-medium">Asignado a:</span> {assignment.asignadoA}
          </p>
        </div>
      </div>
      
      {formError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {formError}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Decisión <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="decision"
              value="Aprobada"
              checked={decision === 'Aprobada'}
              onChange={() => setDecision('Aprobada')}
              className="mr-2"
            />
            <span>Aprobada</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="decision"
              value="Rechazada"
              checked={decision === 'Rechazada'}
              onChange={() => setDecision('Rechazada')}
              className="mr-2"
            />
            <span>Rechazada</span>
          </label>
        </div>
      </div>
      
      <div className={`mb-6 ${decision === 'Rechazada' ? '' : 'opacity-50'}`}>
        <label className="block text-gray-700 font-medium mb-2">
          Comentarios {decision === 'Rechazada' && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={decision !== 'Rechazada'}
          placeholder={decision === 'Rechazada' ? "Explique por qué rechaza esta ejecución" : "Solo obligatorio si rechaza"}
          className="w-full border rounded p-2"
          rows={4}
        />
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={signatureConfirm}
            onChange={(e) => setSignatureConfirm(e.target.checked)}
            className="mr-2"
          />
          <span>
            Confirmo mi {decision === 'Aprobada' ? 'aprobación' : decision === 'Rechazada' ? 'rechazo' : 'decisión'} como supervisor
            {currentUser && ` (${currentUser.email})`}
          </span>
        </label>
      </div>
      
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={() => router.push('/supervisor')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        
        <button
          type="button"
          onClick={handleSubmitDecision}
          disabled={!decision || (decision === 'Rechazada' && !comments) || !signatureConfirm}
          className={`
            px-4 py-2 rounded
            ${(decision && (decision !== 'Rechazada' || comments) && signatureConfirm)
              ? `bg-${decision === 'Aprobada' ? 'green' : 'red'}-600 text-white hover:bg-${decision === 'Aprobada' ? 'green' : 'red'}-700`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Confirmar {decision || 'Decisión'}
        </button>
      </div>
    </div>
  );
}

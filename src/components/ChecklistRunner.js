'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChecklistBySlug } from '../lib/loader';
import { useExecutionState, useCurrentUser } from '../lib/state';
import StepRenderer from './StepRenderer';
import { updateAssignment } from '../lib/storage';

export default function ChecklistRunner({ assignmentId, readOnly = false }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  const {
    responses,
    updateResponse,
    visibilityMap,
    validationMap,
    saveProgress,
    lastSaved,
    canSubmit,
    assignmentData
  } = useExecutionState(assignmentId, checklist);

  // Load checklist data
  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        
        if (!assignmentData?.checklistSlug) {
          throw new Error('No se encontró la asignación o no tiene un checklist asociado');
        }
        
        const data = await getChecklistBySlug(assignmentData.checklistSlug);
        if (!data) {
          throw new Error(`No se encontró el checklist: ${assignmentData.checklistSlug}`);
        }
        
        setChecklist(data);
        setError(null);
      } catch (err) {
        console.error('Error loading checklist:', err);
        setError(`Error al cargar el checklist: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (assignmentData) {
      fetchChecklist();
    }
  }, [assignmentData]);

  // Save progress
  const handleSaveProgress = async () => {
    try {
      await saveProgress();
    } catch (err) {
      console.error('Error saving progress:', err);
      setError('Error al guardar el progreso');
    }
  };

  // Submit for review
  const handleSubmitForReview = async () => {
    if (!canSubmit()) {
      setError('Por favor complete todos los campos obligatorios antes de enviar');
      return;
    }
    
    try {
      // Save execution first
      const executionId = await saveProgress();
      
      if (executionId && assignmentData) {
        // Update assignment status
        const updatedAssignment = {
          ...assignmentData,
          estado: 'Enviada',
          lastExecutionId: executionId
        };
        
        updateAssignment(updatedAssignment);
        
        // Redirect to summary
        router.push(`/summary/${executionId}`);
      }
    } catch (err) {
      console.error('Error submitting for review:', err);
      setError('Error al enviar para revisión');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando checklist...</div>
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

  if (!checklist) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded">
        No se encontró el checklist asociado a esta asignación.
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm p-4 border">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">{checklist.nombre}</h2>
        <p className="text-gray-600">{checklist.objetivo}</p>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <p>
          <span className="font-medium">Ejecutor:</span> {currentUser?.email || 'Usuario actual'}
        </p>
        {lastSaved && (
          <p>
            <span className="font-medium">Último guardado:</span> {new Date(lastSaved).toLocaleString()}
          </p>
        )}
      </div>
      
      {checklist.pasos && checklist.pasos.map((paso) => (
        <div key={paso.id} className={`mb-6 ${!visibilityMap[paso.id] ? 'hidden' : ''}`}>
          <div className="mb-2">
            <label className="block font-medium">
              {paso.descripcion}
              {paso.obligatorio && <span className="text-red-500 ml-1">*</span>}
            </label>
            {paso.unidad && !['grupo', 'foto', 'archivo', 'firma', 'checkbox'].includes(paso.tipo_campo) && (
              <span className="text-sm text-gray-500">{paso.unidad}</span>
            )}
          </div>
          
          <StepRenderer
            paso={paso}
            value={responses[paso.id]}
            onChange={(value) => updateResponse(paso.id, value)}
            disabled={readOnly}
            isVisible={visibilityMap[paso.id]}
          />
          
          {validationMap[paso.id] && !validationMap[paso.id].isValid && (
            <div className="text-sm text-red-600 mt-1">
              {validationMap[paso.id].errors.join(', ')}
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleSaveProgress}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Guardar progreso
          </button>
          
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={!canSubmit()}
            className={`
              px-4 py-2 rounded
              ${canSubmit() 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Enviar para revisión
          </button>
        </div>
      )}
    </div>
  );
}

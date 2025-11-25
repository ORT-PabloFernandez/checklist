'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChecklistBySlug } from '../lib/loader';
import { useExecutionState, useCurrentUser } from '../lib/state';
import StepRenderer from './StepRenderer';
import { updateAssignment } from '../lib/storage';
import { FIELD_TYPES } from '@/constants/fieldTypes';

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
      
      {checklist.pasos && checklist.pasos.map((paso) => {
        const fieldType = paso.type || paso.tipo_campo;
        const isFieldGroup = fieldType === FIELD_TYPES.GROUP;
        const isFileType = [
          FIELD_TYPES.PHOTO, 
          FIELD_TYPES.FILE, 
          FIELD_TYPES.SIGNATURE
        ].includes(fieldType);
        const isCheckbox = fieldType === FIELD_TYPES.CHECKBOX;
        
        return (
          <div 
            key={paso.id} 
            className={`mb-6 p-4 rounded-lg border ${
              !visibilityMap[paso.id] ? 'hidden' : ''
            } ${isFieldGroup ? 'bg-gray-50' : 'bg-white'}`}
          >
            {/* Encabezado del campo */}
            <div className="mb-3">
              <label className="block font-medium text-gray-900">
                {paso.text}
                {paso.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {/* Descripción adicional si existe */}
              {paso.description && (
                <p className="text-sm text-gray-500 mt-1">{paso.description}</p>
              )}
              
              {/* Mostrar unidad para campos numéricos */}
              {paso.unit && fieldType === FIELD_TYPES.NUMBER && (
                <span className="text-sm text-gray-500 ml-1">({paso.unit})</span>
              )}
            </div>
            
            {/* Renderizado del campo */}
            <div className={isFieldGroup ? 'pl-4 border-l-2 border-gray-200' : ''}>
              <StepRenderer
                paso={{
                  ...paso,
                  tipo_campo: fieldType,
                  text: paso.text || paso.descripcion,
                  obligatorio: paso.required || paso.obligatorio,
                  unidad: paso.unit || paso.unidad
                }}
                value={responses[paso.id]}
                onChange={(value) => updateResponse(paso.id, value)}
                disabled={readOnly}
                isVisible={visibilityMap[paso.id]}
              />
              
              {/* Mensajes de validación */}
              {validationMap[paso.id] && !validationMap[paso.id].isValid && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {validationMap[paso.id].errors.join(', ')}
                </div>
              )}
              
              {/* Instrucciones adicionales */}
              {!isFileType && !isCheckbox && paso.helpText && (
                <p className="mt-1 text-xs text-gray-500">{paso.helpText}</p>
              )}
            </div>
          </div>
        );
      })}

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

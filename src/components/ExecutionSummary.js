'use client';

import { useState, useEffect } from 'react';
import { getChecklistByName } from '../lib/loader';
import StepRenderer from './StepRenderer';

export default function ExecutionSummary({ execution }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChecklist = async () => {
      if (!execution?.checklist) {
        setLoading(false);
        return;
      }

      try {
        // Busco el checklist en el JSON estatico
        let data = await getChecklistByName(execution.checklist);

        if (!data && typeof window !== 'undefined') {
          // Si no encuentra el checklist en el JSON estatico, busca en el localStorage las tareas creadas por el usuario
          const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
          const task = tasks.find(t => t.nombre === execution.checklist);
          // Si encuentra la tarea, la devuelve en el formato de checklist
          if (task) {
            data = {
              nombre: task.nombre,
              pasos: task.pasos.map(paso => ({
                id: paso.id,
                descripcion: paso.descripcion,
                tipo_campo: paso.tipo || paso.tipo_campo || 'texto',
                obligatorio: true
              }))
            };
          }
        }
        setChecklist(data);
      } catch (error) {
        console.error('Error loading checklist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [execution]);

  if (loading) {
    return <div className="text-gray-500">Cargando detalles...</div>;
  }

  return (
    <div className="space-y-3">
      {checklist.pasos.map(paso => {
        const response = execution.respuestas.find(r => r.pasoId === paso.id);
        if (!response || !response.visible) return null;
        // Si el paso es visible, lo renderiza
        return (
          <div key={paso.id} className="border rounded p-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-800 flex-1">{paso.descripcion}</p>
              {response.valido ? (
                <span className="text-green-600 ml-2">✓</span>
              ) : (
                <span className="text-red-600 ml-2">✗</span>
              )}
            </div>

            {response.errores?.length > 0 && (
              <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                {response.errores.join(', ')}
              </div>
            )}

            <div className="text-gray-900">
              <StepRenderer
                paso={paso}
                value={response.valor}
                onChange={() => {}}
                disabled={true}
                isVisible={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

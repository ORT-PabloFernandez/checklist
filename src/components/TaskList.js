'use client';

import { useState } from 'react';
import { useCustomTasks } from '../lib/state';
import { formatDate } from '../lib/utils';

export default function TaskList() {
  const { tasks, loading, error, deleteTask } = useCustomTasks();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm('¿Seguro que desea eliminar esta tarea personalizada?');
    if (!confirmed) return;

    try {
      setDeletingId(taskId);
      deleteTask(taskId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="text-gray-500 text-sm">Cargando tareas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded border border-red-100">
        {error}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded p-6 text-center text-sm text-gray-500">
        No hay tareas personalizadas cargadas.
        <br />
        Cree una nueva tarea para que aparezca en este listado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border rounded-lg bg-white shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{task.nombre}</h3>
              {task.descripcion && (
                <p className="text-sm text-gray-600 mt-1">{task.descripcion}</p>
              )}
              <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2 space-x-3">
                <span>{task.pasos?.length || 0} paso(s)</span>
                {task.creadoPor && (
                  <span>Creado por: {task.creadoPor}</span>
                )}
                {task.fechaCreacion && (
                  <span>Creado el {formatDate(task.fechaCreacion)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                className="text-sm text-red-600 hover:text-red-700"
                disabled={deletingId === task.id}
              >
                {deletingId === task.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>

          {task.pasos && task.pasos.length > 0 && (
            <div className="mt-3 border-t border-dashed pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Pasos definidos:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {task.pasos.map((paso) => (
                  <li key={paso.id} className="flex justify-between items-start gap-3">
                    <span>
                      <strong>Paso {paso.id}:</strong> {paso.descripcion}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">
                      {paso.tipo_campo}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


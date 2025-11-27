'use client';

import { useState, useEffect } from 'react';
import { useAssignments, useCurrentUser } from '../lib/state';
import { loadPackage } from '../lib/loader';
import { slugify } from '../lib/utils';
import { addNotification } from '@/lib/storage';

export default function AssignmentForm({ onSuccess }) {
  const { currentUser } = useCurrentUser();
  const { createAssignment } = useAssignments();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    checklistSlug: '',
    checklistNombre: '',
    asignadoA: '',
    fechaVencimiento: '',
    prioridad: 'Media',
    notas: ''
  });

  // Load available checklists on mount
  useEffect(() => {
    async function fetchChecklists() {
      try {
        setLoading(true);
        //Combino lo estatico con lo creado por el usuario
        const data = await loadPackage();
        const jsonChecklists = data.checklists || [];
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const allChecklists = [...jsonChecklists, ...tasks];

        setChecklists(allChecklists);
        setError(null);
      } catch (err) {
        console.error('Error loading checklists:', err);
        setError('No se pudieron cargar los checklists');
      } finally {
        setLoading(false);
      }
    }

    fetchChecklists();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // Special handling for checklist selection
      if (name === 'checklistSlug' && value) {
        // Si el valor comienza con "task-", es una tarea
        if (value.startsWith('task-')) {
          const taskId = value.replace('task-', '');
          const selectedTask = checklists.find(c => c.id === taskId);
          return {
            ...prev,
            [name]: value,
            checklistNombre: selectedTask ? selectedTask.nombre : ''
          };
        }

        // Si no es tarea, busco el checklist en el JSON estatico
        const selectedChecklist = checklists.find(c => slugify(c.nombre) === value);
        return {
          ...prev,
          [name]: value,
          checklistNombre: selectedChecklist ? selectedChecklist.nombre : ''
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.checklistSlug || !formData.asignadoA || !formData.fechaVencimiento) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      // Create assignment with current user as creator
      const newAssignment = {
        ...formData,
        creadoPor: currentUser?.email || 'unknown',
        fechaCreacion: new Date().toISOString(),
        estado: 'Asignada',
        rechazos: []
      };

      createAssignment(newAssignment);

      if (formData.asignadoA) {
        addNotification(
          formData.asignadoA,
          `se te ha asignado una nueva checklist: "${newAssignment.checklistNombre}"`,
          `assign`
        );
        window.dispatchEvent(new Event('notificationUpdated'));
      }

      // Reset form
      setFormData({
        checklistSlug: '',
        checklistNombre: '',
        asignadoA: '',
        fechaVencimiento: '',
        prioridad: 'Media',
        notas: ''
      });

      setError(null);

      // Notify parent of success
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('No se pudo crear la asignación');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm p-4 border">
      <h3 className="text-lg font-medium mb-4">Nueva Asignación</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Checklist <span className="text-red-500">*</span>
        </label>
        <select
          name="checklistSlug"
          value={formData.checklistSlug}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
          disabled={loading}
        >
          <option value="">Seleccione un checklist</option>

          {checklists.map((checklist, index) => {
            // Verifica si es una tarea por el id ya que todas las tareas tienen un id y los checklists no
            const isTask = checklist.id && checklist.pasos;
            const value = isTask ? `task-${checklist.id}` : slugify(checklist.nombre);

            return (
              <option key={index} value={value}>
                {checklist.nombre}
              </option>
            );
          })}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Asignado a <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="asignadoA"
          value={formData.asignadoA}
          onChange={handleChange}
          placeholder="Email del colaborador"
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Fecha Vencimiento <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="fechaVencimiento"
          value={formData.fechaVencimiento}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
          min={new Date().toISOString().split('T')[0]} // No past dates
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Prioridad
        </label>
        <select
          name="prioridad"
          value={formData.prioridad}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Notas
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          placeholder="Instrucciones adicionales"
          className="w-full border rounded p-2"
          rows="3"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          Crear Asignación
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAssignments, useCurrentUser, useCustomTasks } from '../lib/state';
import { loadPackage } from '../lib/loader';
import { slugify } from '../lib/utils';

export default function AssignmentForm({ onSuccess }) {
  const { currentUser } = useCurrentUser();
  const { createAssignment } = useAssignments();
  const { tasks: customTasks, loading: customTasksLoading } = useCustomTasks();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    checklistSlug: '',
    checklistNombre: '',
    customTaskId: '',
    esChecklistPersonalizado: false,
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
        const data = await loadPackage();
        setChecklists(data.checklists || []);
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
        const selectedChecklist = checklists.find(c => slugify(c.nombre) === value);
        const selectedCustomTask = (customTasks || []).find(task => {
          const taskSlug = task.slug || slugify(task.nombre);
          return taskSlug === value;
        });

        return {
          ...prev,
          [name]: value,
          checklistNombre: selectedCustomTask ? selectedCustomTask.nombre : (selectedChecklist ? selectedChecklist.nombre : ''),
          customTaskId: selectedCustomTask ? selectedCustomTask.id : '',
          esChecklistPersonalizado: Boolean(selectedCustomTask)
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
      
      // Reset form
      setFormData({
        checklistSlug: '',
        checklistNombre: '',
        customTaskId: '',
        esChecklistPersonalizado: false,
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
          disabled={loading || customTasksLoading}
        >
          <option value="">Seleccione un checklist</option>
          {checklists.length > 0 && (
            <optgroup label="Checklists del paquete">
              {checklists.map((checklist, index) => (
                <option key={`packaged-${index}`} value={slugify(checklist.nombre)}>
                  {checklist.nombre}
                </option>
              ))}
            </optgroup>
          )}
          {(customTasks || []).length > 0 && (
            <optgroup label="Tareas personalizadas">
              {(customTasks || []).map(task => {
                const taskSlug = task.slug || slugify(task.nombre);
                return (
                  <option key={`custom-${task.id}`} value={taskSlug}>
                    {task.nombre} (Personalizada)
                  </option>
                );
              })}
            </optgroup>
          )}
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
          disabled={loading || customTasksLoading}
        >
          Crear Asignación
        </button>
      </div>
    </form>
  );
}

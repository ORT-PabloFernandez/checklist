'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { users } from '@/app/data/mocs';
import { saveAssignment } from '../lib/storage';

export default function TaskAssignForm({ taskId }) {
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    asignadoA: '',
    notas: '',
    fechaVencimiento: '',
    prioridad: 'media'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) setTask(foundTask);
    setLoading(false);
  }, [taskId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.asignadoA || !formData.asignadoA.trim()) newErrors.asignadoA = 'Debes seleccionar un usuario';
    if (!formData.fechaVencimiento) newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newAssignment = {
        id: undefined,
        checklistNombre: task?.nombre || 'Sin nombre',
        checklistId: task?.id || null,
        asignadoA: formData.asignadoA,
        notas: formData.notas,
        fechaVencimiento: formData.fechaVencimiento,
        prioridad: formData.prioridad,
        estado: 'Asignada',
        fechaCreacion: new Date().toISOString(),
        lastExecutionId: null
      };

      // Usar la API común de storage para mantener consistencia con listAssignments()
      const savedId = saveAssignment(newAssignment);

      // Notificar a listeners en la misma pestaña para que recarguen la lista
      window.dispatchEvent(new Event('assignmentsUpdated'));

      console.debug('TaskAssignForm: assignment saved', savedId);

      router.push('/supervisor');
    } catch (error) {
      console.error('Error al asignar tarea:', error);
      alert('Hubo un error al asignar la tarea');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  if (!task) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Tarea no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">Asignar Tarea</h1>
      <p className="text-gray-600 mb-6">Tarea: <span className="font-semibold">{task.nombre}</span></p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="asignadoA" className="block text-sm font-medium text-gray-700 mb-1">Asignar a *</label>
          <select
            id="asignadoA"
            name="asignadoA"
            value={formData.asignadoA}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecciona un usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.asignadoA && <p className="text-red-600 text-sm mt-1">{errors.asignadoA}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
          <input
            type="date"
            id="fechaVencimiento"
            name="fechaVencimiento"
            value={formData.fechaVencimiento}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.fechaVencimiento && <p className="text-red-600 text-sm mt-1">{errors.fechaVencimiento}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
          <textarea
            id="notas"
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Agrega alguna nota o instrucción adicional"
            rows="4"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Asignar Tarea</button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getTask, saveTask, updateTask } from '@/lib/storage';
import { slugify } from '@/lib/utils';
import { validateTaskForm } from '@/lib/validation';
import TaskFormFields from './task/TaskFormFields';
import TaskFormItems from './task/TaskFormItems';

export default function TaskForm({ taskId = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    description: '',
    category: '',
    slug: '',
    pasos: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskId) {
      const task = getTask(taskId);
      
      if (task) {
        // Normalize pasos to have both old and new field names for compatibility
        const normalizedPasos = (task.pasos || []).map(paso => ({
          ...paso,
          text: paso.text || paso.descripcion,
          type: paso.type || paso.tipo,
          descripcion: paso.descripcion || paso.text,
          tipo: paso.tipo || paso.type
        }));

        setFormData({
          nombre: task.nombre || '',
          description: task.description || '',
          category: task.category || '',
          slug: task.slug || '',
          pasos: normalizedPasos
        });
      }
    }
  }, [taskId]);

  // Generar slug automáticamente cuando cambia el nombre
  useEffect(() => {
    if (formData.nombre && !taskId) {
      const slug = slugify(formData.nombre);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.nombre, taskId]);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemsChange = (pasos) => {
    setFormData(prev => ({
      ...prev,
      pasos
    }));
    if (errors.pasos) {
      setErrors(prev => ({
        ...prev,
        pasos: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = validateTaskForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Limpiar errores si la validación es exitosa
    setErrors({});

    const currentUser = getCurrentUser();

    try {
      if (taskId) {
        // Editar tarea existente
        updateTask(taskId, formData);
      } else {
        // Crear nueva tarea
        saveTask(formData, currentUser);
      }

      router.push('/supervisor');
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ submit: 'Error al guardar la tarea. Por favor, intenta nuevamente.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">
        {taskId ? 'Editar Tarea' : 'Crear Nueva Tarea'}
      </h1>

      <form onSubmit={handleSubmit}>
        <TaskFormFields
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
        />

        <TaskFormItems
          items={formData.pasos}
          onItemsChange={handleItemsChange}
          errors={errors}
        />

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {taskId ? 'Actualizar Tarea' : 'Crear Tarea'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskForm({ taskId = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    pasos: []
  });
  const [newStepDescription, setNewStepDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskId) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setFormData(task);
      }
    }
  }, [taskId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleAddStep = () => {
    if (!newStepDescription.trim()) {
      setErrors(prev => ({
        ...prev,
        step: 'La descripción del paso no puede estar vacía'
      }));
      return;
    }

    const newStep = {
      id: Date.now(),
      descripcion: newStepDescription,
      tipo: 'texto'
    };

    setFormData(prev => ({
      ...prev,
      pasos: [...prev.pasos, newStep]
    }));
    setNewStepDescription('');
    setErrors(prev => ({
      ...prev,
      step: ''
    }));
  };

  const handleRemoveStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      pasos: prev.pasos.filter(step => step.id !== stepId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la tarea es obligatorio';
    }

    if (formData.pasos.length === 0) {
      newErrors.pasos = 'Debes agregar al menos un paso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    if (taskId) {
      // Editar tarea existente
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...formData, id: taskId }
          : task
      );
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } else {
      // Crear nueva tarea
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        fechaCreacion: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    router.push('/supervisor');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">
        {taskId ? 'Editar Tarea' : 'Crear Nueva Tarea'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Nombre de la tarea */}
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Tarea *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Ingresa el nombre de la tarea"
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Pasos */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pasos de la Tarea *
          </label>

          {/* Lista de pasos existentes */}
          {formData.pasos.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              {formData.pasos.map((step, index) => (
                <div key={step.id} className="flex items-start justify-between mb-3 p-2 bg-white rounded border">
                  <div className="flex-1">
                    <p className="font-medium">Paso {index + 1}</p>
                    <p className="text-gray-600">{step.descripcion}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nuevo paso */}
          <div className="border rounded p-4 bg-gray-50">
            <label htmlFor="newStep" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Paso
            </label>
            <textarea
              id="newStep"
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Describe lo que debe hacer el usuario en este paso"
              rows="3"
            />
            <button
              type="button"
              onClick={handleAddStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Agregar Paso
            </button>
            {errors.step && <p className="text-red-600 text-sm mt-1">{errors.step}</p>}
          </div>

          {errors.pasos && <p className="text-red-600 text-sm mt-2">{errors.pasos}</p>}
        </div>

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
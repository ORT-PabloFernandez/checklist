// app/components/TaskBuilderForm.jsx
'use client';

import { useState } from 'react';
import { useCustomTasks, useCurrentUser } from '../lib/state';
import { slugify } from '../lib/utils';
import Step from './Step';

const FIELD_TYPES = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'foto', label: 'Foto' },
  { value: 'archivo', label: 'Archivo' },
  { value: 'firma', label: 'Firma' }
];

function createEmptyStep() {
  return {
    localId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    descripcion: '',
    tipo_campo: 'texto',
    obligatorio: false,
    opcionesTexto: '',
    numeroMin: '',
    numeroMax: '',
    textoMaxLen: '',
    condicionActiva: false,
    condicionPasoId: '',
    condicionValor: ''
  };
}

export default function TaskBuilderForm({ onSuccess }) {
  const { createTask } = useCustomTasks();
  const { currentUser } = useCurrentUser();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const [pasos, setPasos] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const stepOptions = pasos.map((paso, index) => ({
    value: (index + 1).toString(),
    label: `Paso ${index + 1}: ${paso.descripcion || 'Sin descripción'}`
  }));

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setPasos([]);
  };

  const handleGeneralChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStep = () => {
    setPasos(prev => [...prev, createEmptyStep()]);
  };

  const handleRemoveStep = (localId) => {
    setPasos(prev => prev.filter(step => step.localId !== localId));
  };

  const handleStepChange = (localId, field, value) => {
    setPasos(prev =>
      prev.map(step =>
        step.localId === localId
          ? { ...step, [field]: value }
          : step
      )
    );
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      return 'El nombre de la tarea es obligatorio.';
    }

    for (let index = 0; index < pasos.length; index += 1) {
      const paso = pasos[index];
      const numeroPaso = index + 1;

      if (!paso.descripcion.trim()) {
        return `La descripción del paso ${numeroPaso} es obligatoria.`;
      }

      if (!paso.tipo_campo) {
        return `Seleccione un tipo de campo para el paso ${numeroPaso}.`;
      }

      if (['select', 'checkbox'].includes(paso.tipo_campo)) {
        const opciones = paso.opcionesTexto
          .split('\n')
          .map(option => option.trim())
          .filter(Boolean);

        if (opciones.length === 0) {
          return `Ingrese al menos una opción para el paso ${numeroPaso}.`;
        }
      }

      if (paso.tipo_campo === 'numero') {
        const min = paso.numeroMin !== '' ? Number(paso.numeroMin) : null;
        const max = paso.numeroMax !== '' ? Number(paso.numeroMax) : null;

        if (paso.numeroMin !== '' && Number.isNaN(min)) {
          return `El valor mínimo del paso ${numeroPaso} debe ser numérico.`;
        }

        if (paso.numeroMax !== '' && Number.isNaN(max)) {
          return `El valor máximo del paso ${numeroPaso} debe ser numérico.`;
        }

        if (min !== null && max !== null && min > max) {
          return `El mínimo no puede ser mayor que el máximo en el paso ${numeroPaso}.`;
        }
      }

      if (paso.tipo_campo === 'texto' && paso.textoMaxLen !== '') {
        const maxLen = Number(paso.textoMaxLen);
        if (Number.isNaN(maxLen) || maxLen <= 0) {
          return `El máximo de caracteres del paso ${numeroPaso} debe ser un número positivo.`;
        }
      }

      if (paso.condicionActiva) {
        if (!paso.condicionPasoId) {
          return `Seleccione el paso de referencia para la condición del paso ${numeroPaso}.`;
        }

        if (!paso.condicionValor.trim()) {
          return `Ingrese el valor requerido para la condición del paso ${numeroPaso}.`;
        }

        const condicionPasoIndex = Number(paso.condicionPasoId);
        if (Number.isNaN(condicionPasoIndex) || condicionPasoIndex >= numeroPaso) {
          return `La condición del paso ${numeroPaso} debe referenciar un paso anterior.`;
        }
      }
    }

    return null;
  };

  const buildTaskPayload = () => {
    const pasosNormalizados = pasos.map((paso, index) => {
      const pasoPayload = {
        id: index + 1,
        descripcion: paso.descripcion.trim(),
        tipo_campo: paso.tipo_campo,
        obligatorio: paso.obligatorio || false
      };

      if (['select', 'checkbox'].includes(paso.tipo_campo)) {
        const options = paso.opcionesTexto
          .split('\n')
          .map(option => option.trim())
          .filter(Boolean);

        if (options.length > 0) {
          pasoPayload.valores = options;
        }
      }

      if (paso.tipo_campo === 'numero') {
        const min = paso.numeroMin !== '' ? Number(paso.numeroMin) : undefined;
        const max = paso.numeroMax !== '' ? Number(paso.numeroMax) : undefined;

        if (min !== undefined || max !== undefined) {
          pasoPayload.validacion = {};
          if (min !== undefined) pasoPayload.validacion.min = min;
          if (max !== undefined) pasoPayload.validacion.max = max;
        }
      }

      if (paso.tipo_campo === 'texto') {
        const maxLen = paso.textoMaxLen !== '' ? Number(paso.textoMaxLen) : undefined;
        if (maxLen !== undefined) {
          pasoPayload.validacion = {
            ...(pasoPayload.validacion || {}),
            max_len: maxLen
          };
        }
      }

      if (paso.condicionActiva && paso.condicionPasoId && paso.condicionValor.trim()) {
        pasoPayload.condicional = {
          cuando: {
            paso_id: Number(paso.condicionPasoId),
            igual_a: paso.condicionValor.trim()
          }
        };
      }

      return pasoPayload;
    });

    return {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      slug: slugify(formData.nombre.trim()),
      creadoPor: currentUser?.email || 'supervisor@desconocido',
      fechaCreacion: new Date().toISOString(),
      pasos: pasosNormalizados
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = buildTaskPayload();
      createTask(payload);
      setSuccess('Tarea creada con éxito.');
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al guardar la tarea personalizada:', err);
      setError('Ocurrió un error al guardar la tarea. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm p-4 border">
      <h3 className="text-lg font-medium mb-4">Nueva Tarea</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Nombre de la tarea <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleGeneralChange}
          className="w-full border rounded p-2"
          placeholder="Ej: Inspección de seguridad personalizada"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Descripción / Objetivo
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleGeneralChange}
          className="w-full border rounded p-2"
          rows="3"
          placeholder="Defina el objetivo general de la tarea"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold">Pasos / Subtareas</h4>
        <button
          type="button"
          onClick={handleAddStep}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
        >
          Agregar paso
        </button>
      </div>

      {pasos.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded p-4 text-sm text-gray-500 mb-6">
          Aún no hay pasos definidos. Puede crear la tarea sin pasos o agregar pasos personalizados.
        </div>
      )}

      <div className="space-y-5">
        {pasos.map((paso, index) => (
          <Step
            key={paso.localId}
            paso={paso}
            index={index}
            fieldTypes={FIELD_TYPES}
            stepOptions={stepOptions}
            onChange={handleStepChange}
            onRemove={handleRemoveStep}
          />
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar tarea'}
        </button>
      </div>
    </form>
  );
}
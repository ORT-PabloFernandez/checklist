// app/hooks/useTaskBuilder.js
'use client';

import { useState } from 'react';
import { useCustomTasks, useCurrentUser } from '../../lib/state';
import { slugify } from '../../lib/utils';

function createEmptyStep() {
  return {
    localId: crypto.randomUUID(),
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

function validateForm(formData, pasos) {
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
}

function buildTaskPayload({ formData, pasos, currentUser }) {
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
}

export function useTaskBuilder({ onSuccess } = {}) {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm(formData, pasos);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = buildTaskPayload({ formData, pasos, currentUser });
      createTask(payload);
      setSuccess('Tarea creada con éxito.');
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error('Error al guardar la tarea personalizada:', err);
      setError('Ocurrió un error al guardar la tarea. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    pasos,
    stepOptions,
    error,
    success,
    saving,
    handleGeneralChange,
    handleAddStep,
    handleRemoveStep,
    handleStepChange,
    handleSubmit
  };
}
'use client';

import { useState, useEffect } from 'react';

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

function mapPasoToFormStep(paso) {
  const tipo = paso.tipo_campo || 'texto';

  let opcionesTexto = '';
  let numeroMin = '';
  let numeroMax = '';
  let textoMaxLen = '';
  let condicionActiva = false;
  let condicionPasoId = '';
  let condicionValor = '';

  if (['select', 'checkbox'].includes(tipo) && Array.isArray(paso.valores)) {
    opcionesTexto = paso.valores.join('\n');
  }

  if (tipo === 'numero' && paso.validacion) {
    if (typeof paso.validacion.min === 'number') {
      numeroMin = paso.validacion.min.toString();
    }
    if (typeof paso.validacion.max === 'number') {
      numeroMax = paso.validacion.max.toString();
    }
  }

  if (tipo === 'texto' && paso.validacion && typeof paso.validacion.max_len === 'number') {
    textoMaxLen = paso.validacion.max_len.toString();
  }

  if (paso.condicional && paso.condicional.cuando) {
    condicionActiva = true;
    if (paso.condicional.cuando.paso_id != null) {
      condicionPasoId = String(paso.condicional.cuando.paso_id);
    }
    if (paso.condicional.cuando.igual_a != null) {
      condicionValor = paso.condicional.cuando.igual_a;
    }
  }

  return {
    localId: crypto.randomUUID(),
    descripcion: paso.descripcion || '',
    tipo_campo: tipo,
    obligatorio: paso.obligatorio || false,
    opcionesTexto,
    numeroMin,
    numeroMax,
    textoMaxLen,
    condicionActiva,
    condicionPasoId,
    condicionValor
  };
}

export function useStepsBuilder(initialTask) {
  const [pasos, setPasos] = useState([]);

  // Inicializa los pasos cuando se edita una tarea existente
  useEffect(() => {
    if (initialTask) {
      const pasosFromTask = Array.isArray(initialTask.pasos)
        ? initialTask.pasos.map(mapPasoToFormStep)
        : [];

      setPasos(pasosFromTask);
    } else {
      // Si es creación de una nueva tarea limpio los pasos
      setPasos([]);
    }
  }, [initialTask]);

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

  const resetSteps = () => {
    setPasos([]);
  };

  const stepOptions = pasos.map((paso, index) => ({
    value: (index + 1).toString(),
    label: `Paso ${index + 1}: ${paso.descripcion || 'Sin descripción'}`
  }));

  return {
    pasos,
    stepOptions,
    handleAddStep,
    handleRemoveStep,
    handleStepChange,
    resetSteps
  };
}



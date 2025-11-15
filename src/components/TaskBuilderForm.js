// app/components/TaskBuilderForm.jsx
'use client';

import { useTaskBuilder } from '../app/hooks/useTaskBuilder';
import StepForm from './StepForm';

export default function TaskBuilderForm({ onSuccess }) {
  const {
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
  } = useTaskBuilder({ onSuccess });

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
          <StepForm
            key={paso.localId}
            paso={paso}
            index={index}
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
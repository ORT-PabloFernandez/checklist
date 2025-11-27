'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTaskById, updateTask, getAssignmentsByTaskId } from '../lib/storage';
import FieldTexto from './FieldTexto';
import FieldGrupo from './FieldGrupo';

export default function TaskEdit({ params }) {
  const router = useRouter();
  const taskId = params?.id;
  const [task, setTask] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pasos, setPasos] = useState([]);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loaded = getTaskById(taskId);
    if (!loaded) {
      setError('No se encontró la tarea');
      return;
    }
    setTask(loaded);
    setNombre(loaded.nombre || '');
    setDescripcion(loaded.descripcion || '');
    setPasos(loaded.pasos || []);

    const asignaciones = getAssignmentsByTaskId(taskId);
    if (asignaciones?.length > 0) {
      setWarning('⚠️ Esta tarea tiene asignaciones activas. Los cambios afectarán a los usuarios asignados.');
    }
  }, [taskId]);

  const handlePasoChange = (index, newValue) => {
    const updated = [...pasos];
    updated[index].value = newValue;
    setPasos(updated);
  };

  const handleAddPaso = () => {
    const nuevoPaso = {
      nombre: `Paso ${pasos.length + 1}`,
      tipo: 'grupo',
      campos: [],
      value: {}
    };
    setPasos([...pasos, nuevoPaso]);
  };

  const handleDeletePaso = (index) => {
    const updated = pasos.filter((_, i) => i !== index);
    setPasos(updated);
  };

  const handleSave = () => {
    if (!nombre.trim()) {
      setError('El nombre de la tarea es obligatorio');
      return;
    }

    const updatedTask = {
      ...task,
      nombre,
      descripcion,
      pasos
    };

    updateTask(updatedTask);
    router.push('/tareas');
  };

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700">{error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Tarea</h1>

      {warning && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded mb-4 text-sm">
          {warning}
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1">Nombre <span className="text-red-500">*</span></label>
        <FieldTexto value={nombre} onChange={setNombre} paso={{ validacion: { max_len: 100 } }} />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Descripción</label>
        <FieldTexto value={descripcion} onChange={setDescripcion} paso={{ validacion: { max_len: 500 } }} />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Pasos</h2>
        {pasos.map((paso, index) => (
          <div key={index} className="border rounded p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <strong>{paso.nombre}</strong>
              <button
                type="button"
                onClick={() => handleDeletePaso(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
            <FieldGrupo
              paso={paso}
              value={paso.value}
              onChange={(val) => handlePasoChange(index, val)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddPaso}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar Paso
        </button>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/tareas')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
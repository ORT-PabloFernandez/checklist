'use client';

import { useState } from 'react';

export default function TaskFormItemFields({ item, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...item, [field]: value });
  };

  const handleValidationChange = (field, value) => {
    const validation = { ...(item.validation || {}), [field]: value };
    onChange({ ...item, validation });
  };

  const handleOptionsChange = (options) => {
    onChange({ ...item, options });
  };

  return (
    <div className="space-y-4">
      {/* Unit - Solo para tipo number */}
      {item.type === 'number' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad (opcional)
          </label>
          <input
            type="text"
            value={item.unit || ''}
            onChange={(e) => handleFieldChange('unit', e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej: PSI, kg, m²"
          />
        </div>
      )}

      {/* Options - Solo para tipo select */}
      {item.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opciones *
          </label>
          <OptionsEditor
            options={item.options || []}
            onChange={handleOptionsChange}
          />
        </div>
      )}

      {/* Validation - Para number y date */}
      {(item.type === 'number' || item.type === 'date') && (
        <div className="border rounded p-3 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validaciones
          </label>

          {item.type === 'number' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={item.validation?.min || ''}
                  onChange={(e) => handleValidationChange('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                <input
                  type="number"
                  value={item.validation?.max || ''}
                  onChange={(e) => handleValidationChange('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="1000"
                />
              </div>
            </div>
          )}

          {item.type === 'date' && (
            <div className="space-y-2">
              <input
                type="number"
                value={item.validation?.max_age_days || ''}
                onChange={(e) => handleValidationChange('max_age_days', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Ej: 365"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para editar opciones
function OptionsEditor({ options, onChange }) {
  const [newOption, setNewOption] = useState('');

  const handleAdd = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      onChange([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemove = (index) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Agregar opción"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Agregar
        </button>
      </div>
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((opt, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {opt}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import TaskFormItemFields from './TaskFormItemFields';
import { FIELD_TYPES, FIELD_TYPE_LABELS, DEFAULT_FIELD_TYPE } from '@/constants/fieldTypes';
import { validateField } from '@/lib/validation';

const ITEM_TYPES = Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export default function TaskFormItemEditor({ item, onSave, onCancel, existingItems = [] }) {
  const [editedItem, setEditedItem] = useState(item || {
    id: Date.now().toString(),
    text: '',
    type: DEFAULT_FIELD_TYPE,
    required: false
  });
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, value) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (updatedItem) => {
    setEditedItem(updatedItem);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campo de texto
    const textValidation = validateField(editedItem.text, {
      type: FIELD_TYPES.TEXT,
      obligatorio: true,
      validacion: { max_len: 255 }
    });
    
    if (!textValidation.isValid) {
      newErrors.text = textValidation.errors[0] || 'El texto es obligatorio';
    }

    // Validar opciones para campos de selección
    if (editedItem.type === FIELD_TYPES.SELECT) {
      const optionsValidation = validateField(editedItem.options || [], {
        type: FIELD_TYPES.SELECT,
        obligatorio: true,
        validacion: { min: 1 }
      });
      
      if (!optionsValidation.isValid) {
        newErrors.options = 'Debe agregar al menos una opción';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editedItem);
    }
  };

  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="text-lg font-medium mb-4">
        {item ? 'Editar Item' : 'Nuevo Item'}
      </h3>

      <div className="space-y-4">
        {/* Texto del item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto del Item *
          </label>
          <textarea
            value={editedItem.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Describe lo que debe hacer el usuario en este item"
            rows="2"
          />
            {errors.text && <p className="mt-1 text-sm text-red-600">{errors.text}</p>}
        </div>

        {/* Tipo de campo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Campo *
          </label>
          <select
            value={editedItem.type}
            onChange={(e) => {
              const newType = e.target.value;
              const updated = { ...editedItem, type: newType };
              // Limpiar campos específicos del tipo anterior
              if (newType !== 'number') delete updated.unit;
              if (newType !== 'select') delete updated.options;
              if (newType !== 'number' && newType !== 'date') delete updated.validation;
              setEditedItem(updated);
            }}
            className="w-full border rounded px-3 py-2"
          >
            {ITEM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Required */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedItem.required || false}
              onChange={(e) => handleFieldChange('required', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Campo obligatorio</span>
          </label>
        </div>

        {/* Campos específicos según el tipo */}
        <TaskFormItemFields
          item={editedItem}
          onChange={handleItemChange}
        />

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {item ? 'Actualizar' : 'Agregar'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


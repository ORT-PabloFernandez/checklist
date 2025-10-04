'use client';

import { useState, useEffect } from 'react';
import { validateNumero } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldNumero({ 
  paso, 
  value, 
  onChange,
  disabled = false 
}) {
  const [localValue, setLocalValue] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: [] });

  useEffect(() => {
    // Update local value when prop changes
    setLocalValue(value !== undefined && value !== null ? String(value) : '');
  }, [value]);

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateNumero(localValue, paso.validacion));
    }
  }, [localValue, paso]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Notify parent with numeric value if possible
    const numValue = newValue === '' ? null : Number(newValue);
    onChange(numValue);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            border rounded p-2 w-full
            ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-600' : ''}
          `}
          placeholder={`Ingrese un número${paso.validacion?.min !== undefined ? ` (mín: ${paso.validacion.min})` : ''}${paso.validacion?.max !== undefined ? ` (máx: ${paso.validacion.max})` : ''}`}
        />
        {paso.unidad && (
          <span className="ml-2 text-gray-600">{paso.unidad}</span>
        )}
      </div>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

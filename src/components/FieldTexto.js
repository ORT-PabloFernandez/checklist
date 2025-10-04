'use client';

import { useState, useEffect } from 'react';
import { validateTexto } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldTexto({ 
  paso, 
  value, 
  onChange,
  disabled = false 
}) {
  const [localValue, setLocalValue] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const maxLength = paso?.validacion?.max_len;

  useEffect(() => {
    // Update local value when prop changes
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateTexto(localValue, paso.validacion));
    }
  }, [localValue, paso]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const isLongText = maxLength > 100;

  return (
    <div className="mb-4">
      {isLongText ? (
        <textarea
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          rows={4}
          className={`
            border rounded p-2 w-full
            ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-600' : ''}
          `}
          placeholder="Ingrese texto"
          maxLength={maxLength}
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            border rounded p-2 w-full
            ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-600' : ''}
          `}
          placeholder="Ingrese texto"
          maxLength={maxLength}
        />
      )}
      
      {maxLength && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {localValue.length} / {maxLength}
        </div>
      )}
      
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

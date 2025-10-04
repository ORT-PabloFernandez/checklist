'use client';

import { useState, useEffect } from 'react';
import { validateSelect } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldSelect({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateSelect(value, paso.valores));
    }
  }, [value, paso]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue === '' ? null : newValue);
  };

  return (
    <div className="mb-4">
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className={`
          border rounded p-2 w-full
          ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-600' : ''}
        `}
      >
        <option value="">Seleccione una opción</option>
        {paso?.valores?.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { validateFecha } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldFecha({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [localValue, setLocalValue] = useState('');
  
  useEffect(() => {
    // Format date value to YYYY-MM-DD for the input
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toISOString().split('T')[0];
          setLocalValue(formattedDate);
        } else {
          setLocalValue('');
        }
      } catch (e) {
        setLocalValue('');
      }
    } else {
      setLocalValue('');
    }
  }, [value]);

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso && localValue) {
      setValidation(validateFecha(localValue, paso.validacion));
    } else {
      setValidation({ isValid: true, errors: [] });
    }
  }, [localValue, paso]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (newValue) {
      // Convert to ISO date for consistency
      const date = new Date(newValue + 'T00:00:00');
      onChange(date.toISOString());
    } else {
      onChange(null);
    }
  };

  // Calculate max date if no future dates allowed
  let maxDate = null;
  if (paso?.validacion?.no_futuras) {
    const today = new Date();
    maxDate = today.toISOString().split('T')[0];
  }

  // Calculate min date if max age restriction applies
  let minDate = null;
  if (paso?.validacion?.max_antiguedad_dias) {
    const today = new Date();
    today.setDate(today.getDate() - paso.validacion.max_antiguedad_dias);
    minDate = today.toISOString().split('T')[0];
  }

  return (
    <div className="mb-4">
      <input
        type="date"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        max={maxDate}
        min={minDate}
        className={`
          border rounded p-2 w-full
          ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-600' : ''}
        `}
      />
      <ValidationHint errors={validation.errors} />
      {paso?.validacion?.no_futuras && (
        <div className="text-xs text-gray-500 mt-1">
          No se permiten fechas futuras
        </div>
      )}
      {paso?.validacion?.max_antiguedad_dias && (
        <div className="text-xs text-gray-500 mt-1">
          La fecha no puede ser más antigua de {paso.validacion.max_antiguedad_dias} días
        </div>
      )}
    </div>
  );
}

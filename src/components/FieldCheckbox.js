'use client';

import { useState, useEffect } from 'react';
import { validateCheckbox } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldCheckbox({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const checkboxValue = paso?.valores?.[0] || 'Seleccionado';

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateCheckbox(value));
    }
  }, [value, paso]);

  const handleChange = (e) => {
    const newValue = e.target.checked ? checkboxValue : null;
    onChange(newValue);
  };

  return (
    <div className="mb-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value === checkboxValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            form-checkbox h-5 w-5 text-blue-600 rounded
            ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        <span className={`ml-2 ${disabled ? 'text-gray-600' : ''}`}>
          {checkboxValue}
        </span>
      </label>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

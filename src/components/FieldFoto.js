'use client';

import { useState, useEffect, useRef } from 'react';
import { validateFile } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldFoto({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateFile(value));
    }
  }, [value, paso]);

  useEffect(() => {
    // Update preview when value changes
    if (value) {
      if (typeof value === 'string') {
        // Value is already a URL or data URL
        setPreview(value);
      } else if (value instanceof File) {
        // Value is a File object, create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(value);
      }
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create file preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPreview(dataUrl);
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="mb-4">
      <div className={`
        border-2 border-dashed rounded-lg p-4 text-center
        ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-100 text-gray-600' : ''}
      `}>
        {preview ? (
          <div className="space-y-2">
            <div className="relative mx-auto w-full max-w-xs">
              <img 
                src={preview} 
                alt="Vista previa" 
                className="mx-auto rounded max-h-48 object-contain bg-gray-100 p-1"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-red-600 hover:underline"
              >
                Eliminar foto
              </button>
            )}
          </div>
        ) : (
          <>
            <label className="block cursor-pointer">
              <span className="block text-sm text-gray-500 mb-2">
                {disabled ? 'No hay foto cargada' : 'Haga clic para cargar una foto'}
              </span>
              {!disabled && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={disabled}
                  accept="image/*"
                  className="hidden"
                />
              )}
              {!disabled && (
                <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Seleccionar foto
                </span>
              )}
            </label>
          </>
        )}
      </div>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

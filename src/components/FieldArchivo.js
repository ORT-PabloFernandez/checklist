'use client';

import { useState, useEffect, useRef } from 'react';
import { validateFile } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldArchivo({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Accepted file types based on paso valores if any
  const getAcceptedTypes = () => {
    if (!paso?.valores || paso.valores.length === 0) {
      return "*/*";
    }
    
    const typeMap = {
      "PDF": ".pdf",
      "Excel": ".xls,.xlsx,.csv",
      "Imagen": "image/*"
    };
    
    return paso.valores.map(v => typeMap[v] || v).join(',');
  };

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateFile(value));
    }
  }, [value, paso]);

  useEffect(() => {
    // Update filename when value changes
    if (value) {
      if (typeof value === 'string') {
        // Value is a URL or data URL
        const parts = value.split('/');
        setFileName(parts[parts.length - 1]);
      } else if (value instanceof File) {
        // Value is a File object
        setFileName(value.name);
      } else if (value.name) {
        setFileName(value.name);
      }
    } else {
      setFileName('');
    }
  }, [value]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      // Read file metadata and create a data URL for small files
      const reader = new FileReader();
      
      if (file.type.startsWith('image/')) {
        // For images, read as data URL
        reader.onload = (e) => {
          onChange({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: e.target.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        // For other files, just store metadata
        onChange({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });
      }
    } else {
      setFileName('');
      onChange(null);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName('');
    onChange(null);
  };

  return (
    <div className="mb-4">
      <div className={`
        border-2 border-dashed rounded-lg p-4
        ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-100 text-gray-600' : ''}
      `}>
        {fileName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm truncate max-w-xs">{fileName}</span>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-red-600 hover:underline ml-2"
              >
                Eliminar
              </button>
            )}
          </div>
        ) : (
          <>
            <label className="block cursor-pointer text-center">
              <span className="block text-sm text-gray-500 mb-2">
                {disabled ? 'No hay archivo cargado' : 'Haga clic para cargar un archivo'}
              </span>
              {paso?.valores && paso.valores.length > 0 && (
                <span className="block text-xs text-gray-400 mb-2">
                  Formatos aceptados: {paso.valores.join(', ')}
                </span>
              )}
              {!disabled && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={disabled}
                  accept={getAcceptedTypes()}
                  className="hidden"
                />
              )}
              {!disabled && (
                <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Seleccionar archivo
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

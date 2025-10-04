'use client';

import { useState, useEffect } from 'react';
import { validateGrupo } from '../lib/validation';
import ValidationHint from './ValidationHint';
import FieldNumero from './FieldNumero';
import FieldTexto from './FieldTexto';
import FieldSelect from './FieldSelect';
import FieldCheckbox from './FieldCheckbox';
import FieldFecha from './FieldFecha';
import FieldFoto from './FieldFoto';
import FieldArchivo from './FieldArchivo';
import FieldFirma from './FieldFirma';

export default function FieldGrupo({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [groupValues, setGroupValues] = useState({});
  const [validation, setValidation] = useState({ isValid: true, errors: [], subfieldResults: {} });

  useEffect(() => {
    // Initialize values from prop
    if (value) {
      setGroupValues(value);
    } else {
      const initialValues = {};
      paso?.campos?.forEach(campo => {
        initialValues[campo.nombre] = null;
      });
      setGroupValues(initialValues);
    }
  }, [value, paso]);

  useEffect(() => {
    // Validate entire group when values change
    if (paso?.campos) {
      const result = validateGrupo(groupValues, paso.campos);
      setValidation(result);
    }
  }, [groupValues, paso]);

  const handleFieldChange = (fieldName, fieldValue) => {
    const updatedValues = {
      ...groupValues,
      [fieldName]: fieldValue
    };
    
    setGroupValues(updatedValues);
    onChange(updatedValues);
  };

  const renderField = (campo) => {
    const fieldValue = groupValues[campo.nombre];
    const fieldValidation = validation.subfieldResults[campo.nombre] || { isValid: true, errors: [] };
    
    switch (campo.tipo_campo) {
      case 'numero':
        return (
          <FieldNumero
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'texto':
        return (
          <FieldTexto
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <FieldSelect
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'checkbox':
        return (
          <FieldCheckbox
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'fecha':
        return (
          <FieldFecha
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'foto':
        return (
          <FieldFoto
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'archivo':
        return (
          <FieldArchivo
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      case 'firma':
        return (
          <FieldFirma
            paso={campo}
            value={fieldValue}
            onChange={(value) => handleFieldChange(campo.nombre, value)}
            disabled={disabled}
          />
        );
      default:
        return <div>Tipo de campo no soportado: {campo.tipo_campo}</div>;
    }
  };

  return (
    <div className="mb-4">
      <div className={`
        border rounded p-4
        ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
      `}>
        {paso?.campos?.map((campo, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {campo.nombre}
              {campo.obligatorio && <span className="text-red-500 ml-1">*</span>}
              {campo.unidad && <span className="text-gray-500 ml-1">({campo.unidad})</span>}
            </label>
            {renderField(campo)}
          </div>
        ))}
      </div>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

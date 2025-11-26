'use client';

import FieldNumero from './FieldNumero';
import FieldTexto from './FieldTexto';
import FieldSelect from './FieldSelect';
import FieldCheckbox from './FieldCheckbox';
import FieldFecha from './FieldFecha';
import FieldFoto from './FieldFoto';
import FieldArchivo from './FieldArchivo';
import FieldFirma from './FieldFirma';
import FieldGrupo from './FieldGrupo';
import { FIELD_TYPES } from '@/constants/fieldTypes';

export default function StepRenderer({
  paso,
  value,
  onChange,
  disabled = false,
  isVisible = true
}) {
  if (!paso || !isVisible) {
    return null;
  }

  // Get field type, default to text if not specified
  const fieldType = paso.tipo_campo || FIELD_TYPES.TEXT;
  
  // Render field based on type
  switch (fieldType) {
    case FIELD_TYPES.NUMBER:
      return (
        <FieldNumero
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.TEXT:
      return (
        <FieldTexto
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.SELECT:
      return (
        <FieldSelect
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.CHECKBOX:
      return (
        <FieldCheckbox
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.DATE:
      return (
        <FieldFecha
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.PHOTO:
      return (
        <FieldFoto
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.FILE:
      return (
        <FieldArchivo
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.SIGNATURE:
      return (
        <FieldFirma
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case FIELD_TYPES.GROUP:
      return (
        <FieldGrupo
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return (
        <div className="p-4 border border-yellow-400 bg-yellow-50 text-yellow-800 rounded">
          Tipo de campo desconocido: {fieldType}
        </div>
      );
  }
}

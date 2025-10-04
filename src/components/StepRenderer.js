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

  // Render field based on type
  switch (paso.tipo_campo) {
    case 'numero':
      return (
        <FieldNumero
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'texto':
      return (
        <FieldTexto
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'select':
      return (
        <FieldSelect
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'checkbox':
      return (
        <FieldCheckbox
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'fecha':
      return (
        <FieldFecha
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'foto':
      return (
        <FieldFoto
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'archivo':
      return (
        <FieldArchivo
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'firma':
      return (
        <FieldFirma
          paso={paso}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'grupo':
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
          Tipo de campo desconocido: {paso.tipo_campo}
        </div>
      );
  }
}
